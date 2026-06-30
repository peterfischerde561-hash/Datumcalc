import { getArticleBySlug, articles, getArticles, getLocalizedArticleSlug } from '@/lib/articles';
import { notFound, redirect, permanentRedirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CalculatorCore } from '@/components/calculator/CalculatorCore';
import { locales } from '@/i18n/routing';
import { SITE_URL } from '@/lib/constants';
import { ArticleSchema } from '@/components/seo/ArticleSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { INTENT_TRANSLATIONS, getCanonicalPath } from '@/lib/seo/translations';

export const dynamic = 'force-static';
export const revalidate = false; 
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
        return {};
    }

    const languages: Record<string, string> = {};
    locales.forEach(loc => {
        const locSlug = getLocalizedArticleSlug(slug, locale, loc);
        languages[loc] = `${siteUrl}${getCanonicalPath(loc, 'ratgeber', locSlug)}`;
    });
    const deSlug = getLocalizedArticleSlug(slug, locale, 'de');
    languages['x-default'] = `${siteUrl}${getCanonicalPath('de', 'ratgeber', deSlug)}`;

    return {
        title: article.title,
        description: article.description,
        alternates: {
            canonical: `${siteUrl}${getCanonicalPath(locale, 'ratgeber', slug)}`,
            languages
        }
    };
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

    // Breadcrumbs
    const breadcrumbItems = [
        { name: isDe ? 'Startseite' : 'Home', item: `${SITE_URL}${locale === 'de' ? '/' : `/${locale}`}` },
        { name: isDe ? 'Ratgeber' : 'Guides', item: `${SITE_URL}${parentPath}` },
        { name: article.title, item: `${SITE_URL}${correctPath}` }
    ];

    return (
        <main className="flex-1 w-full bg-white text-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <BreadcrumbSchema items={breadcrumbItems} />
            <ArticleSchema
                title={article.title}
                description={article.description}
                url={fullUrl}
                publishedAt="2024-03-24T00:00:00Z"
            />

            <article className="w-full max-w-3xl mx-auto">

            <header className="mb-12 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-xs font-bold tracking-widest uppercase text-blue-700">
                    {article.publishedAt} • {article.readTime} {t('readTime')}
                </div>

                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-slate-900">
                    {article.title}
                </h1>

                <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed">
                    {article.description}
                </p>

                <div className="flex items-center gap-4 pt-6 border-t border-slate-200">
                    <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-lg shrink-0">
                        FS
                    </div>
                    <div className="text-left">
                        <div className="text-slate-900 font-bold">Felix Schmidt</div>
                        <div className="text-slate-500 text-[10px] tracking-wide uppercase font-bold">{t('authorTitle')}</div>
                    </div>
                </div>
            </header>

            {/* Key Takeaways */}
            <section className="mb-16 bg-blue-50 border border-blue-200 rounded-xl p-8 md:p-10">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-slate-900">
                    <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 text-sm">✓</span>
                    {t('takeaways')}
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-700">
                     <li>{t('takeawaysItem1')}</li>
                     <li>{t('takeawaysItem2')}</li>
                     <li>{t('takeawaysItem3')}</li>
                </ul>
            </section>

            {/* Main Article Content */}
            <div
                className="prose prose-lg md:prose-xl max-w-none prose-headings:text-slate-900 prose-h2:text-4xl prose-h2:tracking-tight prose-h2:mb-8 prose-h2:mt-16 prose-a:text-blue-700 hover:prose-a:text-blue-800 prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900"
                dangerouslySetInnerHTML={{ __html: article.content }}
            />

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
