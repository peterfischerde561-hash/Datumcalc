import { describe, it, expect } from 'vitest';
import {
    directAnswerFor,
    getLeapYearFacts,
    getWeekFacts,
    leapYearTable,
    skippedCenturies
} from './guideFacts';
import { CivilDate, isLeapYear, isoWeeksInYear } from '@/lib/date/civil';

const d = (year: number, month: number, day: number): CivilDate => ({ year, month, day });

describe('leap year facts', () => {
    it('names 2028 from a 2026 vantage point', () => {
        const f = getLeapYearFacts(d(2026, 8, 25));
        expect(f.currentIsLeap).toBe(false);
        expect(f.nextLeapYear).toBe(2028);
        expect(f.previousLeapYear).toBe(2024);
        expect(f.upcoming).toEqual([2028, 2032, 2036, 2040]);
    });

    it('treats the current year as next while 29 February is still ahead', () => {
        const f = getLeapYearFacts(d(2028, 1, 15));
        expect(f.leapDayStillAhead).toBe(true);
        expect(f.nextLeapYear).toBe(2028);
    });

    it('moves on once 29 February has passed', () => {
        const f = getLeapYearFacts(d(2028, 3, 1));
        expect(f.leapDayStillAhead).toBe(false);
        expect(f.nextLeapYear).toBe(2032);
        expect(f.previousLeapYear).toBe(2028);
    });

    it('counts 29 February itself as still ahead', () => {
        expect(getLeapYearFacts(d(2028, 2, 29)).nextLeapYear).toBe(2028);
    });

    it('skips centuries that are not divisible by 400', () => {
        // From 2097 the next leap year is 2104, because 2100 is skipped.
        const f = getLeapYearFacts(d(2097, 6, 1));
        expect(f.nextLeapYear).toBe(2104);
        expect(f.upcoming).toEqual([2104, 2108, 2112, 2116]);
    });

    it('identifies the next skipped century', () => {
        expect(getLeapYearFacts(d(2026, 1, 1)).nextSkippedCentury).toBe(2100);
        // 2400 is divisible by 400, so it is NOT skipped; 2500 is the next one.
        expect(getLeapYearFacts(d(2301, 1, 1)).nextSkippedCentury).toBe(2500);
    });

    it('always reports a genuine leap year', () => {
        for (let y = 2024; y < 2140; y++) {
            const f = getLeapYearFacts(d(y, 6, 15));
            expect(isLeapYear(f.nextLeapYear)).toBe(true);
            expect(isLeapYear(f.previousLeapYear)).toBe(true);
            expect(f.nextLeapYear).toBeGreaterThanOrEqual(y);
        }
    });
});

describe('week facts', () => {
    it('reports the ISO week count for the year', () => {
        expect(getWeekFacts(d(2026, 8, 25)).weeksThisYear).toBe(53);
        expect(getWeekFacts(d(2025, 8, 25)).weeksThisYear).toBe(52);
    });

    it('finds the next 53-week year', () => {
        const f = getWeekFacts(d(2025, 1, 1));
        expect(f.next53WeekYear).toBe(2026);
        expect(isoWeeksInYear(f.next53WeekYear)).toBe(53);
    });

    it('reports the current year when it already has 53 weeks', () => {
        expect(getWeekFacts(d(2026, 1, 1)).next53WeekYear).toBe(2026);
    });
});

describe('leap year table', () => {
    it('starts at the current year and lists only leap years plus skipped centuries', () => {
        const rows = leapYearTable(d(2026, 8, 27), 24);
        expect(rows.every((r) => r.isLeap || r.reason === 'century-skipped')).toBe(true);
        expect(rows.map((r) => r.year)).toEqual([2028, 2032, 2036, 2040, 2044, 2048]);
    });

    it('classifies each year by the rule that decided it', () => {
        const rows = leapYearTable(d(2096, 1, 1), 12);
        const byYear = Object.fromEntries(rows.map((r) => [r.year, r]));
        expect(byYear[2096].reason).toBe('divisible-by-4');
        // 2100 is divisible by 4 but skipped — the case the rule exists for.
        expect(byYear[2100].isLeap).toBe(false);
        expect(byYear[2100].reason).toBe('century-skipped');
    });

    it('keeps a century that is divisible by 400', () => {
        const rows = leapYearTable(d(2396, 1, 1), 10);
        const y2400 = rows.find((r) => r.year === 2400)!;
        expect(y2400.isLeap).toBe(true);
        expect(y2400.reason).toBe('century-kept');
    });

    it('never lists a year before today', () => {
        for (const year of [2026, 2030, 2099, 2400]) {
            for (const r of leapYearTable(d(year, 6, 1), 12)) {
                expect(r.year).toBeGreaterThanOrEqual(year);
            }
        }
    });
});

describe('skipped centuries', () => {
    it('names the next centuries that are not leap years', () => {
        expect(skippedCenturies(d(2026, 1, 1), 3)).toEqual([2100, 2200, 2300]);
    });

    it('skips 2400, which is divisible by 400', () => {
        expect(skippedCenturies(d(2301, 1, 1), 2)).toEqual([2500, 2600]);
    });

    it('only ever returns non-leap years', () => {
        for (const y of skippedCenturies(d(2026, 1, 1), 6)) {
            expect(isLeapYear(y)).toBe(false);
            expect(y % 100).toBe(0);
        }
    });
});

describe('direct answers', () => {
    it('answers the leap-year question with the year, not a hardcoded one', () => {
        const a = directAnswerFor('schaltjahre-erklaert', 'de', d(2026, 8, 25))!;
        expect(a.answer).toContain('2028');
        expect(a.answer).toContain('2024');

        // The same page, viewed years later, must answer differently.
        const later = directAnswerFor('schaltjahre-erklaert', 'de', d(2030, 8, 25))!;
        expect(later.answer).toContain('2032');
        expect(later.answer).not.toContain('ist 2028');
    });

    it('answers in the requested language', () => {
        expect(directAnswerFor('schaltjahre-erklaert', 'en', d(2026, 8, 25))!.question).toBe(
            'When is the next leap year?'
        );
        expect(directAnswerFor('schaltjahre-erklaert', 'de', d(2026, 8, 25))!.question).toBe(
            'Wann ist das nächste Schaltjahr?'
        );
    });

    it('names the current year in the weeks answer', () => {
        const a = directAnswerFor('wochen-im-jahr', 'de', d(2026, 8, 25))!;
        expect(a.question).toContain('2026');
        expect(a.answer).toContain('53');
    });

    it('returns null for guides whose subject does not move', () => {
        expect(directAnswerFor('iso-8601-erklaert', 'de', d(2026, 8, 25))).toBeNull();
        expect(directAnswerFor('was-ist-ein-arbeitstag', 'de', d(2026, 8, 25))).toBeNull();
    });

    it('never emits a stale year for any vantage point in the next century', () => {
        for (let y = 2026; y < 2126; y++) {
            const a = directAnswerFor('schaltjahre-erklaert', 'de', d(y, 7, 1))!;
            const claimed = Number(a.answer.match(/ist (\d{4})/)?.[1]);
            expect(isLeapYear(claimed)).toBe(true);
            expect(claimed).toBeGreaterThanOrEqual(y);
        }
    });
});
