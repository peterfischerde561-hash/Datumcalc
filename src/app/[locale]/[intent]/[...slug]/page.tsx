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
import { resolveCanonicalQuery, CANONICAL_QUERIES } from '@/lib/seo/queryModel';
import { locales } from '@/i18n/routing';
import { SITE_URL } from '@/lib/constants';
import { INTENT_TRANSLATIONS, translateSlug, reverseTranslateSlug, getCanonicalPath } from '@/lib/seo/translations';

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
export const dynamic = 'force-static';
export const revalidate = false; 
export const dynamicParams = true; 
import { InstantResultClient } from '@/components/seo/InstantResultClient';
import { ToolSchema, FAQSchema } from '@/components/seo/ToolSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';

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
    const currentYear = new Date().getFullYear();
    const tEvents = await getTranslations({ locale, namespace: 'Events' });
    
    let title = isDe 
        ? `${displaySlug} – Exakte Berechnung online`
        : `${displaySlug} – Exact calculation online`;
    
    let description = isDe
        ? `Nutzen Sie den kostenlosen Datumsrechner für exakte Ergebnisse zu ${displaySlug}. ISO 8601 konform, präzise und sekundenschnell.`
        : `Use the free date calculator for exact results on ${displaySlug}. ISO 8601 compliant, precise and lightning fast.`;

    if (isAdd) {
        const match = (canonicalSlug || canonicalSlugStr).match(/^(\d+)-(tage|monate|jahre|jahr)-ab-heute$/);
        if (match) {
            const num = parseInt(match[1], 10);
            const unit = match[2];

            const displayUnit = isDe
                ? (unit === 'tage' ? 'Tage' : unit === 'monate' ? 'Monate' : 'Jahr')
                : (unit === 'tage' ? 'days' : unit === 'monate' ? 'months' : (num === 1 ? 'year' : 'years'));
            
            const unitLabel = isDe
                ? (unit === 'tage' ? 'Tagen' : unit === 'monate' ? 'Monaten' : 'Jahr')
                : (unit === 'tage' ? 'days' : unit === 'monate' ? 'months' : (num === 1 ? 'year' : 'years'));

            title = isDe 
                ? `${num} ${displayUnit} ab heute – Welches Datum?`
                : `${num} ${displayUnit} from today – What date?`;
            description = isDe
                ? `Welches Datum ist in ${num} ${unitLabel} ab heute? Der kostenlose Datumsrechner zeigt das genaue Zieldatum samt Wochentag – live berechnet und schaltjahrgenau, ohne Anmeldung.`
                : `What date is ${num} ${unitLabel} from today? The free date calculator shows the exact target date including the weekday – computed live and leap-year accurate, no registration required.`;
        }
    } else if (isDiff) {
        const eventKey = (canonicalSlug || canonicalSlugStr).replace('tage-bis-', '');
        let label = displaySlug;
        try {
            const eventName = tEvents(eventKey);
            if (isDe) {
                label = eventKey === 'urlaub' ? 'zum Urlaub' : eventName;
            } else {
                label = eventName;
            }
        } catch (e) {
            // fallback
        }
        
        title = isDe
            ? `Wie viele Tage bis ${label} ${currentYear}?`
            : `How many days until ${label} ${currentYear}?`;
        description = isDe
            ? `Wie viele Tage sind es noch bis ${label} ${currentYear}? Berechnen Sie den exakten Countdown und die verbleibende Zeit online – kostenlos und sofort.`
            : `How many days until ${label} ${currentYear}? Calculate the exact countdown and remaining time to ${label} online – free, fast, and highly precise.`;
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
            type: 'website',
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
    const displaySlug = correctSlug.replace(/-/g, ' ');
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
        permanentRedirect(targetPath);
    } 

    const tSlug = await getTranslations({ locale, namespace: 'SlugPage' });
    const tEvents = await getTranslations({ locale, namespace: 'Events' });
    const tCalc = await getTranslations({ locale, namespace: 'Calculator' });

    const translations = {
        in: tSlug('in'),
        is: tSlug('is'),
        basedOn: tSlug('basedOn'),
        until: tSlug('until'),
        areYet: tSlug('areYet'),
        theDateIs: tSlug('theDateIs'),
        days: tCalc('days'),
        months: tCalc('months'),
        years: tCalc('years'),
        events: {
            weihnachten: tEvents('weihnachten'),
            silvester: tEvents('silvester'),
            neujahr: tEvents('neujahr'),
            sommeranfang: tEvents('sommeranfang'),
            ostern: tEvents('ostern'),
            urlaub: tEvents('urlaub')
        }
    };

    const isDe = locale === 'de';
    const isAdd = internalIntent === 'addieren' || internalIntent === 'add';
    const isDiff = internalIntent === 'differenz' || internalIntent === 'difference';

    // Breadcrumbs
    const breadcrumbItems = [
        { name: isDe ? 'Startseite' : 'Home', item: `${SITE_URL}/${locale === 'de' ? '' : locale}` },
        { name: intent.charAt(0).toUpperCase() + intent.slice(1), item: `${SITE_URL}${getCanonicalPath(locale, internalIntent)}` },
        { name: displaySlug, item: `${SITE_URL}${correctPath}` }
    ];

    // FAQ Generation
    const faqItems = [];
    if (internalIntent === 'addieren' || internalIntent === 'add') {
        const match = canonicalSlugStr.match(/^(\d+)-(tage|monate|jahre|jahr)-ab-heute$/);
        if (match) {
            const num = match[1];
            const unit = match[2];
            let unitLabel = '';
            if (isDe) {
                unitLabel = unit === 'tage' ? 'Tagen' : unit === 'monate' ? 'Monaten' : 'Jahr';
            } else {
                unitLabel = unit === 'tage' ? 'days' : unit === 'monate' ? 'months' : (num === '1' ? 'year' : 'years');
            }
            faqItems.push({
                question: isDe ? `Welches Datum ist in ${num} ${unitLabel} ab heute?` : `What date is ${num} ${unitLabel} from today?`,
                answer: isDe 
                    ? `In exakt ${num} ${unitLabel} ab heute erreichen wir das berechnete Zieldatum. Unser Rechner berücksichtigt dabei alle Schaltjahre.`
                    : `In exactly ${num} ${unitLabel} from today, we reach the calculated target date. Our calculator accounts for all leap years.`
            });
        }
    } else {
        const eventKey = canonicalSlugStr.replace('tage-bis-', '');
        let eventName = '';
        try {
            eventName = tEvents(eventKey);
        } catch (e) {
            eventName = displaySlug.replace('tage bis ', '');
        }

        const label = isDe 
            ? (eventKey === 'urlaub' ? 'den Urlaub' : eventName)
            : eventName;

        faqItems.push({
            question: isDe ? `Wie viele Tage sind es bis ${label} ${new Date().getFullYear()}?` : `How many days until ${label}?`,
            answer: isDe
                ? `Mit unserem kostenlosen Online-Rechner ermitteln Sie sofort die verbleibenden Tage bis ${label}.`
                : `Use our free online calculator to instantly determine the remaining days until ${label}.`
        });
    }

    // H1 Generation
    let h1Text = '';
    if (isAdd) {
        const match = canonicalSlugStr.match(/^(\d+)-(tage|monate|jahre|jahr)-ab-heute$/);
        if (match) {
            const num = parseInt(match[1], 10);
            const unit = match[2];
            if (isDe) {
                const displayUnit = unit === 'tage' ? 'Tage' : unit === 'monate' ? 'Monate' : 'Jahr';
                h1Text = `${num} ${displayUnit} ab heute`;
            } else {
                const displayUnit = unit === 'tage' ? 'days' : unit === 'monate' ? 'months' : (num === 1 ? 'year' : 'years');
                h1Text = `${num} ${displayUnit} from today`;
            }
        } else {
            h1Text = displaySlug.charAt(0).toUpperCase() + displaySlug.slice(1);
        }
    } else if (isDiff) {
        const eventKey = canonicalSlugStr.replace('tage-bis-', '');
        let eventName = '';
        try {
            eventName = tEvents(eventKey);
        } catch (e) {
            eventName = displaySlug.replace('tage bis ', '');
        }

        if (isDe) {
            const label = eventKey === 'urlaub' ? 'zum Urlaub' : eventName;
            h1Text = `Wie viele Tage bis ${label}?`;
        } else {
            h1Text = `How many days until ${eventName}?`;
        }
    } else {
        h1Text = displaySlug.charAt(0).toUpperCase() + displaySlug.slice(1);
    }

    return (
        <main className="flex-1 w-full relative">
            <BreadcrumbSchema items={breadcrumbItems} />
            <ToolSchema 
                name={displaySlug} 
                description={isDe ? `Präziser Datumsrechner für ${displaySlug}.` : `Precise date calculator for ${displaySlug}.`} 
                url={`${SITE_URL}${correctPath}`} 
            />
            <FAQSchema items={faqItems} />
            <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 space-y-16">

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

            <header className="w-full text-center space-y-6 animate-slide-up-fade">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
                    {h1Text}
                </h1>
                <InstantResultClient 
                    intent={internalIntent.toLowerCase()} 
                    slugStr={canonicalSlugStr} 
                    locale={locale} 
                    translations={translations}
                />

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
        </main>
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
                const locSlug = translateSlug(def.canonicalSlug, locale);
                
                params.push({
                    locale,
                    intent: internalIntent,
                    slug: [locSlug]
                });
            }
        });
    }

    return params;
}
