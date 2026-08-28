'use client';

import { useState, Suspense, useEffect, useId, useRef } from 'react';
import { DateDifference } from './modes/DateDifference';
import { AddSubtractTime } from './modes/AddSubtractTime';
import { BusinessDays } from './modes/BusinessDays';
import { AgeCalculator } from './modes/AgeCalculator';
import { useRecentCalculations } from '@/hooks/useRecentCalculations';

type Mode = 'difference' | 'add_subtract' | 'business_days' | 'age';

interface CalculatorCoreProps {
    initialMode?: Mode;
}

import { useTranslations } from 'next-intl';

/**
 * The mode switcher is a real tab set.
 *
 * It rendered four bare <button>s: no role, no aria-selected, no link between a
 * tab and the panel it controls. Sighted users saw tabs; a screen reader user
 * heard four unrelated buttons and got no announcement when the panel beneath
 * them changed. This is the calculator's primary control, so that gap sat on
 * the one interaction the whole site exists for.
 *
 * Keyboard behaviour follows the APG tabs pattern: arrows move between tabs,
 * Home/End jump to the ends, and only the active tab is tabbable, so Tab moves
 * out of the tablist into the panel rather than through four stops.
 */
export function CalculatorCore({ initialMode = 'difference' }: CalculatorCoreProps) {
    const t = useTranslations('Modes');
    const [activeMode, setActiveMode] = useState<Mode>(initialMode);
    // Ids must be unique per instance: an article renders a calculator below
    // its prose, so a page can hold more than one.
    const baseId = useId();
    const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    const tabs: { id: Mode; label: string }[] = [
        { id: 'difference', label: t('dateDifference') },
        { id: 'add_subtract', label: t('addSubtract') },
        { id: 'business_days', label: t('businessDays') },
        { id: 'age', label: t('ageCalculator') },
    ];

    const tabId = (mode: Mode) => `${baseId}-tab-${mode}`;
    const panelId = (mode: Mode) => `${baseId}-panel-${mode}`;

    const onKeyDown = (event: React.KeyboardEvent) => {
        const index = tabs.findIndex((tab) => tab.id === activeMode);
        let next: number | null = null;

        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        if (next === null) return;

        event.preventDefault();
        const mode = tabs[next].id;
        setActiveMode(mode);
        tabRefs.current[mode]?.focus();
    };

    return (
        <div className="w-full">
            <div
                role="tablist"
                aria-label={t('dateDifference')}
                onKeyDown={onKeyDown}
                className="flex flex-wrap gap-1 mb-8 p-1 bg-slate-100 rounded-lg border border-slate-200"
            >
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        id={tabId(tab.id)}
                        role="tab"
                        type="button"
                        aria-selected={activeMode === tab.id}
                        aria-controls={panelId(tab.id)}
                        tabIndex={activeMode === tab.id ? 0 : -1}
                        ref={(node) => { tabRefs.current[tab.id] = node; }}
                        onClick={() => setActiveMode(tab.id)}
                        className={`flex-1 min-w-[120px] min-h-11 px-4 py-2.5 text-sm font-semibold rounded-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeMode === tab.id
                            ? 'bg-blue-700 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Calculator Body */}
            <div
                role="tabpanel"
                id={panelId(activeMode)}
                aria-labelledby={tabId(activeMode)}
                tabIndex={0}
                className="min-h-[300px] focus:outline-none"
            >
                <Suspense fallback={<div className="animate-pulse h-64 bg-slate-100 rounded-lg"></div>}>
                    {activeMode === 'difference' && <DateDifference />}
                    {activeMode === 'add_subtract' && <AddSubtractTime />}
                    {activeMode === 'business_days' && <BusinessDays />}
                    {activeMode === 'age' && <AgeCalculator />}
                </Suspense>
            </div>

            {/* Recent Calculations */}
            <RecentCalculationsBlock />
        </div>
    );
}

function RecentCalculationsBlock() {
    const t = useTranslations('SmartInput');
    const { history, clearHistory, removeCalculation } = useRecentCalculations();
    // avoid hydration mismatch by not rendering server side
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || history.length === 0) return null;

    return (
        <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">{t('history') || 'Recent Calculations'}</h3>
                <button onClick={clearHistory} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">{t('clearHistory') || 'Clear History'}</button>
            </div>
            <div className="space-y-3">
                {history.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-slate-300 transition-colors">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">{item.title}</p>
                            <p className="text-lg font-bold text-slate-900">{item.result}</p>
                        </div>
                        {/* Was an unlabelled &times; in text-slate-400 (2.79:1)
                            with no accessible name -- a destructive control
                            that screen readers announced as "times". */}
                        <button
                            type="button"
                            onClick={() => removeCalculation(item.id)}
                            aria-label={`${t('removeEntry')}: ${item.title}`}
                            className="flex items-center justify-center h-11 w-11 shrink-0 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors text-2xl leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
