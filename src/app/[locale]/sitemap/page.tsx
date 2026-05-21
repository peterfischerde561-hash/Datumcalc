import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/routing';
import { SITE_URL, DOMAIN } from '@/lib/constants';
import { INTENT_TRANSLATIONS, translateSlug, getCanonicalPath } from '@/lib/seo/translations';
import { CANONICAL_QUERIES } from '@/lib/seo/queryModel';
import { getArticles } from '@/lib/articles';
import { Link } from '@/i18n/routing';

export const revalidate = 86400; // 24 hours
export const dynamic = 'force-static';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'Common.titles' });
    const siteUrl = SITE_URL;
    const fullUrl = `${siteUrl}${getCanonicalPath(locale, 'sitemap')}`;

    // Build hreflang alternates
    const languages: Record<string, string> = {};
    locales.forEach(loc => {
        languages[loc] = `${siteUrl}${getCanonicalPath(loc, 'sitemap')}`;
    });
    languages['x-default'] = `${siteUrl}${getCanonicalPath('de', 'sitemap')}`;

    return {
        title: locale === 'de' ? 'Sitemap – Alle Seiten' : 'Sitemap',
        description: locale === 'de'
            ? `Inhaltsverzeichnis und Übersicht aller Tools, Ratgeber und rechtlichen Informationen von ${DOMAIN}. Finden Sie schnell den passenden Datumsrechner.`
            : `Sitemap of all calculators, expert guides, and legal information on ${DOMAIN}. Find the perfect date difference or business day tool instantly.`,
        alternates: {
            canonical: fullUrl,
            languages
        },
        openGraph: {
            title: `${t('sitemap')} - Datumsrechner`,
            url: fullUrl,
            type: 'website',
            locale: locale,
        }
    };
}

export default async function SitemapPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'Common.titles' });
    const tNav = await getTranslations({ locale, namespace: 'Header.Nav' });
    const tSitemap = await getTranslations({ locale, namespace: 'Sitemap' });
    const isDe = locale === 'de';

    const calculatorIntents = [
        { id: 'addieren', icon: '➕' },
        { id: 'differenz', icon: '📅' },
        { id: 'arbeitstage', icon: '💼' },
        { id: 'alter', icon: '🎂' }
    ] as const;

    const legalRoutes = ['ueber-uns', 'agb', 'datenschutz', 'impressum'] as const;

    return (
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <header className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-white">
                    {t('sitemap')}
                </h1>
                <p className="text-xl text-white/60">
                    {tSitemap('subtitle')}
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {/* 1. Calculator Categories & Tools */}
                <section className="space-y-8">
                    <h2 className="text-2xl font-bold border-b border-white/10 pb-4 mb-6 flex items-center gap-3 text-white">
                        <span className="text-neon">01.</span> {tSitemap('calculators')}
                    </h2>
                    {calculatorIntents.map(intent => {
                        const internalIntent = intent.id;
                        
                        const intentToMode: Record<string, string> = {
                            addieren: 'add_subtract',
                            differenz: 'difference',
                            arbeitstage: 'business_days',
                            alter: 'age'
                        };
                        const expectedMode = intentToMode[internalIntent];

                        const queries = Object.values(CANONICAL_QUERIES).filter((def) => 
                            def.calcMode === expectedMode
                        );

                        return (
                            <div key={intent.id} className="space-y-4">
                                <Link href={(`/${internalIntent}` as any)} className="text-lg font-bold hover:text-neon flex items-center gap-2 text-white">
                                    <span>{intent.icon}</span>
                                    <span className="capitalize">{tNav(internalIntent)}</span>
                                </Link>
                                <ul className="pl-8 space-y-2 border-l border-white/5">
                                    {queries.slice(0, 10).map((def) => (
                                        <li key={def.canonicalSlug}>
                                            <Link 
                                                href={{
                                                    pathname: (`/${internalIntent}/[...slug]` as any),
                                                    params: { slug: [translateSlug(def.canonicalSlug, locale)] }
                                                }}
                                                className="text-white/50 hover:text-white transition-colors text-sm"
                                            >
                                                {translateSlug(def.canonicalSlug, locale).replace(/-/g, ' ')}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </section>

                {/* 2. Guides & Articles */}
                <section className="space-y-8">
                    <h2 className="text-2xl font-bold border-b border-white/10 pb-4 mb-6 flex items-center gap-3 text-white">
                        <span className="text-neon">02.</span> {tNav('ratgeber')}
                    </h2>
                    <ul className="space-y-4">
                        {getArticles(locale).map(article => (
                            <li key={article.slug}>
                                <Link 
                                    href={{
                                        pathname: '/ratgeber/[slug]',
                                        params: { slug: article.slug }
                                    }}
                                    className="block p-4 rounded-xl bg-white/5 border border-white/10 hover:border-neon/30 transition-all"
                                >
                                    <h3 className="font-bold text-white mb-1">{article.title}</h3>
                                    <p className="text-xs text-white/40 line-clamp-2">{article.description}</p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* 3. Numeric Variations Directory */}
                <section className="space-y-8 lg:col-span-3">
                    <h2 className="text-2xl font-bold border-b border-white/10 pb-4 mb-6 flex items-center gap-3 text-white">
                        <span className="text-neon">03.</span> {tSitemap('commonSpans')}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {[30, 45, 60, 90, 100, 120, 150, 180, 200, 365, 500, 730, 1000].map(days => {
                            let canonicalSlug = `${days}-tage-ab-heute`;
                            if (days === 180) {
                                canonicalSlug = '6-monate-ab-heute';
                            } else if (days === 365) {
                                canonicalSlug = '1-jahr-ab-heute';
                            }
                            const locSlug = translateSlug(canonicalSlug, locale);
                            return (
                                <Link 
                                    key={days}
                                    href={{
                                        pathname: '/addieren/[...slug]',
                                        params: { slug: [locSlug] }
                                    }}
                                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 hover:border-neon/30 text-xs text-center text-white/50 hover:text-white transition-all capitalize"
                                >
                                    {locSlug.replace(/-/g, ' ')}
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* 4. Legal */}
                <section className="space-y-8">
                    <h2 className="text-2xl font-bold border-b border-white/10 pb-4 mb-6 flex items-center gap-3 text-white">
                        <span className="text-neon">04.</span> {tSitemap('legal')}
                    </h2>
                    <ul className="space-y-3">
                        {legalRoutes.map(route => {
                            const keyMap: Record<string, any> = {
                                'ueber-uns': 'about',
                                'agb': 'terms',
                                'datenschutz': 'privacy',
                                'impressum': 'imprint'
                            };
                            return (
                            <li key={route}>
                                <Link 
                                    href={(`/${route}` as any)} 
                                    className="text-white/60 hover:text-neon flex items-center justify-between group py-2"
                                >
                                    <span className="capitalize">{t(keyMap[route])}</span>
                                    <div className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-neon transition-colors"></div>
                                </Link>
                            </li>
                            );
                        })}
                    </ul>

                    <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-neon/10 to-transparent border border-neon/20">
                        <h3 className="font-bold text-white mb-2 italic">
                            {isDe ? 'ISO 8601 zertifiziert' : 'ISO 8601 Certified'}
                        </h3>
                        <p className="text-xs text-white/50 leading-relaxed">
                            {isDe 
                                ? 'Alle Berechnungen auf dieser Website unterliegen strikten mathematischen Kontrollen und halten den internationalen Standard für Datums- und Zeitangaben ein.'
                                : 'All calculations on this website are subject to strict mathematical controls and comply with the international standard for date and time specifications.'}
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
