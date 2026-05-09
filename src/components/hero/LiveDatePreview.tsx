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
        <div className="relative group perspective-1000">
            <div className="absolute -inset-1 bg-gradient-to-r from-neon/20 to-neon-blue/20 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative bg-[#0a0a0a]/60 backdrop-blur-3xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden transform-gpu group-hover:scale-[1.02] transition-all duration-500">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-neon/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-neon-blue/5 rounded-full blur-3xl"></div>

                <div className="relative z-10 space-y-8">
                    <div className="flex items-center justify-between border-b border-white/5 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-neon/10 flex items-center justify-center text-neon">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                                    {isDe ? 'Heute ist der' : "Today is"}
                                </p>
                                <p className="text-white font-bold text-lg">
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
                        <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-neon-blue mb-1">
                                <Hash className="w-4 h-4" />
                                <span className="text-[10px] uppercase tracking-widest font-bold opacity-70">
                                    {isDe ? 'Tag des Jahres' : 'Day of Year'}
                                </span>
                            </div>
                            <p className="text-2xl font-black text-white">
                                {dayOfYear} <span className="text-sm font-normal text-white/30">/ {totalDays}</span>
                            </p>
                        </div>

                        <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-purple-400 mb-1">
                                <Clock className="w-4 h-4" />
                                <span className="text-[10px] uppercase tracking-widest font-bold opacity-70">
                                    {isDe ? 'Kalenderwoche' : 'Week Number'}
                                </span>
                            </div>
                            <p className="text-2xl font-black text-white">
                                {isDe ? 'KW' : 'CW'} {weekNum}
                            </p>
                        </div>
                    </div>

                    {/* Live Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-white/30">
                            <span>{isDe ? 'Jahresfortschritt' : 'Year Progress'}</span>
                            <span>{Math.round((dayOfYear / totalDays) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-neon to-neon-blue rounded-full transition-all duration-1000" 
                                style={{ width: `${(dayOfYear / totalDays) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
