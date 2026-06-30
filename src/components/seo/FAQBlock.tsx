import { generateDynamicFAQs } from '@/lib/seo/contentEngine';

export function FAQBlock({ intent, slug, locale }: { intent: string; slug: string; locale: string }) {
    const match = slug.match(/^(\d+)-/);
    const numValue = match ? parseInt(match[1]) : undefined;
    const faqs = generateDynamicFAQs(intent, slug, locale, numValue);

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <section className="bg-white border border-slate-200 rounded-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-8 text-slate-900">{locale === 'de' ? 'Häufig gestellte Fragen (FAQ)' : 'Frequently Asked Questions (FAQ)'}</h2>

            {/* Script for JSON-LD is manually injected safely */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="space-y-6">
                {faqs.map((faq, index) => (
                    <div key={index} className="space-y-2 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                        <h3 className="text-lg font-semibold text-slate-900">{faq.question}</h3>
                        <p className="text-slate-700 leading-relaxed">{faq.answer}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
