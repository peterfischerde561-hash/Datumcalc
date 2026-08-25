import {
    CANONICAL_TIMEZONE,
    daysInYear,
    formatCivilDate,
    getDayOfYear,
    getIsoWeek,
    getTodayInTimeZone
} from '@/lib/date/civil';
import { formatLong } from '@/lib/date/format';
import { ResultValue } from '@/components/seo/ResultValue';

/**
 * Today's date, ordinal day and ISO week, from the canonical Europe/Berlin date.
 *
 * Rendered as a compact strip rather than the tall side card it used to be.
 * That card was `hidden lg:block`, so every phone visitor lost today's date
 * entirely — and it occupied the column where the calculator now sits. The
 * strip carries the same four figures, reads at any width, and stays out of the
 * way of the tool.
 */
export function LiveDatePreview({ locale }: { locale: string }) {
    const isDe = locale === 'de';
    const today = getTodayInTimeZone(CANONICAL_TIMEZONE);

    const dayOfYear = getDayOfYear(today);
    const totalDays = daysInYear(today.year);
    const { week } = getIsoWeek(today);
    const progress = Math.round((dayOfYear / totalDays) * 100);

    const cell = 'flex flex-col gap-0.5';
    const key = 'text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500';
    const val = 'text-sm font-bold text-slate-900 tabular-nums';

    return (
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
            <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
                <div className={cell}>
                    <span className={key}>{isDe ? 'Heute' : 'Today'}</span>
                    <span className="text-base font-bold text-slate-900">
                        <ResultValue type="today" value={formatCivilDate(today)}>
                            {formatLong(today, locale)}
                        </ResultValue>
                    </span>
                </div>

                <div className={cell}>
                    <span className={key}>{isDe ? 'Tag des Jahres' : 'Day of year'}</span>
                    <span className={val}>
                        <ResultValue type="day-of-year" value={dayOfYear}>
                            {dayOfYear}
                        </ResultValue>
                        <span className="font-normal text-slate-400"> / {totalDays}</span>
                    </span>
                </div>

                <div className={cell}>
                    <span className={key}>{isDe ? 'Kalenderwoche' : 'Calendar week'}</span>
                    <span className={val}>
                        {isDe ? 'KW ' : 'CW '}
                        <ResultValue type="iso-week" value={week}>
                            {week}
                        </ResultValue>
                    </span>
                </div>

                <div className={`${cell} min-w-[7.5rem] flex-1`}>
                    <span className={key}>{isDe ? 'Jahresfortschritt' : 'Year progress'}</span>
                    <span className="flex items-center gap-2">
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                            <span
                                className="block h-full rounded-full bg-blue-600"
                                style={{ width: `${progress}%` }}
                            />
                        </span>
                        <span className={val}>{progress}%</span>
                    </span>
                </div>
            </div>
        </div>
    );
}
