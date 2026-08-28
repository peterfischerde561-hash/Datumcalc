import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes so a caller's override actually wins.
 *
 * Without this, `<Card className="p-8">` produces `p-6 p-8` and the result
 * depends on stylesheet order rather than intent. twMerge resolves conflicting
 * utilities by keeping the last one, which is what lets the primitives below
 * set sensible defaults without becoming a straitjacket.
 *
 * clsx and tailwind-merge were both already dependencies, unused.
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}
