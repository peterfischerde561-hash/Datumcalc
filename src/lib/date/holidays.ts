/**
 * German public holidays (gesetzliche Feiertage), by Bundesland.
 *
 * Until now the business-day calculator counted Monday to Friday and said
 * plainly that it did not deduct holidays, because they differ by state. That
 * was honest but it is also where the demand is: "Arbeitstage 2026 NRW" and
 * "Feiertage Bayern" are the searches, and every serious competitor segments
 * by Bundesland.
 *
 * Every date is computed — the fixed ones from their month and day, the movable
 * ones from Easter via the existing Computus implementation. Nothing is
 * tabulated per year, so this does not need maintaining and cannot go stale.
 *
 * KNOWN LIMITS, stated rather than hidden (see /wie-wir-rechnen):
 *   - Fronleichnam is a public holiday in parts of Sachsen and Thüringen at
 *     municipality level. This module treats it as not a holiday there,
 *     because the state alone cannot decide it.
 *   - Mariä Himmelfahrt applies in Bayern only in predominantly Catholic
 *     municipalities. Treated as not a holiday for BY for the same reason.
 *   - Heilige Drei Könige, Allerheiligen and the rest are state-wide where
 *     listed, so those are exact.
 *
 * A calculator that quietly guesses a municipality would be worse than one
 * that states what it does not know.
 */

import { CivilDate, addDays, fromDayNumber, getIsoWeekday, toDayNumber } from './civil';
import { computeEaster } from '../events';

export const BUNDESLAENDER = {
    BW: 'Baden-Württemberg',
    BY: 'Bayern',
    BE: 'Berlin',
    BB: 'Brandenburg',
    HB: 'Bremen',
    HH: 'Hamburg',
    HE: 'Hessen',
    MV: 'Mecklenburg-Vorpommern',
    NI: 'Niedersachsen',
    NW: 'Nordrhein-Westfalen',
    RP: 'Rheinland-Pfalz',
    SL: 'Saarland',
    SN: 'Sachsen',
    ST: 'Sachsen-Anhalt',
    SH: 'Schleswig-Holstein',
    TH: 'Thüringen'
} as const;

export type BundeslandCode = keyof typeof BUNDESLAENDER;

export const BUNDESLAND_CODES = Object.keys(BUNDESLAENDER) as BundeslandCode[];

export function isBundeslandCode(value: string): value is BundeslandCode {
    return Object.prototype.hasOwnProperty.call(BUNDESLAENDER, value);
}

export type Holiday = {
    date: CivilDate;
    name: string;
    /** True when it applies in every Bundesland. */
    nationwide: boolean;
};

/** Fixed-date holidays: [month, day, name, states or null for nationwide]. */
const FIXED: [number, number, string, BundeslandCode[] | null][] = [
    [1, 1, 'Neujahr', null],
    [1, 6, 'Heilige Drei Könige', ['BW', 'BY', 'ST']],
    [3, 8, 'Internationaler Frauentag', ['BE', 'MV']],
    [5, 1, 'Tag der Arbeit', null],
    [8, 15, 'Mariä Himmelfahrt', ['SL']],
    [9, 20, 'Weltkindertag', ['TH']],
    [10, 3, 'Tag der Deutschen Einheit', null],
    [10, 31, 'Reformationstag', ['BB', 'HB', 'HH', 'MV', 'NI', 'SN', 'ST', 'SH', 'TH']],
    [11, 1, 'Allerheiligen', ['BW', 'BY', 'NW', 'RP', 'SL']],
    [12, 25, '1. Weihnachtstag', null],
    [12, 26, '2. Weihnachtstag', null]
];

/** Easter-relative holidays: [offset in days from Easter Sunday, name, states]. */
const MOVABLE: [number, string, BundeslandCode[] | null][] = [
    [-2, 'Karfreitag', null],
    [0, 'Ostersonntag', ['BB']],
    [1, 'Ostermontag', null],
    [39, 'Christi Himmelfahrt', null],
    [49, 'Pfingstsonntag', ['BB']],
    [50, 'Pfingstmontag', null],
    [60, 'Fronleichnam', ['BW', 'BY', 'HE', 'NW', 'RP', 'SL']]
];

/**
 * Buß- und Bettag: the Wednesday before 23 November. Sachsen only since 1995.
 * Defined by counting back from a fixed date rather than "the Nth Wednesday",
 * which is the usual way to get this one wrong.
 */
function bussUndBettag(year: number): CivilDate {
    let d: CivilDate = { year, month: 11, day: 22 };
    while (getIsoWeekday(d) !== 3) d = addDays(d, -1);
    return d;
}

/** Every public holiday in a Bundesland for a year, sorted by date. */
export function holidaysFor(year: number, state: BundeslandCode): Holiday[] {
    const out: Holiday[] = [];

    for (const [month, day, name, states] of FIXED) {
        if (states === null || states.includes(state)) {
            out.push({ date: { year, month, day }, name, nationwide: states === null });
        }
    }

    const easter = computeEaster(year);
    const easterDate: CivilDate = { year, month: easter.month + 1, day: easter.day };
    for (const [offset, name, states] of MOVABLE) {
        if (states === null || states.includes(state)) {
            out.push({ date: addDays(easterDate, offset), name, nationwide: states === null });
        }
    }

    if (state === 'SN') {
        out.push({ date: bussUndBettag(year), name: 'Buß- und Bettag', nationwide: false });
    }

    return out.sort((a, b) => toDayNumber(a.date) - toDayNumber(b.date));
}

export function isPublicHoliday(date: CivilDate, state: BundeslandCode): boolean {
    return holidaysFor(date.year, state).some(
        (h) => toDayNumber(h.date) === toDayNumber(date)
    );
}

/**
 * Business days in the half-open interval [start, end), excluding weekends and
 * the public holidays of `state`. Holidays that fall on a weekend are not
 * double-counted, because they were never in the count to begin with.
 *
 * Returns the count and the holidays that were actually deducted, so the page
 * can show its work rather than just a smaller number.
 */
export function businessDaysExcludingHolidays(
    start: CivilDate,
    end: CivilDate,
    state: BundeslandCode
): { count: number; deducted: Holiday[] } {
    const s = toDayNumber(start);
    const e = toDayNumber(end);
    if (s === e) return { count: 0, deducted: [] };

    const sign = e > s ? 1 : -1;
    const lo = Math.min(s, e);
    const hi = Math.max(s, e);

    const byDayNumber = new Map<number, Holiday>();
    for (let y = Math.min(start.year, end.year) - 1; y <= Math.max(start.year, end.year) + 1; y++) {
        for (const h of holidaysFor(y, state)) byDayNumber.set(toDayNumber(h.date), h);
    }

    let count = 0;
    const deducted: Holiday[] = [];

    for (let n = lo; n < hi; n++) {
        if (getIsoWeekday(fromDayNumber(n)) > 5) continue; // weekend, never counted
        const holiday = byDayNumber.get(n);
        if (holiday) {
            deducted.push(holiday);
            continue;
        }
        count++;
    }

    return { count: sign * count, deducted };
}
