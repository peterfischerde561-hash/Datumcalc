import { describe, it, expect } from 'vitest';
import {
    CivilDate,
    addDays,
    addMonths,
    addYears,
    compareCivilDates,
    daysInYear,
    differenceInDays,
    differenceInDaysInclusive,
    formatCivilDate,
    fromDayNumber,
    getDayOfYear,
    getIsoWeek,
    getIsoWeekday,
    getTodayInTimeZone,
    isLeapYear,
    isValidCivilDate,
    isoWeeksInYear,
    parseCivilDate,
    subtractDays,
    toDayNumber
} from './civil';

const d = (year: number, month: number, day: number): CivilDate => ({ year, month, day });
const iso = (c: CivilDate) => formatCivilDate(c);

describe('leap years', () => {
    it.each([
        [2000, true],
        [1900, false],
        [2024, true],
        [2100, false],
        [2026, false],
        [2028, true]
    ])('isLeapYear(%i) === %s', (year, expected) => {
        expect(isLeapYear(year)).toBe(expected);
    });

    it('daysInYear(2028) === 366', () => {
        expect(daysInYear(2028)).toBe(366);
    });

    it('daysInYear(2026) === 365', () => {
        expect(daysInYear(2026)).toBe(365);
    });
});

describe('month-boundary arithmetic', () => {
    it('clamps 31 Jan + 1 month to 28 Feb in a common year', () => {
        expect(iso(addMonths(d(2026, 1, 31), 1))).toBe('2026-02-28');
    });

    it('clamps 31 Jan + 1 month to 29 Feb in a leap year', () => {
        expect(iso(addMonths(d(2024, 1, 31), 1))).toBe('2024-02-29');
    });

    it.each([
        [d(2026, 2, 28), 1, '2026-03-01'],
        [d(2024, 2, 28), 1, '2024-02-29'],
        [d(2024, 2, 29), 1, '2024-03-01'],
        [d(2026, 12, 31), 1, '2027-01-01'],
        [d(2026, 1, 31), 1, '2026-02-01']
    ])('addDays(%o, %i) === %s', (start, amount, expected) => {
        expect(iso(addDays(start, amount))).toBe(expected);
    });

    it('clamps 29 Feb + 1 year to 28 Feb', () => {
        expect(iso(addYears(d(2024, 2, 29), 1))).toBe('2025-02-28');
    });

    it('addMonths is reversible only where no clamping occurred', () => {
        expect(iso(addMonths(addMonths(d(2026, 3, 15), 1), -1))).toBe('2026-03-15');
        // Clamping is lossy by design: 31 Jan -> 28 Feb -> 28 Jan.
        expect(iso(addMonths(addMonths(d(2026, 1, 31), 1), -1))).toBe('2026-01-28');
    });
});

describe('day of year', () => {
    it('24 August 2026 is day 236', () => {
        expect(getDayOfYear(d(2026, 8, 24))).toBe(236);
    });

    it.each([
        [d(2026, 1, 1), 1],
        [d(2026, 12, 31), 365],
        [d(2024, 12, 31), 366],
        [d(2024, 3, 1), 61],
        [d(2026, 3, 1), 60]
    ])('getDayOfYear(%o) === %i', (date, expected) => {
        expect(getDayOfYear(date)).toBe(expected);
    });
});

describe('ISO weeks', () => {
    it('1 January 2026 is a Thursday, so week 1 of 2026', () => {
        expect(getIsoWeekday(d(2026, 1, 1))).toBe(4);
        expect(getIsoWeek(d(2026, 1, 1))).toEqual({ week: 1, isoYear: 2026 });
    });

    it('1 January 2027 is a Friday, so week 53 of 2026', () => {
        expect(getIsoWeekday(d(2027, 1, 1))).toBe(5);
        expect(getIsoWeek(d(2027, 1, 1))).toEqual({ week: 53, isoYear: 2026 });
    });

    it('24 August 2026 is in week 35', () => {
        expect(getIsoWeek(d(2026, 8, 24)).week).toBe(35);
    });

    it.each([
        // 1 Jan falling in the previous ISO year
        [d(2022, 1, 1), 52, 2021],
        [d(2023, 1, 1), 52, 2022],
        // 31 Dec falling in the next ISO year
        [d(2024, 12, 31), 1, 2025],
        [d(2019, 12, 30), 1, 2020],
        // Genuine 53-week years
        [d(2020, 12, 31), 53, 2020],
        [d(2026, 12, 31), 53, 2026]
    ])('getIsoWeek(%o) === week %i of %i', (date, week, isoYear) => {
        expect(getIsoWeek(date)).toEqual({ week, isoYear });
    });

    it('identifies 53-week years', () => {
        expect(isoWeeksInYear(2020)).toBe(53);
        expect(isoWeeksInYear(2026)).toBe(53);
        expect(isoWeeksInYear(2025)).toBe(52);
        expect(isoWeeksInYear(2024)).toBe(52);
    });

    it('every ISO week number in a year is between 1 and its week count', () => {
        for (const year of [2024, 2025, 2026, 2027]) {
            let cursor = d(year, 1, 1);
            while (cursor.year === year) {
                const { week, isoYear } = getIsoWeek(cursor);
                expect(week).toBeGreaterThanOrEqual(1);
                expect(week).toBeLessThanOrEqual(isoWeeksInYear(isoYear));
                cursor = addDays(cursor, 1);
            }
        }
    });
});

describe('the 100-days-from-today case', () => {
    // The worked example the SEO pages must server-render.
    const start = d(2026, 8, 24);
    const target = addDays(start, 100);

    it('lands on 2 December 2026', () => {
        expect(iso(target)).toBe('2026-12-02');
    });

    it('is a Wednesday', () => {
        expect(getIsoWeekday(target)).toBe(3);
    });

    it('is day 336 of the year', () => {
        expect(getDayOfYear(target)).toBe(336);
    });

    it('round-trips back to the start date', () => {
        expect(iso(subtractDays(target, 100))).toBe(iso(start));
        expect(differenceInDays(start, target)).toBe(100);
    });
});

describe('differences', () => {
    it('is exclusive by default and signed', () => {
        expect(differenceInDays(d(2026, 8, 24), d(2026, 8, 25))).toBe(1);
        expect(differenceInDays(d(2026, 8, 24), d(2026, 8, 24))).toBe(0);
        expect(differenceInDays(d(2026, 8, 25), d(2026, 8, 24))).toBe(-1);
    });

    it('counts both endpoints when inclusive', () => {
        expect(differenceInDaysInclusive(d(2026, 8, 24), d(2026, 8, 24))).toBe(1);
        expect(differenceInDaysInclusive(d(2026, 8, 24), d(2026, 8, 25))).toBe(2);
    });

    it('counts the leap day inside a span', () => {
        expect(differenceInDays(d(2024, 2, 28), d(2024, 3, 1))).toBe(2);
        expect(differenceInDays(d(2026, 2, 28), d(2026, 3, 1))).toBe(1);
    });

    it('orders dates correctly', () => {
        expect(compareCivilDates(d(2026, 1, 1), d(2026, 1, 2))).toBe(-1);
        expect(compareCivilDates(d(2026, 1, 2), d(2026, 1, 1))).toBe(1);
        expect(compareCivilDates(d(2026, 1, 1), d(2026, 1, 1))).toBe(0);
    });
});

describe('DST safety', () => {
    // Europe/Berlin 2026: spring forward 29 March, fall back 25 October.
    it('adding a day across spring-forward advances exactly one calendar day', () => {
        expect(iso(addDays(d(2026, 3, 28), 1))).toBe('2026-03-29');
        expect(iso(addDays(d(2026, 3, 29), 1))).toBe('2026-03-30');
    });

    it('adding a day across fall-back advances exactly one calendar day', () => {
        expect(iso(addDays(d(2026, 10, 24), 1))).toBe('2026-10-25');
        expect(iso(addDays(d(2026, 10, 25), 1))).toBe('2026-10-26');
    });

    it('a span crossing both transitions counts whole days', () => {
        // 29 Mar -> 25 Oct 2026 spans a +1h and a -1h shift; must be exact.
        expect(differenceInDays(d(2026, 3, 29), d(2026, 10, 25))).toBe(210);
    });

    it('day-of-year does not drop by one after a DST shift', () => {
        // Regression guard: the previous implementation floored a millisecond
        // span from "Jan 0" and lost a day between 00:00 and 01:00 local time
        // once Berlin moved to UTC+2.
        for (const date of [d(2026, 3, 29), d(2026, 6, 15), d(2026, 8, 24), d(2026, 10, 25)]) {
            const viaCount = toDayNumber(date) - toDayNumber(d(date.year, 1, 1)) + 1;
            expect(getDayOfYear(date)).toBe(viaCount);
        }
    });
});

describe('getTodayInTimeZone', () => {
    it('resolves the Berlin civil date just after local midnight in summer', () => {
        // Berlin is UTC+2 in August: 2026-08-23T22:30Z is 2026-08-24T00:30 local.
        const today = getTodayInTimeZone('Europe/Berlin', new Date('2026-08-23T22:30:00Z'));
        expect(iso(today)).toBe('2026-08-24');
        expect(getDayOfYear(today)).toBe(236);
        expect(getIsoWeek(today).week).toBe(35);
    });

    it('has not yet rolled over just before local midnight', () => {
        const today = getTodayInTimeZone('Europe/Berlin', new Date('2026-08-23T21:59:00Z'));
        expect(iso(today)).toBe('2026-08-23');
        expect(getDayOfYear(today)).toBe(235);
    });

    it('resolves the Berlin civil date just after local midnight in winter', () => {
        // Berlin is UTC+1 in December: 2026-12-01T23:30Z is 2026-12-02T00:30 local.
        expect(iso(getTodayInTimeZone('Europe/Berlin', new Date('2026-12-01T23:30:00Z')))).toBe(
            '2026-12-02'
        );
    });

    it('is independent of the machine timezone', () => {
        const instant = new Date('2026-08-23T22:30:00Z');
        expect(iso(getTodayInTimeZone('Europe/Berlin', instant))).toBe('2026-08-24');
        expect(iso(getTodayInTimeZone('UTC', instant))).toBe('2026-08-23');
        expect(iso(getTodayInTimeZone('America/New_York', instant))).toBe('2026-08-23');
    });
});

describe('parsing and formatting', () => {
    it('round-trips a valid ISO date', () => {
        expect(formatCivilDate(parseCivilDate('2026-08-24')!)).toBe('2026-08-24');
    });

    it('pads single-digit months and days', () => {
        expect(formatCivilDate(d(2026, 1, 5))).toBe('2026-01-05');
    });

    it.each(['2026-02-30', '2026-13-01', '2026-00-10', 'today', '24.08.2026', '2026-8-4', ''])(
        'rejects %s',
        (input) => {
            expect(parseCivilDate(input)).toBeNull();
        }
    );

    it('accepts 29 February only in a leap year', () => {
        expect(parseCivilDate('2024-02-29')).not.toBeNull();
        expect(parseCivilDate('2026-02-29')).toBeNull();
    });

    it('validates structurally', () => {
        expect(isValidCivilDate(d(2026, 8, 24))).toBe(true);
        expect(isValidCivilDate(d(2026, 2, 29))).toBe(false);
        expect(isValidCivilDate({ year: 2026, month: 8, day: 24.5 })).toBe(false);
        expect(isValidCivilDate(null)).toBe(false);
    });
});

describe('day-number conversion', () => {
    it('anchors the epoch', () => {
        expect(toDayNumber(d(1970, 1, 1))).toBe(0);
        expect(iso(fromDayNumber(0))).toBe('1970-01-01');
    });

    it('handles pre-epoch dates', () => {
        expect(iso(fromDayNumber(toDayNumber(d(1900, 2, 28)) + 1))).toBe('1900-03-01');
    });

    it('round-trips across a long span', () => {
        let cursor = d(1999, 12, 25);
        for (let i = 0; i < 800; i++) {
            expect(fromDayNumber(toDayNumber(cursor))).toEqual(cursor);
            cursor = addDays(cursor, 1);
        }
    });
});
