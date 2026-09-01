'use client';

import { useSyncExternalStore } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useLocale } from 'next-intl';

type Choice = 'light' | 'dark' | 'system';

/*
 * The stored theme is external browser state, so it is read with
 * useSyncExternalStore rather than copied into component state inside an
 * effect. That is what the hook is for, and it avoids the
 * set-state-in-effect cascade the lint rule flags.
 *
 * The `storage` event only fires in *other* tabs, so `apply` dispatches one
 * locally too. The useful side effect is that changing the theme in one tab
 * now updates every other open tab as well.
 */
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
    listeners.add(onChange);
    window.addEventListener('storage', onChange);
    return () => {
        listeners.delete(onChange);
        window.removeEventListener('storage', onChange);
    };
}

function getSnapshot(): Choice {
    try {
        const stored = localStorage.getItem('theme');
        return stored === 'dark' || stored === 'light' ? stored : 'system';
    } catch {
        return 'system';
    }
}

/*
 * The server cannot know what is in localStorage. Returning undefined renders
 * nothing selected until hydration, which is honest -- guessing 'system' would
 * light up the wrong control for a moment on every load for anyone who chose.
 */
function getServerSnapshot(): Choice | undefined {
    return undefined;
}

/**
 * Light / dark / system, as a three-way control.
 *
 * The reference site offers the same choice, and "system" has to be one of the
 * options rather than an implicit default: without it, a reader whose OS is
 * dark cannot get back to following it once they have tried the other two.
 *
 * "system" is stored as the *absence* of a preference, so the
 * prefers-color-scheme media query in globals.css stays in charge. The
 * data-theme attribute is only ever set for an explicit choice.
 *
 * The inline script in the layout applies the stored value before first paint;
 * this component only reads and writes it. Until it mounts, `undefined` renders
 * nothing selected -- the server cannot know what is in localStorage, and
 * guessing produces a hydration mismatch.
 */
export function ThemeSwitch() {
    const locale = useLocale();
    const isDe = locale === 'de';
    const choice = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const apply = (next: Choice) => {
        // The attribute is set first, so the theme changes even if storage
        // throws -- private mode should still honour the click for this view.
        if (next === 'system') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', next);
        }
        try {
            if (next === 'system') localStorage.removeItem('theme');
            else localStorage.setItem('theme', next);
        } catch {
            /* Private mode: the choice applies but will not persist. */
        }
        for (const listener of listeners) listener();
    };

    const options: { value: Choice; label: string; Icon: typeof Sun }[] = [
        { value: 'light', label: isDe ? 'Hell' : 'Light', Icon: Sun },
        { value: 'dark', label: isDe ? 'Dunkel' : 'Dark', Icon: Moon },
        { value: 'system', label: isDe ? 'System' : 'System', Icon: Monitor }
    ];

    return (
        <div
            role="group"
            aria-label={isDe ? 'Farbschema' : 'Colour scheme'}
            className="flex items-center gap-0.5 rounded-full border border-line bg-surface p-0.5"
        >
            {options.map(({ value, label, Icon }) => {
                const active = choice === value;
                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() => apply(value)}
                        aria-pressed={active}
                        aria-label={label}
                        title={label}
                        className={`flex items-center justify-center h-8 w-8 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                            active
                                ? 'bg-accent-dim text-accent'
                                : 'text-ink-3 hover:text-ink hover:bg-surface-2'
                        }`}
                    >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                    </button>
                );
            })}
        </div>
    );
}
