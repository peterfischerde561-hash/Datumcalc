#!/usr/bin/env node
/**
 * Accessibility smoke test against rendered HTML.
 *
 * Not a substitute for a real audit with a screen reader, but it catches the
 * regressions that are easy to reintroduce and invisible in review: an input
 * that loses its label, an icon button that loses its name, a result region
 * that stops announcing.
 *
 *   node scripts/verify-a11y.mjs [baseUrl]
 */

const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');

const ROUTES = [
    '/',
    '/en',
    '/differenz',
    '/addieren',
    '/arbeitstage',
    '/alter',
    '/addieren/100-tage-ab-heute',
    '/differenz/tage-bis-weihnachten',
    '/ratgeber/schaltjahre-erklaert',
    '/wie-wir-rechnen'
];

const VOID_TEXT = /^\s*$/;

function checks(html, route) {
    const problems = [];

    // 1. Every form control is programmatically named.
    const controls = [...html.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)];
    for (const [, tag, attrs] of controls) {
        if (/type="(hidden|submit|button)"/i.test(attrs)) continue;
        const id = attrs.match(/\bid="([^"]+)"/)?.[1];
        const hasAria = /aria-label=|aria-labelledby=/.test(attrs);
        if (!hasAria && !id) {
            problems.push(`<${tag}> has neither id nor aria-label`);
            continue;
        }
        if (id && !hasAria) {
            const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            if (!new RegExp(`<label[^>]*for="${escaped}"`, 'i').test(html)) {
                problems.push(`<${tag} id="${id}"> has no <label for>`);
            }
        }
    }

    // 2. Buttons have an accessible name (text or aria-label).
    for (const [full, attrs, inner] of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
        const hasAria = /aria-label=/.test(attrs);
        const text = inner.replace(/<[^>]*>/g, '');
        if (!hasAria && VOID_TEXT.test(text)) {
            problems.push(`<button> with no text and no aria-label`);
        }
    }

    // 3. Links have an accessible name.
    for (const [, attrs, inner] of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
        const hasAria = /aria-label=/.test(attrs);
        const text = inner.replace(/<[^>]*>/g, '');
        if (!hasAria && VOID_TEXT.test(text)) {
            problems.push(`<a> with no text and no aria-label`);
        }
    }

    // 4. Exactly one h1, and no skipped heading level.
    const levels = [...html.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
    const h1s = levels.filter((l) => l === 1).length;
    if (h1s !== 1) problems.push(`${h1s} h1 elements (expected exactly 1)`);
    for (let i = 1; i < levels.length; i++) {
        if (levels[i] - levels[i - 1] > 1) {
            problems.push(`heading level jumps h${levels[i - 1]} -> h${levels[i]}`);
            break;
        }
    }

    // 5. Images carry alt text.
    for (const [, attrs] of html.matchAll(/<img\b([^>]*)>/gi)) {
        if (!/\balt=/.test(attrs)) problems.push('<img> without alt');
    }

    // 6. html lang is set.
    if (!/<html[^>]*\blang="[a-z-]+"/i.test(html)) problems.push('<html> has no lang');

    // 7. Pages with a calculator announce their result.
    const hasCalculator = /<input[^>]*type="date"/i.test(html);
    if (hasCalculator && !/aria-live="polite"|role="status"/.test(html)) {
        problems.push('calculator present but no live region for the result');
    }

    /*
     * 8. A skip link exists and points at the main landmark.
     *
     * This matched the Tailwind classes `sr-only ... focus:not-sr-only`, which
     * described one particular implementation rather than the requirement. The
     * skip link is now styled solely by #skip-nav in globals.css, and the check
     * would have failed a working link. Assert the contract instead: a link to
     * #main-content, and a target with that id.
     */
    if (!/<a[^>]*href="#main-content"/i.test(html)) {
        problems.push('no skip link to #main-content');
    }
    if (!/id="main-content"/.test(html)) {
        problems.push('skip-link target #main-content does not exist');
    }

    /*
     * 9. Exactly one <main>.
     *
     * The layout rendered <main id="main-content"> and every page rendered a
     * second <main> inside it -- invalid HTML on 20 of 21 routes, and it left
     * the skip target ambiguous. Nothing here caught it, because every other
     * check looked at elements rather than landmarks.
     */
    const mains = (html.match(/<main[\s>]/gi) || []).length;
    if (mains !== 1) problems.push(`${mains} <main> elements (expected exactly 1)`);

    const banners = (html.match(/role="banner"/g) || []).length;
    if (banners > 1) problems.push(`${banners} banner landmarks`);

    // 10. Tabs carry the state that makes them tabs.
    for (const [, attrs] of html.matchAll(/<button\b([^>]*role="tab"[^>]*)>/gi)) {
        if (!/aria-selected=/.test(attrs)) problems.push('role="tab" without aria-selected');
        if (!/aria-controls=/.test(attrs)) problems.push('role="tab" without aria-controls');
    }
    if (/role="tab"/.test(html) && !/role="tabpanel"/.test(html)) {
        problems.push('role="tab" present but no tabpanel');
    }

    return problems;
}

let failures = 0;
for (const route of ROUTES) {
    let html;
    try {
        const res = await fetch(BASE + route);
        html = await res.text();
    } catch (err) {
        console.log(`FAIL ${route}\n     ${err.message}`);
        failures++;
        continue;
    }

    // Strip the Next.js flight payload; it is data, not rendered markup.
    const body = html.replace(/<script[\s\S]*?<\/script>/gi, '');
    const problems = checks(body, route);

    if (problems.length) {
        failures++;
        console.log(`FAIL ${route}`);
        for (const p of [...new Set(problems)]) console.log(`     - ${p}`);
    } else {
        console.log(`ok   ${route}`);
    }
}

console.log(`\n${ROUTES.length - failures}/${ROUTES.length} routes passed accessibility checks`);
process.exit(failures ? 1 : 0);
