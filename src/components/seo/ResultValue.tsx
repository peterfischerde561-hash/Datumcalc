/**
 * Machine-readable wrapper for a server-rendered calculation result.
 *
 * Route-level tests assert on `data-result-type` / `data-result-value` rather
 * than regex-matching prose, so adding a route family means declaring an
 * expectation (see src/lib/seo/resultContract.ts) instead of editing a
 * validator. `data-result-value` is always a machine value — an ISO date or a
 * plain integer — never a localized string.
 */

export type ResultType =
    | 'today'
    | 'target-date'
    | 'days-remaining'
    | 'day-of-year'
    | 'iso-week'
    | 'weekday';

/**
 * Numeric results render in the accent colour and the mono face, so the figure
 * a visitor came for is the thing their eye lands on inside a sentence. Dates
 * and weekdays are words, not values, and stay in the body face.
 */
const NUMERIC: ResultType[] = ['days-remaining', 'day-of-year', 'iso-week'];

export function ResultValue({
    type,
    value,
    children,
    className
}: {
    type: ResultType;
    value: string | number;
    children: React.ReactNode;
    className?: string;
}) {
    const numeric = NUMERIC.includes(type);
    return (
        <span
            data-result-type={type}
            data-result-value={String(value)}
            className={[numeric ? 'figure-mono text-accent' : '', className].filter(Boolean).join(' ')}
        >
            {children}
        </span>
    );
}
