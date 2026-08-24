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
    return (
        <span data-result-type={type} data-result-value={String(value)} className={className}>
            {children}
        </span>
    );
}
