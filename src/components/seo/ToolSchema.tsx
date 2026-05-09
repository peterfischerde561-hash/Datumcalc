import { SITE_URL } from "@/lib/constants";

interface ToolSchemaProps {
    name: string;
    description: string;
    url: string;
    category?: string;
}

export function ToolSchema({ name, description, url, category = "CalculatorApplication" }: ToolSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": name,
        "description": description,
        "url": url,
        "applicationCategory": category,
        "operatingSystem": "All",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "EUR"
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

interface FAQItem {
    question: string;
    answer: string;
}

export function FAQSchema({ items }: { items: FAQItem[] }) {
    if (!items.length) return null;
    
    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": items.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
