'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Hash } from 'lucide-react';

export function LiveDatePreview({ locale }: { locale: string }) {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 1000 * 60); // Update every minute
        return () => clearInterval(timer);
    }, []);

    // Helper functions for stats
    const getDayOfYear = (d: Date) => {
        const start = new Date(d.getFullYear(), 0, 0);
        const diff = d.getTime() - start.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    };

    const getWeekNumber = (d: Date) => {
        const date = new Date(d.getTime());
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        const week1 = new Date(date.getFullYear(), 0, 4);
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    };

    const dayOfYear = getDayOfYear(date);
    const totalDays = (date.getFullYear() % 4 === 0 && (date.getFullYear() % 100 !== 0 || date.getFullYear() % 400 === 0)) ? 366 : 365;
    const weekNum = getWeekNumber(date);

    const isDe = locale === 'de';

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
                                    {isDe ? 'Heute ist der' : "Today is"}
                                </p>
                                <p className="text-slate-900 font-bold text-lg">
                                    {date.toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
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
                                {dayOfYear} <span className="text-sm font-normal text-slate-400">/ {totalDays}</span>
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
                                {isDe ? 'KW' : 'CW'} {weekNum}
                            </p>
                        </div>
                    </div>

                    {/* Live Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-slate-500">
                            <span>{isDe ? 'Jahresfortschritt' : 'Year Progress'}</span>
                            <span>{Math.round((dayOfYear / totalDays) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                                style={{ width: `${(dayOfYear / totalDays) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
