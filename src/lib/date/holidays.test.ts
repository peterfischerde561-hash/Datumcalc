import { describe, it, expect } from 'vitest';
import {
    BUNDESLAND_CODES,
    BundeslandCode,
    businessDaysExcludingHolidays,
    holidaysFor,
    isBundeslandCode,
    isPublicHoliday
} from './holidays';
import { CivilDate, formatCivilDate, getIsoWeekday } from './civil';

const d = (year: number, month: number, day: number): CivilDate => ({ year, month, day });
const names = (year: number, state: BundeslandCode) => holidaysFor(year, state).map((h) => h.name);
const on = (year: number, state: BundeslandCode, name: string) =>
    formatCivilDate(holidaysFor(year, state).find((h) => h.name === name)!.date);

describe('nationwide holidays', () => {
    // Easter Sunday 2026 is 5 April.
    it.each([
        ['Neujahr', '2026-01-01'],
        ['Karfreitag', '2026-04-03'],
        ['Ostermontag', '2026-04-06'],
        ['Tag der Arbeit', '2026-05-01'],
        ['Christi Himmelfahrt', '2026-05-14'],
        ['Pfingstmontag', '2026-05-25'],
        ['Tag der Deutschen Einheit', '2026-10-03'],
        ['1. Weihnachtstag', '2026-12-25'],
        ['2. Weihnachtstag', '2026-12-26']
    ])('%s 2026 falls on %s', (name, expected) => {
        expect(on(2026, 'NW', name)).toBe(expected);
    });

    it('gives every Bundesland the same nine nationwide holidays', () => {
        for (const state of BUNDESLAND_CODES) {
            const nationwide = holidaysFor(2026, state).filter((h) => h.nationwide);
            expect(nationwide).toHaveLength(9);
        }
    });
});

describe('regional holidays', () => {
    it('Fronleichnam applies in the Catholic states, not the others', () => {
        for (const state of ['BW', 'BY', 'HE', 'NW', 'RP', 'SL'] as BundeslandCode[]) {
            expect(names(2026, state)).toContain('Fronleichnam');
        }
        for (const state of ['BE', 'HH', 'HB', 'NI', 'SH', 'MV', 'BB', 'ST'] as BundeslandCode[]) {
            expect(names(2026, state)).not.toContain('Fronleichnam');
        }
    });

    it('Fronleichnam 2026 is 4 June (Easter + 60)', () => {
        expect(on(2026, 'NW', 'Fronleichnam')).toBe('2026-06-04');
    });

    it('Reformationstag applies in the nine northern and eastern states', () => {
        const withIt = BUNDESLAND_CODES.filter((s) => names(2026, s).includes('Reformationstag'));
        expect(withIt.sort()).toEqual(['BB', 'HB', 'HH', 'MV', 'NI', 'SH', 'SN', 'ST', 'TH']);
    });

    it('Buß- und Bettag is Sachsen only, and is a Wednesday before 23 November', () => {
        const withIt = BUNDESLAND_CODES.filter((s) => names(2026, s).includes('Buß- und Bettag'));
        expect(withIt).toEqual(['SN']);

        for (const year of [2024, 2025, 2026, 2027, 2028]) {
            const bbt = holidaysFor(year, 'SN').find((h) => h.name === 'Buß- und Bettag')!.date;
            expect(getIsoWeekday(bbt)).toBe(3); // Wednesday
            expect(bbt.month).toBe(11);
            expect(bbt.day).toBeGreaterThanOrEqual(16);
            expect(bbt.day).toBeLessThanOrEqual(22);
        }
    });

    it('Brandenburg is the state that also has Oster- and Pfingstsonntag', () => {
        expect(names(2026, 'BB')).toContain('Ostersonntag');
        expect(names(2026, 'BB')).toContain('Pfingstsonntag');
        expect(names(2026, 'NW')).not.toContain('Ostersonntag');
    });

    it('Bayern has the most holidays, Berlin and Hamburg among the fewest', () => {
        const counts = Object.fromEntries(
            BUNDESLAND_CODES.map((s) => [s, holidaysFor(2026, s).length])
        );
        expect(counts.BY).toBeGreaterThan(counts.BE);
        expect(counts.BY).toBeGreaterThan(counts.HH);
        expect(counts.NW).toBeGreaterThan(counts.HH);
    });

    it('does not claim the municipality-level cases it cannot know', () => {
        // Fronleichnam exists in parts of SN and TH, Mariä Himmelfahrt in
        // Catholic parts of BY — neither is decidable from the state alone.
        expect(names(2026, 'SN')).not.toContain('Fronleichnam');
        expect(names(2026, 'TH')).not.toContain('Fronleichnam');
        expect(names(2026, 'BY')).not.toContain('Mariä Himmelfahrt');
        expect(names(2026, 'SL')).toContain('Mariä Himmelfahrt');
    });
});

describe('isPublicHoliday', () => {
    it('recognises a nationwide holiday everywhere', () => {
        for (const state of BUNDESLAND_CODES) {
            expect(isPublicHoliday(d(2026, 12, 25), state)).toBe(true);
        }
    });

    it('is state-specific for regional holidays', () => {
        expect(isPublicHoliday(d(2026, 11, 1), 'BY')).toBe(true); // Allerheiligen
        expect(isPublicHoliday(d(2026, 11, 1), 'BE')).toBe(false);
    });

    it('is false for an ordinary day', () => {
        expect(isPublicHoliday(d(2026, 8, 27), 'NW')).toBe(false);
    });
});

describe('business days excluding holidays', () => {
    it('deducts a holiday that falls on a weekday', () => {
        // 1 May 2026 is a Friday. The week Mon 27 Apr -> Mon 4 May has 5
        // weekdays, one of which is Tag der Arbeit.
        const { count, deducted } = businessDaysExcludingHolidays(d(2026, 4, 27), d(2026, 5, 4), 'NW');
        expect(count).toBe(4);
        expect(deducted.map((h) => h.name)).toEqual(['Tag der Arbeit']);
    });

    it('never double-counts a holiday that falls on a weekend', () => {
        // 3 October 2026 is a Saturday: already excluded as a weekend.
        const { count, deducted } = businessDaysExcludingHolidays(d(2026, 9, 28), d(2026, 10, 5), 'NW');
        expect(count).toBe(5);
        expect(deducted).toEqual([]);
    });

    it('gives different answers for different states over the same span', () => {
        // Fronleichnam, 4 June 2026, is a Thursday.
        const nw = businessDaysExcludingHolidays(d(2026, 6, 1), d(2026, 6, 8), 'NW');
        const be = businessDaysExcludingHolidays(d(2026, 6, 1), d(2026, 6, 8), 'BE');
        expect(be.count).toBe(nw.count + 1);
        expect(nw.deducted.map((h) => h.name)).toEqual(['Fronleichnam']);
        expect(be.deducted).toEqual([]);
    });

    it('is zero for an empty span and signed when reversed', () => {
        expect(businessDaysExcludingHolidays(d(2026, 6, 1), d(2026, 6, 1), 'NW').count).toBe(0);
        expect(businessDaysExcludingHolidays(d(2026, 6, 8), d(2026, 6, 1), 'NW').count).toBeLessThan(0);
    });

    it('never returns more than the plain weekday count', () => {
        for (const state of BUNDESLAND_CODES) {
            const { count } = businessDaysExcludingHolidays(d(2026, 1, 1), d(2027, 1, 1), state);
            expect(count).toBeLessThanOrEqual(262); // weekdays in 2026
            expect(count).toBeGreaterThan(240);
        }
    });
});

describe('state codes', () => {
    it('covers all sixteen', () => {
        expect(BUNDESLAND_CODES).toHaveLength(16);
    });

    it('validates codes', () => {
        expect(isBundeslandCode('NW')).toBe(true);
        expect(isBundeslandCode('XX')).toBe(false);
    });
});
