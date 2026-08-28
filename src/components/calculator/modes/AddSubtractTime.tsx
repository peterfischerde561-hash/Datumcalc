'use client';

import { useState, useEffect, useId } from 'react';
import { calculateOffsetDate, TimeUnit, Operation } from '@/lib/calculator';
import { parseCivilDate } from '@/lib/date/civil';
import { formatDayMonth, formatLong, formatNumeric } from '@/lib/date/format';
import { useRecentCalculations } from '@/hooks/useRecentCalculations';
import { Share2, Check, BookmarkPlus } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export function AddSubtractTime() {
    const t = useTranslations('Calculator');
    const locale = useLocale();

    const [baseDate, setBaseDate] = useState<string>('');
    const [amount, setAmount] = useState<number | ''>('');
    const [unit, setUnit] = useState<TimeUnit>('days');
    const [operation, setOperation] = useState<Operation>('add');
    const [copied, setCopied] = useState(false);
    const { addCalculation } = useRecentCalculations();
    // A page can embed more than one calculator (an article renders one below
    // the prose), so ids must not collide across instances.
    const fieldId = useId();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('base')) setBaseDate(params.get('base')!);
        if (params.get('amount')) setAmount(Number(params.get('amount')));
        if (params.get('unit')) setUnit(params.get('unit') as TimeUnit);
        if (params.get('op')) setOperation(params.get('op') as Operation);
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!baseDate && amount === '') return;
            const url = new URL(window.location.href);
            if (baseDate) url.searchParams.set('base', baseDate);
            if (amount !== '') url.searchParams.set('amount', amount.toString());
            url.searchParams.set('unit', unit);
            url.searchParams.set('op', operation);
            window.history.replaceState({}, '', url);
        }, 300);
        return () => clearTimeout(timeout);
    }, [baseDate, amount, unit, operation]);

    const calculate = () => {
        if (!baseDate || amount === '' || isNaN(amount)) return null;
        return calculateOffsetDate(baseDate, Number(amount), unit, operation);
    };

    const result = calculate();

    const handleSave = () => {
        const base = parseCivilDate(baseDate);
        if (result && base) {
            addCalculation({
                type: 'add_subtract',
                title: `${formatDayMonth(base, locale)} ${operation === 'add' ? '+' : '-'} ${amount} ${t(unit)}`,
                result: formatNumeric(result, locale)
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
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                    <label htmlFor={`${fieldId}-op`} className={labelClass}>{t('action')}</label>
                    <select id={`${fieldId}-op`} value={operation} onChange={(e) => setOperation(e.target.value as Operation)} className={inputClass}>
                        <option value="add">{t('add')}</option>
                        <option value="subtract">{t('subtract')}</option>
                    </select>
                </div>

                <div>
                    <label htmlFor={`${fieldId}-amount`} className={labelClass}>{t('amount')}</label>
                    <input id={`${fieldId}-amount`} type="number" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value === '' ? '' : parseInt(e.target.value))} min="0" className={inputClass} />
                </div>

                <div>
                    <label htmlFor={`${fieldId}-unit`} className={labelClass}>{t('unit')}</label>
                    <select id={`${fieldId}-unit`} value={unit} onChange={(e) => setUnit(e.target.value as TimeUnit)} className={inputClass}>
                        <option value="days">{t('days')}</option>
                        <option value="weeks">{t('weeks')}</option>
                        <option value="months">{t('months')}</option>
                        <option value="years">{t('years')}</option>
                    </select>
                </div>

                <div>
                    <label htmlFor={`${fieldId}-base`} className={labelClass}>{t('startDate')}</label>
                    <input id={`${fieldId}-base`} type="date" value={baseDate} onChange={(e) => setBaseDate(e.target.value)} className={inputClass} />
                </div>
            </div>

            {/*
              The result appears as soon as the inputs are valid — there is no
              submit to move focus. Without a live region a screen reader user
              types a date and hears nothing at all, which on a calculator means
              the answer is simply unavailable to them.
            */}
            <div role="status" aria-live="polite">
                {result && (
                    <div className="mt-8 p-6 rounded-lg bg-blue-50 border border-blue-200 space-y-4">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">{t('result')}</h3>
                                <p className="text-3xl mt-2 font-bold text-blue-800">
                                    {formatLong(result, locale)}
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
