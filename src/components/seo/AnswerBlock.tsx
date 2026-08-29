/**
 * Server-rendered answers.
 *
 * These are plain server components: the calculated result is present in the
 * initial HTML, before any JavaScript runs. The interactive calculator and the
 * ticking countdown enhance the answer — they are no longer the only source of
 * it, which is what stopped these pages from earning a snippet.
 *
 * "Today" is always the canonical Berlin civil date, so the indexed answer is
 * the same for every requester.
 */

import {
    CivilDate,
    getDayOfYear,
    getIsoWeek,
    getIsoWeekday
} from '@/lib/date/civil';
import {
    formatDayMonthLong,
    formatLong,
    formatLongNoWeekday,
    formatNumeric
} from '@/lib/date/format';
import { EVENT_NAMES } from '@/lib/events';
import { ResultValue } from './ResultValue';
import { Card } from '@/components/ui/Card';

const DE_WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

function weekdayName(date: CivilDate, locale: string): string {
    if (locale === 'de') return DE_WEEKDAYS[getIsoWeekday(date) - 1];
    return formatLong(date, locale).split(',')[0];
}

/** Shared frame so both answer types look and read the same. */
function AnswerFrame({
    headline,
    detail
}: {
    headline: React.ReactNode;
    detail: React.ReactNode;
}) {
    /*
     * The answer outranks the question.
     *
     * These pages exist to answer one thing, and the h1 restating that question
     * was rendering larger than the answer to it -- text-4xl md:text-5xl over a
     * block that topped out at md:text-4xl. The answer now leads the page
     * visually, which is the only hierarchy that makes sense on a page someone
     * arrived at by asking exactly this.
     */
    return (
        <Card
            tone="accent"
            padding="none"
            /* The 4px accent rule down the left edge is what marks this out as
               the answer rather than another panel on the page. */
            className="border-l-4 border-l-accent px-6 py-8 sm:px-8 sm:py-10"
        >
            <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-ink leading-tight text-balance">
                {headline}
            </p>
            <p className="mt-4 text-base sm:text-lg text-ink-2">{detail}</p>
        </Card>
    );
}

// ---------------------------------------------------------------------------
// Countdown: /differenz/tage-bis-*
// ---------------------------------------------------------------------------

export function CountdownAnswer({
    eventKey,
    today,
    target,
    daysRemaining,
    locale
}: {
    eventKey: string;
    today: CivilDate;
    target: CivilDate;
    daysRemaining: number;
    locale: string;
}) {
    const isDe = locale === 'de';
    const names = EVENT_NAMES[eventKey];
    const bisName = isDe ? names.bisDe : names.en;
    const subjectName = isDe ? names.de : names.en;
    const weekday = weekdayName(target, locale);

    const days = (
        <ResultValue type="days-remaining" value={daysRemaining}>
            {daysRemaining}
        </ResultValue>
    );

    let headline: React.ReactNode;
    if (daysRemaining === 0) {
        headline = isDe ? <>{subjectName} ist heute.</> : <>{subjectName} is today.</>;
    } else if (isDe) {
        headline = (
            <>
                Bis {bisName} {target.year} {daysRemaining === 1 ? 'ist' : 'sind'} es noch {days}{' '}
                {daysRemaining === 1 ? 'Tag' : 'Tage'}.
            </>
        );
    } else {
        headline = (
            <>
                There {daysRemaining === 1 ? 'is' : 'are'} {days}{' '}
                {daysRemaining === 1 ? 'day' : 'days'} until {bisName} {target.year}.
            </>
        );
    }

    const targetIso = `${target.year}-${String(target.month).padStart(2, '0')}-${String(
        target.day
    ).padStart(2, '0')}`;

    const detail = isDe ? (
        <>
            {subjectName} fällt {target.year} auf{' '}
            <ResultValue type="target-date" value={targetIso} className="font-semibold">
                {weekday}, den {formatDayMonthLong(target, locale)}
            </ResultValue>
            . Stichtag der Berechnung ist heute, der {formatNumeric(today, locale)} (Zeitzone
            Europe/Berlin).
        </>
    ) : (
        <>
            {subjectName} {target.year} falls on{' '}
            <ResultValue type="target-date" value={targetIso} className="font-semibold">
                {formatLong(target, locale)}
            </ResultValue>
            . Counted from today, {formatNumeric(today, locale)} (Europe/Berlin).
        </>
    );

    return <AnswerFrame headline={headline} detail={detail} />;
}

// ---------------------------------------------------------------------------
// Offset: /addieren/N-tage-ab-heute
// ---------------------------------------------------------------------------

export type OffsetUnit = 'tage' | 'monate' | 'jahre' | 'jahr';

export function OffsetAnswer({
    amount,
    unit,
    today,
    target,
    locale
}: {
    amount: number;
    unit: OffsetUnit;
    today: CivilDate;
    target: CivilDate;
    locale: string;
}) {
    const isDe = locale === 'de';
    const weekday = weekdayName(target, locale);
    const { week } = getIsoWeek(target);
    const dayOfYear = getDayOfYear(target);

    const targetIso = `${target.year}-${String(target.month).padStart(2, '0')}-${String(
        target.day
    ).padStart(2, '0')}`;

    const plural = amount !== 1;

    // German needs two forms: dative after "In …", nominative when the amount
    // heads its own phrase ("100 Tage ab dem …"). English uses one.
    const unitDative = isDe
        ? unit === 'tage'
            ? plural ? 'Tagen' : 'Tag'
            : unit === 'monate'
              ? plural ? 'Monaten' : 'Monat'
              : plural ? 'Jahren' : 'Jahr'
        : unit === 'tage'
          ? plural ? 'days' : 'day'
          : unit === 'monate'
            ? plural ? 'months' : 'month'
            : plural ? 'years' : 'year';

    const unitNominative = isDe
        ? unit === 'tage'
            ? plural ? 'Tage' : 'Tag'
            : unit === 'monate'
              ? plural ? 'Monate' : 'Monat'
              : plural ? 'Jahre' : 'Jahr'
        : unitDative;

    const targetNode = (
        <ResultValue type="target-date" value={targetIso}>
            {isDe ? `${weekday}, der ${formatLongNoWeekday(target, locale)}` : formatLong(target, locale)}
        </ResultValue>
    );

    const headline = isDe ? (
        <>
            In {amount} {unitDative} ist {targetNode}.
        </>
    ) : (
        <>
            {amount} {unitDative} from today is {targetNode}.
        </>
    );

    // Only meaningful for a day offset; weeks-and-days of "6 months" is noise.
    const weeksAndDays =
        unit === 'tage'
            ? { weeks: Math.floor(amount / 7), days: amount % 7 }
            : null;

    const detail = (
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-2">
            <span>
                {amount} {unitNominative}{' '}
                {isDe ? `ab dem ${formatNumeric(today, locale)}` : `from ${formatNumeric(today, locale)}`}
            </span>
            <span aria-hidden="true" className="text-ink-3">·</span>
            <span>
                {isDe ? 'KW' : 'week'}{' '}
                <ResultValue type="iso-week" value={week}>{week}</ResultValue>
            </span>
            <span aria-hidden="true" className="text-ink-3">·</span>
            <span>
                {isDe ? 'Tag' : 'day'}{' '}
                <ResultValue type="day-of-year" value={dayOfYear}>{dayOfYear}</ResultValue>{' '}
                {isDe ? 'des Jahres' : 'of the year'}
            </span>
            {weeksAndDays && weeksAndDays.weeks > 0 && (
                <>
                    <span aria-hidden="true" className="text-ink-3">·</span>
                    <span>
                        {isDe ? 'entspricht' : 'equals'} {weeksAndDays.weeks}{' '}
                        {isDe
                            ? weeksAndDays.weeks === 1 ? 'Woche' : 'Wochen'
                            : weeksAndDays.weeks === 1 ? 'week' : 'weeks'}
                        {weeksAndDays.days > 0 && (
                            <>
                                {' '}
                                {isDe ? 'und' : 'and'} {weeksAndDays.days}{' '}
                                {isDe
                                    ? weeksAndDays.days === 1 ? 'Tag' : 'Tagen'
                                    : weeksAndDays.days === 1 ? 'day' : 'days'}
                            </>
                        )}
                    </span>
                </>
            )}
        </span>
    );

    return <AnswerFrame headline={headline} detail={detail} />;
}
