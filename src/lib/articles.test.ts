import { describe, it, expect } from 'vitest';
import { articles } from './articles';
import { ROUTE_LABELS, ToolKey, routeLabel } from './seo/routeLabels';
import { isIndexableLocale } from './seo/indexPolicy';

const allArticles = Object.entries(articles).flatMap(([locale, list]) =>
    list.map((article) => ({ locale, article }))
);

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

describe('index policy', () => {
    it('keeps German indexable and English out of the index', () => {
        expect(isIndexableLocale('de')).toBe(true);
        expect(isIndexableLocale('en')).toBe(false);
    });
});
