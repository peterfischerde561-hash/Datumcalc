import { CalculatorCore } from '@/components/calculator/CalculatorCore';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SmartInputBar } from '@/components/SmartInputBar';
import { HomepageSEO } from '@/components/seo/HomepageSEO';
import { WebApplicationSchema } from '@/components/seo/WebApplicationSchema';
import { locales, Link } from '@/i18n/routing';
import { SITE_URL } from "@/lib/constants";
import { ROUTES } from '@/lib/routes';
import { SplitSquareHorizontal, PlusSquare, Briefcase, User } from 'lucide-react';
import { LiveDatePreview } from '@/components/hero/LiveDatePreview';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { QuickShortcuts } from '@/components/hero/QuickShortcuts';

// The hero states today's date, ordinal day and ISO week, so this page is
// date-dependent. Hourly ISR bounds staleness; the daily cron refreshes it at
// the Europe/Berlin date boundary.
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const siteUrl = SITE_URL;
    
    // The homepage uses the layout's `default` title, so no brand suffix is
    // appended here — this string stands alone and must carry the brand itself.
    const title = locale === 'de'
        ? 'Datumsrechner – Tage berechnen, addieren & Arbeitstage'
        : 'Date Calculator – Days Between Dates, Add & Subtract';
    
    const description = locale === 'de' 
        ? 'Datumsrechner online: Datumsdifferenz, Arbeitstage & Alter kostenlos berechnen. Mit vollständiger Schaltjahrregel und Kalenderwochen nach ISO 8601. Ohne Anmeldung.'
        : 'Online date calculator: calculate date differences, business days & age for free. Full leap-year rule, calendar weeks per ISO 8601. No registration.';

    return buildPageMetadata({
        locale,
        title,
        description,
        path: locale === 'de' ? '/' : `/${locale}`,
        pathForLocale: (loc) => (loc === 'de' ? '/' : `/${loc}`)
    });
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'Header' });

    return (
        <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 lg:pt-32 lg:pb-32">
            {/* The homepage is the calculator, so it declares the application. */}
            <WebApplicationSchema locale={locale} />
            {/*
              Page order follows Solve -> Continue -> Understand -> Explore.
              Previously the calculator was the fifth thing on the page, below a
              search box, a chip row, an anchor button and four cards that all
              linked away — four competing entry points, none of which was the
              tool. Someone arriving to calculate a date had to choose a route
              before they could do anything. The tool now comes first and the
              routes come after it.
            */}

            {/* ── Solve ─────────────────────────────────────────────── */}
            <header className="space-y-6 animate-slide-up-fade">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold uppercase tracking-widest text-blue-700">
                    <span className="w-2 h-2 rounded-full bg-blue-600" aria-hidden="true"></span>
                    {locale === 'de' ? 'Gregorianischer Kalender' : 'Gregorian calendar'}
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.02] text-slate-900 text-balance">
                    {locale === 'de' ? (
                        <>Präziser <span className="text-blue-700">Datumsrechner</span> für alle Fristen.</>
                    ) : (
                        <>Precise <span className="text-blue-700">Date Calculator</span> for every deadline.</>
                    )}
                </h1>

                <p className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed">
                    {locale === 'de'
                        ? 'Tage zwischen zwei Daten zählen, Tage zu einem Datum addieren, Netto-Arbeitstage ermitteln oder ein Alter bestimmen. Jede Berechnung folgt dem gregorianischen Kalender mit vollständiger Schaltjahrregel; Kalenderwochen nach ISO 8601.'
                        : 'Count the days between two dates, add days to a date, work out net business days or determine an age. Every calculation follows the Gregorian calendar with the full leap-year rule; calendar weeks per ISO 8601.'}
                </p>

                <LiveDatePreview locale={locale} />
            </header>

            {/* The tool itself — first interactive element on the page. */}
            <section
                aria-labelledby="calculator-heading"
                className="mt-10 w-full rounded-2xl border border-slate-200 bg-white p-5 md:p-8 shadow-lg animate-slide-up-fade"
            >
                <h2 id="calculator-heading" className="text-2xl font-bold text-slate-900 mb-1">
                    {locale === 'de' ? 'Datum berechnen' : 'Calculate a date'}
                </h2>
                <p className="text-slate-600 mb-6">
                    {locale === 'de'
                        ? 'Rechner wählen, Daten eintragen – das Ergebnis erscheint sofort darunter.'
                        : 'Pick a calculator, enter your dates – the result appears below straight away.'}
                </p>
                <CalculatorCore />
            </section>

            {/* ── Understand: what it does, how it works, common questions ── */}
            <HomepageSEO locale={locale} part="understand" />

            {/* ── Explore ───────────────────────────────────────────── */}
            <h2 id="tools-heading" className="text-2xl font-bold text-slate-900 mt-20 mb-2">
                {locale === 'de' ? 'Alle Rechner' : 'All calculators'}
            </h2>
            <p className="text-slate-600 mb-6 max-w-2xl">
                {locale === 'de'
                    ? 'Jeder Rechner hat eine eigene Seite mit Erklärung und Beispielen.'
                    : 'Each calculator has its own page with an explanation and examples.'}
            </p>
            <section id="tools" aria-labelledby="tools-heading" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 animate-slide-up-fade">
                <Link href={ROUTES.differenz} className="group p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition-all shadow-sm text-left flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                        <SplitSquareHorizontal className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-slate-900 font-bold text-lg mb-1">{locale === 'de' ? 'Datumsdifferenz' : 'Date Difference'}</h3>
                        <p className="text-slate-600 text-sm leading-snug">{locale === 'de' ? 'Tage zwischen zwei Daten berechnen' : 'Calculate days between two dates'}</p>
                    </div>
                </Link>
                <Link href={ROUTES.addieren} className="group p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition-all shadow-sm text-left flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 group-hover:scale-110 transition-transform">
                        <PlusSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-slate-900 font-bold text-lg mb-1">{locale === 'de' ? 'Datum addieren' : 'Add to Date'}</h3>
                        <p className="text-slate-600 text-sm leading-snug">{locale === 'de' ? 'Tage addieren oder abziehen' : 'Add or subtract days from a date'}</p>
                    </div>
                </Link>
                <Link href={ROUTES.arbeitstage} className="group p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition-all shadow-sm text-left flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-slate-900 font-bold text-lg mb-1">{locale === 'de' ? 'Arbeitstage' : 'Business Days'}</h3>
                        <p className="text-slate-600 text-sm leading-snug">{locale === 'de' ? 'Netto-Arbeitstage ermitteln' : 'Calculate net business days'}</p>
                    </div>
                </Link>
                <Link href={ROUTES.alter} className="group p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition-all shadow-sm text-left flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-slate-900 font-bold text-lg mb-1">{locale === 'de' ? 'Alter berechnen' : 'Age Calculator'}</h3>
                        <p className="text-slate-600 text-sm leading-snug">{locale === 'de' ? 'Genaues Alter in Tagen & Jahren' : 'Exact age in days and years'}</p>
                    </div>
                </Link>
            </section>



            {/*
              Prepared pages for the most-searched spans. These are navigation,
              not a second calculator: each chip is a crawlable link to a page
              that already states its answer. The free-text box sits here for
              the same reason — it routes to a prepared page rather than
              calculating, so it belongs beside the links and not above the tool.
            */}
            <section aria-labelledby="common-heading" className="mb-20 animate-slide-up-fade">
                <h2 id="common-heading" className="text-2xl font-bold text-slate-900 mb-2">
                    {locale === 'de' ? 'Häufige Berechnungen' : 'Common calculations'}
                </h2>
                <p className="text-slate-600 mb-6 max-w-2xl">
                    {locale === 'de'
                        ? 'Fertige Seiten mit Antwort, Wochentag und Kalenderwoche.'
                        : 'Ready-made pages with the answer, weekday and calendar week.'}
                </p>
                <QuickShortcuts locale={locale} />
                <div className="mt-8">
                    <SmartInputBar />
                </div>
            </section>

            <HomepageSEO locale={locale} part="explore" />
        </div>
    );
}

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}
