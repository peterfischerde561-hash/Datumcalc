/**
 * Which locales are open to indexing.
 *
 * `/en` is served but not indexed. Over the three months to 2026-08-24 it
 * produced 1,186 impressions and zero clicks, ranking 58–97 for English head
 * terms ("date calculator" at 76, "date finder" at 59) — a German exact-match
 * domain competing against calculator.net and timeanddate.com with no domain
 * relevance and no crawlable inbound links. `follow` is kept so link equity
 * still flows to the German pages it points at.
 *
 * This is reversible: remove the locale from NOINDEXED_LOCALES to reopen it.
 * Revisit if the German side is healthy and the English pages are given
 * genuinely distinct value rather than translated German ones.
 */

import { locales } from '@/i18n/locales';

export const NOINDEXED_LOCALES = new Set<string>(['en']);

export function isIndexableLocale(locale: string): boolean {
    return !NOINDEXED_LOCALES.has(locale);
}

/**
 * The robots directive for a page, combining locale policy with the page's own
 * indexability. Locale policy wins: a canonical page in a noindexed locale is
 * still noindex.
 */
export function robotsDirective(locale: string, pageIsIndexable = true): string {
    return isIndexableLocale(locale) && pageIsIndexable ? 'index, follow' : 'noindex, follow';
}

/**
 * hreflang alternates for a page, covering indexable locales only.
 *
 * Declaring an alternate that serves `noindex` asks a crawler to consider a
 * page it is then told to drop, so a noindexed locale is omitted rather than
 * advertised. `x-default` always points at the German URL, which is the
 * canonical experience for this domain.
 *
 * Every page builds its alternates through this function; the map was
 * previously reconstructed by hand in ten separate files, which is how one
 * locale policy change could silently miss half the site.
 */
export function hreflangAlternates(
    pathForLocale: (locale: string) => string
): Record<string, string> {
    const languages: Record<string, string> = {};

    for (const locale of locales.filter(isIndexableLocale)) {
        languages[locale] = pathForLocale(locale);
    }

    languages['x-default'] = pathForLocale('de');
    return languages;
}
