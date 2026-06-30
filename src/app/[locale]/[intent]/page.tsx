import { CANONICAL_QUERIES } from '@/lib/seo/queryModel';
import NextLink from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { locales } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { CalculatorCore } from '@/components/calculator/CalculatorCore';
import { ToolSchema } from '@/components/seo/ToolSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';

export const revalidate = 86400; // 24 hours
export const dynamicParams = false;
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

    const metaData: Record<string, { title: string; description: string }> = {
        'differenz': {
            de: {
                title: 'Tage zwischen zwei Daten berechnen',
                description: 'Berechnen Sie exakt wie viele Tage, Wochen oder Monate zwischen zwei Daten liegen. Kostenlos, präzise & sofort – ISO 8601 konform.'
            },
            en: {
                title: 'Calculate Days Between Two Dates',
                description: 'Calculate exactly how many days, weeks or months lie between two dates. Free, precise & instant – ISO 8601 compliant.'
            }
        },
        'addieren': {
            de: {
                title: 'Datum addieren & subtrahieren',
                description: 'Datum addieren oder subtrahieren: Welches Datum ist in X Tagen, Wochen oder Monaten? Sofortige Berechnung – kostenlos & ohne Anmeldung.'
            },
            en: {
                title: 'Add & Subtract Dates Online',
                description: 'Add or subtract dates: which date is in X days, weeks or months? Instant calculation – free & no registration.'
            }
        },
        'arbeitstage': {
            de: {
                title: 'Arbeitstage & Werktage berechnen',
                description: 'Netto-Arbeitstage zwischen zwei Daten berechnen – ohne Wochenenden. Kostenlos, präzise und sofort verfügbar.'
            },
            en: {
                title: 'Calculate Business & Working Days',
                description: 'Calculate net business days between two dates – without weekends. Free, precise and instantly available.'
            }
        },
        'alter': {
            de: {
                title: 'Altersrechner – Alter berechnen',
                description: 'Berechnen Sie Ihr genaues Alter in Jahren, Monaten, Wochen und Tagen. Kostenloser Altersrechner – ohne Anmeldung.'
            },
            en: {
                title: 'Age Calculator – Calculate Age',
                description: 'Calculate your exact age in years, months, weeks and days. Free age calculator – no registration.'
            }
        }
    }[finalIntent.toLowerCase()] || {
        de: { title: `${intent} - Datumsrechner`, description: `Alle Tools für ${intent}.` },
        en: { title: `${intent} - Date Calculator`, description: `All tools for ${intent}.` }
    };

    const title = locale === 'de' ? metaData.de.title : metaData.en.title;
    const description = locale === 'de' ? metaData.de.description : metaData.en.description;

    return {
        title,
        description,
        alternates: {
            canonical: fullUrl,
            languages
        },
        openGraph: {
            title,
            description,
            url: fullUrl,
            type: 'website',
            locale: locale,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
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
                h1: "Arbeitstage berechnen – Netto-Werktage zwischen zwei Daten",
                sub: "Berechnen Sie exakt wie viele Werktage zwischen zwei Daten liegen – ohne Wochenenden."
            },
            en: {
                h1: "Calculate Business Days",
                sub: "Calculate net business days between two dates – excluding weekends."
            }
        },
        'alter': {
            de: {
                h1: "Altersrechner – Alter in Jahren, Monaten & Tagen berechnen",
                sub: "Berechnen Sie Ihr genaues Alter oder das Alter einer anderen Person – auf den Tag genau."
            },
            en: {
                h1: "Age Calculator – Calculate Age Precisely",
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
    
    // Breadcrumbs
    const breadcrumbItems = [
        { name: isDe ? 'Startseite' : 'Home', item: `/${locale === 'de' ? '' : locale}` },
        { name: localizedText.h1, item: correctPath }
    ];

    return (
        <main className="flex-1 w-full bg-white text-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <BreadcrumbSchema items={breadcrumbItems} />
            <ToolSchema
                name={localizedText.h1}
                description={isDe ? "Präziser Datumsrechner für verschiedene kalendarische Szenarien." : "Precise date calculator for various calendar scenarios."}
                url={`${SITE_URL}${correctPath}`}
            />
            <div className="mb-12 space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                    {localizedText.h1}
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl">
                    {localizedText.sub}
                </p>
                {localizedText.intro && (
                    <p className="text-md text-slate-600 max-w-3xl mt-4 leading-relaxed">
                        {localizedText.intro}
                    </p>
                )}
            </div>

            <section aria-label={isDe ? "Rechner" : "Calculator"} className="w-full rounded-xl border border-slate-200 bg-white p-6 md:p-8 mb-16 shadow-sm">
                <CalculatorCore />
            </section>

            {(transactional.length > 0 || informational.length > 0 || internalIntent.toLowerCase() === 'arbeitstage' || internalIntent.toLowerCase() === 'alter') && (
                <div className="max-w-5xl mx-auto space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Popular / Transactional */}
                        <div className="bg-white border border-slate-200 p-8 rounded-xl">
                            <h2 className="text-2xl font-bold mb-6 text-blue-700">
                                {locale === 'de' ? 'Häufige Berechnungen' : 'Popular Calculations'}
                            </h2>
                            <ul className="space-y-3">
                                {internalIntent.toLowerCase() === 'arbeitstage' && isDe && (
                                    <>
                                        {['Januar 2026', 'Februar 2026', 'Q1 2026', 'Q2 2026', 'Mai 2026', 'Juni 2026'].map(label => (
                                            <li key={label}>
                                                <div className="text-slate-700 flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-default">
                                                    <span>Arbeitstage im {label}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </>
                                )}
                                {internalIntent.toLowerCase() === 'alter' && isDe && (
                                    <>
                                        {[1990, 2000, 1985, 2005].map(year => (
                                            <li key={year}>
                                                <div className="text-slate-700 flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-default">
                                                    <span>Wie alt bin ich wenn ich {year} geboren wurde?</span>
                                                </div>
                                            </li>
                                        ))}
                                    </>
                                )}
                                {transactional.map((def) => {
                                    const locSlug = translateSlug(def.canonicalSlug, locale);
                                    const href = getCanonicalPath(locale, internalIntent!, locSlug);
                                    return (
                                        <li key={def.canonicalSlug}>
                                            <NextLink href={href} className="text-slate-700 hover:text-blue-700 flex items-center justify-between group p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                                                <span>{locSlug.replace(/-/g, ' ')}</span>
                                                <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </NextLink>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        {/* Events / Informational */}
                        {informational.length > 0 && (
                            <div className="bg-white border border-slate-200 p-8 rounded-xl">
                                <h2 className="text-2xl font-bold mb-6 text-blue-700">
                                    {locale === 'de' ? 'Meilensteine & Events' : 'Milestones & Events'}
                                </h2>
                                <ul className="space-y-3">
                                    {informational.map((def) => {
                                        const locSlug = translateSlug(def.canonicalSlug, locale);
                                        const href = getCanonicalPath(locale, internalIntent!, locSlug);
                                        return (
                                            <li key={def.canonicalSlug}>
                                                <NextLink href={href} className="text-slate-700 hover:text-blue-700 flex items-center justify-between group p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                                                    <span className="capitalize">{locSlug.replace(/-/g, ' ')}</span>
                                                    <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

                    {/* Explanation for Arbeitstage */}
                    {internalIntent.toLowerCase() === 'arbeitstage' && isDe && (
                        <div className="bg-white border border-slate-200 p-8 md:p-12 rounded-xl text-slate-700 space-y-6 leading-relaxed">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Was sind Arbeitstage?</h2>
                            <p>
                                Der Begriff Arbeitstage (oft auch Werktage genannt) beschreibt jene Tage, an denen üblicherweise gearbeitet wird. 
                                In der Regel sind dies die Tage von Montag bis Freitag. Samstage und Sonntage werden bei der Berechnung von Netto-Arbeitstagen 
                                ausgeklammert, um den realen Zeitaufwand für berufliche Projekte oder Fristen zu ermitteln.
                            </p>
                            <p>
                                Unser Rechner hilft Ihnen dabei, genau diese Spanne zwischen zwei Daten zu bestimmen. Dies ist besonders nützlich für die 
                                Personalplanung, das Projektmanagement oder die Berechnung von Kündigungsfristen, die sich oft auf Arbeitstage beziehen.
                            </p>
                        </div>
                    )}
                </div>
            )}
          </div>
        </main>
    );
}

export function generateStaticParams() {
    return locales.flatMap(locale => {
        // Return canonical keys (the ones in next-intl routing.ts)
        const intents = ['addieren', 'differenz', 'arbeitstage', 'alter'];
        return intents.map(intent => {
            return { locale, intent };
        });
    });
}
