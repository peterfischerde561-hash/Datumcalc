'use client';

import { useState, useEffect } from 'react';
import { calculateAge } from '@/lib/calculator';
import { useRecentCalculations } from '@/hooks/useRecentCalculations';
import { Share2, Check, BookmarkPlus } from 'lucide-react';
import { format } from 'date-fns';

import { useTranslations } from 'next-intl';

export function AgeCalculator() {
    const t = useTranslations('Calculator');
    const [birthdate, setBirthdate] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const { addCalculation } = useRecentCalculations();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('dob')) setBirthdate(params.get('dob')!);
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!birthdate) return;
            const url = new URL(window.location.href);
            url.searchParams.set('dob', birthdate);
            window.history.replaceState({}, '', url);
        }, 500);
        return () => clearTimeout(timeout);
    }, [birthdate]);

    const calculate = () => {
        if (!birthdate) return null;
        return calculateAge(new Date(birthdate));
    };

    const result = calculate();

    const handleSave = () => {
        if (result && birthdate) {
            addCalculation({
                type: 'age',
                title: `${t('birthDate')}: ${format(new Date(birthdate), 'dd.MM.yyyy')}`,
                result: `${result.years} ${t('years')}`
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
                    <label className={labelClass}>{t('birthDate')}</label>
                    <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className={inputClass} />
                </div>
            </div>

            {result && (
                <div className="mt-8 p-6 rounded-lg bg-blue-50 border border-blue-200 space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">{t('currentAge')}</h3>
                            <p className="text-4xl mt-2 font-bold text-blue-800">
                                {result.years} {t('years')}
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

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-blue-200">
                        <div>
                            <p className="text-sm text-slate-500">{t('months')}</p>
                            <p className="font-semibold text-slate-900">{result.months}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">{t('days')}</p>
                            <p className="font-semibold text-slate-900">{result.days}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm text-slate-500">Total Life Days</p>
                            <p className="font-semibold text-slate-900">{result.totalDays} {t('days')}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
