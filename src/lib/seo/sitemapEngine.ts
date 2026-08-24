import { CANONICAL_QUERIES } from './queryModel';
import { locales } from '@/i18n/routing';
import { INTENT_TRANSLATIONS, translateSlug, getCanonicalPath } from './translations';
import { SITE_URL } from '@/lib/constants';
import { getArticles } from '@/lib/articles';
import { isIndexableLocale } from './indexPolicy';

// A sitemap is a request to index. Listing a noindexed locale asks Google to
// index a page that then tells it not to, which is a contradiction worth
// avoiding rather than a signal worth sending.
const indexableLocales = locales.filter(isIndexableLocale);

const CALC_MODE_TO_INTENT: Record<string, string> = {
    add_subtract: 'addieren',
    difference: 'differenz',
    business_days: 'arbeitstage',
    age: 'alter',
};

/**
 * Sitemap Engine Configuration
 * Defines logic for which programmatic pages are injected into sitemaps.
 */

// Define standard buckets to generate dynamic sitemaps
export const BASE_URL = SITE_URL; 
const STATIC_LASTMOD = new Date('2024-01-01T00:00:00Z');

function getLocalizedUrl(path: string, locale: string) {
    const prefix = locale === 'de' ? '' : `/${locale}`;
    const cleanPath = path === '/' ? '' : (path.startsWith('/') ? path : `/${path}`);
    return `${SITE_URL}${prefix}${cleanPath}` || `${SITE_URL}/`;
}

export function getCoreSitemapUrls() {
    const internalPaths = ['', 'addieren', 'differenz', 'arbeitstage', 'alter', 'ratgeber', 'sitemap', 'ueber-uns', 'datenschutz', 'impressum', 'agb'];
    const urls: any[] = [];

    indexableLocales.forEach(locale => {
        internalPaths.forEach(path => {
            let canonicalPath = '';
            if (path === '') {
                canonicalPath = locale === 'de' ? '/' : `/${locale}`;
            } else {
                canonicalPath = getCanonicalPath(locale, path);
            }

            urls.push({
                url: `${SITE_URL}${canonicalPath}`,
                lastModified: STATIC_LASTMOD,
                changeFrequency: path === '' ? 'daily' : 'monthly',
                priority: path === '' ? 1.0 : 0.5
            });
        });

        // Add individual guide/ratgeber articles
        const articles = getArticles(locale);
        articles.forEach(article => {
            const canonicalPath = getCanonicalPath(locale, 'ratgeber', article.slug);
            urls.push({
                url: `${SITE_URL}${canonicalPath}`,
                lastModified: STATIC_LASTMOD,
                changeFrequency: 'monthly',
                priority: 0.6
            });
        });
    });

    return urls;
}

export function getSEOSitemapUrls() {
    const urls: any[] = [];
    
    indexableLocales.forEach(locale => {
        Object.values(CANONICAL_QUERIES).forEach((def) => {
            if (def.isIndexable && def.intentType !== 'Informational') {
                const internalIntent = CALC_MODE_TO_INTENT[def.calcMode] || 'differenz';
                const locSlug = translateSlug(def.canonicalSlug, locale);
                const canonicalPath = getCanonicalPath(locale, internalIntent, locSlug);
                
                urls.push({
                    url: `${SITE_URL}${canonicalPath}`,
                    lastModified: STATIC_LASTMOD,
                    changeFrequency: 'weekly',
                    priority: 0.8
                });
            }
        });
    });

    return urls;
}

export function getEventsSitemapUrls() {
    const urls: any[] = [];
    
    indexableLocales.forEach(locale => {
        Object.values(CANONICAL_QUERIES).forEach((def) => {
            if (def.isIndexable && (def.priority === 'High' || def.priority === 'Medium') && def.intentType === 'Informational') {
                 const internalIntent = CALC_MODE_TO_INTENT[def.calcMode] || 'differenz';
                 const locSlug = translateSlug(def.canonicalSlug, locale);
                 const canonicalPath = getCanonicalPath(locale, internalIntent, locSlug);
                 
                 urls.push({
                    url: `${SITE_URL}${canonicalPath}`,
                    lastModified: STATIC_LASTMOD,
                    changeFrequency: 'monthly',
                    priority: 0.9
                });
            }
        });
    });
    
    return urls;
}
