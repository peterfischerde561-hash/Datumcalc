import { CANONICAL_QUERIES } from '@/lib/seo/queryModel';
import NextLink from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { locales } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { CalculatorCore } from '@/components/calculator/CalculatorCore';

export const revalidate = 604800; // 7 days ISR revalidation
export const dynamicParams = true;
import { INTENT_TRANSLATIONS, translateSlug, getCanonicalPath } from '@/lib/seo/translations';
import { SITE_URL } from '@/lib/constants';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; intent: string }> }) {
    const { locale, intent } = await params;
    setRequestLocale(locale);
    
    // Resolve internal intent
    let internalIntent = Object.keys(INTENT_TRANSLATIONS[locale]).find(k => INTENT_TRANSLATIONS[locale][k] === intent);
    if (!internalIntent) {
        for (const loc of locales) {
            internalIntent = Object.keys(INTENT_TRANSLATIONS[loc]).find(k => INTENT_TRANSLATIONS[loc][k] === intent);
            if (internalIntent) break;
        }
    }
    const finalIntent = internalIntent || intent;
    
    const canonicalPath = getCanonicalPath(locale, finalIntent);
    const fullUrl = `${SITE_URL}${canonicalPath}`;
    
    // Build hreflang alternates
    const languages: Record<string, string> = {};
    locales.forEach(loc => {
        languages[loc] = `${SITE_URL}${getCanonicalPath(loc, finalIntent)}`;
    });
    languages['x-default'] = `${SITE_URL}${getCanonicalPath('de', finalIntent)}`;

    const title = locale === 'de' 
        ? `${intent.charAt(0).toUpperCase() + intent.slice(1)} - Datumsrechner Hub ✓`
        : `${intent.charAt(0).toUpperCase() + intent.slice(1)} - Date Calculator Hub ✓`;

    return {
        title,
        description: locale === 'de'
            ? `Nutzen Sie unsere Sammlung an präzisen Rechnern für ${intent}. Schnelle Antworten für alle Datums-Szenarien.`
            : `Use our collection of precise calculators for ${intent}. Fast answers for all date scenarios.`,
        alternates: {
            canonical: fullUrl,
            languages
        },
        openGraph: {
            title,
            url: fullUrl,
            type: 'website',
            locale: locale,
        }
    };
}

export default async function IntentHubPage({ params }: { params: Promise<{ locale: string; intent: string }> }) {
    const { locale, intent } = await params;
    setRequestLocale(locale);
    // Resolve internal intent across ALL locales (robust fallback)
    let internalIntent = Object.keys(INTENT_TRANSLATIONS[locale]).find(k => INTENT_TRANSLATIONS[locale][k] === intent);
    
    if (!internalIntent) {
        // Search other locales
        for (const loc of locales) {
            internalIntent = Object.keys(INTENT_TRANSLATIONS[loc]).find(k => INTENT_TRANSLATIONS[loc][k] === intent);
            if (internalIntent) break;
        }
    }

    if (!internalIntent) {
        notFound();
    }

    // NORMALIZE: Ensure strictly localized intent URL
    const correctPath = getCanonicalPath(locale, internalIntent);
    const correctIntent = INTENT_TRANSLATIONS[locale][internalIntent] || internalIntent;

    const intentMap: Record<string, string> = { 
        'addieren': 'add_subtract',
        'differenz': 'difference',
        'arbeitstage': 'business_days',
        'alter': 'age'
    };

    if (!intentMap[internalIntent.toLowerCase()]) {
        notFound();
    }

    const calcMode = intentMap[internalIntent.toLowerCase()];
    
    // Group known queries for this hub
    const activeQueries = Object.values(CANONICAL_QUERIES).filter((def) => def.calcMode === calcMode && def.isIndexable);
    
    // Split into events vs generic for nicely grouped navigation
    const informational = activeQueries.filter((def) => def.intentType === 'Informational');
    const transactional = activeQueries.filter((def) => def.intentType === 'Transactional');

    const textMapping: Record<string, { de: { h1: string, sub: string, intro?: string }, en: { h1: string, sub: string, intro?: string } }> = {
        'differenz': {
            de: {
                h1: "Datumsdifferenz berechnen",
                sub: "Berechnen Sie exakt wie viele Tage, Wochen oder Monate zwischen zwei Daten liegen.",
                intro: "Mit unserem Rechner zur Datumsdifferenz können Sie Zeitspannen mühelos ermitteln. Egal ob Sie Projektfristen planen oder Countdowns für Events erstellen, Sie erhalten stets präzise Ergebnisse unter Berücksichtigung von Schaltjahren."
            },
            en: {
                h1: "Calculate Date Difference",
                sub: "Calculate exactly how many days, weeks or months lie between two dates.",
                intro: "With our date difference calculator, you can easily determine time spans. Whether you are planning project deadlines or creating countdowns for events, you always get precise results taking leap years into account."
            }
        },
        'addieren': {
            de: {
                h1: "Datum addieren & subtrahieren",
                sub: "Ermitteln Sie das genaue Datum nach einer bestimmten Anzahl von Tagen, Wochen oder Monaten.",
                intro: "Fügen Sie einem Startdatum ganz einfach Tage, Wochen oder Monate hinzu – oder ziehen Sie diese ab. Dieses Tool ist ideal für die exakte Bestimmung von Lieferterminen, Projektmeilensteinen oder rechtlichen Kündigungsfristen."
            },
            en: {
                h1: "Add & Subtract Dates",
                sub: "Determine the exact date after a certain number of days, weeks or months.",
                intro: "Easily add or subtract days, weeks or months from a start date. This tool is ideal for accurately determining delivery dates, project milestones, or legal notice periods."
            }
        },
        'arbeitstage': {
            de: {
                h1: "Netto-Arbeitstage berechnen",
                sub: "Berechnen Sie Werktage zwischen zwei Daten – ohne Wochenenden, optional ohne Feiertage."
            },
            en: {
                h1: "Calculate Net Business Days",
                sub: "Calculate business days between two dates – without weekends, optionally without public holidays."
            }
        },
        'alter': {
            de: {
                h1: "Alter berechnen – Altersrechner",
                sub: "Berechnen Sie Ihr genaues Alter in Jahren, Monaten, Wochen und Tagen."
            },
            en: {
                h1: "Calculate Age – Age Calculator",
                sub: "Calculate your exact age in years, months, weeks and days."
            }
        }
    };

    const currentText = textMapping[internalIntent.toLowerCase()] || {
        de: { h1: correctIntent, sub: `Alle Berechnungen rund um das Thema ${correctIntent}.` },
        en: { h1: correctIntent, sub: `All calculations related to ${correctIntent}.` }
    };
    
    const isDe = locale === 'de';
    const localizedText = isDe ? currentText.de : currentText.en;

    return (
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-16 space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight py-2">
                    {localizedText.h1}
                </h1>
                <p className="text-lg text-white/60 max-w-2xl mx-auto">
                    {localizedText.sub}
                </p>
                {localizedText.intro && (
                    <p className="text-md text-white/50 max-w-3xl mx-auto mt-4 leading-relaxed">
                        {localizedText.intro}
                    </p>
                )}
            </div>

            <section aria-label={isDe ? "Rechner" : "Calculator"} className="w-full max-w-5xl mx-auto rounded-[2.5rem] border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-3xl p-6 md:p-10 mb-16 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-slide-up-fade" style={{ animationDelay: '0.1s' }}>
                <CalculatorCore />
            </section>

            {(transactional.length > 0 || informational.length > 0) && (
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Generic Numbers - Transactional */}
                {transactional.length > 0 && (
                    <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem]">
                        <h2 className="text-2xl font-bold mb-6 text-neon-blue">
                            {locale === 'de' ? 'Häufige Berechnungen' : 'Popular Calculations'}
                        </h2>
                        <ul className="space-y-3">
                            {transactional.map((def) => {
                                const locSlug = translateSlug(def.canonicalSlug, locale);
                                const href = getCanonicalPath(locale, internalIntent!, locSlug);
                                return (
                                    <li key={def.canonicalSlug}>
                                        <NextLink href={href} className="text-white hover:text-neon flex items-center justify-between group p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                            <span>{locSlug.replace(/-/g, ' ')}</span>
                                            <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </NextLink>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}

                {/* Events - Informational */}
                {informational.length > 0 && (
                    <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem]">
                        <h2 className="text-2xl font-bold mb-6 text-neon-blue">
                            {locale === 'de' ? 'Meilensteine & Events' : 'Milestones & Events'}
                        </h2>
                        <ul className="space-y-3">
                            {informational.map((def) => {
                                const locSlug = translateSlug(def.canonicalSlug, locale);
                                const href = getCanonicalPath(locale, internalIntent!, locSlug);
                                return (
                                    <li key={def.canonicalSlug}>
                                        <NextLink href={href} className="text-white hover:text-neon flex items-center justify-between group p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                            <span className="capitalize">{locSlug.replace(/-/g, ' ')}</span>
                                            <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </NextLink>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
            )}
        </main>
    );
}

export function generateStaticParams() {
    return locales.flatMap(locale => {
        const intents = Object.values(INTENT_TRANSLATIONS[locale]);
        return intents.map(intent => ({ locale, intent }));
    });
}
