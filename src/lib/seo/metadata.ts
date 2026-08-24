/**
 * Central page metadata builder.
 *
 * Next.js does not deep-merge `openGraph` — a page that declares the object
 * replaces the layout's entirely. That produced two silent failures:
 *
 *   - Pages declaring `openGraph` without `images` lost the layout's og:image,
 *     so /arbeitstage and /ueber-uns shared with no image at all.
 *   - Pages declaring no `openGraph` inherited the *homepage's*, so every
 *     /ratgeber article shared as "Datumsrechner – Tage, Arbeitstage & Alter"
 *     pointing at https://datums-rechner.com. Every link to an article on
 *     WhatsApp, LinkedIn or Slack rendered as a generic homepage card — on the
 *     one content type meant to earn links.
 *
 * Building metadata through this function makes both impossible: og:url is
 * always the canonical, and title/description/image are always the page's own.
 * `scripts/verify-routes.mjs` asserts og:url === canonical so a regression
 * fails the route check rather than surfacing months later in shares.
 */

import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/constants';
import { hreflangAlternates, robotsDirective } from './indexPolicy';

export const OG_IMAGE = '/og-image.png';

export type PageMetadataInput = {
    locale: string;
    /** Page-specific title, without the site suffix (the layout template adds it). */
    title: string;
    description: string;
    /** Canonical path, root-relative and without a trailing slash (e.g. "/ratgeber"). */
    path: string;
    /** Maps a locale to this page's URL in that locale. Omit for single-locale pages. */
    pathForLocale?: (locale: string) => string;
    /** Defaults to true; combined with locale policy. */
    indexable?: boolean;
    /** og:type — "article" for editorial pages. */
    type?: 'website' | 'article';
    /** Overrides the shared social image. */
    image?: string;
    /** Alt text for the social image; defaults to the page title. */
    imageAlt?: string;
};

/**
 * Normalize a path to the canonical form: root-relative, leading slash, and
 * no trailing slash. The site sets `trailingSlash: false`, so
 * `/addieren/` and `/addieren` must not both be advertised.
 */
export function canonicalUrl(path: string): string {
    if (!path || path === '/') return SITE_URL;
    const withSlash = path.startsWith('/') ? path : `/${path}`;
    const trimmed = withSlash.endsWith('/') ? withSlash.slice(0, -1) : withSlash;
    return `${SITE_URL}${trimmed}`;
}

export function buildPageMetadata({
    locale,
    title,
    description,
    path,
    pathForLocale,
    indexable = true,
    type = 'website',
    image = OG_IMAGE,
    imageAlt
}: PageMetadataInput): Metadata {
    const url = canonicalUrl(path);
    const alt = imageAlt ?? title;

    return {
        title,
        description,
        robots: robotsDirective(locale, indexable),
        alternates: {
            canonical: url,
            languages: pathForLocale
                ? hreflangAlternates((loc) => canonicalUrl(pathForLocale(loc)))
                : hreflangAlternates(() => url)
        },
        openGraph: {
            type,
            locale,
            siteName: 'Datumsrechner',
            title,
            description,
            // Always the page's own canonical — never the parent's.
            url,
            images: [{ url: image, width: 1200, height: 630, alt }]
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
            creator: '@datumsrechner'
        }
    };
}
