'use client';

import { useState, useEffect } from 'react';
import { calculateDateDifference } from '@/lib/calculator';
import { parseCivilDate } from '@/lib/date/civil';
import { formatMedium, formatNumeric } from '@/lib/date/format';
import { useRecentCalculations } from '@/hooks/useRecentCalculations';
import { TimelineVisualization } from '../TimelineVisualization';
import { Share2, Check, BookmarkPlus } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { InputField, FieldRow } from '@/components/ui/Field';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function DateDifference() {
    const t = useTranslations('Calculator');
    const locale = useLocale();

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
        return calculateDateDifference(start, end);
    };

    const result = calculate();

    const handleSave = () => {
        const s = parseCivilDate(start);
        const e = parseCivilDate(end);
        if (result && s && e) {
            addCalculation({
                type: 'differenz',
                title: `${formatNumeric(s, locale)} - ${formatNumeric(e, locale)}`,
                result: `${Math.abs(result.totalDays)} ${t('days')}`
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
                    label={t('startDate')}
                    type="date"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                />
                <InputField
                    label={t('endDate')}
                    type="date"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                />
            </FieldRow>

            <div role="status" aria-live="polite">
            {result && (
                <Card tone="accent" className="mt-8 space-y-6">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">{t('result')}</h3>
                            <p className="mt-2 text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
                                {Math.abs(result.totalDays)} {t('days')}
                            </p>
                            {/* Was "{months} {t('months')} {t('days')} {days}", which
                                rendered as "3 Monate tage 8" — the unit label and its
                                number had drifted apart. */}
                            <p className="text-sm text-slate-600 mt-1">
                                ≈ {result.yearsMonthsDays.months} {t('months')}, {result.yearsMonthsDays.days} {t('days')}
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

                    <TimelineVisualization
                        percentage={100}
                        labelStart={formatMedium(parseCivilDate(start)!, locale)}
                        labelEnd={formatMedium(parseCivilDate(end)!, locale)}
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
                </Card>
            )}
            </div>
        </div>
    );
}
