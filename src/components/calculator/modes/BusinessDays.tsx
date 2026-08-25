'use client';

import { useState, useEffect, useId } from 'react';
import { getBusinessDays } from '@/lib/calculator';
import { parseCivilDate } from '@/lib/date/civil';
import { formatDayMonth } from '@/lib/date/format';
import { useRecentCalculations } from '@/hooks/useRecentCalculations';
import { Share2, Check, BookmarkPlus } from 'lucide-react';

import { useTranslations, useLocale } from 'next-intl';

export function BusinessDays() {
    const t = useTranslations('Calculator');
    const locale = useLocale();
    const [start, setStart] = useState<string>('');
    const [end, setEnd] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const { addCalculation } = useRecentCalculations();
    const fieldId = useId();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('start')) setStart(params.get('start')!);
        if (params.get('end')) setEnd(params.get('end')!);
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!start && !end) return;
            const url = new URL(window.location.href);
            if (start) url.searchParams.set('start', start);
            if (end) url.searchParams.set('end', end);
            window.history.replaceState({}, '', url);
        }, 300);
        return () => clearTimeout(timeout);
    }, [start, end]);

    const calculate = () => {
        if (!start || !end) return null;
        return getBusinessDays(start, end);
    };

    const result = calculate();

    const handleSave = () => {
        const s = parseCivilDate(start);
        const e = parseCivilDate(end);
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

            <div role="status" aria-live="polite">
                {result !== null && (
                    <div className="mt-8 p-6 rounded-lg bg-blue-50 border border-blue-200 space-y-4">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">{t('businessDays')}</h3>
                                <p className="text-3xl mt-2 font-bold text-blue-800">
                                    {Math.abs(result)} {t('days')}
                                </p>
                                {/* Was the untranslated "Excl. Sat & Sun." on both locales. */}
                                <p className="text-sm text-slate-600 mt-1">
                                    {locale === 'de'
                                        ? 'Ohne Samstag und Sonntag. Gesetzliche Feiertage sind nicht abgezogen.'
                                        : 'Excluding Saturday and Sunday. Public holidays are not deducted.'}
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
                    </div>
                )}
            </div>
        </div>
    );
}
