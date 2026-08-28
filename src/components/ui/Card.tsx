import { cn } from '@/lib/ui/cn';

/**
 * The card. Singular.
 *
 * The audit found this shape written inline fifteen different ways:
 * `bg-white border border-slate-200 rounded-xl` with p-5, p-6, p-7, p-8 and
 * p-10, with and without shadow-sm, on pages that sit next to each other. Six
 * files declared the p-6 rounded-xl variant independently.
 *
 * Three tones, because three are actually used: the default surface, a sunken
 * one for secondary information, and an accent one for answers and callouts
 * (which was `bg-blue-50 border-blue-200` inline in five places).
 *
 * Flat by default. Borders separate these cards, not shadows -- a page of
 * elevated white boxes on a near-white background reads as noise, and the
 * shadow was inconsistent anyway.
 */
type CardTone = 'default' | 'sunken' | 'accent';
type CardPadding = 'none' | 'compact' | 'default' | 'roomy';

const TONES: Record<CardTone, string> = {
    default: 'bg-white border-slate-200',
    sunken: 'bg-slate-50 border-slate-200',
    accent: 'bg-blue-50 border-blue-200'
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
            className={cn('rounded-xl border', TONES[tone], PADDING[padding], className)}
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
                'rounded-xl border border-slate-200 bg-white transition-colors',
                'hover:border-blue-400 focus-within:border-blue-500',
                'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
                className
            )}
            {...rest}
        >
            {children}
        </div>
    );
}
