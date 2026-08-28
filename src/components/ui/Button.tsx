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

const VARIANTS: Record<Variant, string> = {
    primary: 'bg-blue-700 text-white hover:bg-blue-800 border border-transparent',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900',
    ghost: 'bg-transparent text-slate-600 border border-transparent hover:bg-slate-100 hover:text-slate-900'
};

const SIZES: Record<Size, string> = {
    default: 'h-11 px-5 text-sm',
    large: 'h-12 px-6 text-base'
};

const BASE = cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold',
    'transition-colors outline-none',
    'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
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
