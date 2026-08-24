/**
 * The locale list, with no dependencies.
 *
 * Kept separate from `routing.ts` because that module builds next-intl's
 * navigation helpers, which pull in `next/navigation` and only load inside the
 * Next runtime. Anything that merely needs to know which locales exist — SEO
 * policy, sitemap generation, tests — imports from here instead.
 */

export const locales = ['de', 'en'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'de';
