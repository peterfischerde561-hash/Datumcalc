import { SITE_URL } from '@/lib/constants';
import { organizationRef, webSiteId } from '@/lib/seo/schema';

/**
 * Article markup for the editorial guides.
 *
 * No `Person` author. The previous version defaulted to a Person named "Felix
 * Schmidt" — a byline with no author page, no bio and no sameAs, carrying two
 * different job titles across two pages. Marking that up converts a soft
 * fabrication into an explicit machine-readable claim, so authorship is
 * attributed to the publishing organisation until there is a real person to
 * name.
 *
 * `author` and `publisher` are now references to the Organization node the
 * layout renders, not inline copies. The inline versions had drifted into two
 * different partial descriptions of the same company: `author` carried a url
 * and no logo, `publisher` a logo and no url.
 *
 * Dates are real. Every guide previously declared datePublished 2024-03-24 —
 * for the oldest two that is the right day and month and the wrong year, and
 * for the other six it predates the article entirely. The dates were removed
 * rather than left false; they return here derived from the commits that
 * actually introduced and last changed each article's content, and
 * `scripts/article-dates.mjs --check` fails the build when they drift.
 */
interface ArticleSchemaProps {
    title: string;
    description: string;
    url: string;
    locale: string;
    /** ISO date (YYYY-MM-DD) of the commit that introduced this article. */
    datePublished: string;
    /** ISO date of the last commit that changed this article's content. */
    dateModified: string;
}

export function ArticleSchema({
    title,
    description,
    url,
    locale,
    datePublished,
    dateModified
}: ArticleSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: title,
        description,
        author: organizationRef,
        publisher: organizationRef,
        isPartOf: { '@id': webSiteId(locale) },
        inLanguage: locale === 'de' ? 'de-DE' : 'en',
        datePublished,
        dateModified,
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
