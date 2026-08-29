'use client';

import { useState, useEffect } from 'react';

const LABELS: Record<string, { days: string; hours: string; minutes: string; seconds: string; on: string }> = {
    de: { days: 'Tage', hours: 'Std.', minutes: 'Min.', seconds: 'Sek.', on: 'am' },
    en: { days: 'days', hours: 'hrs', minutes: 'min', seconds: 'sec', on: 'on' },
};

function Cell({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center bg-surface-2 border border-line rounded-2xl px-3 sm:px-5 py-4">
            {/*
              The seconds cell repaints every second. In a proportional face
              the digits have different widths, so the number jitters and
              nudges its neighbours; figure-mono pins them to one width.
            */}
            <span className="figure-mono text-3xl sm:text-5xl font-bold text-accent leading-none min-w-[2ch] text-center">
                {String(value).padStart(2, '0')}
            </span>
            <span className="mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] text-ink-2">
                {label}
            </span>
        </div>
    );
}

/**
 * Live clock for a countdown page.
 *
 * The target instant and the initial day count come from the server, computed
 * from the canonical Europe/Berlin date. The clock therefore ticks toward the
 * same moment the server-rendered answer counts to, so a viewer in another
 * timezone never sees the clock contradict the indexed number. Client-side
 * ticking is presentation only — it changes no URL, canonical or metadata.
 */
export function CountdownTimer({
    targetEpochMs,
    initialDays,
    targetLabel,
    locale
}: {
    targetEpochMs: number;
    initialDays: number;
    targetLabel: string;
    locale: string;
}) {
    const l = LABELS[locale] || LABELS.de;

    // Server and first client paint agree: whole days, no time components yet.
    const [remainingMs, setRemainingMs] = useState<number | null>(null);

    useEffect(() => {
        const tick = () => setRemainingMs(Math.max(0, targetEpochMs - Date.now()));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [targetEpochMs]);

    const totalSec = remainingMs === null ? null : Math.floor(remainingMs / 1000);
    const days = totalSec === null ? initialDays : Math.floor(totalSec / 86400);
    const hours = totalSec === null ? 0 : Math.floor((totalSec % 86400) / 3600);
    const minutes = totalSec === null ? 0 : Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec === null ? 0 : totalSec % 60;

    return (
        <div className="space-y-5">
            <div className="flex justify-center gap-3 sm:gap-4" role="timer" aria-live="off">
                <Cell value={days} label={l.days} />
                <Cell value={hours} label={l.hours} />
                <Cell value={minutes} label={l.minutes} />
                <Cell value={seconds} label={l.seconds} />
            </div>
            <p className="text-center text-ink-2 text-lg">
                {l.on} <span className="font-semibold text-ink">{targetLabel}</span>
            </p>
        </div>
    );
}
