#!/usr/bin/env node
/**
 * Route-level smoke test for server-rendered answers.
 *
 * Fetches each route and asserts, against raw HTML with no JavaScript run,
 * that the result contract declared in src/lib/seo/resultContract.ts is
 * satisfied and that canonical/og:url agree.
 *
 *   node scripts/verify-routes.mjs [baseUrl]
 *
 * Exits non-zero on any failure, so it can gate a deploy.
 */

const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');

// Mirrors src/lib/seo/resultContract.ts. Kept as plain data so this script can
// run against a deployed URL without a build step.
const ROUTE_EXPECTATIONS = {
    '/': ['today', 'day-of-year', 'iso-week'],
    '/en': ['today', 'day-of-year', 'iso-week'],
    '/addieren/*-tage-ab-heute': ['target-date', 'iso-week', 'day-of-year'],
    '/addieren/*-monate-ab-heute': ['target-date', 'iso-week', 'day-of-year'],
    '/addieren/*-jahr*-ab-heute': ['target-date', 'iso-week', 'day-of-year'],
    '/differenz/tage-bis-*': ['days-remaining', 'target-date'],
    '/en/add/*-days-from-today': ['target-date', 'iso-week', 'day-of-year'],
    '/en/difference/days-until-*': ['days-remaining', 'target-date']
};

// Routes with no result contract are still checked for canonical/og:url
// agreement, metadata completeness and a single h1.
const METADATA_ONLY_ROUTES = [
    '/addieren',
    '/differenz',
    '/arbeitstage',
    '/alter',
    '/ratgeber',
    '/ratgeber/schaltjahre-erklaert',
    '/ratgeber/iso-8601-erklaert',
    '/ratgeber/wochen-im-jahr',
    '/wie-wir-rechnen',
    '/ueber-uns',
    '/impressum',
    '/datenschutz',
    '/agb',
    '/sitemap'
];

const ROUTES = [
    '/',
    '/en',
    '/differenz/tage-bis-weihnachten',
    '/differenz/tage-bis-sommeranfang',
    '/differenz/tage-bis-ostern',
    '/addieren/30-tage-ab-heute',
    '/addieren/100-tage-ab-heute',
    '/addieren/6-monate-ab-heute',
    '/addieren/1-jahr-ab-heute',
    '/en/add/100-days-from-today',
    '/en/difference/days-until-christmas'
];

function matches(pathname, pattern) {
    const source =
        '^' +
        pattern
            .split('*')
            .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('[^/]*') +
        '$';
    return new RegExp(source).test(pathname);
}

function expectationFor(pathname) {
    const key = Object.keys(ROUTE_EXPECTATIONS).find((p) => matches(pathname, p));
    return key ? ROUTE_EXPECTATIONS[key] : null;
}

function attr(html, re) {
    const m = html.match(re);
    return m ? m[1] : null;
}

function contractValues(html) {
    const found = {};
    const re = /data-result-type="([^"]+)"\s+data-result-value="([^"]+)"/g;
    let m;
    while ((m = re.exec(html))) found[m[1]] = m[2];
    return found;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
// Result types whose value is a calendar date rather than a count.
const DATE_VALUED = new Set(['target-date', 'today']);

/** Names that must never reappear in markup. */
const FABRICATED = ['Felix Schmidt', 'Mathematiker & Autor', 'Lead Developer & Kalender-Experte'];

function decodeEntities(s) {
    return s
        .replace(/&quot;/g, '"')
        .replace(/&#x27;|&apos;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

/**
 * Structured data must parse, describe the page it sits on, and assert nothing
 * the page does not show. Checks here rather than in a unit test because the
 * failure mode is in rendered output, not in the component.
 */
function checkJsonLd(html, route, canonical) {
    const problems = [];
    const blocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];

    if (blocks.length === 0) return problems;

    const graphs = [];
    for (const [, raw] of blocks) {
        try {
            graphs.push(JSON.parse(decodeEntities(raw)));
        } catch (err) {
            problems.push(`JSON-LD does not parse: ${err.message}`);
        }
    }

    const serialized = JSON.stringify(graphs);

    for (const name of FABRICATED) {
        if (serialized.includes(name)) problems.push(`JSON-LD contains removed identity "${name}"`);
    }

    // A calculator page is not an Article.
    const types = [...serialized.matchAll(/"@type":"([^"]+)"/g)].map((m) => m[1]);
    const isGuide = route.includes('/ratgeber/') || route.includes('/guide/');
    if (types.includes('Article') && !isGuide) {
        problems.push(`Article schema on a non-editorial page (types: ${[...new Set(types)].join(', ')})`);
    }

    // FAQPage is reserved for hand-written Q&A; the generated pSEO FAQs must not carry it.
    const isTemplatedFaqPage = /\/(addieren|differenz|add|difference)\/.+/.test(route);
    if (types.includes('FAQPage') && isTemplatedFaqPage) {
        problems.push('FAQPage schema on a template-generated FAQ');
    }

    // Every Question must be visible on the page.
    for (const graph of graphs) {
        for (const q of graph?.mainEntity ?? []) {
            const name = q?.name;
            if (name && !decodeEntities(html).includes(name)) {
                problems.push(`FAQ question in schema is not visible on the page: "${name}"`);
                break;
            }
        }
    }

    // BreadcrumbList must end at this page's canonical.
    for (const graph of graphs) {
        if (graph?.['@type'] !== 'BreadcrumbList') continue;
        const items = graph.itemListElement ?? [];
        const last = items[items.length - 1];
        const lastUrl = last?.item?.['@id'] ?? last?.item;
        if (canonical && lastUrl && lastUrl !== canonical) {
            problems.push(`breadcrumb ends at ${lastUrl}, not the canonical ${canonical}`);
        }
        for (const it of items) {
            const url = it?.item?.['@id'] ?? it?.item;
            if (typeof url === 'string' && url !== BASE && url.endsWith('/')) {
                problems.push(`breadcrumb item has a trailing slash: ${url}`);
            }
        }
    }

    return problems;
}

let failures = 0;
let checked = 0;

for (const route of [...ROUTES, ...METADATA_ONLY_ROUTES]) {
    const url = BASE + route;
    let res, html;
    try {
        res = await fetch(url, { redirect: 'manual' });
        html = await res.text();
    } catch (err) {
        console.log(`FAIL ${route}\n     request failed: ${err.message}`);
        failures++;
        continue;
    }

    const problems = [];

    if (res.status !== 200) problems.push(`expected 200, got ${res.status}`);

    const expected = expectationFor(route);
    if (!expected) {
        // Only routes that promise a calculated answer need a contract.
        if (!METADATA_ONLY_ROUTES.includes(route)) {
            problems.push('no expectation declared in resultContract.ts');
        }
    } else {
        const found = contractValues(html);
        for (const type of expected) {
            const value = found[type];
            if (value === undefined) {
                problems.push(`missing result "${type}" in server HTML`);
            } else if (DATE_VALUED.has(type) && !ISO_DATE.test(value)) {
                problems.push(`"${type}" is not an ISO date: ${value}`);
            } else if (!DATE_VALUED.has(type) && !/^-?\d+$/.test(value)) {
                problems.push(`"${type}" is not an integer: ${value}`);
            }
        }
    }

    const canonical = attr(html, /<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i);
    const ogUrl = attr(html, /<meta[^>]*property="og:url"[^>]*content="([^"]*)"/i);
    const ogTitle = attr(html, /<meta[^>]*property="og:title"[^>]*content="([^"]*)"/i);
    const ogImage = attr(html, /<meta[^>]*property="og:image"[^>]*content="([^"]*)"/i);
    const twTitle = attr(html, /<meta[^>]*name="twitter:title"[^>]*content="([^"]*)"/i);
    const title = attr(html, /<title[^>]*>([^<]*)<\/title>/i);

    if (!canonical) problems.push('no canonical');
    if (!ogUrl) problems.push('no og:url');
    if (canonical && ogUrl && canonical !== ogUrl) {
        problems.push(`og:url !== canonical\n       canonical: ${canonical}\n       og:url:    ${ogUrl}`);
    }
    if (canonical && canonical !== BASE && canonical.endsWith('/')) {
        problems.push(`canonical has a trailing slash: ${canonical}`);
    }
    // The inheritance bug: a child page silently showing the parent's card.
    if (!ogImage) problems.push('no og:image');
    if (ogTitle && title && !title.startsWith(ogTitle.slice(0, 24))) {
        problems.push(`og:title does not match <title>\n       <title>:  ${title}\n       og:title: ${ogTitle}`);
    }
    if (twTitle && ogTitle && twTitle !== ogTitle) {
        problems.push(`twitter:title !== og:title\n       og:  ${ogTitle}\n       tw:  ${twTitle}`);
    }

    const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
    if (h1Count === 0) problems.push('no h1');
    if (h1Count > 1) problems.push(`${h1Count} h1 elements`);

    problems.push(...checkJsonLd(html, route, canonical));

    checked++;
    if (problems.length) {
        failures++;
        console.log(`FAIL ${route}`);
        for (const p of problems) console.log(`     - ${p}`);
    } else {
        const found = contractValues(html);
        const summary = Object.entries(found)
            .map(([k, v]) => `${k}=${v}`)
            .join(' ');
        console.log(`ok   ${route}  ${summary}`);
    }
}

console.log(`\n${checked - failures}/${checked} routes passed against ${BASE}`);
process.exit(failures ? 1 : 0);
