import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';
import { INTENT_TRANSLATIONS, translateSlug, reverseTranslateSlug } from '@/lib/seo/translations';
import { resolveCanonicalQuery, exceedsOffsetLimit } from '@/lib/seo/queryModel';

const intlMiddleware = createMiddleware(routing);

/**
 * URL normalization happens here, not during render.
 *
 * It used to live in the route: `permanentRedirect()` was called from
 * generateMetadata and again from the page component. That combination emits
 * two Location headers for one request, because the page component can execute
 * more than once and each execution throws its own redirect. A client joins
 * them:
 *
 *   Location: /addieren/100-tage-ab-heute, /addieren/100-tage-ab-heute
 *
 * which is not a valid URL. Search Console records that as "Redirect error",
 * and it is by far the largest bucket of non-indexed pages on this property.
 *
 * Neither half alone works: a redirect thrown in generateMetadata does not
 * abort the render in this Next version, so metadata-only silently serves a
 * 200 on a URL that should redirect; and page-component-only emits the
 * duplicate header. The normalization simply does not belong in the rendering
 * path.
 *
 * Middleware runs exactly once per request, before any rendering, and returns
 * one response. That makes a duplicate Location structurally impossible.
 */
function normalizeCalculatorPath(request: NextRequest): NextResponse | null {
    const { pathname } = request.nextUrl;

    // /<intent>/<slug> or /<locale>/<intent>/<slug>
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;

    const locale = routing.locales.includes(parts[0] as never) ? parts[0] : routing.defaultLocale;
    const offset = routing.locales.includes(parts[0] as never) ? 1 : 0;
    const intentSegment = parts[offset];
    const slugParts = parts.slice(offset + 1);
    if (slugParts.length === 0) return null;

    const intents = INTENT_TRANSLATIONS[locale];
    if (!intents) return null;

    const internalIntent = Object.keys(intents).find((key) => intents[key] === intentSegment);
    if (!internalIntent) return null;
    if (!['addieren', 'differenz', 'arbeitstage', 'alter'].includes(internalIntent)) return null;

    const slugStr = slugParts.join('-');
    const canonicalSlugStr = reverseTranslateSlug(slugStr, locale);

    // Beyond the generation limit there is nothing to redirect to; let the
    // route render its 404.
    if (exceedsOffsetLimit(canonicalSlugStr)) return null;

    const { canonicalSlug } = resolveCanonicalQuery(canonicalSlugStr);
    if (!canonicalSlug) return null;

    const correctSlug = translateSlug(canonicalSlug, locale);
    if (correctSlug.toLowerCase() === slugStr.toLowerCase()) return null;

    const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
    const target = `${prefix}/${intentSegment}/${correctSlug}`;

    const url = request.nextUrl.clone();
    url.pathname = target;
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url, 308);
}

export default function middleware(request: NextRequest) {
    const normalized = normalizeCalculatorPath(request);
    if (normalized) return normalized;
    return intlMiddleware(request);
}

export const config = {
    // Match only internationalized pathnames
    matcher: [
        '/',
        '/(de|en)/:path*',
        '/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap.*\\.xml|878dc35e0.*\\.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|json)).*)'
    ]
};
