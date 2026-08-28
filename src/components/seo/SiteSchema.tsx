import { organizationNode, webSiteNode } from '@/lib/seo/schema';

/**
 * The two nodes that are true on every page: who publishes this site, and that
 * the site exists. Rendered from the layout, which is what lets every other
 * block on the page reference `@id` instead of restating the organisation.
 *
 * Emitted as a single `@graph` rather than two sibling blocks. Consumers merge
 * them either way; one block makes the relationship between them (WebSite
 * publisher → Organization) visible in the source.
 */
export function SiteSchema({ locale }: { locale: string }) {
    const graph = {
        '@context': 'https://schema.org',
        '@graph': [organizationNode(), webSiteNode(locale)]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
        />
    );
}
