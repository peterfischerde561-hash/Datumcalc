import { cn } from '@/lib/ui/cn';

/**
 * The card. Singular.
 *
 * The audit found this shape written inline fifteen different ways:
 * `bg-surface border border-line rounded-xl` with p-5, p-6, p-7, p-8 and
 * p-10, with and without shadow-sm, on pages that sit next to each other. Six
 * files declared the p-6 rounded-xl variant independently.
 *
 * Three tones, because three are actually used: the default surface, a sunken
 * one for secondary information, and an accent one for answers and callouts
 * (which was `bg-accent-dim border-accent-line` inline in five places).
 *
 * Flat by default. Borders separate these cards, not shadows -- a page of
 * elevated white boxes on a near-white background reads as noise, and the
 * shadow was inconsistent anyway.
 */
type CardTone = 'default' | 'sunken' | 'accent';
type CardPadding = 'none' | 'compact' | 'default' | 'roomy';

/*
 * Opaque surfaces on a tinted page, which is how the reference separates a card
 * from its background: --surface (#FFF light / #201A2E dark) sitting on --paper
 * (#F5F3FB / #17131F), with a hairline rule and a shadow so faint it reads as
 * an edge rather than elevation.
 *
 * An earlier version of this used translucent white and a backdrop blur. That
 * belonged to the dark cyan theme this replaced; over a light page a 4%-white
 * fill is invisible.
 */
const TONES: Record<CardTone, string> = {
    default: 'bg-surface border border-line shadow-[var(--shadow-sm)]',
    sunken: 'bg-surface-2 border border-line',
    accent: 'bg-accent-dim border border-accent/20'
};

const PADDING: Record<CardPadding, string> = {
    none: '',
    compact: 'p-4 sm:p-5',
    default: 'p-6 sm:p-8',
    roomy: 'p-8 sm:p-10'
};

export function Card({
    tone = 'default',
    padding = 'default',
    as: Component = 'div',
    className,
    children,
    ...rest
}: {
    tone?: CardTone;
    padding?: CardPadding;
    /** `li` is here so ordered/unordered lists keep valid children. */
    as?: 'div' | 'section' | 'article' | 'aside' | 'li';
    className?: string;
    children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
    return (
        <Component
            className={cn('rounded-2xl', TONES[tone], PADDING[padding], className)}
            {...rest}
        >
            {children}
        </Component>
    );
}

/**
 * A card that is a link target in a list -- the guide index, the tool grid.
 * Separate from Card because the hover and focus affordances only make sense
 * when the whole surface is clickable, and inlining them was how the grids
 * drifted apart.
 */
export function CardLink({
    className,
    children,
    ...rest
}: { className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLElement>) {
    return (
        <div
            className={cn(
                'bg-surface border border-line rounded-2xl shadow-[var(--shadow-sm)] transition-colors',
                'hover:border-accent focus-within:border-accent',
                'focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-background',
                className
            )}
            {...rest}
        >
            {children}
        </div>
    );
}
