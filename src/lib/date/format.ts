/**
 * Localized presentation of civil dates.
 *
 * Every formatter pins `timeZone: 'UTC'` and feeds it a Date built at UTC
 * midnight, so the rendered calendar day always equals the CivilDate's day
 * regardless of where the viewer is. Formatting a civil date through the
 * viewer's local timezone is what makes a date render one day early west of
 * UTC — do not bypass these helpers.
 */

import { CivilDate, toUtcDate } from './civil';

const cache = new Map<string, Intl.DateTimeFormat>();

function formatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
    const key = `${locale}|${JSON.stringify(options)}`;
    let f = cache.get(key);
    if (!f) {
        f = new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' });
        cache.set(key, f);
    }
    return f;
}

const bcp47 = (locale: string) => (locale === 'de' ? 'de-DE' : locale === 'en' ? 'en-US' : locale);

/** "Montag, 24. August 2026" / "Monday, August 24, 2026" */
export function formatLong(date: CivilDate, locale: string): string {
    return formatter(bcp47(locale), {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(toUtcDate(date));
}

/** "24. August 2026" / "August 24, 2026" — no weekday. */
export function formatLongNoWeekday(date: CivilDate, locale: string): string {
    return formatter(bcp47(locale), {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(toUtcDate(date));
}

/** "25. Dezember" / "December 25" — no year, for use after a year is already stated. */
export function formatDayMonthLong(date: CivilDate, locale: string): string {
    return formatter(bcp47(locale), { day: 'numeric', month: 'long' }).format(toUtcDate(date));
}

/** "24. Aug. 2026" / "Aug 24, 2026" — abbreviated month. */
export function formatMedium(date: CivilDate, locale: string): string {
    return formatter(bcp47(locale), {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).format(toUtcDate(date));
}

/** "24.08.2026" / "08/24/2026" */
export function formatNumeric(date: CivilDate, locale: string): string {
    return formatter(bcp47(locale), {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(toUtcDate(date));
}

/** "24.08." / "08/24" — for compact history entries. */
export function formatDayMonth(date: CivilDate, locale: string): string {
    return formatter(bcp47(locale), { day: '2-digit', month: '2-digit' }).format(toUtcDate(date));
}

/** "Montag" / "Monday" */
export function formatWeekday(date: CivilDate, locale: string): string {
    return formatter(bcp47(locale), { weekday: 'long' }).format(toUtcDate(date));
}

/**
 * Format a number for the locale — German uses a comma as the decimal
 * separator. Use this for every derived figure shown in copy.
 */
export function formatNumber(value: number, locale: string, maximumFractionDigits = 1): string {
    return new Intl.NumberFormat(bcp47(locale), { maximumFractionDigits }).format(value);
}
