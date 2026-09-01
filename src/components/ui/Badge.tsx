import NextLink from 'next/link';
import { cn } from '@/lib/ui/cn';

/**
 * Small uppercase pills. The reference uses a row of these above the hero h1 to
 * state what the tool is, before the heading says what it does.
 *
 * Matches their .badge: 0.75rem, weight 600, 0.05em tracking, uppercase, full
 * radius, tinted fill with a matching border.
 *
 * Amber is deliberately absent. Their amber (#E08A00) is 2.3-2.7:1 on every
 * surface here, so it cannot carry its own label text.
 */
type BadgeTone = 'accent' | 'success' | 'neutral';

const TONES: Record<BadgeTone, string> = {
    accent: 'bg-accent-dim text-accent border-accent/25',
    success: 'bg-success-dim text-success-ink border-success/25',
    neutral: 'bg-surface-2 text-ink-2 border-line'
};

export function Badge({
    tone = 'accent',
    className,
    children
}: {
    tone?: BadgeTone;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1',
                'text-xs font-semibold uppercase tracking-[0.05em]',
                TONES[tone],
                className
            )}
        >
            {children}
        </span>
    );
}

/**
 * The suggestion pills under the calculator. These are links to real pages, not
 * buttons that prefill a field -- a crawlable route from the homepage to the
 * URLs that actually earn traffic.
 */
export function Chip({
    href,
    className,
    children
}: {
    href: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <NextLink
            href={href}
            className={cn(
                'inline-flex items-center rounded-full border border-line bg-surface-2 px-3 py-1.5',
                'text-sm text-ink-2 whitespace-nowrap transition-colors',
                'hover:border-accent hover:text-accent hover:bg-accent-dim',
                'outline-none focus-visible:ring-2 focus-visible:ring-accent',
                className
            )}
        >
            {children}
        </NextLink>
    );
}
