'use client';

import { useState, useEffect } from 'react';
import { calculateOffsetDate, TimeUnit, Operation } from '@/lib/calculator';
import { parseCivilDate } from '@/lib/date/civil';
import { formatDayMonth, formatLong, formatNumeric } from '@/lib/date/format';
import { useRecentCalculations } from '@/hooks/useRecentCalculations';
import { Share2, Check, BookmarkPlus } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { InputField, SelectField, FieldRow } from '@/components/ui/Field';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function AddSubtractTime() {
    const t = useTranslations('Calculator');
    const locale = useLocale();

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

    return (
        <div className="space-y-6">
            {/*
              The label/control wiring is Field's job now. This used to be four
              hand-built pairs sharing two class strings copied into all four
              modes, with the caller responsible for generating an id and
              matching it in htmlFor -- wiring that fails silently, because the
              control still works and only screen readers notice.
            */}
            <FieldRow columns={4}>
                <SelectField
                    label={t('action')}
                    value={operation}
                    onChange={(e) => setOperation(e.target.value as Operation)}
                >
                    <option value="add">{t('add')}</option>
                    <option value="subtract">{t('subtract')}</option>
                </SelectField>

                <InputField
                    label={t('amount')}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : parseInt(e.target.value))}
                />

                <SelectField
                    label={t('unit')}
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as TimeUnit)}
                >
                    <option value="days">{t('days')}</option>
                    <option value="weeks">{t('weeks')}</option>
                    <option value="months">{t('months')}</option>
                    <option value="years">{t('years')}</option>
                </SelectField>

                <InputField
                    label={t('startDate')}
                    type="date"
                    value={baseDate}
                    onChange={(e) => setBaseDate(e.target.value)}
                />
            </FieldRow>

            {/*
              The result appears as soon as the inputs are valid — there is no
              submit to move focus. Without a live region a screen reader user
              types a date and hears nothing at all, which on a calculator means
              the answer is simply unavailable to them.
            */}
            <div role="status" aria-live="polite">
                {result && (
                    <Card tone="accent" className="mt-8">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-2">{t('result')}</h3>
                                {/* The answer is the reason the page exists, so
                                    it outranks the surrounding chrome. */}
                                <p className="mt-2 text-3xl sm:text-4xl font-bold text-ink tracking-tight">
                                    {formatLong(result, locale)}
                                </p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <Button variant="secondary" iconOnly onClick={handleSave} aria-label={t('save')} title={t('save')}>
                                    <BookmarkPlus className="w-5 h-5 text-accent" aria-hidden="true" />
                                </Button>
                                <Button variant="secondary" iconOnly onClick={shareUrl} aria-label={t('share')} title={t('share')}>
                                    {copied ? <Check className="w-5 h-5 text-success" aria-hidden="true" /> : <Share2 className="w-5 h-5 text-accent" aria-hidden="true" />}
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
