'use client';

import { useState, useEffect } from 'react';
import { addDays, addMonths, addYears, differenceInDays, format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';

const dateLocales: Record<string, any> = { de, en: enUS };

interface InstantResultClientProps {
    intent: string;
    slugStr: string;
    locale: string;
    translations: {
        in: string;
        is: string;
        basedOn: string;
        until: string;
        areYet: string;
        theDateIs: string;
        days: string;
        months: string;
        years: string;
        events: Record<string, string>;
    };
}

export function InstantResultClient({ intent, slugStr, locale, translations }: InstantResultClientProps) {
    const [result, setResult] = useState<{
        headline: string;
        highlight: string;
        subtext: string;
    } | null>(null);

    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const loc = dateLocales[locale] || de;

        try {
            if (intent === 'addieren' || intent === 'add') {
                const match = slugStr.match(/^(\d+)-(tage|monate|jahre)-ab-heute$/);
                if (match) {
                    const amount = parseInt(match[1], 10);
                    const unit = match[2];
                    let resultDate;
                    if (unit === 'tage') resultDate = addDays(today, amount);
                    else if (unit === 'monate') resultDate = addMonths(today, amount);
                    else if (unit === 'jahre') resultDate = addYears(today, amount);

                    if (resultDate) {
                        const unitLabel = unit === 'tage' ? translations.days : unit === 'monate' ? translations.months : translations.years;
                        setResult({
                            headline: `${translations.in} ${amount} ${unitLabel} ${translations.is}`,
                            highlight: format(resultDate, 'EEEE, dd. MMMM yyyy', { locale: loc }),
                            subtext: `${translations.basedOn} (${format(today, 'dd.MM.yyyy')})`
                        });
                    }
                }
            }

            if (intent === 'differenz' || intent === 'difference') {
                const match = slugStr.match(/^tage-bis-(.+)$/);
                if (match) {
                    const eventStr = match[1].toLowerCase();
                    let targetDate = new Date(today.getFullYear(), 0, 1);
                    let eventName = '';
                    let found = false;

                    const e = translations.events;

                    if (eventStr === 'weihnachten') {
                        targetDate = new Date(today.getFullYear(), 11, 25);
                        eventName = e.weihnachten;
                        found = true;
                    } else if (eventStr === 'silvester') {
                        targetDate = new Date(today.getFullYear(), 11, 31);
                        eventName = e.silvester;
                        found = true;
                    } else if (eventStr === 'sommeranfang') {
                        targetDate = new Date(today.getFullYear(), 5, 21);
                        eventName = e.sommeranfang;
                        found = true;
                    } else if (eventStr === 'ostern') {
                        const yr = today.getFullYear();
                        if (yr === 2024) targetDate = new Date(2024, 2, 31);
                        else if (yr === 2025) targetDate = new Date(2025, 3, 20);
                        else if (yr === 2026) targetDate = new Date(2026, 3, 5);
                        else targetDate = new Date(yr, 3, 10);
                        eventName = e.ostern;
                        found = true;
                    } else if (eventStr === 'neujahr') {
                        targetDate = new Date(today.getFullYear() + 1, 0, 1);
                        eventName = e.neujahr;
                        found = true;
                    } else if (eventStr === 'urlaub') {
                        targetDate = new Date(today.getFullYear(), 6, 1);
                        eventName = e.urlaub;
                        found = true;
                    }

                    if (found) {
                        if (today > targetDate) {
                            targetDate.setFullYear(targetDate.getFullYear() + 1);
                        }
                        const diff = differenceInDays(targetDate, today);
                        setResult({
                            headline: `${translations.until} ${eventName} ${translations.areYet}`,
                            highlight: `${diff} ${translations.days}`,
                            subtext: `${translations.theDateIs} ${format(targetDate, 'dd. MMMM yyyy', { locale: loc })}`
                        });
                    }
                }
            }
        } catch (e) {
            console.error('Client calculation error:', e);
        }
    }, [intent, slugStr, locale, translations]);

    if (!result) {
        return (
            <div className="animate-pulse space-y-8">
                <div className="h-8 bg-white/5 rounded-full w-48 mx-auto"></div>
                <div className="h-24 bg-white/5 rounded-2xl w-full"></div>
                <div className="h-6 bg-white/5 rounded-full w-64 mx-auto"></div>
            </div>
        );
    }

    return (
        <>
            <p className="text-xl md:text-2xl font-bold text-white/50 tracking-[0.2em] uppercase">
                {result.headline}
            </p>
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/30 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] py-4">
                {result.highlight}
            </h1>
            <p className="text-xl text-white/70 font-medium">
                {result.subtext}
            </p>
        </>
    );
}
