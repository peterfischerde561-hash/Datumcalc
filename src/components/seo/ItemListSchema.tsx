import { canonicalUrl } from '@/lib/seo/metadata';

/**
 * The ordered set of entries a hub page links to.
 *
 * /ratgeber listed eight guides and said nothing about them in markup — it was
 * also the only second-level page with no BreadcrumbList, while /wie-wir-rechnen
 * one level down had one. An ItemList states what a collection page is for:
 * these specific URLs, in this order, are what this page indexes.
 *
 * URLs go through `canonicalUrl` for the same reason breadcrumbs do — a hub must
 * not advertise a variant its own canonical does not use.
 */
export function ItemListSchema({
    name,
    items
}: {
    name: string;
    items: { name: string; url: string }[];
}) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name,
        numberOfItems: items.length,
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        itemListElement: items.map((entry, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: entry.name,
            url: entry.url.startsWith('http')
                ? entry.url
                : canonicalUrl(entry.url)
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
