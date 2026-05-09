import { SITE_URL } from "@/lib/constants";

interface ArticleSchemaProps {
    title: string;
    description: string;
    url: string;
    publishedAt: string;
    authorName?: string;
}

export function ArticleSchema({ title, description, url, publishedAt, authorName = "Felix Schmidt" }: ArticleSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": description,
        "author": {
            "@type": "Person",
            "name": authorName,
            "url": `${SITE_URL}/ueber-uns`
        },
        "publisher": {
            "@type": "Organization",
            "name": "Datumsrechner",
            "logo": {
                "@type": "ImageObject",
                "url": `${SITE_URL}/logo.png`
            }
        },
        "datePublished": publishedAt,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": url
        },
        "image": `${SITE_URL}/og-image.png`
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
