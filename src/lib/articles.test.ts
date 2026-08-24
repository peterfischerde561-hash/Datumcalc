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
        expect(joined).toContain('2028');
        expect(joined).toContain('1900');
        expect(joined).toContain('2000');
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
