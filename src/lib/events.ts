/**
 * Shared, client-safe event metadata + date math.
 * Used by the server content engine (weekday tables, prose) and by the
 * client-side countdown timer, so Easter and occurrence logic live in one place.
 */

import { CivilDate, differenceInDays } from './date/civil';

// Grammatically correct German forms. `de` is nominative (sentence start),
// `bisDe` the form that follows "bis ".
export const EVENT_NAMES: Record<string, {
    de: string; bisDe: string; en: string;
    whenDe?: string; whenEn?: string; movable?: boolean;
}> = {
    weihnachten: { de: 'Weihnachten', bisDe: 'Weihnachten', en: 'Christmas', whenDe: 'jedes Jahr am 25. Dezember', whenEn: 'every year on December 25' },
    silvester: { de: 'Silvester', bisDe: 'Silvester', en: "New Year's Eve", whenDe: 'am 31. Dezember', whenEn: 'on December 31' },
    neujahr: { de: 'Neujahr', bisDe: 'Neujahr', en: 'New Year', whenDe: 'am 1. Januar', whenEn: 'on January 1' },
    ostern: { de: 'Ostern', bisDe: 'Ostern', en: 'Easter', whenDe: 'an einem wechselnden Datum zwischen dem 22. März und dem 25. April', whenEn: 'on a changing date between March 22 and April 25', movable: true },
    sommeranfang: { de: 'Der Sommeranfang', bisDe: 'zum Sommeranfang', en: 'the summer solstice', whenDe: 'um den 21. Juni', whenEn: 'around June 21' },
    urlaub: { de: 'Der Urlaub', bisDe: 'zum Urlaub', en: 'your vacation' },
};

// Easter Sunday (Gregorian) via the Anonymous Gregorian / Computus algorithm.
export function computeEaster(year: number): { month: number; day: number } {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = March, 4 = April
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return { month: month - 1, day }; // 0-indexed month
}

// Month/day for an event in a given year. Returns null for events without a
// fixed calendar date used in tables (urlaub is handled separately below).
export function eventMonthDay(eventKey: string, year: number): { month: number; day: number } | null {
    switch (eventKey) {
        case 'weihnachten': return { month: 11, day: 25 };
        case 'silvester': return { month: 11, day: 31 };
        case 'neujahr': return { month: 0, day: 1 };
        case 'sommeranfang': return { month: 5, day: 21 };
        case 'urlaub': return { month: 6, day: 1 }; // approximated as start of July
        case 'ostern': return computeEaster(year);
        default: return null;
    }
}

/*
 * The Date-based helpers that used to sit here are gone.
 *
 * getNextOccurrence() built a local-time Date and compared it against a Date
 * carrying a clock time, which is why a countdown read 365 days on the event
 * day itself. It was replaced by getNextOccurrenceCivil() below and had no
 * remaining callers.
 *
 * getEventDateUTC() returned a UTC Date purely so a table could be formatted;
 * getEventCivilDate() plus the formatters in date/format.ts do that without a
 * Date at all.
 */

// ---------------------------------------------------------------------------
// Civil-date API — what server-rendered answers and metadata must use.
// ---------------------------------------------------------------------------

/** The event's calendar date in a given year. */
export function getEventCivilDate(eventKey: string, year: number): CivilDate | null {
    const md = eventMonthDay(eventKey, year);
    if (!md) return null;
    return { year, month: md.month + 1, day: md.day };
}

/**
 * The occurrence a countdown should point at, given today's civil date.
 *
 * The event still counts as upcoming *on the day itself* — on 25 December the
 * answer is "today", not "365 days". (The legacy Date-based helper above rolls
 * to next year at 00:00:01 on the day, which is why the countdown read 365 on
 * the event date itself.)
 */
export function getNextOccurrenceCivil(
    eventKey: string,
    today: CivilDate
): { date: CivilDate; daysRemaining: number } | null {
    const thisYear = getEventCivilDate(eventKey, today.year);
    if (!thisYear) return null;

    const date =
        differenceInDays(today, thisYear) >= 0
            ? thisYear
            : getEventCivilDate(eventKey, today.year + 1)!;

    return { date, daysRemaining: differenceInDays(today, date) };
}
