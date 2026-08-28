#!/usr/bin/env node
/**
 * Structured-data checks against rendered HTML.
 *
 * A schema audit of production found no invalid markup and a badly shaped
 * graph: one `@id` asserting two identities, the calculator declared on the
 * Impressum, and 48 Organization nodes across 21 routes where references
 * belonged. None of that fails a validator, so nothing would have caught it
 * coming back. These are the invariants that fix depends on.
 *
 *   node scripts/verify-schema.mjs [baseUrl]
 */

const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');

/** Routes that are the calculator, and therefore must declare WebApplication. */
const CALCULATOR_ROUTES = [
    '/',
    '/en',
    '/differenz',
    '/addieren',
    '/arbeitstage',
    '/alter',
    '/addieren/100-tage-ab-heute',
    '/differenz/tage-bis-weihnachten',
    '/en/add/100-days-from-today'
];

/** Routes that are not the calculator, and therefore must not declare it. */
const NON_CALCULATOR_ROUTES = [
    '/ratgeber',
    '/ratgeber/schaltjahre-erklaert',
    '/ratgeber/wochen-im-jahr',
    '/wie-wir-rechnen',
    '/ueber-uns',
    '/impressum',
    '/datenschutz',
    '/agb',
    '/sitemap',
    '/en/guide/leap-years-explained'
];

const ROUTES = [...CALCULATOR_ROUTES, ...NON_CALCULATOR_ROUTES];

const decode = (s) =>
    s.replace(/&quot;/g, '"')
        .replace(/&#x27;|&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');

function walk(node, fn) {
    if (Array.isArray(node)) return node.forEach((n) => walk(n, fn));
    if (node && typeof node === 'object') {
        fn(node);
        for (const value of Object.values(node)) walk(value, fn);
    }
}

function checks(html, route) {
    const problems = [];

    const visible = decode(
        html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ')
    ).replace(/\s+/g, ' ');

    const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i)?.[1];

    const nodes = [];
    for (const [, raw] of html.matchAll(
        /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
    )) {
        let parsed;
        try {
            parsed = JSON.parse(decode(raw));
        } catch (error) {
            problems.push(`JSON-LD does not parse: ${error.message}`);
            continue;
        }
        walk(parsed['@graph'] ?? parsed, (node) => {
            if (node['@type']) nodes.push(node);
        });
    }

    const typed = (type) => nodes.filter((n) => n['@type'] === type);
    const has = (type) => typed(type).length > 0;

    // 1. The site-level nodes are on every page, so references can resolve.
    if (!has('Organization')) problems.push('no Organization node');
    if (!has('WebSite')) problems.push('no WebSite node');

    // 2. One entity per @id. A URI that carries two different names or
    //    languages is a contradiction, not a description.
    const byId = new Map();
    for (const node of nodes) {
        const id = node['@id'];
        // References carry only @id; they describe nothing and cannot conflict.
        if (!id || Object.keys(node).length === 1) continue;
        if (!byId.has(id)) byId.set(id, []);
        byId.get(id).push(node);
    }
    for (const [id, defs] of byId) {
        const names = new Set(defs.map((d) => d.name).filter(Boolean));
        const langs = new Set(defs.map((d) => d.inLanguage).filter(Boolean));
        if (names.size > 1) problems.push(`@id ${id} has names ${[...names].join(' / ')}`);
        if (langs.size > 1) problems.push(`@id ${id} has inLanguage ${[...langs].join(' / ')}`);
    }

    // 3. Every @id reference resolves to a node defined on the same page.
    const defined = new Set([...byId.keys()]);
    for (const node of nodes) {
        if (Object.keys(node).length === 1 && node['@id'] && !defined.has(node['@id'])) {
            problems.push(`dangling reference to ${node['@id']}`);
        }
    }

    // 4. The organisation is described once and referenced thereafter. Anonymous
    //    copies are how it drifted into four partial descriptions of itself.
    const anonymousOrgs = typed('Organization').filter((n) => !n['@id']);
    if (anonymousOrgs.length > 0) {
        problems.push(`${anonymousOrgs.length} Organization node(s) without @id`);
    }
    for (const org of typed('Organization')) {
        if (Array.isArray(org.sameAs) && org.sameAs.length === 0) {
            problems.push('Organization has an empty sameAs');
        }
    }

    // 5. The calculator is declared where the calculator is.
    const isCalculator = CALCULATOR_ROUTES.includes(route);
    if (isCalculator && !has('WebApplication')) {
        problems.push('calculator route without WebApplication');
    }
    if (!isCalculator && has('WebApplication')) {
        problems.push('non-calculator route declares WebApplication');
    }

    // 6. Breadcrumbs are ordered, named, and end at this page.
    for (const list of typed('BreadcrumbList')) {
        const items = list.itemListElement ?? [];
        items.forEach((item, index) => {
            if (item.position !== index + 1) {
                problems.push(`breadcrumb position ${item.position} at index ${index}`);
            }
            if (!item.name) problems.push('breadcrumb item without name');
        });
        const last = items[items.length - 1];
        const url = last?.item?.['@id'] ?? last?.item;
        if (canonical && url && url !== canonical) {
            problems.push(`breadcrumb ends ${url}, canonical is ${canonical}`);
        }
    }

    // 7. Structured data describes what the page shows. An answer that is only
    //    in the markup is the thing FAQ markup is penalised for.
    for (const question of nodes.filter((n) => n['@type'] === 'Question')) {
        const answer = question.acceptedAnswer?.text;
        if (!answer) {
            problems.push(`Question without acceptedAnswer: ${question.name}`);
            continue;
        }
        if (question.name && !visible.includes(question.name.slice(0, 40))) {
            problems.push(`FAQ question not visible: ${question.name.slice(0, 50)}`);
        }
        if (!visible.includes(answer.slice(0, 40))) {
            problems.push(`FAQ answer not visible: ${answer.slice(0, 40)}`);
        }
    }

    // 8. Article dates exist, are ISO, and run forwards.
    for (const article of typed('Article')) {
        const { datePublished, dateModified, headline } = article;
        const iso = /^\d{4}-\d{2}-\d{2}$/;
        if (!iso.test(datePublished ?? '')) problems.push(`Article datePublished "${datePublished}"`);
        if (!iso.test(dateModified ?? '')) problems.push(`Article dateModified "${dateModified}"`);
        if (iso.test(datePublished ?? '') && iso.test(dateModified ?? '') && dateModified < datePublished) {
            problems.push(`Article modified ${dateModified} before published ${datePublished}`);
        }
        const h1 = decode(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '')
            .replace(/<[^>]+>/g, '')
            .trim();
        if (headline && h1 && headline.trim() !== h1) {
            problems.push(`Article headline "${headline}" is not the h1 "${h1}"`);
        }
    }

    return problems;
}

let failures = 0;

for (const route of ROUTES) {
    const url = `${BASE}${route}`;
    let response;
    try {
        response = await fetch(url);
    } catch (error) {
        console.log(`FAIL ${route}\n       fetch failed: ${error.message}`);
        failures++;
        continue;
    }
    if (!response.ok) {
        console.log(`FAIL ${route}\n       HTTP ${response.status}`);
        failures++;
        continue;
    }

    const problems = checks(await response.text(), route);
    if (problems.length === 0) {
        console.log(`ok   ${route}`);
    } else {
        failures++;
        console.log(`FAIL ${route}`);
        for (const problem of problems) console.log(`       ${problem}`);
    }
}

console.log(
    `\n${ROUTES.length - failures}/${ROUTES.length} routes pass structured-data checks`
);
process.exit(failures === 0 ? 0 : 1);
