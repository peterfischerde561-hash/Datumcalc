import { Calendar, Clock, Hash } from 'lucide-react';
import {
    CANONICAL_TIMEZONE,
    daysInYear,
    formatCivilDate,
    getDayOfYear,
    getIsoWeek,
    getTodayInTimeZone
} from '@/lib/date/civil';
import { formatLongNoWeekday } from '@/lib/date/format';
import { ResultValue } from '@/components/seo/ResultValue';

/**
 * Today's date, ordinal day and ISO week — server-rendered from the canonical
 * Europe/Berlin date so the values are present in the HTML and identical for
 * every requester.
 *
 * This was previously a client component seeded with `new Date()`, which meant
 * the server HTML froze at build time and its own day-of-year helper lost a day
 * between 00:00 and 01:00 local once Berlin moved to UTC+2. Both figures now
 * come from the shared date core. There is nothing to tick: every value here
 * changes only at midnight, and the page revalidates at the Berlin boundary.
 */
export function LiveDatePreview({ locale }: { locale: string }) {
    const isDe = locale === 'de';
    const today = getTodayInTimeZone(CANONICAL_TIMEZONE);

    const dayOfYear = getDayOfYear(today);
    const totalDays = daysInYear(today.year);
    const { week } = getIsoWeek(today);
    const progress = Math.round((dayOfYear / totalDays) * 100);

    return (
        <div className="relative group">
            <div className="relative bg-white border border-slate-200 p-8 rounded-2xl shadow-lg overflow-hidden transition-all duration-500">
                <div className="relative z-10 space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                                    {isDe ? 'Heute ist der' : 'Today is'}
                                </p>
                                <p className="text-slate-900 font-bold text-lg">
                                    <ResultValue type="today" value={formatCivilDate(today)}>
                                        {formatLongNoWeekday(today, locale)}
                                    </ResultValue>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-blue-700 mb-1">
                                <Hash className="w-4 h-4" />
                                <span className="text-[10px] uppercase tracking-widest font-bold opacity-80">
                                    {isDe ? 'Tag des Jahres' : 'Day of Year'}
                                </span>
                            </div>
                            <p className="text-2xl font-black text-slate-900">
                                <ResultValue type="day-of-year" value={dayOfYear}>
                                    {dayOfYear}
                                </ResultValue>{' '}
                                <span className="text-sm font-normal text-slate-400">/ {totalDays}</span>
                            </p>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-purple-600 mb-1">
                                <Clock className="w-4 h-4" />
                                <span className="text-[10px] uppercase tracking-widest font-bold opacity-80">
                                    {isDe ? 'Kalenderwoche' : 'Week Number'}
                                </span>
                            </div>
                            <p className="text-2xl font-black text-slate-900">
                                {isDe ? 'KW' : 'CW'}{' '}
                                <ResultValue type="iso-week" value={week}>
                                    {week}
                                </ResultValue>
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-slate-500">
                            <span>{isDe ? 'Jahresfortschritt' : 'Year Progress'}</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
