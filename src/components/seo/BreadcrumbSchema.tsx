import { SITE_URL } from '@/lib/constants';
import { canonicalUrl } from '@/lib/seo/metadata';

interface BreadcrumbItem {
    name: string;
    /** Absolute URL or root-relative path; both are normalized. */
    item: string;
}

/**
 * BreadcrumbList markup.
 *
 * Every URL is normalized through `canonicalUrl`, so a breadcrumb can never
 * advertise a variant the canonical does not use. Callers previously passed a
 * mix of absolute URLs and root-relative paths, and the homepage entry came out
 * as SITE_URL + "/" while the homepage canonical carries no trailing slash —
 * the schema and the canonical disagreed on the same page.
 *
 * Visible breadcrumbs must use the same labels these items carry; both take
 * them from src/lib/seo/routeLabels.ts.
 */
export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((entry, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: entry.name,
            item: entry.item.startsWith('http')
                ? canonicalUrl(entry.item.replace(SITE_URL, '') || '/')
                : canonicalUrl(entry.item)
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
