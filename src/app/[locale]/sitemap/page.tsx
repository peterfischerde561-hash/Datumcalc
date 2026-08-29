import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/routing';
import { SITE_URL, DOMAIN } from '@/lib/constants';
import { INTENT_TRANSLATIONS, translateSlug, getCanonicalPath } from '@/lib/seo/translations';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { PlusSquare, SplitSquareHorizontal, Briefcase, User } from 'lucide-react';
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

    return buildPageMetadata({
        locale,
        title: locale === 'de' ? 'Sitemap – Alle Seiten' : 'Sitemap',
        description: locale === 'de'
            ? `Inhaltsverzeichnis und Übersicht aller Tools, Ratgeber und rechtlichen Informationen von ${DOMAIN}. Finden Sie schnell den passenden Datumsrechner.`
            : `Sitemap of all calculators, expert guides, and legal information on ${DOMAIN}. Find the perfect date difference or business day tool instantly.`,
        path: getCanonicalPath(locale, 'sitemap'),
        pathForLocale: (loc) => getCanonicalPath(loc, 'sitemap')
    });
}

export default async function SitemapPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'Common.titles' });
    const tNav = await getTranslations({ locale, namespace: 'Header.Nav' });
    const tSitemap = await getTranslations({ locale, namespace: 'Sitemap' });
    const isDe = locale === 'de';

    /*
     * Icons, not emoji. The four intents were marked with a plus sign, a
     * calendar, a briefcase and a birthday cake as literal characters, which
     * render in the reader's system emoji font at a size and colour nothing on
     * the page controls, and are announced by screen readers as their Unicode
     * names. These are the same lucide icons the nav and tool cards already
     * use, so one URL now carries one mark everywhere.
     */
    const calculatorIntents = [
        { id: 'addieren', Icon: PlusSquare },
        { id: 'differenz', Icon: SplitSquareHorizontal },
        { id: 'arbeitstage', Icon: Briefcase },
        { id: 'alter', Icon: User }
    ] as const;

    const legalRoutes = ['ueber-uns', 'agb', 'datenschutz', 'impressum'] as const;

    return (
        <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

            <Breadcrumbs

                className="mb-8"

                items={[

                    { name: locale === 'de' ? 'Startseite' : 'Home', item: locale === 'de' ? '/' : `/${locale}` },

                    { name: t('sitemap'), item: getCanonicalPath(locale, 'sitemap') }

                ]}

            />
            <header className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-ink">
                    {t('sitemap')}
                </h1>
                <p className="text-xl text-ink-2">
                    {tSitemap('subtitle')}
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {/* 1. Calculator Categories & Tools */}
                <section className="space-y-8">
                    <h2 className="text-2xl font-bold border-b border-line pb-4 mb-6 flex items-center gap-3 text-ink">
                        <span className="text-accent">01.</span> {tSitemap('calculators')}
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

                        // Indexable only, and from the same source as section 03
                        // below — the two sections previously disagreed about
                        // which pages exist, on the same page.
                        const queries = Object.values(CANONICAL_QUERIES).filter(
                            (def) => def.calcMode === expectedMode && def.isIndexable
                        );

                        return (
                            <div key={intent.id} className="space-y-4">
                                <Link href={(`/${internalIntent}` as any)} className="text-lg font-bold hover:text-accent flex items-center gap-2 text-ink">
                                    <intent.Icon className="w-5 h-5 text-accent shrink-0" aria-hidden="true" />
                                    <span className="capitalize">{tNav(internalIntent)}</span>
                                </Link>
                                <ul className="pl-8 space-y-2 border-l border-line">
                                    {queries.slice(0, 10).map((def) => (
                                        <li key={def.canonicalSlug}>
                                            <Link
                                                href={{
                                                    pathname: (`/${internalIntent}/[...slug]` as any),
                                                    params: { slug: [translateSlug(def.canonicalSlug, locale)] }
                                                }}
                                                className="text-ink-2 hover:text-accent transition-colors text-sm"
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
                    <h2 className="text-2xl font-bold border-b border-line pb-4 mb-6 flex items-center gap-3 text-ink">
                        <span className="text-accent">02.</span> {tNav('ratgeber')}
                    </h2>
                    <ul className="space-y-4">
                        {getArticles(locale).map(article => (
                            <li key={article.slug}>
                                <Link 
                                    href={{
                                        pathname: '/ratgeber/[slug]',
                                        params: { slug: article.slug }
                                    }}
                                    className="block p-4 rounded-xl bg-surface border border-line hover:border-accent hover:shadow-sm transition-all"
                                >
                                    <h3 className="font-bold text-ink mb-1">{article.title}</h3>
                                    <p className="text-xs text-ink-3 line-clamp-2">{article.description}</p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* 3. Numeric Variations Directory */}
                <section className="space-y-8 lg:col-span-3">
                    <h2 className="text-2xl font-bold border-b border-line pb-4 mb-6 flex items-center gap-3 text-ink">
                        <span className="text-accent">03.</span> {tSitemap('commonSpans')}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {/*
                          Derived from CANONICAL_QUERIES rather than a hardcoded
                          list. The previous array named days (180, 365) that had
                          to be mapped back to their canonical slugs by hand, and
                          it drifted out of step with section 01 above — two
                          arrays on one page disagreeing about the same URLs.
                        */}
                        {Object.values(CANONICAL_QUERIES)
                            .filter((def) => def.calcMode === 'add_subtract' && def.isIndexable)
                            .map((def) => {
                                const locSlug = translateSlug(def.canonicalSlug, locale);
                                return (
                                    <Link
                                        key={def.canonicalSlug}
                                        href={{
                                            pathname: '/addieren/[...slug]',
                                            params: { slug: [locSlug] }
                                        }}
                                        className="px-4 py-2 rounded-lg bg-surface border border-line hover:border-accent text-xs text-center text-ink-2 hover:text-accent transition-all capitalize"
                                    >
                                        {locSlug.replace(/-/g, ' ')}
                                    </Link>
                                );
                            })}
                    </div>
                </section>

                {/* 4. Legal */}
                <section className="space-y-8">
                    <h2 className="text-2xl font-bold border-b border-line pb-4 mb-6 flex items-center gap-3 text-ink">
                        <span className="text-accent">04.</span> {tSitemap('legal')}
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
                                    className="text-ink-2 hover:text-accent flex items-center justify-between group py-2"
                                >
                                    <span className="capitalize">{t(keyMap[route])}</span>
                                    <div className="w-1 h-1 rounded-full bg-line-2 group-hover:bg-accent transition-colors"></div>
                                </Link>
                            </li>
                            );
                        })}
                    </ul>

                    <div className="mt-12 p-6 rounded-2xl bg-accent-dim border border-accent-line">
                        <h3 className="font-bold text-ink mb-2 italic">
                            {isDe ? 'Kalenderwochen nach ISO 8601' : 'ISO 8601 calendar weeks'}
                        </h3>
                        <p className="text-xs text-ink-2 leading-relaxed">
                            {isDe 
                                ? 'Alle Berechnungen auf dieser Website unterliegen strikten mathematischen Kontrollen und halten den internationalen Standard für Datums- und Zeitangaben ein.'
                                : 'All calculations on this website are subject to strict mathematical controls and comply with the international standard for date and time specifications.'}
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
