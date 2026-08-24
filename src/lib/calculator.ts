/**
 * Calculator business logic.
 *
 * All arithmetic delegates to the civil-date core, so results are DST-safe and
 * independent of the server's or the viewer's timezone. Inputs are the raw
 * `YYYY-MM-DD` strings produced by `<input type="date">`; do not pass a JS
 * `Date` in here — parsing one reintroduces the timezone bug these functions
 * exist to avoid.
 */

import {
    CivilDate,
    addDays,
    addMonths,
    addWeeks,
    addYears,
    differenceInDays,
    fromDayNumber,
    getIsoWeekday,
    parseCivilDate,
    toDayNumber
} from './date/civil';

export type TimeUnit = 'days' | 'weeks' | 'months' | 'years';
export type Operation = 'add' | 'subtract';

/** Accepts an ISO string or an already-parsed CivilDate. */
export type DateInput = string | CivilDate;

function coerce(input: DateInput): CivilDate | null {
    return typeof input === 'string' ? parseCivilDate(input) : input;
}

const isWeekend = (dayNumber: number) => getIsoWeekday(fromDayNumber(dayNumber)) > 5;

/**
 * 1. Date difference.
 *
 * `totalDays` is exclusive and signed. The years/months/days breakdown is
 * calendar-aware: it walks whole years, then whole months, then the remainder,
 * so "1 month" respects the actual length of the month it lands in.
 */
export function calculateDateDifference(startInput: DateInput, endInput: DateInput) {
    const start = coerce(startInput);
    const end = coerce(endInput);
    if (!start || !end) return null;

    const isNegative = toDayNumber(start) > toDayNumber(end);
    const s = isNegative ? end : start;
    const e = isNegative ? start : end;

    const totalDays = differenceInDays(s, e);

    let years = e.year - s.year;
    if (toDayNumber(addYears(s, years)) > toDayNumber(e)) years--;
    const afterYears = addYears(s, years);

    let months = (e.year - afterYears.year) * 12 + (e.month - afterYears.month);
    if (toDayNumber(addMonths(afterYears, months)) > toDayNumber(e)) months--;
    const afterMonths = addMonths(afterYears, months);

    const days = differenceInDays(afterMonths, e);

    return {
        totalDays: (isNegative ? -1 : 1) * totalDays,
        weeksAndDays: {
            weeks: Math.floor(totalDays / 7),
            days: totalDays % 7
        },
        yearsMonthsDays: { years, months, days }
    };
}

/**
 * 2. Add / subtract time.
 *
 * Month and year arithmetic clamps to the end of the target month, so
 * 31 January + 1 month is 28 February (29 February in a leap year).
 */
export function calculateOffsetDate(
    baseInput: DateInput,
    amount: number,
    unit: TimeUnit,
    operation: Operation
): CivilDate | null {
    const base = coerce(baseInput);
    if (!base) return null;
    if (!Number.isFinite(amount)) return null;

    const signed = operation === 'subtract' ? -amount : amount;

    switch (unit) {
        case 'days':
            return addDays(base, signed);
        case 'weeks':
            return addWeeks(base, signed);
        case 'months':
            return addMonths(base, signed);
        case 'years':
            return addYears(base, signed);
    }
}

/**
 * 3. Business days.
 *
 * Counts Monday–Friday in the half-open interval [start, end), signed.
 * Public holidays are not considered — see the methodology page.
 */
export function getBusinessDays(startInput: DateInput, endInput: DateInput): number | null {
    const start = coerce(startInput);
    const end = coerce(endInput);
    if (!start || !end) return null;

    const s = toDayNumber(start);
    const e = toDayNumber(end);
    if (s === e) return 0;

    const sign = e > s ? 1 : -1;
    const lo = Math.min(s, e);
    const hi = Math.max(s, e);

    // Whole weeks contribute exactly five business days each.
    const span = hi - lo;
    let count = Math.floor(span / 7) * 5;
    for (let i = lo + Math.floor(span / 7) * 7; i < hi; i++) {
        if (!isWeekend(i)) count++;
    }

    return sign * count;
}

/**
 * Move a number of business days from a base date.
 * A weekend base is first moved to the nearest business day in the direction
 * of travel, then the offset is applied.
 */
export function addBusinessDaysOffset(baseInput: DateInput, amount: number): CivilDate | null {
    const base = coerce(baseInput);
    if (!base || !Number.isFinite(amount)) return null;

    const step = amount < 0 ? -1 : 1;
    let cursor = toDayNumber(base);
    while (isWeekend(cursor)) cursor += step;

    let remaining = Math.abs(Math.trunc(amount));

    // Shortcut whole weeks: from a weekday, five business days is seven days.
    const weeks = Math.floor(remaining / 5);
    cursor += weeks * 7 * step;
    remaining -= weeks * 5;

    while (remaining > 0) {
        cursor += step;
        if (!isWeekend(cursor)) remaining--;
    }

    return fromDayNumber(cursor);
}

/**
 * 4. Age.
 *
 * `years` is the completed age. A 29 February birthday is treated as reached
 * on 28 February in a common year, which is how the clamping in `addYears`
 * resolves it.
 */
export function calculateAge(birthdateInput: DateInput, targetInput: DateInput) {
    const birthdate = coerce(birthdateInput);
    const target = coerce(targetInput);
    if (!birthdate || !target) return null;

    const diff = calculateDateDifference(birthdate, target);
    if (!diff) return null;

    return {
        years: diff.yearsMonthsDays.years,
        months: diff.yearsMonthsDays.months,
        days: diff.yearsMonthsDays.days,
        totalDays: diff.totalDays
    };
}
