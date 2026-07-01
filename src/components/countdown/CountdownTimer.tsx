'use client';

import { useState, useEffect } from 'react';
import { getNextOccurrence } from '@/lib/events';

const LABELS: Record<string, { days: string; hours: string; minutes: string; seconds: string; on: string }> = {
    de: { days: 'Tage', hours: 'Std.', minutes: 'Min.', seconds: 'Sek.', on: 'am' },
    en: { days: 'days', hours: 'hrs', minutes: 'min', seconds: 'sec', on: 'on' },
};

function Cell({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="tabular-nums text-3xl sm:text-5xl font-black text-slate-900 bg-white border border-slate-200 rounded-xl px-3 sm:px-5 py-3 min-w-[3.5rem] sm:min-w-[5rem] text-center shadow-sm">
                {String(value).padStart(2, '0')}
            </div>
            <span className="mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">{label}</span>
        </div>
    );
}

export function CountdownTimer({ eventKey, locale }: { eventKey: string; locale: string }) {
    const l = LABELS[locale] || LABELS.de;
    const [target, setTarget] = useState<Date | null>(null);
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        setTarget(getNextOccurrence(eventKey));
        setNow(new Date());
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, [eventKey]);

    if (!target || !now) {
        return (
            <div className="flex justify-center gap-3 sm:gap-4 animate-pulse py-2" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-20 sm:h-24 w-14 sm:w-20 bg-slate-100 rounded-xl border border-slate-200" />
                ))}
            </div>
        );
    }

    const diffMs = Math.max(0, target.getTime() - now.getTime());
    const totalSec = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    const dateLabel = new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-US', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }).format(target);

    return (
        <div className="space-y-5">
            <div className="flex justify-center gap-3 sm:gap-4" role="timer" aria-live="off">
                <Cell value={days} label={l.days} />
                <Cell value={hours} label={l.hours} />
                <Cell value={minutes} label={l.minutes} />
                <Cell value={seconds} label={l.seconds} />
            </div>
            <p className="text-center text-slate-600 text-lg">
                {l.on} <span className="font-semibold text-slate-900">{dateLabel}</span>
            </p>
        </div>
    );
}
