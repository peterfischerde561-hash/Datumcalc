import { getArticleBySlug, articles, getArticles, getLocalizedArticleSlug, readingTimeMinutes } from '@/lib/articles';
import { notFound, redirect, permanentRedirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CalculatorCore } from '@/components/calculator/CalculatorCore';
import { locales } from '@/i18n/routing';
import { SITE_URL } from '@/lib/constants';
import { ArticleSchema } from '@/components/seo/ArticleSchema';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { INTENT_TRANSLATIONS, getCanonicalPath } from '@/lib/seo/translations';
import { buildPageMetadata, canonicalUrl } from '@/lib/seo/metadata';
import { directAnswerFor } from '@/lib/seo/guideFacts';
import { GuideFacts } from '@/components/seo/GuideFacts';

export const dynamic = 'force-static';
// These guides now open with an answer computed from today's date (the next
// leap year, this year's week count), so they are date-dependent and must not
// freeze at build time. Hourly ISR bounds the staleness; the daily cron
// refreshes them at the Europe/Berlin date boundary.
export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
    return locales.flatMap(locale => {
        const localeArticles = getArticles(locale);
        return localeArticles.map(a => ({ 
            locale,
            slug: a.slug 
        }));
    });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }) {
    const { locale, slug } = await params;
    setRequestLocale(locale);
    const article = getArticleBySlug(slug, locale);
    const siteUrl = SITE_URL;

    /*
     * No redirect here — the page component owns it.
     *
     * This block used to call permanentRedirect() while the page body did the
     * same for the same request, so both could fire and Next emitted two
     * Location headers. The joined value is not a valid URL, and Search Console
     * reports it as "Redirect error". Returning empty metadata is correct: the
     * page redirects, so nothing renders and no metadata is used.
     */
    if (!article) {
        return {};
    }

    return buildPageMetadata({
        locale,
        title: article.title,
        description: article.description,
        path: getCanonicalPath(locale, 'ratgeber', slug),
        pathForLocale: (loc) =>
            getCanonicalPath(loc, 'ratgeber', getLocalizedArticleSlug(slug, locale, loc)),
        // Editorial content, unlike the calculator pages.
        type: 'article'
    });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
    const { locale, slug } = await params;
    setRequestLocale(locale);
    const article = getArticleBySlug(slug, locale);

    if (!article) {
        for (const loc of locales) {
            if (loc !== locale) {
                const altArticle = getArticleBySlug(slug, loc);
                if (altArticle) {
                    const locSlug = getLocalizedArticleSlug(slug, loc, locale);
                    const targetPath = getCanonicalPath(locale, 'ratgeber', locSlug);
                    permanentRedirect(targetPath);
                }
            }
        }
        notFound();
    }

    const correctPath = getCanonicalPath(locale, 'ratgeber', slug);
    const parentPath = getCanonicalPath(locale, 'ratgeber');
    const t = await getTranslations({ locale, namespace: 'Article' });
    const fullUrl = `${SITE_URL}${correctPath}`;
    const isDe = locale === 'de';
    const directAnswer = directAnswerFor(slug, locale);

    // Breadcrumbs
    const breadcrumbItems = [
        { name: isDe ? 'Startseite' : 'Home', item: canonicalUrl(locale === 'de' ? '/' : `/${locale}`) },
        { name: isDe ? 'Ratgeber' : 'Guides', item: `${SITE_URL}${parentPath}` },
        { name: article.title, item: `${SITE_URL}${correctPath}` }
    ];

    return (
        <main className="flex-1 w-full bg-white text-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <Breadcrumbs items={breadcrumbItems} className="mb-8" />
            <ArticleSchema
                title={article.title}
                description={article.description}
                url={fullUrl}
                locale={locale}
                datePublished={article.datePublished}
                dateModified={article.dateModified}
            />

            <article className="w-full max-w-3xl mx-auto">

            <header className="mb-12 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-xs font-bold tracking-widest uppercase text-blue-700">
                    {readingTimeMinutes(article.content)} min {t('readTime')}
                </div>

                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-slate-900">
                    {article.title}
                </h1>

                <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed">
                    {article.description}
                </p>

                {/*
                  A byline for "Felix Schmidt" sat here — a name that appeared
                  nowhere else as a real entity, carried two conflicting job
                  titles across two pages, and was attached to dates predating
                  the site. Removed rather than restyled; the operator decided
                  against bylines instead of inventing a person to hold them.
                */}
            </header>

            {/*
              Direct answer, above the article body.
              The queries these guides rank for are time-relative ("wann ist das
              nächste Schaltjahr"), so the answer is computed from today's date
              rather than written — see guideFacts.ts. Guides whose subject does
              not move with the calendar render nothing here rather than
              manufacturing a hook.
            */}
            {directAnswer && (
                <section
                    aria-label={isDe ? 'Kurze Antwort' : 'Quick answer'}
                    className="mb-12 rounded-xl border border-slate-200 bg-white p-6 md:p-8"
                >
                    {/*
                      Only re-ask the question when the H1 is not already asking
                      it. Since the titles were aligned to search intent, most
                      guide H1s *are* the question, and repeating it verbatim as
                      an H2 gave the page two identical headings in a row.
                    */}
                    {directAnswer.question !== article.title && (
                        <h2 className="text-xl font-bold text-slate-900 mb-3">{directAnswer.question}</h2>
                    )}
                    <p className="text-lg text-slate-700 leading-relaxed">{directAnswer.answer}</p>
                </section>
            )}

            {/* Key Takeaways */}
            <section className="mb-16 bg-blue-50 border border-blue-200 rounded-xl p-8 md:p-10">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-slate-900">
                    {/* Decorative: it was being read as part of the heading text. */}
                    <span aria-hidden="true" className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 text-sm">✓</span>
                    {t('takeaways')}
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-700">
                    {article.takeaways.map((point) => (
                        <li key={point}>{point}</li>
                    ))}
                </ul>
            </section>

            {/* Main Article Content */}
            <div
                className="prose prose-lg md:prose-xl max-w-none prose-headings:text-slate-900 prose-h2:text-4xl prose-h2:tracking-tight prose-h2:mb-8 prose-h2:mt-16 prose-a:text-blue-700 hover:prose-a:text-blue-800 prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900"
                dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/*
              Computed sections, after the rule the body explains. The article
              carries what does not change; this carries the years, which do.
            */}
            <GuideFacts slug={slug} locale={locale} />

            {/* In-Article Calculator CTA */}
            <section aria-label="Ausprobieren" className="mt-20 bg-white rounded-xl p-6 md:p-10 border border-slate-200 shadow-sm">
                <h3 className="text-center text-blue-700 font-bold uppercase tracking-widest text-sm mb-4">{t('theory')}</h3>
                <h4 className="text-3xl md:text-4xl font-extrabold text-center mb-10 tracking-tight text-slate-900">{t('practice')}</h4>
                <div className="max-w-4xl mx-auto">
                    <CalculatorCore />
                </div>
            </section>
        </article>
          </div>
        </main>
    );
}
