import { SITE_URL } from '@/lib/constants';

/**
 * Article markup for the editorial guides.
 *
 * No `author` node. The previous version defaulted to a Person named "Felix
 * Schmidt" — a byline with no author page, no bio and no sameAs, carrying two
 * different job titles across two pages. Marking that up converts a soft
 * fabrication into an explicit machine-readable claim, so authorship is
 * attributed to the publishing organisation until there is a real person to
 * name.
 *
 * No `datePublished` either. Every guide previously declared 2024-03-24, a
 * date predating the site's own copyright year. A wrong date is worse than an
 * absent one: `datePublished` is optional, and a fabricated one is a claim.
 */
interface ArticleSchemaProps {
    title: string;
    description: string;
    url: string;
    locale: string;
}

export function ArticleSchema({ title, description, url, locale }: ArticleSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description,
        author: {
            '@type': 'Organization',
            name: 'Datumsrechner',
            url: SITE_URL
        },
        publisher: {
            '@type': 'Organization',
            name: 'Datumsrechner',
            logo: {
                '@type': 'ImageObject',
                url: `${SITE_URL}/logo.png`
            }
        },
        inLanguage: locale,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': url
        },
        image: `${SITE_URL}/og-image.png`
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
