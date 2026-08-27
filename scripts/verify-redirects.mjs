#!/usr/bin/env node
/**
 * Redirect integrity check.
 *
 * Exists because of a defect that survived every manual inspection: a route
 * that called permanentRedirect() in both generateMetadata and the page body
 * emitted two Location headers for the same request. A client joins them —
 *
 *   Location: /addieren/100-tage-ab-heute, /addieren/100-tage-ab-heute
 *
 * — which is not a valid URL. It only reproduced sometimes, because the two
 * code paths race, so single spot-checks came back clean. Search Console
 * reports a malformed Location as "Redirect error".
 *
 * Each redirecting URL is therefore requested REPEATS times and every response
 * must carry exactly one Location header.
 *
 *   node scripts/verify-redirects.mjs [baseUrl]
 */

const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const MAX_HOPS = 6;
const REPEATS = 6;

/** [path, expected first-hop status, expected first-hop target or null] */
const CASES = [
    // German is the default locale and is served unprefixed. These must be
    // permanent (308) — a 307 keeps the prefixed URL in the index.
    ['/de', 308, '/'],
    ['/de/addieren', 308, '/addieren'],
    ['/de/addieren/100-tage-ab-heute', 308, '/addieren/100-tage-ab-heute'],
    ['/de/ratgeber/schaltjahre-erklaert', 308, '/ratgeber/schaltjahre-erklaert'],
    ['/de/impressum', 308, '/impressum'],

    // Retired locales: hub URLs must reach their German equivalent in one hop.
    ['/es/sumar', 308, '/addieren'],
    ['/fr/ajouter', 308, '/addieren'],
    ['/it/eta', 308, '/alter'],
    ['/pt/uteis', 308, '/arbeitstage'],
    ['/es/guia', 308, '/ratgeber'],
    ['/fr/guide/iso-8601-erklaert', 308, '/ratgeber/iso-8601-erklaert'],
    ['/es', 308, '/'],

    // Slug aliases — the case that exposed the duplicate header.
    ['/addieren/100-tage-von-heute', 308, null],
    ['/addieren/365-tage-ab-heute', 308, null],
    ['/addieren/180-tage-ab-heute', 308, null],

    // Must not redirect at all.
    ['/', 200, null],
    ['/en', 200, null],
    ['/addieren/100-tage-ab-heute', 200, null],
    ['/differenz/tage-bis-weihnachten', 200, null],
    ['/wie-wir-rechnen', 200, null]
];

/** One request. Returns status plus every Location header seen. */
async function once(url) {
    const r = await fetch(url, { redirect: 'manual' });
    const locations = [...r.headers].filter(([k]) => k.toLowerCase() === 'location').map(([, v]) => v);
    return { status: r.status, locations };
}

async function follow(path) {
    const hops = [];
    const seen = new Set();
    let url = BASE + path;

    for (let i = 0; i < MAX_HOPS; i++) {
        if (seen.has(url)) return { hops, loop: true };
        seen.add(url);
        const { status, locations } = await once(url);
        hops.push({ status, locations });
        if (status >= 300 && status < 400 && locations.length === 1) {
            const loc = locations[0];
            url = loc.startsWith('http') ? loc : BASE + loc;
            continue;
        }
        break;
    }
    return { hops, loop: false };
}

let failures = 0;

for (const [path, expectStatus, expectTarget] of CASES) {
    const problems = [];

    // Hammer the first hop: the duplicate-header bug is a race.
    for (let i = 0; i < REPEATS; i++) {
        const { status, locations } = await once(BASE + path);
        if (status !== expectStatus) {
            problems.push(`status ${status}, expected ${expectStatus}`);
            break;
        }
        if (status >= 300 && status < 400) {
            if (locations.length !== 1) {
                problems.push(`${locations.length} Location headers on attempt ${i + 1}: ${locations.map((l) => `"${l}"`).join(' + ')}`);
                break;
            }
            if (locations[0].includes(',')) {
                problems.push(`Location contains a comma: "${locations[0]}"`);
                break;
            }
            if (expectTarget && locations[0] !== expectTarget) {
                problems.push(`target "${locations[0]}", expected "${expectTarget}"`);
                break;
            }
        }
    }

    // Then walk the chain.
    let trail = '';
    if (!problems.length) {
        const { hops, loop } = await follow(path);
        if (loop) problems.push('redirect loop');
        if (hops.length > 3) problems.push(`${hops.length - 1} hops`);
        const last = hops[hops.length - 1];
        if (last && last.status >= 400) problems.push(`chain ends ${last.status}`);
        trail = hops.map((h) => `${h.status}${h.locations[0] ? ' -> ' + h.locations[0] : ''}`).join('  ');
    }

    if (problems.length) {
        failures++;
        console.log(`FAIL ${path}`);
        for (const p of problems) console.log(`     - ${p}`);
    } else {
        console.log(`ok   ${path.padEnd(38)} ${trail}`);
    }
}

console.log(`\n${CASES.length - failures}/${CASES.length} redirect cases passed against ${BASE}`);
process.exit(failures ? 1 : 0);
