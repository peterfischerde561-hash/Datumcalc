import { describe, it, expect } from 'vitest';
import {
    addBusinessDaysOffset,
    calculateAge,
    calculateDateDifference,
    calculateOffsetDate,
    getBusinessDays
} from './calculator';
import { formatCivilDate } from './date/civil';

const iso = (c: ReturnType<typeof calculateOffsetDate>) => (c ? formatCivilDate(c) : null);

describe('calculateOffsetDate', () => {
    it.each([
        ['2026-08-24', 100, 'days', 'add', '2026-12-02'],
        ['2026-08-24', 100, 'days', 'subtract', '2026-05-16'],
        ['2026-08-24', 2, 'weeks', 'add', '2026-09-07'],
        ['2026-01-31', 1, 'months', 'add', '2026-02-28'],
        ['2024-01-31', 1, 'months', 'add', '2024-02-29'],
        ['2024-02-29', 1, 'years', 'add', '2025-02-28'],
        ['2026-12-31', 1, 'days', 'add', '2027-01-01'],
        ['2026-01-01', 1, 'days', 'subtract', '2025-12-31']
    ] as const)('%s %s %i %s -> %s', (base, amount, unit, op, expected) => {
        expect(iso(calculateOffsetDate(base, amount, unit, op))).toBe(expected);
    });

    it('rejects malformed input rather than guessing', () => {
        expect(calculateOffsetDate('not-a-date', 1, 'days', 'add')).toBeNull();
        expect(calculateOffsetDate('2026-02-30', 1, 'days', 'add')).toBeNull();
        expect(calculateOffsetDate('2026-08-24', NaN, 'days', 'add')).toBeNull();
    });

    it('is unaffected by the machine timezone', () => {
        // Regression guard: the previous implementation parsed the input as
        // UTC midnight and then formatted it in local time, rendering the
        // previous day for viewers west of UTC.
        const original = process.env.TZ;
        try {
            for (const tz of ['UTC', 'America/New_York', 'Pacific/Kiritimati', 'Europe/Berlin']) {
                process.env.TZ = tz;
                expect(iso(calculateOffsetDate('2026-08-24', 100, 'days', 'add'))).toBe('2026-12-02');
            }
        } finally {
            process.env.TZ = original;
        }
    });
});

describe('calculateDateDifference', () => {
    it('counts a plain span', () => {
        const r = calculateDateDifference('2026-08-24', '2026-12-02')!;
        expect(r.totalDays).toBe(100);
        expect(r.weeksAndDays).toEqual({ weeks: 14, days: 2 });
    });

    it('signs a reversed span but keeps the breakdown positive', () => {
        const r = calculateDateDifference('2026-12-02', '2026-08-24')!;
        expect(r.totalDays).toBe(-100);
        expect(r.yearsMonthsDays).toEqual({ years: 0, months: 3, days: 8 });
    });

    it('is zero for the same day', () => {
        const r = calculateDateDifference('2026-08-24', '2026-08-24')!;
        expect(r.totalDays).toBe(0);
        expect(r.yearsMonthsDays).toEqual({ years: 0, months: 0, days: 0 });
    });

    it('respects real month lengths in the breakdown', () => {
        // 31 Jan + 1 month clamps to 28 Feb, leaving one further day to 1 Mar.
        const r = calculateDateDifference('2026-01-31', '2026-03-01')!;
        expect(r.totalDays).toBe(29);
        expect(r.yearsMonthsDays).toEqual({ years: 0, months: 1, days: 1 });
    });

    it('includes the leap day', () => {
        expect(calculateDateDifference('2024-02-28', '2024-03-01')!.totalDays).toBe(2);
        expect(calculateDateDifference('2026-02-28', '2026-03-01')!.totalDays).toBe(1);
    });

    it('never reports a negative month or day component', () => {
        const pairs = [
            ['2026-01-31', '2026-02-28'],
            ['2024-02-29', '2025-02-28'],
            ['2026-08-24', '2027-08-23'],
            ['2000-01-01', '2026-08-24']
        ] as const;
        for (const [a, b] of pairs) {
            const { years, months, days } = calculateDateDifference(a, b)!.yearsMonthsDays;
            expect(years).toBeGreaterThanOrEqual(0);
            expect(months).toBeGreaterThanOrEqual(0);
            expect(days).toBeGreaterThanOrEqual(0);
            expect(months).toBeLessThan(12);
        }
    });
});

describe('getBusinessDays', () => {
    // 2026-08-24 is a Monday.
    it.each([
        ['2026-08-24', '2026-08-28', 4], // Mon -> Fri, exclusive
        ['2026-08-24', '2026-08-31', 5], // one full week
        ['2026-08-24', '2026-09-07', 10], // two full weeks
        ['2026-08-29', '2026-08-31', 0], // Sat -> Mon, weekend only
        ['2026-08-24', '2026-08-24', 0]
    ])('%s -> %s === %i', (a, b, expected) => {
        expect(getBusinessDays(a, b)).toBe(expected);
    });

    it('is signed when reversed', () => {
        expect(getBusinessDays('2026-08-31', '2026-08-24')).toBe(-5);
    });

    it('agrees with a naive day-by-day count', () => {
        // Brute-force oracle over an arbitrary 90-day span.
        const naive = (() => {
            let count = 0;
            const start = new Date(Date.UTC(2026, 0, 5));
            for (let i = 0; i < 90; i++) {
                const day = new Date(start.getTime() + i * 86400000).getUTCDay();
                if (day !== 0 && day !== 6) count++;
            }
            return count;
        })();
        expect(getBusinessDays('2026-01-05', '2026-04-05')).toBe(naive);
    });
});

describe('addBusinessDaysOffset', () => {
    it.each([
        ['2026-08-24', 1, '2026-08-25'], // Mon + 1 = Tue
        ['2026-08-28', 1, '2026-08-31'], // Fri + 1 skips the weekend
        ['2026-08-24', 5, '2026-08-31'], // exactly one week
        ['2026-08-24', 10, '2026-09-07'],
        ['2026-08-31', -1, '2026-08-28'], // Mon - 1 skips back over the weekend
        ['2026-08-29', 1, '2026-09-01'] // Sat base moves to Mon, then +1
    ])('%s %+i business days -> %s', (base, amount, expected) => {
        expect(iso(addBusinessDaysOffset(base, amount))).toBe(expected);
    });

    it('never lands on a weekend', () => {
        for (let n = 1; n <= 60; n++) {
            const result = addBusinessDaysOffset('2026-08-24', n)!;
            const weekday = new Date(
                Date.UTC(result.year, result.month - 1, result.day)
            ).getUTCDay();
            expect(weekday).not.toBe(0);
            expect(weekday).not.toBe(6);
        }
    });
});

describe('calculateAge', () => {
    it('computes a completed age', () => {
        const age = calculateAge('1990-06-15', '2026-08-24')!;
        expect(age.years).toBe(36);
        expect(age.months).toBe(2);
        expect(age.days).toBe(9);
    });

    it('does not round up on the day before a birthday', () => {
        expect(calculateAge('2000-08-25', '2026-08-24')!.years).toBe(25);
        expect(calculateAge('2000-08-24', '2026-08-24')!.years).toBe(26);
    });

    it('resolves a 29 February birthday in a common year', () => {
        // 29 Feb clamps to 28 Feb, so the year is completed on 28 February.
        expect(calculateAge('2000-02-29', '2026-02-28')!.years).toBe(26);
        expect(calculateAge('2000-02-29', '2026-02-27')!.years).toBe(25);
        expect(calculateAge('2000-02-29', '2024-02-29')!.years).toBe(24);
    });

    it('rejects malformed input', () => {
        expect(calculateAge('nope', '2026-08-24')).toBeNull();
    });
});
