import { webApplicationNode } from '@/lib/seo/schema';

/**
 * Declares the calculator. Rendered by the calculator routes only.
 *
 * This used to come from the layout, which put it on all 21 routes: /impressum
 * declared itself a CalculatorApplication with a featureList and an offers
 * block, as did /datenschutz, /agb, /sitemap and the guides. The legal pages
 * are not the application.
 *
 * The route pages already carried a comment saying "no per-page WebApplication
 * node, the layout declares it" — correct about not wanting one node per URL,
 * but the layout's answer was to put it on every page instead of the right
 * ones. The `@id` keeps that guarantee: every calculator route emits the same
 * identified node, so it stays one entity no matter how many pages carry it.
 *
 * Not emitted on /ueber-uns, which embeds a CalculatorCore as a demonstration.
 * The page is about the project; the calculator is an illustration on it.
 */
export function WebApplicationSchema({ locale }: { locale: string }) {
    const schema = {
        '@context': 'https://schema.org',
        ...webApplicationNode(locale)
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
