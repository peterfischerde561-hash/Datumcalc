/**
 * Shared, client-safe event metadata + date math.
 * Used by the server content engine (weekday tables, prose) and by the
 * client-side countdown timer, so Easter and occurrence logic live in one place.
 */

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

// UTC date for stable weekday/date formatting in server-rendered tables.
export function getEventDateUTC(eventKey: string, year: number): Date | null {
    const md = eventMonthDay(eventKey, year);
    if (!md) return null;
    return new Date(Date.UTC(year, md.month, md.day));
}

// Next upcoming occurrence as a LOCAL date at 00:00, for the live countdown.
export function getNextOccurrence(eventKey: string, from: Date = new Date()): Date | null {
    const year = from.getFullYear();
    const md = eventMonthDay(eventKey, year);
    if (!md) return null;
    let d = new Date(year, md.month, md.day, 0, 0, 0, 0);
    if (d.getTime() <= from.getTime()) {
        const next = eventMonthDay(eventKey, year + 1)!;
        d = new Date(year + 1, next.month, next.day, 0, 0, 0, 0);
    }
    return d;
}
