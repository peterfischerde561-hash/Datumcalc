import { CalculatorCore } from '@/components/calculator/CalculatorCore';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound, redirect, permanentRedirect } from 'next/navigation';
import NextLink from 'next/link';
import { ChevronRight } from 'lucide-react';
import { SEOContentBlock } from '@/components/seo/SEOContentBlock';
import { FAQBlock } from '@/components/seo/FAQBlock';
import { InternalLinksBlock } from '@/components/seo/InternalLinksBlock';
import { ConversionTools } from '@/components/seo/ConversionTools';
import { TrustSignals } from '@/components/seo/TrustSignals';
import { addDays, addMonths, addYears, differenceInDays, format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { resolveCanonicalQuery, CANONICAL_QUERIES } from '@/lib/seo/queryModel';
import { locales } from '@/i18n/routing';
import { SITE_URL } from '@/lib/constants';
import { INTENT_TRANSLATIONS, translateSlug, reverseTranslateSlug, getCanonicalPath } from '@/lib/seo/translations';

const dateLocales: Record<string, any> = { de, en: enUS };

const intentToModeMap: Record<string, string> = {
    'differenz': 'difference',
    'difference': 'difference',
    'addieren': 'add_subtract',
    'add': 'add_subtract',
    'arbeitstage': 'business_days',
    'business': 'business_days',
    'alter': 'age',
    'age': 'age'
};
export const revalidate = 86400; // 24 hours ISR revalidation
export const dynamicParams = true; // Allow on-demand rendering for long-tail SEO URLs

async function computeInstantResult(intent: string, slugStr: string, localeStr: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const loc = dateLocales[localeStr] || de;
    const tSlug = await getTranslations({ locale: localeStr, namespace: 'SlugPage' });
    const tEvents = await getTranslations({ locale: localeStr, namespace: 'Events' });
    const tCalc = await getTranslations({ locale: localeStr, namespace: 'Calculator' });

    try {
        if (intent === 'addieren' || intent === 'add') {
            const match = slugStr.match(/^(\d+)-(tage|monate|jahre)-ab-heute$/);
            if (match) {
                const amount = parseInt(match[1], 10);
                const unit = match[2];
                let resultDate;
                if (unit === 'tage') resultDate = addDays(today, amount);
                else if (unit === 'monate') resultDate = addMonths(today, amount);
                else if (unit === 'jahre') resultDate = addYears(today, amount);

                if (resultDate) {
                    const unitLabel = tCalc(unit === 'tage' ? 'days' : unit === 'monate' ? 'months' : 'years');
                    return {
                        headline: `${tSlug('in')} ${amount} ${unitLabel} ${tSlug('is')}`,
                        highlight: format(resultDate, 'EEEE, dd. MMMM yyyy', { locale: loc }),
                        subtext: `${tSlug('basedOn')} (${format(today, 'dd.MM.yyyy')})`,
                        dateValue: resultDate
                    };
                }
            }
        }

        if (intent === 'differenz' || intent === 'difference') {
            const match = slugStr.match(/^tage-bis-(.+)$/);
            if (match) {
                const eventStr = match[1].toLowerCase();
                let targetDate = new Date(today.getFullYear(), 0, 1);
                let eventName = '';
                let found = false;

                if (eventStr === 'weihnachten') {
                    targetDate = new Date(today.getFullYear(), 11, 25);
                    eventName = tEvents('weihnachten');
                    found = true;
                } else if (eventStr === 'silvester') {
                    targetDate = new Date(today.getFullYear(), 11, 31);
                    eventName = tEvents('silvester');
                    found = true;
                } else if (eventStr === 'sommeranfang') {
                    targetDate = new Date(today.getFullYear(), 5, 21);
                    eventName = tEvents('sommeranfang');
                    found = true;
                } else if (eventStr === 'ostern') {
                    const yr = today.getFullYear();
                    if (yr === 2024) targetDate = new Date(2024, 2, 31);
                    else if (yr === 2025) targetDate = new Date(2025, 3, 20);
                    else if (yr === 2026) targetDate = new Date(2026, 3, 5);
                    else targetDate = new Date(yr, 3, 10);
                    eventName = tEvents('ostern');
                    found = true;
                } else if (eventStr === 'neujahr') {
                    targetDate = new Date(today.getFullYear() + 1, 0, 1);
                    eventName = tEvents('neujahr');
                    found = true;
                } else if (eventStr === 'urlaub') {
                    // Fallback to a generic summer vacation start if not specified
                    targetDate = new Date(today.getFullYear(), 6, 1);
                    eventName = tEvents('urlaub');
                    found = true;
                }

                if (found) {
                    if (today > targetDate) {
                        targetDate.setFullYear(targetDate.getFullYear() + 1);
                    }
                    const diff = differenceInDays(targetDate, today);
                    return {
                        headline: `${tSlug('until')} ${eventName} ${tSlug('areYet')}`,
                        highlight: `${diff} ${tCalc('days')}`,
                        subtext: `${tSlug('theDateIs')} ${format(targetDate, 'dd. MMMM yyyy', { locale: loc })}`,
                        dateValue: targetDate
                    };
                }
            }
        }
    } catch (e) { }

    return null;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; intent: string; slug: string[] }> }) {
    const { locale, intent, slug } = await params;
    setRequestLocale(locale);
    const slugStr = slug.join('-');
    const siteUrl = SITE_URL;
    
    // Resolve internal intent across ALL locales (robust)
    let internalIntent = Object.keys(INTENT_TRANSLATIONS[locale]).find(k => INTENT_TRANSLATIONS[locale][k] === intent);
    if (!internalIntent) {
        for (const loc of locales) {
            internalIntent = Object.keys(INTENT_TRANSLATIONS[loc]).find(k => INTENT_TRANSLATIONS[loc][k] === intent);
            if (internalIntent) break;
        }
    }
    if (!internalIntent) return {}; // Let it 404 if truly unknown

    const canonicalSlugStr = reverseTranslateSlug(slugStr, locale);
    const { canonicalSlug, isExact, def } = resolveCanonicalQuery(canonicalSlugStr);
    
    // NORMALIZE: Ensure we always point to the strictly correct localized URL
    const correctSlug = translateSlug(canonicalSlug || canonicalSlugStr, locale);
    const correctPath = getCanonicalPath(locale, internalIntent, correctSlug);

    // STRICT ENFORCEMENT: Redirect only if the SLUG part is non-canonical.
    // next-intl middleware handles the localized intent segment (e.g. /add/ vs /addieren/)
    if (slugStr.toLowerCase() !== correctSlug.toLowerCase()) {
        permanentRedirect(correctPath); 
    }

    const correctUrl = `${SITE_URL}${correctPath}`;

    // Build hreflang alternates (prefix-aware)
    const languages: Record<string, string> = {};
    locales.forEach(loc => {
        const locSlug = translateSlug(canonicalSlug || canonicalSlugStr, loc);
        const locPath = getCanonicalPath(loc, internalIntent, locSlug);
        languages[loc] = `${SITE_URL}${locPath}`;
    });
    const deSlug = translateSlug(canonicalSlug || canonicalSlugStr, 'de');
    languages['x-default'] = `${SITE_URL}${getCanonicalPath('de', internalIntent, deSlug)}`;

    // SERP Domination formatting
    const isDe = locale === 'de';
    const displaySlug = correctSlug.replace(/-/g, ' ');
    const isAdd = internalIntent === 'addieren' || internalIntent === 'add';
    const isDiff = internalIntent === 'differenz' || internalIntent === 'difference';
    
    let title = isDe 
        ? `${displaySlug} → Exakte Berechnung online ✓`
        : `${displaySlug} → Exact calculation online ✓`;
    
    let description = isDe
        ? `Nutzen Sie den kostenlosen Datumsrechner für exakte Ergebnisse zu ${displaySlug}. ISO 8601 konform, präzise und sekundenschnell.`
        : `Use the free date calculator for exact results on ${displaySlug}. ISO 8601 compliant, precise and lightning fast.`;

    if (isAdd) {
        const match = (canonicalSlug || canonicalSlugStr).match(/^(\d+)-(tage|monate|jahre)-ab-heute$/);
        if (match) {
            const num = match[1];
            const unit = match[2];
            const displayUnit = unit === 'tage' ? 'Tage' : unit === 'monate' ? 'Monate' : 'Jahr';
            title = isDe 
                ? `${num} ${displayUnit} ab heute – Welches Datum ist das? (Sofort-Ergebnis)`
                : `${num} ${unit} from today → What date is that? ✓`;
            description = isDe
                ? `Berechnen Sie sofort das exakte Datum in ${num} ${unit} ab heute. Unser Rechner berücksichtigt Schaltjahre und unregelmäßige Monatslängen für 100% Genauigkeit.`
                : `Instantly calculate the exact date in ${num} ${unit} from today. Our calculator accounts for leap years and irregular month lengths for 100% accuracy.`;
        }
    } else if (isDiff) {
        const eventMapping: Record<string, string> = {
            'tage-bis-weihnachten': 'Wie viele Tage bis Weihnachten 2026? – Jetzt berechnen',
            'tage-bis-silvester': 'Wie viele Tage bis Silvester 2026? – Countdown heute',
            'tage-bis-neujahr': 'Wie viele Tage bis Neujahr 2027? – Countdown berechnen',
            'tage-bis-ostern': 'Wie viele Tage bis Ostern 2026? – Datum & Countdown',
            'tage-bis-sommeranfang': 'Wie viele Tage bis Sommeranfang 2026? – Countdown',
            'tage-bis-urlaub': 'Tage bis zum Urlaub berechnen – Countdown ab heute'
        };
        title = isDe
            ? (eventMapping[canonicalSlug || canonicalSlugStr] || `Tage bis ${displaySlug} – Jetzt exakt berechnen`)
            : `Days until ${displaySlug} → Calculate exactly now ✓`;
        description = isDe
            ? `Wie viele Tage sind es noch bis ${displaySlug}? Erhalten Sie ein präzises Ergebnis inklusive Berücksichtigung von Schaltjahren und Zeitspannen.`
            : `How many days until ${displaySlug}? Get a precise result including leap year considerations and time spans.`;
    }

    // robots: prevent index bloat for non-canonical number variations
    const robots = def?.isIndexable ? 'index, follow' : 'noindex, follow';

    return {
        title,
        description,
        robots,
        alternates: {
            canonical: correctUrl,
            languages
        },
        openGraph: {
            title,
            description,
            url: correctUrl,
            siteName: 'Datumsrechner',
            type: 'article',
            locale: locale,
            images: [
                {
                    url: '/og-image.png',
                    width: 1200,
                    height: 630,
                    alt: isDe ? `Datumsrechner: ${displaySlug}` : `Date Calculator: ${displaySlug}`,
                }
            ]
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['/og-image.png'],
        }
    };
}

export default async function ProgrammaticPage({
    params
}: {
    params: Promise<{ locale: string; intent: string; slug: string[] }>
}) {
    const { locale, intent, slug } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'SlugPage' });

    let internalIntent = Object.keys(INTENT_TRANSLATIONS[locale]).find(k => INTENT_TRANSLATIONS[locale][k] === intent);
    if (!internalIntent) {
        for (const loc of locales) {
            internalIntent = Object.keys(INTENT_TRANSLATIONS[loc]).find(k => INTENT_TRANSLATIONS[loc][k] === intent);
            if (internalIntent) break;
        }
    }
    if (!internalIntent) notFound();

    const mode = intentToModeMap[internalIntent.toLowerCase()];
    const slugStr = slug.join('-');
    const canonicalSlugStr = reverseTranslateSlug(slugStr, locale);
    
    const correctSlug = translateSlug(canonicalSlugStr, locale);
    const correctPath = getCanonicalPath(locale, internalIntent, correctSlug);
    
    // STRICT ENFORCEMENT: Redirect only if the SLUG part is non-canonical.
    if (slugStr.toLowerCase() !== correctSlug.toLowerCase()) {
        permanentRedirect(correctPath);
    }

    if (!mode) {
        notFound();
    }

    const { canonicalSlug, isExact } = resolveCanonicalQuery(canonicalSlugStr);
    
    if (!canonicalSlug) {
        notFound();
    }

    if (!isExact && canonicalSlug) {
        const locSlug = translateSlug(canonicalSlug, locale);
        const targetPath = getCanonicalPath(locale, internalIntent, locSlug);
        redirect(targetPath);
    } 

    const instantResult = await computeInstantResult(internalIntent.toLowerCase(), canonicalSlugStr, locale);

    const isDe = locale === 'de';
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": isDe ? "Startseite" : "Home", "item": `${SITE_URL}${locale === 'de' ? '' : `/${locale}`}` },
            { "@type": "ListItem", "position": 2, "name": isDe ? (mode === 'add_subtract' ? 'Datumsrechner' : 'Tage Zählen') : (mode === 'add_subtract' ? 'Date Calculator' : 'Days Counter'), "item": `${SITE_URL}${getCanonicalPath(locale, internalIntent)}` },
            { "@type": "ListItem", "position": 3, "name": correctSlug.replace(/-/g, ' '), "item": `${SITE_URL}${correctPath}` }
        ]
    };

    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": instantResult ? `${instantResult.headline} ${instantResult.highlight}` : `${intent} ${slugStr.replace(/-/g, ' ')}`,
        "author": { "@type": "Person", "name": "Felix Schmidt", "url": `${SITE_URL}${locale === 'de' ? '' : `/${locale}`}/ueber-uns` },
        "datePublished": "2024-01-01T00:00:00Z",
        "dateModified": new Date().toISOString()
    };

    return (
        <article className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 space-y-16">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

            <nav aria-label="Breadcrumb" className="mb-8 hidden sm:flex text-sm text-white/50 items-center justify-center space-x-2 animate-slide-up-fade">
                <NextLink href={`${locale === 'de' ? '/' : `/${locale}`}`} className="hover:text-neon transition-colors">
                    {isDe ? "Startseite" : "Home"}
                </NextLink>
                <ChevronRight className="w-4 h-4" />
                <NextLink href={getCanonicalPath(locale, internalIntent)} className="hover:text-neon transition-colors">
                    {isDe ? (mode === 'add_subtract' ? 'Datumsrechner' : 'Tage Zählen') : (mode === 'add_subtract' ? 'Date Calculator' : 'Days Counter')}
                </NextLink>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white/80" aria-current="page">{correctSlug.replace(/-/g, ' ')}</span>
            </nav>

            <header className="w-full text-center space-y-8 animate-slide-up-fade">
                {instantResult ? (
                    <>
                        <p className="text-xl md:text-2xl font-bold text-white/50 tracking-[0.2em] uppercase">
                            {instantResult.headline}
                        </p>
                        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/30 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] py-4">
                            {instantResult.highlight}
                        </h1>
                        <p className="text-xl text-white/70 font-medium">
                            {instantResult.subtext}
                        </p>
                    </>
                ) : (
                    <>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight capitalize">
                            {intent} {slugStr.replace(/-/g, ' ')}
                        </h1>
                        <p className="text-xl text-white/60 max-w-2xl mx-auto">
                            {t('description', { slug: slugStr.replace(/-/g, ' ') })}
                        </p>
                    </>
                )}

                <div className="flex justify-center mt-6">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-bold text-green-400 uppercase tracking-widest backdrop-blur-md">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {t('verified')}
                    </span>
                </div>
            </header>

            <section aria-label="Share and Convert" className="animate-slide-up-fade" style={{ animationDelay: '0.1s' }}>
                <ConversionTools />
            </section>

            <section aria-label="Interaktiver Rechner" className="w-full max-w-5xl mx-auto rounded-[2.5rem] border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-3xl p-6 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-slide-up-fade" style={{ animationDelay: '0.2s' }}>
                <CalculatorCore initialMode={mode as any} />
            </section>

            <section aria-label="Detaillierte Informationen" className="max-w-4xl mx-auto space-y-12 animate-slide-up-fade" style={{ animationDelay: '0.3s' }}>
                <SEOContentBlock intent={intent} slug={slugStr} locale={locale} />
                <InternalLinksBlock locale={locale} intent={intent} slug={slugStr} />
                <FAQBlock intent={intent} slug={slugStr} locale={locale} />
            </section>

            <TrustSignals />
        </article>
    );
}

export function generateStaticParams() {
    const params: { locale: string; intent: string; slug: string[] }[] = [];

    for (const locale of locales) {
        // Canonical Queries (Strictly enforced 220-page limit)
        Object.values(CANONICAL_QUERIES).forEach(def => {
            if (def.isIndexable) {
                const internalIntent = def.calcMode === 'add_subtract' ? 'addieren' : 
                                     def.calcMode === 'difference' ? 'differenz' : 
                                     def.calcMode === 'business_days' ? 'arbeitstage' : 'alter';
                const locIntent = INTENT_TRANSLATIONS[locale][internalIntent] || internalIntent;
                const locSlug = translateSlug(def.canonicalSlug, locale);
                
                params.push({
                    locale,
                    intent: locIntent,
                    slug: locSlug.split('-')
                });
            }
        });
    }

    return params;
}
