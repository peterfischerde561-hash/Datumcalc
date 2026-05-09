import { getArticleBySlug, articles, getArticles } from '@/lib/articles';
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
export const dynamicParams = false; 

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

    if (!article) return {};

    const languages: Record<string, string> = {};
    locales.forEach(loc => {
        const locPath = `/ratgeber/${slug}`;
        languages[loc] = `${siteUrl}${loc === 'de' ? '' : `/${loc}`}${locPath}`;
    });

    return {
        title: article.title,
        description: article.description,
        alternates: {
            canonical: `${siteUrl}${locale === 'de' ? '' : `/${locale}`}/ratgeber/${slug}`,
            languages
        }
    };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
    const { locale, slug } = await params;
    setRequestLocale(locale);
    const article = getArticleBySlug(slug, locale);

    if (!article) {
        notFound();
    }

    const correctPath = `/ratgeber/${slug}`;
    const t = await getTranslations({ locale, namespace: 'Article' });
    const fullUrl = `${SITE_URL}${correctPath}`;
    const isDe = locale === 'de';

    // Breadcrumbs
    const breadcrumbItems = [
        { name: isDe ? 'Startseite' : 'Home', item: `/${locale === 'de' ? '' : locale}` },
        { name: isDe ? 'Ratgeber' : 'Guides', item: `/${locale}/ratgeber` },
        { name: article.title, item: correctPath }
    ];

    return (
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <BreadcrumbSchema items={breadcrumbItems} />
            <ArticleSchema 
                title={article.title} 
                description={article.description} 
                url={fullUrl} 
                publishedAt="2024-03-24T00:00:00Z" 
            />
            
            <article className="w-full max-w-4xl mx-auto lg:py-24">
            
            <header className="mb-12 space-y-8 text-center animate-slide-up-fade">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/10 border border-neon/20 text-xs font-bold tracking-widest uppercase text-neon">
                    {article.publishedAt} • {article.readTime} {t('readTime')}
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                    {article.title}
                </h1>
                
                <p className="text-xl md:text-2xl text-white/50 max-w-3xl mx-auto font-medium leading-relaxed">
                    {article.description}
                </p>

                <div className="flex items-center justify-center gap-4 pt-4">
                    <div className="w-12 h-12 rounded-full border-2 border-neon/30 p-0.5">
                        <img 
                            src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" 
                            alt="Felix Schmidt" 
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                    <div className="text-left">
                        <div className="text-white font-bold">Felix Schmidt</div>
                        <div className="text-white/40 text-sm tracking-wide uppercase font-bold text-[10px]">{t('author')}</div>
                    </div>
                </div>
            </header>

            {/* Key Takeaways */}
            <section className="mb-16 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 animate-slide-up-fade" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-neon/20 flex items-center justify-center text-neon text-sm">✓</span>
                    {t('keyTakeaways')}
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white/70">
                     <li>{t('takeawaysItem1')}</li>
                     <li>{t('takeawaysItem2')}</li>
                     <li>{t('takeawaysItem3')}</li>
                </ul>
            </section>

            {/* Main Article Content */}
            <div
                className="prose prose-invert prose-lg md:prose-xl max-w-none prose-h2:text-4xl prose-h2:tracking-tight prose-h2:mb-8 prose-h2:mt-16 prose-h2:text-white prose-a:text-neon hover:prose-a:text-neon-blue prose-p:text-white/70 prose-li:text-white/70 animate-slide-up-fade"
                style={{ animationDelay: '0.2s' }}
                dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* In-Article Calculator CTA */}
            <section aria-label="Ausprobieren" className="mt-24 bg-[#0a0a0a]/50 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <h3 className="text-center text-neon-blue font-bold uppercase tracking-widest text-sm mb-4">{t('theory')}</h3>
                <h4 className="text-3xl md:text-4xl font-extrabold text-center mb-10 tracking-tight">{t('practice')}</h4>
                <div className="max-w-4xl mx-auto">
                    <CalculatorCore />
                </div>
            </section>
        </article>
        </main>
    );
}
