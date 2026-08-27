'use client';

import { useState, useEffect, useId } from 'react';
import { getBusinessDays } from '@/lib/calculator';
import { parseCivilDate, formatCivilDate } from '@/lib/date/civil';
import { formatDayMonth, formatNumeric } from '@/lib/date/format';
import {
    BUNDESLAENDER,
    BUNDESLAND_CODES,
    BundeslandCode,
    businessDaysExcludingHolidays,
    isBundeslandCode
} from '@/lib/date/holidays';
import { useRecentCalculations } from '@/hooks/useRecentCalculations';
import { Share2, Check, BookmarkPlus } from 'lucide-react';

import { useTranslations, useLocale } from 'next-intl';

export function BusinessDays() {
    const t = useTranslations('Calculator');
    const locale = useLocale();
    const isDe = locale === 'de';
    const [start, setStart] = useState<string>('');
    const [end, setEnd] = useState<string>('');
    // '' means "no Bundesland chosen" — weekends only, holidays not deducted.
    // That stays the default because it is the honest answer when we do not
    // know which state's holidays apply.
    const [state, setState] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const { addCalculation } = useRecentCalculations();
    const fieldId = useId();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('start')) setStart(params.get('start')!);
        if (params.get('end')) setEnd(params.get('end')!);
        const bl = params.get('bl');
        if (bl && isBundeslandCode(bl)) setState(bl);
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!start && !end) return;
            const url = new URL(window.location.href);
            if (start) url.searchParams.set('start', start);
            if (end) url.searchParams.set('end', end);
            if (state) url.searchParams.set('bl', state);
            else url.searchParams.delete('bl');
            window.history.replaceState({}, '', url);
        }, 300);
        return () => clearTimeout(timeout);
    }, [start, end, state]);

    const s = parseCivilDate(start);
    const e = parseCivilDate(end);

    const plain = start && end ? getBusinessDays(start, end) : null;
    const withHolidays =
        s && e && isBundeslandCode(state) ? businessDaysExcludingHolidays(s, e, state) : null;

    const result = withHolidays ? withHolidays.count : plain;

    const handleSave = () => {
        if (result !== null && s && e) {
            addCalculation({
                type: 'business_days',
                title: `${t('businessDays')}: ${formatDayMonth(s, locale)} - ${formatDayMonth(e, locale)}`,
                result: `${Math.abs(result)} ${t('days')}`
            });
        }
    };

    const shareUrl = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const inputClass = "w-full bg-white border border-slate-300 rounded-md px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors [color-scheme:light]";
    const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor={`${fieldId}-start`} className={labelClass}>{t('startDate')}</label>
                    <input id={`${fieldId}-start`} type="date" value={start} onChange={(e) => setStart(e.target.value)} className={inputClass} />
                </div>
                <div>
                    <label htmlFor={`${fieldId}-end`} className={labelClass}>{t('endDate')}</label>
                    <input id={`${fieldId}-end`} type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={inputClass} />
                </div>
            </div>

            {/*
              Optional, and it defaults to off. Public holidays differ by
              Bundesland, so guessing one would produce a confidently wrong
              number; leaving it unset says plainly that only weekends were
              removed. Choosing a state is the user telling us which rules apply.
            */}
            <div className="max-w-sm">
                <label htmlFor={`${fieldId}-bl`} className={labelClass}>
                    {isDe ? 'Bundesland (optional)' : 'German state (optional)'}
                </label>
                <select
                    id={`${fieldId}-bl`}
                    value={state}
                    onChange={(ev) => setState(ev.target.value)}
                    className={inputClass}
                >
                    <option value="">
                        {isDe ? 'Ohne Feiertage – nur Wochenenden' : 'No holidays – weekends only'}
                    </option>
                    {BUNDESLAND_CODES.map((code) => (
                        <option key={code} value={code}>
                            {BUNDESLAENDER[code]}
                        </option>
                    ))}
                </select>
            </div>

            <div role="status" aria-live="polite">
                {result !== null && (
                    <div className="mt-8 p-6 rounded-lg bg-blue-50 border border-blue-200 space-y-4">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">{t('businessDays')}</h3>
                                <p className="text-3xl mt-2 font-bold text-blue-800">
                                    {Math.abs(result)} {t('days')}
                                </p>
                                {/* Says what was actually excluded, which now depends on the state. */}
                                <p className="text-sm text-slate-600 mt-1">
                                    {withHolidays
                                        ? isDe
                                            ? `Ohne Wochenenden und die Feiertage in ${BUNDESLAENDER[state as BundeslandCode]}.`
                                            : `Excluding weekends and public holidays in ${BUNDESLAENDER[state as BundeslandCode]}.`
                                        : isDe
                                          ? 'Ohne Samstag und Sonntag. Gesetzliche Feiertage sind nicht abgezogen – wählen Sie ein Bundesland, um sie zu berücksichtigen.'
                                          : 'Excluding Saturday and Sunday. Public holidays are not deducted – pick a state to include them.'}
                                </p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button type="button" onClick={handleSave} aria-label={t('save')} title={t('save')} className="bg-white hover:bg-slate-100 border border-slate-300 p-2 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                    <BookmarkPlus className="w-5 h-5 text-blue-700" aria-hidden="true" />
                                </button>
                                <button type="button" onClick={shareUrl} aria-label={t('share')} title={t('share')} className="bg-white hover:bg-slate-100 border border-slate-300 p-2 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                    {copied ? <Check className="w-5 h-5 text-green-600" aria-hidden="true" /> : <Share2 className="w-5 h-5 text-blue-700" aria-hidden="true" />}
                                </button>
                            </div>
                        </div>

                        {/*
                          Show the work. A smaller number with no explanation is
                          the kind of result a user cannot check; naming the
                          holidays that were removed makes it verifiable.
                        */}
                        {withHolidays && withHolidays.deducted.length > 0 && (
                            <div className="pt-4 border-t border-blue-200">
                                <h4 className="text-sm font-semibold text-slate-700 mb-2">
                                    {isDe
                                        ? `Abgezogene Feiertage (${withHolidays.deducted.length})`
                                        : `Public holidays deducted (${withHolidays.deducted.length})`}
                                </h4>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-slate-700">
                                    {withHolidays.deducted.map((h) => (
                                        <li key={`${h.name}-${formatCivilDate(h.date)}`} className="flex justify-between gap-3">
                                            <span>{h.name}</span>
                                            <span className="tabular-nums text-slate-500">
                                                {formatNumeric(h.date, locale)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
