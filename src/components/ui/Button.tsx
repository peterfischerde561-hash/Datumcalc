import NextLink from 'next/link';
import { cn } from '@/lib/ui/cn';

/**
 * Buttons and button-shaped links.
 *
 * Every one was written by hand, which is why they disagreed on height:
 * 32px for the language toggle, 40px for the menu toggle, 42px for the CTA.
 * `h-11` is 44px, the minimum comfortable target, and it is not optional here.
 *
 * `iconOnly` exists because an icon button with no text needs a square target
 * and an aria-label, and the ones that were hand-rolled had neither
 * consistently -- the history delete control was an unlabelled &times; in
 * slate-400.
 */
type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'default' | 'large';

/*
 * The primary button is a cyan gradient carrying *dark* text. On this palette
 * that is the high-contrast direction: #080b14 on #00d4ff is 11:1, whereas
 * white on cyan would be 1.6:1 and illegible.
 */
const VARIANTS: Record<Variant, string> = {
    primary:
        'bg-gradient-to-br from-accent to-accent-2 text-background border border-transparent ' +
        'shadow-[0_0_20px_rgba(0,212,255,0.30)] hover:shadow-[0_0_30px_rgba(0,212,255,0.50)]',
    secondary: 'bg-surface-2 text-ink border border-line-2 hover:bg-surface-3 hover:border-accent hover:text-accent',
    ghost: 'bg-transparent text-ink-2 border border-line hover:text-accent hover:border-accent'
};

const SIZES: Record<Size, string> = {
    default: 'h-11 px-5 text-sm',
    large: 'h-12 px-6 text-base'
};

const BASE = cn(
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold',
    'transition-all outline-none',
    'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:opacity-50 disabled:pointer-events-none'
);

function classes(variant: Variant, size: Size, iconOnly: boolean, className?: string) {
    return cn(BASE, VARIANTS[variant], SIZES[size], iconOnly && 'w-11 px-0', className);
}

export function Button({
    variant = 'primary',
    size = 'default',
    iconOnly = false,
    className,
    type = 'button',
    children,
    ...rest
}: {
    variant?: Variant;
    size?: Size;
    iconOnly?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button type={type} className={classes(variant, size, iconOnly, className)} {...rest}>
            {children}
        </button>
    );
}

export function ButtonLink({
    href,
    variant = 'primary',
    size = 'default',
    iconOnly = false,
    className,
    children,
    ...rest
}: {
    href: string;
    variant?: Variant;
    size?: Size;
    iconOnly?: boolean;
} & Omit<React.ComponentProps<typeof NextLink>, 'href'>) {
    return (
        <NextLink href={href} className={classes(variant, size, iconOnly, className)} {...rest}>
            {children}
        </NextLink>
    );
}
