'use client';

import { useState, Suspense, useEffect, useId, useRef } from 'react';
import { DateDifference } from './modes/DateDifference';
import { AddSubtractTime } from './modes/AddSubtractTime';
import { BusinessDays } from './modes/BusinessDays';
import { AgeCalculator } from './modes/AgeCalculator';
import { useRecentCalculations } from '@/hooks/useRecentCalculations';
import { SplitSquareHorizontal, PlusSquare, Briefcase, User } from 'lucide-react';

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

    // Icons match the ones the nav and the homepage tool cards use for the same
    // four tools, so a mode is recognisable in whichever place it appears.
    const tabs: { id: Mode; label: string; Icon: typeof SplitSquareHorizontal }[] = [
        { id: 'difference', label: t('dateDifference'), Icon: SplitSquareHorizontal },
        { id: 'add_subtract', label: t('addSubtract'), Icon: PlusSquare },
        { id: 'business_days', label: t('businessDays'), Icon: Briefcase },
        { id: 'age', label: t('ageCalculator'), Icon: User },
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
                /* Scrolls rather than wraps, matching .mode-tabbar: four tabs
                   wrapping onto two rows on a narrow phone pushed the fields
                   below the fold. */
                className="flex gap-1 mb-8 p-1 bg-surface-2 rounded-2xl border border-line overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                        className={`flex-1 min-w-max flex items-center justify-center gap-2 min-h-11 px-4 py-3 text-sm font-semibold rounded-xl whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${activeMode === tab.id
                            /* The active tab is an accent-tinted pill, matching
                               the reference's .mode-tab.active, rather than a
                               solid fill -- it reads as selected without
                               shouting over the fields below it. */
                            ? 'bg-accent-dim text-accent border border-accent/25'
                            : 'text-ink-2 border border-transparent hover:text-ink hover:bg-surface'
                            }`}
                    >
                        <tab.Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
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
                <Suspense fallback={<div className="animate-pulse h-64 bg-surface-2 rounded-lg"></div>}>
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
        <div className="mt-12 pt-8 border-t border-line">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-ink">{t('history') || 'Recent Calculations'}</h3>
                <button onClick={clearHistory} className="text-sm text-ink-3 hover:text-ink transition-colors">{t('clearHistory') || 'Clear History'}</button>
            </div>
            <div className="space-y-3">
                {history.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-surface rounded-lg p-4 border border-line hover:border-line-2 transition-colors">
                        <div>
                            <p className="text-sm font-medium text-ink-3 mb-1">{item.title}</p>
                            <p className="text-lg font-bold text-ink">{item.result}</p>
                        </div>
                        {/* Was an unlabelled &times; in text-ink-3 (2.79:1)
                            with no accessible name -- a destructive control
                            that screen readers announced as "times". */}
                        <button
                            type="button"
                            onClick={() => removeCalculation(item.id)}
                            aria-label={`${t('removeEntry')}: ${item.title}`}
                            className="flex items-center justify-center h-11 w-11 shrink-0 rounded-lg text-ink-3 hover:text-ink hover:bg-surface-2 transition-colors text-2xl leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
