'use client';

import { useState, useEffect } from 'react';
import { calculateOffsetDate, TimeUnit, Operation } from '@/lib/calculator';
import { format } from 'date-fns';
import { useRecentCalculations } from '@/hooks/useRecentCalculations';
import { Share2, Check, BookmarkPlus } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import * as dateLocales from 'date-fns/locale';

export function AddSubtractTime() {
    const t = useTranslations('Calculator');
    const locale = useLocale();
    const dateLocale = (dateLocales as any)[locale] || dateLocales.de;

    const [baseDate, setBaseDate] = useState<string>('');
    const [amount, setAmount] = useState<number | ''>('');
    const [unit, setUnit] = useState<TimeUnit>('days');
    const [operation, setOperation] = useState<Operation>('add');
    const [copied, setCopied] = useState(false);
    const { addCalculation } = useRecentCalculations();

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
        return calculateOffsetDate(new Date(baseDate), Number(amount), unit, operation);
    };

    const result = calculate();

    const handleSave = () => {
        if (result) {
            addCalculation({
                type: 'add_subtract',
                title: `${format(new Date(baseDate), 'dd.MM')} ${operation === 'add' ? '+' : '-'} ${amount} ${t(unit)}`,
                result: format(result, 'dd.MM.yyyy')
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                    <label className={labelClass}>{t('action')}</label>
                    <select value={operation} onChange={(e) => setOperation(e.target.value as Operation)} className={inputClass}>
                        <option value="add">{t('add')}</option>
                        <option value="subtract">{t('subtract')}</option>
                    </select>
                </div>

                <div>
                    <label className={labelClass}>{t('amount')}</label>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value === '' ? '' : parseInt(e.target.value))} min="0" className={inputClass} />
                </div>

                <div>
                    <label className={labelClass}>{t('unit')}</label>
                    <select value={unit} onChange={(e) => setUnit(e.target.value as TimeUnit)} className={inputClass}>
                        <option value="days">{t('days')}</option>
                        <option value="weeks">{t('weeks')}</option>
                        <option value="months">{t('months')}</option>
                        <option value="years">{t('years')}</option>
                    </select>
                </div>

                <div>
                    <label className={labelClass}>{t('startDate')}</label>
                    <input type="date" value={baseDate} onChange={(e) => setBaseDate(e.target.value)} className={inputClass} />
                </div>
            </div>

            {result && (
                <div className="mt-8 p-6 rounded-lg bg-blue-50 border border-blue-200 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">{t('result')}</h3>
                            <p className="text-3xl mt-2 font-bold text-blue-800">
                                {format(result, 'EEEE, dd. MMMM yyyy', { locale: dateLocale })}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleSave} className="bg-white hover:bg-slate-100 border border-slate-300 p-2 rounded-md transition-colors" title={t('save')}>
                                <BookmarkPlus className="w-5 h-5 text-blue-700" />
                            </button>
                            <button onClick={shareUrl} className="bg-white hover:bg-slate-100 border border-slate-300 p-2 rounded-md transition-colors" title={t('share')}>
                                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Share2 className="w-5 h-5 text-blue-700" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
