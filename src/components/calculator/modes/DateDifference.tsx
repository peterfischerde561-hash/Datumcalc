'use client';

import { useState, useEffect } from 'react';
import { calculateDateDifference } from '@/lib/calculator';
import { format } from 'date-fns';
import { useRecentCalculations } from '@/hooks/useRecentCalculations';
import { TimelineVisualization } from '../TimelineVisualization';
import { Share2, Check, BookmarkPlus } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import * as dateLocales from 'date-fns/locale';

export function DateDifference() {
    const t = useTranslations('Calculator');
    const locale = useLocale();
    const dateLocale = (dateLocales as any)[locale] || dateLocales.de;

    const [start, setStart] = useState<string>('');
    const [end, setEnd] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const { addCalculation } = useRecentCalculations();

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
        }, 500);
        return () => clearTimeout(timeout);
    }, [start, end]);

    const calculate = () => {
        if (!start || !end) return null;
        return calculateDateDifference(new Date(start), new Date(end));
    };

    const result = calculate();

    const handleSave = () => {
        if (result) {
            addCalculation({
                type: 'differenz',
                title: `${format(new Date(start), 'dd.MM.yyyy')} - ${format(new Date(end), 'dd.MM.yyyy')}`,
                result: `${Math.abs(result.totalDays)} ${t('days')}`
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
                    <label className={labelClass}>{t('startDate')}</label>
                    <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>{t('endDate')}</label>
                    <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={inputClass} />
                </div>
            </div>

            {result && (
                <div className="mt-8 p-6 rounded-lg bg-blue-50 border border-blue-200 space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">{t('result')}</h3>
                            <p className="text-4xl mt-2 font-bold text-blue-800">
                                {Math.abs(result.totalDays)} {t('days')}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">
                                ≈ {result.yearsMonthsDays.months} {t('months')} {t('days').toLowerCase()} {result.yearsMonthsDays.days}
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

                    <TimelineVisualization
                        percentage={100}
                        labelStart={format(new Date(start), 'dd. MMM yyyy', { locale: dateLocale })}
                        labelEnd={format(new Date(end), 'dd. MMM yyyy', { locale: dateLocale })}
                    />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-blue-200">
                        <div>
                            <p className="text-sm text-slate-500">{t('weeks')}</p>
                            <p className="font-semibold text-slate-900">{result.weeksAndDays.weeks} {t('weeksAbbr')}, {result.weeksAndDays.days} {t('daysAbbr')}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm text-slate-500">{t('years')}, {t('months')}, {t('days')}</p>
                            <p className="font-semibold text-slate-900">{result.yearsMonthsDays.years} {t('yearsAbbr')}, {result.yearsMonthsDays.months} {t('monthsAbbr')}, {result.yearsMonthsDays.days} {t('daysAbbr')}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
