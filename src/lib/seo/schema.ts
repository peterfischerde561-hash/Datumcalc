/**
 * The site's structured-data entities, defined once.
 *
 * A schema audit of production found 48 Organization nodes across 21 routes
 * where about 21 references belonged. Every page emitted the canonical
 * `#organization` node *and* an anonymous copy inside `WebApplication.creator`;
 * the guides added two more, `author` (url, no logo) and `publisher` (logo, no
 * url). Four partial descriptions of one company, three of them anonymous, none
 * pointing at the `@id` sitting in the same document.
 *
 * The fix is what `@id` is for: describe each entity once, reference it
 * everywhere else. Consumers merge every JSON-LD block on a page into a single
 * graph, so a reference resolves as long as the target node is somewhere on the
 * same page — which `SiteSchema` guarantees by living in the layout.
 *
 * Identity rules that produced bugs before:
 *
 *   - `@id` is a global claim, so it must be locale-scoped where the node's
 *     content differs by locale. `.../#webapp` previously asserted both
 *     `name: "Datumsrechner"` / `inLanguage: "de"` and `name: "Date Calculator"`
 *     / `inLanguage: "en"` — one URI, two contradictory identities.
 *   - Organization is deliberately *not* locale-scoped. There is one company and
 *     its name is the same in both locales, so a single node is correct.
 */

import { SITE_URL } from '@/lib/constants';

/** One organisation, one node, one id — shared by every locale. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

/** A reference to the Organization node, for `publisher` / `author` / `creator`. */
export const organizationRef = { '@id': ORGANIZATION_ID } as const;

function localeHome(locale: string): string {
    return locale === 'de' ? SITE_URL : `${SITE_URL}/${locale}`;
}

export function webSiteId(locale: string): string {
    return `${localeHome(locale)}/#website`;
}

export function webApplicationId(locale: string): string {
    return `${localeHome(locale)}/#webapp`;
}

export function organizationNode() {
    return {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: 'Datumsrechner',
        url: SITE_URL,
        logo: {
            '@type': 'ImageObject',
            '@id': `${SITE_URL}/#logo`,
            url: `${SITE_URL}/logo.png`,
            width: 1024,
            height: 1024,
            caption: 'Datumsrechner'
        }
        /*
         * No `sameAs`. It was an empty array, which is the one option with no
         * upside: it occupies the slot search engines read for entity
         * consolidation while asserting nothing. The key returns when there are
         * real profiles to list — inventing them is the failure mode this
         * codebase has been removing.
         */
    };
}

export function webSiteNode(locale: string) {
    return {
        '@type': 'WebSite',
        '@id': webSiteId(locale),
        url: localeHome(locale),
        name: locale === 'de' ? 'Datumsrechner' : 'Date Calculator',
        inLanguage: locale === 'de' ? 'de-DE' : 'en',
        publisher: organizationRef
        /*
         * No `potentialAction`/SearchAction. There is no site-search endpoint,
         * and pointing one at a URL that does not resolve would claim a
         * capability the site does not have. It belongs here the day search
         * ships, not before.
         */
    };
}

/**
 * The calculator itself. Emitted only by the calculator routes — see
 * WebApplicationSchema for why it no longer lives in the layout.
 */
export function webApplicationNode(locale: string) {
    const isDe = locale === 'de';
    return {
        '@type': 'WebApplication',
        '@id': webApplicationId(locale),
        name: isDe ? 'Datumsrechner' : 'Date Calculator',
        url: localeHome(locale),
        applicationCategory: 'CalculatorApplication',
        operatingSystem: 'All',
        inLanguage: isDe ? 'de-DE' : 'en',
        description: isDe
            ? 'Kostenloser Online-Datumsrechner für exakte Zeitspannen, Fristen und Arbeitstage – mit Kalenderwochen nach ISO 8601.'
            : 'Free online date calculator for exact durations, deadlines and business days – with calendar weeks per ISO 8601.',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'EUR'
        },
        isPartOf: { '@id': webSiteId(locale) },
        creator: organizationRef,
        publisher: organizationRef,
        featureList: isDe
            ? [
                'Tage zwischen zwei Daten berechnen',
                'Tage, Monate oder Jahre zu einem Datum addieren',
                'Arbeitstage mit Feiertagen je Bundesland',
                'Alter in Jahren, Monaten und Tagen',
                'Countdown bis zu einem Termin'
            ]
            : [
                'Days between two dates',
                'Add days, months or years to a date',
                'Business days with public holidays per federal state',
                'Age in years, months and days',
                'Countdown to a date'
            ],
        browserRequirements:
            'Works in all modern browsers. JavaScript is required only for the interactive calculator.'
    };
}
