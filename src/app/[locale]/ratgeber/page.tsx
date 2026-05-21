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
        ? "Ratgeber Datumsberechnung – Fristen, Kalender & Zeitrechnung" 
        : "Date Calculation Guides – Deadlines, Calendars & Time spans";
        
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
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-16 space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    {isDe ? 'Ratgeber & Guides' : 'Expert Guides & Tutorials'}
                </h1>
                <p className="text-lg text-white/60 max-w-2xl mx-auto">
                    {isDe 
                        ? 'Alles Wissenswerte rund um Datum, Zeit und Fristen – verständlich erklärt.'
                        : 'Everything you need to know about dates, time, and deadlines – explained clearly.'}
                </p>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((article) => (
                    <article key={article.slug} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:border-neon/50 transition-colors group">
                        <Link href={{ pathname: '/ratgeber/[slug]', params: { slug: article.slug } }} className="block">
                            <h2 className="text-xl font-bold mb-4 group-hover:text-neon transition-colors">
                                {article.title}
                            </h2>
                            <p className="text-white/60 mb-6 line-clamp-2">
                                {article.description}
                            </p>
                            <span className="text-neon-blue font-semibold flex items-center gap-2">
                                {isDe ? 'Artikel lesen' : 'Read Article'}
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </span>
                        </Link>
                    </article>
                ))}
            </div>
        </main>
    );
}

export function generateStaticParams() {
    return locales.map(locale => ({ locale }));
}
