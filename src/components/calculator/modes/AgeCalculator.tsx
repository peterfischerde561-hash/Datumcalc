'use client';

import { useState, useEffect } from 'react';
import { calculateAge } from '@/lib/calculator';
import { getLocalToday, parseCivilDate } from '@/lib/date/civil';
import { formatNumeric } from '@/lib/date/format';
import { useRecentCalculations } from '@/hooks/useRecentCalculations';
import { Share2, Check, BookmarkPlus } from 'lucide-react';

import { useTranslations, useLocale } from 'next-intl';
import { InputField, FieldRow } from '@/components/ui/Field';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function AgeCalculator() {
    const t = useTranslations('Calculator');
    const locale = useLocale();
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
        return calculateAge(birthdate, getLocalToday());
    };

    const result = calculate();

    const handleSave = () => {
        const dob = parseCivilDate(birthdate);
        if (result && dob) {
            addCalculation({
                type: 'age',
                title: `${t('birthDate')}: ${formatNumeric(dob, locale)}`,
                result: `${result.years} ${t('years')}`
            });
        }
    };

    const shareUrl = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            <FieldRow columns={2}>
                <InputField
                    label={t('birthDate')}
                    type="date"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                />
            </FieldRow>

            <div role="status" aria-live="polite">
            {result && (
                <Card tone="accent" className="mt-8 space-y-6">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">{t('currentAge')}</h3>
                            <p className="mt-2 text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
                                {result.years} {t('years')}
                            </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Button variant="secondary" iconOnly onClick={handleSave} aria-label={t('save')} title={t('save')}>
                                <BookmarkPlus className="w-5 h-5 text-blue-700" aria-hidden="true" />
                            </Button>
                            <Button variant="secondary" iconOnly onClick={shareUrl} aria-label={t('share')} title={t('share')}>
                                {copied ? <Check className="w-5 h-5 text-green-600" aria-hidden="true" /> : <Share2 className="w-5 h-5 text-blue-700" aria-hidden="true" />}
                            </Button>
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
                            {/* Was the untranslated "Total Life Days" on both locales. */}
                            <p className="text-sm text-slate-500">
                                {locale === 'de' ? 'Gelebte Tage insgesamt' : 'Total days lived'}
                            </p>
                            <p className="font-semibold text-slate-900">{result.totalDays} {t('days')}</p>
                        </div>
                    </div>
                </Card>
            )}
            </div>
        </div>
    );
}
