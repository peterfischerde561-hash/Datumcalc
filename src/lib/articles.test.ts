import { describe, it, expect } from 'vitest';
import { articles, readingTimeMinutes } from './articles';
import { CANONICAL_QUERIES, exceedsOffsetLimit } from './seo/queryModel';
import { ROUTE_LABELS, ToolKey, routeLabel } from './seo/routeLabels';
import { isIndexableLocale } from './seo/indexPolicy';
import {
    ORGANIZATION_ID,
    organizationNode,
    organizationRef,
    webApplicationId,
    webApplicationNode,
    webSiteId,
    webSiteNode
} from './seo/schema';

const allArticles = Object.entries(articles).flatMap(([locale, list]) =>
    list.map((article) => ({ locale, article }))
);

describe('article dates', () => {
    it.each(allArticles)('$locale/$article.slug has ISO dates', ({ article }) => {
        expect(article.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(article.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it.each(allArticles)('$locale/$article.slug was not modified before publication', ({ article }) => {
        expect(article.dateModified >= article.datePublished).toBe(true);
    });

    /*
     * The dates that were removed were 2024-03-24 — a year before the repository
     * existed. Anything predating the first article commit is a typo or a
     * fabrication, and both look identical in the markup.
     */
    it.each(allArticles)('$locale/$article.slug is not backdated before the project', ({ article }) => {
        expect(article.datePublished >= '2026-01-01').toBe(true);
    });
});

describe('entity graph', () => {
    it('gives each locale its own WebApplication and WebSite id', () => {
        expect(webApplicationId('de')).not.toBe(webApplicationId('en'));
        expect(webSiteId('de')).not.toBe(webSiteId('en'));
    });

    /*
     * The audited defect: one @id asserting name "Datumsrechner"/inLanguage de
     * on 18 routes and "Date Calculator"/inLanguage en on the rest. Distinct
     * ids are only a fix if the differing fields travel with them.
     */
    it('never lets one id carry two names or languages', () => {
        const nodes = [
            webApplicationNode('de'),
            webApplicationNode('en'),
            webSiteNode('de'),
            webSiteNode('en')
        ];
        const byId = new Map<string, Set<string>>();
        for (const node of nodes) {
            const key = node['@id'];
            if (!byId.has(key)) byId.set(key, new Set());
            byId.get(key)!.add(`${node.name}|${node.inLanguage}`);
        }
        for (const [, identities] of byId) expect(identities.size).toBe(1);
    });

    it('describes the organisation once and references it thereafter', () => {
        expect(organizationNode()['@id']).toBe(ORGANIZATION_ID);
        expect(organizationRef).toEqual({ '@id': ORGANIZATION_ID });

        for (const locale of ['de', 'en']) {
            const app = webApplicationNode(locale);
            // References, not inline copies — the fragmentation this fixed.
            expect(app.creator).toEqual(organizationRef);
            expect(app.publisher).toEqual(organizationRef);
            expect(webSiteNode(locale).publisher).toEqual(organizationRef);
        }
    });

    it('claims no capability the site does not have', () => {
        // No SearchAction: there is no site-search endpoint to point one at.
        expect(webSiteNode('de')).not.toHaveProperty('potentialAction');
        // No empty sameAs: it occupied the slot while asserting nothing.
        expect(organizationNode()).not.toHaveProperty('sameAs');
    });

    it('ties the application to its own locale site', () => {
        for (const locale of ['de', 'en']) {
            expect(webApplicationNode(locale).isPartOf).toEqual({ '@id': webSiteId(locale) });
        }
    });
});

describe('article takeaways', () => {
    it('covers every article', () => {
        expect(allArticles.length).toBeGreaterThan(0);
    });

    it.each(allArticles.map(({ locale, article }) => [`${locale}/${article.slug}`, article]))(
        '%s has three substantial, unique takeaways',
        (_name, article) => {
            expect(article.takeaways.length).toBeGreaterThanOrEqual(3);
            for (const point of article.takeaways) {
                expect(point.trim().length).toBeGreaterThan(20);
            }
            expect(new Set(article.takeaways).size).toBe(article.takeaways.length);
        }
    );

    it('shares no takeaway between two articles in the same locale', () => {
        // The bug this replaced: three generic bullets lived in the i18n files
        // and rendered identically on every guide, in its most prominent block.
        const seen = new Map<string, string>();
        const shared: string[] = [];

        for (const { locale, article } of allArticles) {
            for (const point of article.takeaways) {
                const key = `${locale}::${point}`;
                const owner = seen.get(key);
                if (owner) shared.push(`"${point}" shared by ${owner} and ${locale}/${article.slug}`);
                seen.set(key, `${locale}/${article.slug}`);
            }
        }

        expect(shared).toEqual([]);
    });

    it('says something specific: the leap-year guide names the actual years', () => {
        const leap = articles.de.find((a) => a.slug === 'schaltjahre-erklaert')!;
        const joined = leap.takeaways.join(' ');
        // 1900 and 2000 are settled history and stay true forever.
        expect(joined).toContain('1900');
        expect(joined).toContain('2000');
    });

    it('states no fact that expires', () => {
        // "Das nächste Schaltjahr ist 2028" is correct until it isn't, and
        // nothing fails when it stops being true. Time-relative answers are
        // computed in guideFacts.ts and rendered above the takeaways; prose
        // here must hold regardless of when it is read.
        const decaying =
            /\b(nächste|nächstes|next|kommende|upcoming)\b[^.]{0,40}\b(19|20|21)\d{2}\b|\b(dieses|diesem|this)\s+Jahr\b|\bin diesem Jahr\b/i;

        const offenders: string[] = [];
        for (const { locale, article } of allArticles) {
            for (const point of article.takeaways) {
                if (decaying.test(point)) offenders.push(`${locale}/${article.slug}: "${point}"`);
            }
        }
        expect(offenders).toEqual([]);
    });
});

describe('guide body links', () => {
    it.each(allArticles.map(({ locale, article }) => [`${locale}/${article.slug}`, locale, article]))(
        '%s links out to at least two calculators or guides',
        (_name, _locale, article) => {
            // A leap-year article that never links to the calculator implementing
            // the rule is a dead end. Guides previously had no inline links at all.
            const hrefs = [...article.content.matchAll(/<a href="([^"]+)"/g)].map((m) => m[1]);
            expect(hrefs.length).toBeGreaterThanOrEqual(2);
        }
    );

    it('points every body link at a real route, in the article\'s own locale', () => {
        const KNOWN_DE = ['/alter', '/addieren', '/differenz', '/arbeitstage', '/ratgeber'];
        const KNOWN_EN = ['/en/age', '/en/add', '/en/difference', '/en/business', '/en/guide'];
        const bad: string[] = [];

        for (const { locale, article } of allArticles) {
            const known = locale === 'de' ? KNOWN_DE : KNOWN_EN;
            for (const [, href] of article.content.matchAll(/<a href="([^"]+)"/g)) {
                if (!known.some((prefix) => href === prefix || href.startsWith(`${prefix}/`))) {
                    bad.push(`${locale}/${article.slug} -> ${href}`);
                }
            }
        }

        expect(bad).toEqual([]);
    });

    it('never links an article to itself', () => {
        const selfLinks: string[] = [];
        for (const { locale, article } of allArticles) {
            for (const [, href] of article.content.matchAll(/<a href="([^"]+)"/g)) {
                if (href.endsWith(`/${article.slug}`)) selfLinks.push(`${locale}/${article.slug}`);
            }
        }
        expect(selfLinks).toEqual([]);
    });
});

describe('route labels', () => {
    const keys = Object.keys(ROUTE_LABELS) as ToolKey[];

    it.each(keys)('%s is defined in every locale with no empty strings', (key) => {
        for (const locale of ['de', 'en'] as const) {
            const label = ROUTE_LABELS[key][locale];
            expect(label.label.trim().length).toBeGreaterThan(0);
            expect(label.description.trim().length).toBeGreaterThan(0);
            expect(label.example.trim().length).toBeGreaterThan(0);
        }
    });

    it('never renders a German label on an English page', () => {
        // Regression guard for the homepage use-case table, which hardcoded
        // "Datum addieren" / "Arbeitstage" / "Datumsdifferenz" / "Altersrechner"
        // outside the locale object, so /en served German anchor text.
        const germanOnly = [
            'Datum addieren',
            'Datumsdifferenz',
            'Altersrechner',
            'Arbeitstage',
            'Tage berechnen',
            'Ratgeber'
        ];
        for (const key of keys) {
            const en = routeLabel(key, 'en');
            expect(germanOnly).not.toContain(en.label);
            expect(en.example).not.toMatch(/\bTage\b|\bAlter\b|\bWeihnachten\b/);
        }
    });

    it('gives German and English genuinely different labels', () => {
        for (const key of keys) {
            expect(routeLabel(key, 'de').label).not.toBe(routeLabel(key, 'en').label);
        }
    });
});

describe('reading time', () => {
    it('is derived from the body, not typed in', () => {
        // The leap-year guide claimed "3 min" for 221 words, roughly a minute.
        const leap = articles.de.find((a) => a.slug === 'schaltjahre-erklaert')!;
        expect(readingTimeMinutes(leap.content)).toBeLessThanOrEqual(2);
    });

    it('never claims less than a minute', () => {
        expect(readingTimeMinutes('<p>kurz</p>')).toBe(1);
    });

    it('scales with length and ignores markup', () => {
        const words = Array(600).fill('Wort').join(' ');
        expect(readingTimeMinutes(`<p>${words}</p>`)).toBe(3);
    });
});

describe('offset URL bound', () => {
    it('allows every canonical page', () => {
        for (const def of Object.values(CANONICAL_QUERIES)) {
            expect(exceedsOffsetLimit(def.canonicalSlug)).toBe(false);
        }
    });

    it.each([
        ['36500-tage-ab-heute', false], // exactly a century, still served
        ['36501-tage-ab-heute', true],
        ['77777-tage-ab-heute', true],
        ['999999-tage-ab-heute', true],
        ['1200-monate-ab-heute', false],
        ['1201-monate-ab-heute', true],
        ['100-jahre-ab-heute', false],
        ['101-jahre-ab-heute', true]
    ])('%s exceeds limit: %s', (slug, expected) => {
        expect(exceedsOffsetLimit(slug)).toBe(expected);
    });

    it('keeps long spans that people actually searched', () => {
        // GSC recorded a click on /de/addieren/21128-tage-ab-heute — about 58
        // years. The bound exists to make the space finite, not to second-guess
        // a request someone genuinely made, so anything inside a century stays.
        for (const slug of ['21128-tage-ab-heute', '22200-tage-ab-heute', '12888-tage-ab-heute']) {
            expect(exceedsOffsetLimit(slug)).toBe(false);
        }
    });

    it('ignores slugs that carry no offset', () => {
        expect(exceedsOffsetLimit('tage-bis-weihnachten')).toBe(false);
        expect(exceedsOffsetLimit('irgendwas')).toBe(false);
    });
});

describe('index policy', () => {
    it('keeps German indexable and English out of the index', () => {
        expect(isIndexableLocale('de')).toBe(true);
        expect(isIndexableLocale('en')).toBe(false);
    });
});
