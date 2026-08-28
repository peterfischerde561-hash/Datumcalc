'use client';

import { useId } from 'react';
import { cn } from '@/lib/ui/cn';

/**
 * A labelled form control.
 *
 * All four calculator modes declared the same two strings by hand:
 *
 *   const inputClass = "w-full bg-white border border-slate-300 rounded-md
 *                       px-4 py-3 ... [color-scheme:light]";
 *   const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";
 *
 * Eight copies, and they had already begun to drift. Worse, the label/control
 * pairing was the caller's job: each one had to remember to generate an id,
 * put it on the input, and match it in htmlFor. That is the wiring that breaks
 * silently -- the control keeps working and only screen readers notice.
 *
 * Field owns the id. A caller cannot forget to associate the label, because it
 * never sees the id at all.
 *
 * `hint` is rendered through aria-describedby rather than as loose text, so a
 * screen reader reads the guidance with the field instead of after it.
 */

const CONTROL = cn(
    'w-full h-11 rounded-lg border border-slate-300 bg-white px-3',
    'text-slate-900 placeholder:text-slate-500',
    'transition-colors outline-none',
    'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500',
    // Date inputs render their own picker chrome; without this the browser is
    // free to paint it dark and the calendar glyph disappears on white.
    '[color-scheme:light]'
);

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
    return (
        <label htmlFor={htmlFor} className="block text-sm font-semibold text-slate-700 mb-1.5">
            {children}
        </label>
    );
}

function Hint({ id, children }: { id: string; children: React.ReactNode }) {
    return (
        <p id={id} className="mt-1.5 text-sm text-slate-600">
            {children}
        </p>
    );
}

export function InputField({
    label,
    hint,
    className,
    ...rest
}: {
    label: string;
    hint?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
    const generated = useId();
    const id = rest.id ?? `${generated}-input`;
    const hintId = hint ? `${id}-hint` : undefined;

    return (
        <div>
            <Label htmlFor={id}>{label}</Label>
            <input {...rest} id={id} aria-describedby={hintId} className={cn(CONTROL, className)} />
            {hint && <Hint id={hintId!}>{hint}</Hint>}
        </div>
    );
}

export function SelectField({
    label,
    hint,
    className,
    children,
    ...rest
}: {
    label: string;
    hint?: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
    const generated = useId();
    const id = rest.id ?? `${generated}-select`;
    const hintId = hint ? `${id}-hint` : undefined;

    return (
        <div>
            <Label htmlFor={id}>{label}</Label>
            <select {...rest} id={id} aria-describedby={hintId} className={cn(CONTROL, className)}>
                {children}
            </select>
            {hint && <Hint id={hintId!}>{hint}</Hint>}
        </div>
    );
}

/** The row the calculator inputs sit in, so the four modes stop disagreeing. */
export function FieldRow({
    columns = 4,
    className,
    children
}: {
    columns?: 2 | 3 | 4;
    className?: string;
    children: React.ReactNode;
}) {
    const cols = {
        2: 'sm:grid-cols-2',
        3: 'sm:grid-cols-2 lg:grid-cols-3',
        4: 'sm:grid-cols-2 lg:grid-cols-4'
    }[columns];

    return <div className={cn('grid grid-cols-1 gap-4 sm:gap-6', cols, className)}>{children}</div>;
}
