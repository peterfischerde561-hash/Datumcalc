import { getArticles } from '@/lib/articles';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link, locales } from '@/i18n/routing';
import { SITE_URL } from '@/lib/constants';

export const revalidate = 86400; // 24 hours
export const dynamic = 'force-static';
import { INTENT_TRANSLATIONS, getCanonicalPath } from '@/lib/seo/translations';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const isDe = locale === 'de';
    const siteUrl = SITE_URL;
    
    // SEO Optimized Titles
    const title = isDe 
        ? "Ratgeber zur Datumsberechnung & Fristen" 
        : "Date Calculation Guides & Deadlines";
        
    const description = isDe
        ? "Ratgeber zur Datumsberechnung: Schaltjahre, Arbeitstage, ISO 8601 und Kalenderwochen verständlich erklärt."
        : "Expert guides on date calculation: leap years, business days, ISO 8601, and calendar weeks explained clearly.";

    const languages: Record<string, string> = {};
    locales.forEach(loc => {
        languages[loc] = `${siteUrl}${getCanonicalPath(loc, 'ratgeber')}`;
    });
    languages['x-default'] = `${siteUrl}${getCanonicalPath('de', 'ratgeber')}`;

    return {
        title,
        description,
        alternates: {
            canonical: `${siteUrl}${getCanonicalPath(locale, 'ratgeber')}`,
            languages
        }
    };
}

export default async function RatgeberIndexPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const articles = getArticles(locale);
    const isDe = locale === 'de';

    return (
        <main className="flex-1 w-full bg-white text-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="mb-12 space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                    {isDe ? 'Ratgeber & Guides' : 'Expert Guides & Tutorials'}
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl">
                    {isDe
                        ? 'Alles Wissenswerte rund um Datum, Zeit und Fristen – verständlich erklärt.'
                        : 'Everything you need to know about dates, time, and deadlines – explained clearly.'}
                </p>
            </div>

            <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((article) => (
                    <article key={article.slug} className="bg-white border border-slate-200 p-6 rounded-xl hover:border-blue-400 hover:shadow-sm transition-all group">
                        <Link href={{ pathname: '/ratgeber/[slug]', params: { slug: article.slug } }} className="block">
                            <h2 className="text-xl font-bold mb-4 text-slate-900 group-hover:text-blue-700 transition-colors">
                                {article.title}
                            </h2>
                            <p className="text-slate-600 mb-6 line-clamp-2">
                                {article.description}
                            </p>
                            <span className="text-blue-700 font-semibold flex items-center gap-2">
                                {isDe ? 'Artikel lesen' : 'Read Article'}
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </span>
                        </Link>
                    </article>
                ))}
            </div>
          </div>
        </main>
    );
}

export function generateStaticParams() {
    return locales.map(locale => ({ locale }));
}
