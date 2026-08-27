/**
 * Computed answers for the guides.
 *
 * The queries these pages rank for are time-relative — "wann ist das nächste
 * Schaltjahr", "wie viele Wochen hat dieses Jahr" — so any answer written as
 * prose starts decaying the moment it ships. "Das nächste Schaltjahr ist 2028"
 * is right today and wrong in 2029, and nobody notices because nothing fails.
 *
 * On a calendar site, evergreen means derived from today's date rather than
 * typed once. Everything here is computed from the canonical Berlin date and
 * revalidates with the page.
 */

import {
    CivilDate,
    compareCivilDates,
    getTodayInTimeZone,
    isLeapYear,
    isoWeeksInYear,
    daysInYear
} from '@/lib/date/civil';

export type LeapYearFacts = {
    currentYear: number;
    currentIsLeap: boolean;
    /** The next 29 February on or after today, as a year. */
    nextLeapYear: number;
    /** The most recent leap year strictly before `nextLeapYear`. */
    previousLeapYear: number;
    /** Whether this year's 29 February is still ahead of us. */
    leapDayStillAhead: boolean;
    /** The next few leap years, for a short list. */
    upcoming: number[];
    /** The next century year that is skipped, e.g. 2100. */
    nextSkippedCentury: number;
};

function nextLeapOnOrAfter(year: number): number {
    let y = year;
    while (!isLeapYear(y)) y++;
    return y;
}

export function getLeapYearFacts(today: CivilDate = getTodayInTimeZone()): LeapYearFacts {
    const currentYear = today.year;
    const currentIsLeap = isLeapYear(currentYear);

    // 29 February of this year, if it exists, relative to today.
    const leapDayStillAhead =
        currentIsLeap && compareCivilDates(today, { year: currentYear, month: 2, day: 29 }) <= 0;

    const nextLeapYear = leapDayStillAhead ? currentYear : nextLeapOnOrAfter(currentYear + 1);

    let previousLeapYear = nextLeapYear - 1;
    while (!isLeapYear(previousLeapYear)) previousLeapYear--;

    const upcoming: number[] = [];
    let y = nextLeapYear;
    while (upcoming.length < 4) {
        if (isLeapYear(y)) upcoming.push(y);
        y++;
    }

    let nextSkippedCentury = Math.ceil((currentYear + 1) / 100) * 100;
    while (isLeapYear(nextSkippedCentury)) nextSkippedCentury += 100;

    return {
        currentYear,
        currentIsLeap,
        nextLeapYear,
        previousLeapYear,
        leapDayStillAhead,
        upcoming,
        nextSkippedCentury
    };
}

export type LeapYearRow = {
    year: number;
    isLeap: boolean;
    /** Why it is or is not a leap year, in the terms of the rule. */
    reason: 'divisible-by-4' | 'century-skipped' | 'century-kept' | 'not-divisible';
};

/**
 * A window of years around today, each classified by the rule.
 *
 * The point is not a list of leap years — anyone can produce that. It is
 * showing the rule doing its work on the years the reader can see, including
 * the ones that look like leap years and are not.
 */
export function leapYearTable(
    today: CivilDate = getTodayInTimeZone(),
    span = 12
): LeapYearRow[] {
    const rows: LeapYearRow[] = [];
    for (let year = today.year; year < today.year + span; year++) {
        const leap = isLeapYear(year);
        let reason: LeapYearRow['reason'];
        if (year % 4 !== 0) reason = 'not-divisible';
        else if (year % 400 === 0) reason = 'century-kept';
        else if (year % 100 === 0) reason = 'century-skipped';
        else reason = 'divisible-by-4';
        rows.push({ year, isLeap: leap, reason });
    }
    return rows.filter((r) => r.isLeap || r.reason === 'century-skipped');
}

/** The next few century years that are skipped despite being divisible by 4. */
export function skippedCenturies(today: CivilDate = getTodayInTimeZone(), count = 3): number[] {
    const out: number[] = [];
    let year = Math.ceil((today.year + 1) / 100) * 100;
    while (out.length < count) {
        if (!isLeapYear(year)) out.push(year);
        year += 100;
    }
    return out;
}

export type WeekFacts = {
    currentYear: number;
    weeksThisYear: number;
    daysThisYear: number;
    /** The next year with 53 ISO weeks, on or after the current year. */
    next53WeekYear: number;
};

export function getWeekFacts(today: CivilDate = getTodayInTimeZone()): WeekFacts {
    const currentYear = today.year;
    let next53WeekYear = currentYear;
    while (isoWeeksInYear(next53WeekYear) !== 53) next53WeekYear++;

    return {
        currentYear,
        weeksThisYear: isoWeeksInYear(currentYear),
        daysThisYear: daysInYear(currentYear),
        next53WeekYear
    };
}

/**
 * A short, direct answer for the top of a guide — the shape of a People Also
 * Ask response: the answer first, the qualification after.
 *
 * Returns null for guides whose subject does not move with the calendar; those
 * pages should not manufacture a time-relative hook they do not have.
 */
export function directAnswerFor(
    slug: string,
    locale: string,
    today: CivilDate = getTodayInTimeZone()
): { question: string; answer: string } | null {
    const isDe = locale === 'de';

    if (slug === 'schaltjahre-erklaert' || slug === 'leap-years-explained') {
        const f = getLeapYearFacts(today);

        if (f.leapDayStillAhead) {
            return {
                question: isDe ? 'Wann ist das nächste Schaltjahr?' : 'When is the next leap year?',
                answer: isDe
                    ? `${f.currentYear} ist ein Schaltjahr – der 29. Februar ${f.currentYear} steht noch bevor. Danach folgen ${f.upcoming.slice(1, 4).join(', ')}.`
                    : `${f.currentYear} is a leap year – 29 February ${f.currentYear} is still ahead. The following ones are ${f.upcoming.slice(1, 4).join(', ')}.`
            };
        }

        return {
            question: isDe ? 'Wann ist das nächste Schaltjahr?' : 'When is the next leap year?',
            answer: isDe
                ? `Das nächste Schaltjahr ist ${f.nextLeapYear}; es hat einen 29. Februar. Das letzte war ${f.previousLeapYear}. Danach folgen ${f.upcoming.slice(1, 4).join(', ')} – mit einer Ausnahme: ${f.nextSkippedCentury} fällt aus, weil volle Jahrhunderte nur dann Schaltjahre sind, wenn sie durch 400 teilbar sind.`
                : `The next leap year is ${f.nextLeapYear}, which has a 29 February. The last one was ${f.previousLeapYear}. After that come ${f.upcoming.slice(1, 4).join(', ')} – with one exception: ${f.nextSkippedCentury} is skipped, because full centuries are leap years only when divisible by 400.`
        };
    }

    if (slug === 'wochen-im-jahr' || slug === 'weeks-in-a-year') {
        const f = getWeekFacts(today);
        const has53 = f.weeksThisYear === 53;

        return {
            question: isDe
                ? `Wie viele Wochen hat ${f.currentYear}?`
                : `How many weeks are in ${f.currentYear}?`,
            answer: isDe
                ? `${f.currentYear} hat ${f.weeksThisYear} Kalenderwochen nach ISO 8601 und ${f.daysThisYear} Tage.${has53 ? '' : ` Das nächste Jahr mit 53 Kalenderwochen ist ${f.next53WeekYear}.`}`
                : `${f.currentYear} has ${f.weeksThisYear} ISO 8601 calendar weeks and ${f.daysThisYear} days.${has53 ? '' : ` The next year with 53 calendar weeks is ${f.next53WeekYear}.`}`
        };
    }

    return null;
}
