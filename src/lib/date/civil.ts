/**
 * Civil date core.
 *
 * A CivilDate is a calendar date with no time and no timezone — the thing a
 * user means by "24 August 2026". All calculator business logic must go
 * through this module.
 *
 * DST strategy: arithmetic is done on a day count (days since 1970-01-01)
 * using pure integer math, never on a JS `Date`. There is no hour component
 * to shift, so a daylight-saving transition cannot move a calendar day. The
 * only places a real clock is consulted are `getTodayInTimeZone` and the
 * explicit `Date` bridges at the bottom of this file.
 */

export type CivilDate = {
    /** Full proleptic Gregorian year, e.g. 2026. */
    year: number;
    /** 1–12. */
    month: number;
    /** 1–31. */
    day: number;
};

/** ISO weekday: Monday = 1 … Sunday = 7. */
export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type IsoWeek = {
    /** ISO-8601 week number, 1–53. */
    week: number;
    /** ISO week-numbering year, which may differ from the calendar year. */
    isoYear: number;
};

/** The site's canonical timezone. Server-rendered "today" is always this. */
export const CANONICAL_TIMEZONE = 'Europe/Berlin';

// ---------------------------------------------------------------------------
// Day-count conversion (Howard Hinnant's civil calendar algorithms)
// ---------------------------------------------------------------------------

/**
 * Days since the epoch 1970-01-01. Negative for earlier dates.
 * Exact for any year the Number type can represent; no Date involved.
 */
export function toDayNumber({ year, month, day }: CivilDate): number {
    const y = year - (month <= 2 ? 1 : 0);
    const era = Math.floor(y / 400);
    const yoe = y - era * 400; // [0, 399]
    const doy = Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + day - 1; // [0, 365]
    const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy; // [0, 146096]
    return era * 146097 + doe - 719468;
}

/** Inverse of `toDayNumber`. */
export function fromDayNumber(dayNumber: number): CivilDate {
    const z = dayNumber + 719468;
    const era = Math.floor(z / 146097);
    const doe = z - era * 146097; // [0, 146096]
    const yoe = Math.floor(
        (doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365
    ); // [0, 399]
    const y = yoe + era * 400;
    const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100)); // [0, 365]
    const mp = Math.floor((5 * doy + 2) / 153); // [0, 11]
    const day = doy - Math.floor((153 * mp + 2) / 5) + 1; // [1, 31]
    const month = mp + (mp < 10 ? 3 : -9); // [1, 12]
    return { year: y + (month <= 2 ? 1 : 0), month, day };
}

// ---------------------------------------------------------------------------
// Calendar facts
// ---------------------------------------------------------------------------

/** Full Gregorian rule: divisible by 4, except centuries not divisible by 400. */
export function isLeapYear(year: number): boolean {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function daysInYear(year: number): number {
    return isLeapYear(year) ? 366 : 365;
}

export function daysInMonth(year: number, month: number): number {
    if (month === 2) return isLeapYear(year) ? 29 : 28;
    return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

/** True if the fields describe a real calendar date. */
export function isValidCivilDate(d: unknown): d is CivilDate {
    if (typeof d !== 'object' || d === null) return false;
    const { year, month, day } = d as CivilDate;
    if (![year, month, day].every((n) => Number.isInteger(n))) return false;
    if (month < 1 || month > 12) return false;
    return day >= 1 && day <= daysInMonth(year, month);
}

// ---------------------------------------------------------------------------
// Arithmetic
// ---------------------------------------------------------------------------

export function addDays(date: CivilDate, amount: number): CivilDate {
    return fromDayNumber(toDayNumber(date) + amount);
}

export function subtractDays(date: CivilDate, amount: number): CivilDate {
    return addDays(date, -amount);
}

export function addWeeks(date: CivilDate, amount: number): CivilDate {
    return addDays(date, amount * 7);
}

/**
 * Add calendar months, clamping to the end of the target month.
 * 31 Jan + 1 month = 28 Feb (29 Feb in a leap year).
 */
export function addMonths(date: CivilDate, amount: number): CivilDate {
    const totalMonths = date.year * 12 + (date.month - 1) + amount;
    const year = Math.floor(totalMonths / 12);
    const month = totalMonths - year * 12 + 1;
    return { year, month, day: Math.min(date.day, daysInMonth(year, month)) };
}

/** Add calendar years, clamping 29 Feb to 28 Feb in non-leap years. */
export function addYears(date: CivilDate, amount: number): CivilDate {
    const year = date.year + amount;
    return { year, month: date.month, day: Math.min(date.day, daysInMonth(year, date.month)) };
}

/**
 * Exclusive day count: `end - start`. Negative when end precedes start.
 * 24 Aug → 25 Aug is 1. For inclusive counting add 1 (see `differenceInDaysInclusive`).
 */
export function differenceInDays(start: CivilDate, end: CivilDate): number {
    return toDayNumber(end) - toDayNumber(start);
}

/** Inclusive day count — counts both endpoints. 24 Aug → 24 Aug is 1. */
export function differenceInDaysInclusive(start: CivilDate, end: CivilDate): number {
    const diff = differenceInDays(start, end);
    return diff >= 0 ? diff + 1 : diff - 1;
}

/** -1 if a < b, 0 if equal, 1 if a > b. */
export function compareCivilDates(a: CivilDate, b: CivilDate): number {
    return Math.sign(toDayNumber(a) - toDayNumber(b));
}

export function isSameCivilDate(a: CivilDate, b: CivilDate): boolean {
    return a.year === b.year && a.month === b.month && a.day === b.day;
}

// ---------------------------------------------------------------------------
// Ordinal date, weekday, ISO week
// ---------------------------------------------------------------------------

/** 1 for 1 January, 365/366 for 31 December. */
export function getDayOfYear(date: CivilDate): number {
    return toDayNumber(date) - toDayNumber({ year: date.year, month: 1, day: 1 }) + 1;
}

/** ISO weekday: Monday = 1 … Sunday = 7. */
export function getIsoWeekday(date: CivilDate): IsoWeekday {
    // 1970-01-01 (day 0) was a Thursday, ISO weekday 4.
    const n = toDayNumber(date);
    return ((((n + 3) % 7) + 7) % 7 + 1) as IsoWeekday;
}

/** Number of ISO weeks in a given ISO week-numbering year: 52 or 53. */
export function isoWeeksInYear(year: number): number {
    const p = (y: number) =>
        (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400)) % 7;
    return p(year) === 4 || p(year - 1) === 3 ? 53 : 52;
}

/**
 * ISO-8601 week number and week-numbering year.
 * Week 1 is the week containing the first Thursday of the year, so early
 * January can belong to week 52/53 of the previous ISO year and late
 * December to week 1 of the next.
 */
export function getIsoWeek(date: CivilDate): IsoWeek {
    const week = Math.floor((getDayOfYear(date) - getIsoWeekday(date) + 10) / 7);
    if (week < 1) return { week: isoWeeksInYear(date.year - 1), isoYear: date.year - 1 };
    if (week > isoWeeksInYear(date.year)) return { week: 1, isoYear: date.year + 1 };
    return { week, isoYear: date.year };
}

// ---------------------------------------------------------------------------
// Parsing and formatting
// ---------------------------------------------------------------------------

/** Parse a strict ISO `YYYY-MM-DD`. Returns null on anything else. */
export function parseCivilDate(input: string): CivilDate | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.trim());
    if (!m) return null;
    const candidate = { year: +m[1], month: +m[2], day: +m[3] };
    return isValidCivilDate(candidate) ? candidate : null;
}

/** Serialize to `YYYY-MM-DD`. Locale-independent; safe as a machine value. */
export function formatCivilDate({ year, month, day }: CivilDate): string {
    const pad = (n: number, w = 2) => String(Math.abs(n)).padStart(w, '0');
    return `${year < 0 ? '-' : ''}${pad(year, 4)}-${pad(month)}-${pad(day)}`;
}

// ---------------------------------------------------------------------------
// Clock boundary — the only places that read real time
// ---------------------------------------------------------------------------

/**
 * The current civil date in a timezone.
 *
 * Uses `formatToParts` rather than a formatted string, per the rule that a
 * locale-formatted string is never a serialization format.
 */
export function getTodayInTimeZone(
    timeZone: string = CANONICAL_TIMEZONE,
    now: Date = new Date()
): CivilDate {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(now);

    const get = (type: string) => {
        const part = parts.find((p) => p.type === type);
        if (!part) throw new Error(`Missing "${type}" from Intl parts for ${timeZone}`);
        return Number(part.value);
    };

    return { year: get('year'), month: get('month'), day: get('day') };
}

/**
 * The UTC offset of a timezone at a given instant, in milliseconds.
 * Derived from Intl rather than a hardcoded table, so DST rule changes and
 * historical offsets are handled by the platform.
 */
function timeZoneOffsetMs(utcMs: number, timeZone: string): number {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).formatToParts(new Date(utcMs));

    const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
    // Read the wall-clock reading in that zone as if it were UTC; the gap is the offset.
    const asIfUtc = Date.UTC(
        get('year'),
        get('month') - 1,
        get('day'),
        get('hour') % 24,
        get('minute'),
        get('second')
    );
    return asIfUtc - utcMs;
}

/**
 * The instant (epoch ms) at which a calendar day begins in a timezone.
 *
 * Used to anchor the client-side countdown to the same moment the
 * server-rendered answer counts to, so the ticking clock cannot contradict the
 * indexed number for a viewer in another timezone.
 */
export function zonedStartOfDayMs(
    date: CivilDate,
    timeZone: string = CANONICAL_TIMEZONE
): number {
    const naive = Date.UTC(date.year, date.month - 1, date.day);
    const firstPass = naive - timeZoneOffsetMs(naive, timeZone);
    // Near a DST boundary the offset at the corrected instant can differ from
    // the offset at the guess; re-resolve once against the corrected instant.
    const corrected = naive - timeZoneOffsetMs(firstPass, timeZone);
    return corrected;
}

/**
 * The current civil date in the *viewer's* timezone.
 *
 * For interactive client-side tools only. Server-rendered canonical content
 * must use `getTodayInTimeZone()` with the canonical timezone instead, so the
 * indexed answer does not vary by who requested it.
 */
export function getLocalToday(now: Date = new Date()): CivilDate {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || CANONICAL_TIMEZONE;
    return getTodayInTimeZone(tz, now);
}

/**
 * Bridge to a JS `Date` at UTC midnight, for the presentation layer only
 * (date-fns formatting, `<input type="date">`, existing UI components).
 * Never do arithmetic on the result — come back to CivilDate for that.
 */
export function toUtcDate(date: CivilDate): Date {
    return new Date(Date.UTC(date.year, date.month - 1, date.day));
}

/** Read the UTC calendar fields of a `Date` as a CivilDate. */
export function fromUtcDate(date: Date): CivilDate {
    return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate()
    };
}
