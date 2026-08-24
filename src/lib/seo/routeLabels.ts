/**
 * The one place a tool route's user-facing name is defined.
 *
 * Anchor text is a ranking input and breadcrumb text feeds BreadcrumbList, so
 * the same URL must not be called four different things across nav, breadcrumb,
 * sitemap and tool cards. No component should hardcode a route's label — import
 * it from here, keyed by locale.
 *
 * This also closes the class of bug where an English page rendered German
 * anchor text: a hardcoded label cannot be localized, and every string that
 * reaches a page must come from a locale-keyed lookup.
 */

export type ToolKey = 'differenz' | 'addieren' | 'arbeitstage' | 'alter' | 'ratgeber';

export type RouteLabel = {
    /** Anchor text and breadcrumb label. Keep stable — it is a ranking input. */
    label: string;
    /** One-line description for cards and nav flyouts. */
    description: string;
    /** A representative query, used in the homepage use-case table. */
    example: string;
};

/** Tools are calculators; guides are editorial. Used to label link groups. */
export const ROUTE_KIND: Record<ToolKey, 'tool' | 'guide'> = {
    differenz: 'tool',
    addieren: 'tool',
    arbeitstage: 'tool',
    alter: 'tool',
    ratgeber: 'guide'
};

export const ROUTE_LABELS: Record<ToolKey, Record<'de' | 'en', RouteLabel>> = {
    differenz: {
        de: {
            // "Differenz" alone is a weak anchor; the demand is for "tage berechnen"
            // / "tage zwischen zwei daten". The URL is unchanged.
            label: 'Tage berechnen',
            description: 'Tage zwischen zwei Daten berechnen',
            example: 'Tage bis Weihnachten'
        },
        en: {
            label: 'Count Days',
            description: 'Calculate days between two dates',
            example: 'Days until Christmas'
        }
    },
    addieren: {
        de: {
            label: 'Datum addieren',
            description: 'Tage zu einem Datum addieren oder subtrahieren',
            example: '14 Tage ab heute'
        },
        en: {
            label: 'Add to Date',
            description: 'Add or subtract days from a date',
            example: '14 days from today'
        }
    },
    arbeitstage: {
        de: {
            label: 'Arbeitstage',
            description: 'Netto-Arbeitstage zwischen zwei Daten ermitteln',
            example: 'Arbeitstage im 4. Quartal'
        },
        en: {
            label: 'Business Days',
            description: 'Calculate net business days between dates',
            example: 'Net business days in Q4'
        }
    },
    alter: {
        de: {
            label: 'Altersrechner',
            description: 'Alter in Jahren, Monaten und Tagen berechnen',
            example: 'Alter am 01.01.2050'
        },
        en: {
            label: 'Age Calculator',
            description: 'Calculate age in years, months and days',
            example: 'Age on 01/01/2050'
        }
    },
    ratgeber: {
        de: {
            label: 'Ratgeber',
            description: 'Wissensbeiträge rund um Datum und Zeit',
            example: 'Schaltjahre erklärt'
        },
        en: {
            label: 'Guides',
            description: 'Knowledge base about dates and time',
            example: 'Leap years explained'
        }
    }
};

/** Label lookup with a safe fallback to German if an unknown locale arrives. */
export function routeLabel(key: ToolKey, locale: string): RouteLabel {
    const byLocale = ROUTE_LABELS[key];
    return byLocale[locale === 'en' ? 'en' : 'de'];
}
