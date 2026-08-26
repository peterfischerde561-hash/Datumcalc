import { CANONICAL_QUERIES } from '@/lib/seo/queryModel';
import NextLink from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { locales } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { CalculatorCore } from '@/components/calculator/CalculatorCore';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';

// The titles carry the current year, computed from the Berlin date, so these
// pages are date-dependent and must not be frozen for a day at the year
// boundary. Already covered by the daily Berlin-boundary cron.
export const revalidate = 3600;
export const dynamicParams = false;
import { INTENT_TRANSLATIONS, translateSlug, getCanonicalPath } from '@/lib/seo/translations';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { getTodayInTimeZone } from '@/lib/date/civil';
import { HUB_CONTENT } from '@/lib/seo/hubContent';
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

    /*
     * The year is computed, not written into the string — but only where a
     * year is genuinely part of how people search.
     *
     * Competing pages carry it ("Arbeitstage-Rechner 2026") because it reads as
     * current in a result list, and theirs goes stale on 1 January. Ours comes
     * from the canonical Berlin date, so it stays right. That is only worth
     * doing where the query itself is year-bound: "Arbeitstage 2026" is a real
     * search, "Datum addieren 2026" is not. Sprinkling a year across every
     * title is freshness theatre.
     *
     * Note the layout appends " – Datumsrechner", so titles here must not
     * repeat the brand or the word Rechner.
     */
    const year = getTodayInTimeZone().year;

    const metaData: Record<string, { title: string; description: string }> = {
        'differenz': {
            de: {
                // Leads with the query itself: GSC records "tage zwischen zwei
                // daten", not "datumsdifferenz", and every ranking page titles
                // it the long way.
                title: 'Tage zwischen zwei Daten berechnen',
                description: `Wie viele Tage liegen zwischen zwei Daten? Der Tagerechner zählt Tage, Wochen und Monate exakt – mit Schaltjahren und Kalenderwochen nach ISO 8601. Kostenlos und ohne Anmeldung.`
            },
            en: {
                title: 'Days Between Two Dates',
                description: `How many days lie between two dates? Counts days, weeks and months exactly – including leap years and ISO 8601 calendar weeks. Free, no registration.`
            }
        },
        'addieren': {
            de: {
                title: 'Datum addieren & subtrahieren',
                description: `Welches Datum ist in 30, 90 oder 100 Tagen? Tage, Wochen, Monate oder Jahre zu einem Datum addieren oder davon abziehen – mit Wochentag und Kalenderwoche.`
            },
            en: {
                title: 'Add or Subtract Days from a Date',
                description: `What date is 30, 90 or 100 days from now? Add or subtract days, weeks, months or years from any date – with the weekday and calendar week.`
            }
        },
        'arbeitstage': {
            de: {
                title: `Arbeitstage & Werktage berechnen ${year}`,
                description: `Wie viele Arbeitstage liegen zwischen zwei Daten? Der Rechner zählt Montag bis Freitag und filtert Wochenenden heraus. Unterschied zu Werktagen erklärt.`
            },
            en: {
                title: `Business & Working Days ${year}`,
                description: `How many business days lie between two dates? Counts Monday to Friday and filters out weekends. The difference from calendar days explained.`
            }
        },
        'alter': {
            de: {
                // "wie alt bin ich" is the phrasing the ranking pages carry.
                title: 'Wie alt bin ich? Alter exakt berechnen',
                description: 'Wie alt bin ich genau? Geburtsdatum eingeben und das Alter in Jahren, Monaten und Tagen berechnen – inklusive der gelebten Tage insgesamt.'
            },
            en: {
                title: 'How Old Am I? Calculate Your Exact Age',
                description: 'How old am I exactly? Enter a date of birth to get the age in years, months and days – including the total number of days lived.'
            }
        }
    }[finalIntent.toLowerCase()] || {
        de: { title: `${intent} - Datumsrechner`, description: `Alle Tools für ${intent}.` },
        en: { title: `${intent} - Date Calculator`, description: `All tools for ${intent}.` }
    };

    const title = locale === 'de' ? metaData.de.title : metaData.en.title;
    const description = locale === 'de' ? metaData.de.description : metaData.en.description;

    return buildPageMetadata({
        locale,
        title,
        description,
        path: getCanonicalPath(locale, finalIntent),
        pathForLocale: (loc) => getCanonicalPath(loc, finalIntent)
    });
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
                // Was "Datumsdifferenz berechnen". GSC records the demand as
                // "tage zwischen zwei daten" and "tage berechnen"; nobody
                // searches for the word Datumsdifferenz.
                h1: "Tage zwischen zwei Daten berechnen",
                sub: "Start- und Enddatum eingeben – der Rechner zeigt die Spanne in Tagen, Wochen und Monaten, inklusive Kalenderwoche.",
                intro: "Mit unserem Rechner zur Datumsdifferenz können Sie Zeitspannen mühelos ermitteln. Egal ob Sie Projektfristen planen oder Countdowns für Events erstellen, Sie erhalten stets präzise Ergebnisse unter Berücksichtigung von Schaltjahren."
            },
            en: {
                h1: "Days Between Two Dates",
                sub: "Enter a start and end date – the calculator shows the span in days, weeks and months, including the calendar week.",
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
                h1: "Arbeitstage und Werktage berechnen",
                sub: "Der Rechner zählt Montag bis Freitag zwischen zwei Daten. Gesetzliche Feiertage sind nicht abgezogen – sie unterscheiden sich je nach Bundesland."
            },
            en: {
                h1: "Calculate Business Days",
                sub: "Calculate net business days between two dates – excluding weekends."
            }
        },
        'alter': {
            de: {
                h1: "Wie alt bin ich? Alter exakt berechnen",
                sub: "Geburtsdatum eingeben – der Rechner zeigt das Alter in Jahren, Monaten und Tagen sowie die insgesamt gelebten Tage."
            },
            en: {
                h1: "How Old Am I? Calculate Your Exact Age",
                sub: "Enter a date of birth – the calculator shows the age in years, months and days, plus the total days lived."
            }
        }
    };

    const currentText = textMapping[internalIntent.toLowerCase()] || {
        de: { h1: correctIntent, sub: `Alle Berechnungen rund um das Thema ${correctIntent}.` },
        en: { h1: correctIntent, sub: `All calculations related to ${correctIntent}.` }
    };
    
    const isDe = locale === 'de';
    const localizedText = isDe ? currentText.de : currentText.en;

    const hub = HUB_CONTENT[internalIntent.toLowerCase()]?.[isDe ? 'de' : 'en'];
    const hubFaqJsonLd = hub ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': hub.faqs.map(f => ({
            '@type': 'Question',
            'name': f.q,
            'acceptedAnswer': { '@type': 'Answer', 'text': f.a },
        })),
    } : null;

    // Breadcrumbs
    const breadcrumbItems = [
        { name: isDe ? 'Startseite' : 'Home', item: `/${locale === 'de' ? '' : locale}` },
        { name: localizedText.h1, item: correctPath }
    ];

    return (
        <main className="flex-1 w-full bg-white text-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <BreadcrumbSchema items={breadcrumbItems} />
            {/* See the note in [...slug]/page.tsx: the site-level
                WebApplication lives in the layout, not once per URL. */}
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

            {(transactional.length > 0 || informational.length > 0) && (
                <div className="max-w-5xl mx-auto space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Popular / Transactional */}
                        <div className="bg-white border border-slate-200 p-8 rounded-xl">
                            <h2 className="text-2xl font-bold mb-6 text-blue-700">
                                {locale === 'de' ? 'Häufige Berechnungen' : 'Popular Calculations'}
                            </h2>
                            <ul className="space-y-3">
                                {/*
                                  /arbeitstage listed six months and quarters,
                                  and /alter four birth years, as plain divs with
                                  cursor-default — text shaped like links with no
                                  pages behind them. Removed rather than left as
                                  dead ends; they belong here once the pages exist
                                  and pass the Phase 12 demand check.
                                */}
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

                </div>
            )}

            {/* Category-specific explainer + FAQ (unique per tool) */}
            {hub && (
                <div className="max-w-5xl mx-auto space-y-12 mt-16">
                    <section aria-label={hub.explainerHeading} className="bg-white border border-slate-200 p-8 md:p-10 rounded-xl">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">{hub.explainerHeading}</h2>
                        <div className="space-y-4 text-slate-700 leading-relaxed text-lg">
                            {hub.explainer.map((p, i) => <p key={i}>{p}</p>)}
                        </div>
                    </section>

                    <section aria-label={isDe ? 'Häufige Fragen' : 'Frequently asked questions'} className="bg-white border border-slate-200 p-8 md:p-10 rounded-xl">
                        <h2 className="text-2xl font-bold text-slate-900 mb-8">{isDe ? 'Häufige Fragen' : 'Frequently asked questions'}</h2>
                        {hubFaqJsonLd && (
                            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hubFaqJsonLd) }} />
                        )}
                        <div className="space-y-6">
                            {hub.faqs.map((f, i) => (
                                <div key={i} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.q}</h3>
                                    <p className="text-slate-700 leading-relaxed">{f.a}</p>
                                </div>
                            ))}
                        </div>
                    </section>
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
