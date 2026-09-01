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
 * The primary fill is a violet gradient, matching the reference's .calc-submit
 * and .btn--primary.
 *
 * Its text colour is `text-on-accent`, which is a token rather than a literal
 * because it has to flip: white on the light theme's #6D28D9 is 7.1:1, but
 * white on the dark theme's lighter #A78BFA is 2.7:1 and illegible -- that one
 * needs dark text, at 6.3:1. A hardcoded `text-white` would have been correct
 * in exactly one of the two themes.
 */
const VARIANTS: Record<Variant, string> = {
    primary:
        'bg-gradient-to-br from-accent to-accent-cta text-on-accent border border-transparent ' +
        'shadow-[0_2px_14px_var(--petrol-glow)] hover:shadow-[0_5px_20px_var(--petrol-glow)]',
    secondary: 'bg-surface text-ink border border-line-2 hover:border-accent hover:text-accent',
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
