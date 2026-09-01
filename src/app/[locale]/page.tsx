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
import { routeLabel } from '@/lib/seo/routeLabels';
import { Card, CardLink } from '@/components/ui/Card';
import { Badge, Chip } from '@/components/ui/Badge';

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

    // 1200px, matching the reference's --max-width.
    return (
        <div className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-16 lg:py-20">
            {/* pt-28 lg:pt-32 stood here to clear a fixed header. The header is
                sticky now and occupies its own space, so this is ordinary page
                padding rather than a manual offset the other ten routes
                forgot. */}
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

            {/*
              ── Solve ─────────────────────────────────────────────────
              Centred hero, matching .hero-centered: a row of badges stating
              what the tool is, then the h1 saying what it does, then a single
              lead paragraph, then the calculator. The badges come first
              because they answer "is this the right kind of page" in less time
              than a heading does.
            */}
            <header className="max-w-[780px] mx-auto text-center animate-slide-up-fade">
                <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                    <Badge tone="accent">
                        {locale === 'de' ? 'Gregorianischer Kalender' : 'Gregorian calendar'}
                    </Badge>
                    <Badge tone="neutral">ISO 8601</Badge>
                    <Badge tone="success">
                        {locale === 'de' ? 'Ohne Anmeldung' : 'No sign-up'}
                    </Badge>
                </div>

                {/* No size classes: globals.css sizes h1 fluidly with clamp(). */}
                <h1 className="mb-4">
                    {locale === 'de' ? (
                        <>Präziser <span className="text-accent">Datumsrechner</span> für alle Fristen.</>
                    ) : (
                        <>Precise <span className="text-accent">Date Calculator</span> for every deadline.</>
                    )}
                </h1>

                <p className="text-[1.1rem] text-ink-2 max-w-[640px] mx-auto leading-[1.7]">
                    {locale === 'de'
                        ? 'Tage zwischen zwei Daten zählen, Tage zu einem Datum addieren, Netto-Arbeitstage ermitteln oder ein Alter bestimmen. Vollständige Schaltjahrregel, Kalenderwochen nach ISO 8601.'
                        : 'Count the days between two dates, add days to a date, work out net business days or determine an age. Full leap-year rule, calendar weeks per ISO 8601.'}
                </p>
            </header>

            {/* The tool itself — first interactive element on the page. */}
            <Card
                as="section"
                aria-labelledby="calculator-heading"
                padding="roomy"
                className="mt-10 animate-slide-up-fade"
            >
                <h2 id="calculator-heading" className="sr-only">
                    {locale === 'de' ? 'Datum berechnen' : 'Calculate a date'}
                </h2>
                <CalculatorCore />
            </Card>

            {/*
              Suggestion chips, matching .suggestion-row. These are links to
              real pages rather than controls that prefill the box: a crawlable
              path from the homepage to the URLs that actually earn traffic.
            */}
            <nav
                aria-label={locale === 'de' ? 'Häufige Berechnungen' : 'Common calculations'}
                className="flex flex-wrap justify-center gap-2 mt-6"
            >
                {(locale === 'de'
                    ? [
                        { href: '/differenz/tage-bis-weihnachten', label: 'Tage bis Weihnachten' },
                        { href: '/addieren/100-tage-ab-heute', label: '100 Tage ab heute' },
                        { href: '/addieren/6-monate-ab-heute', label: '6 Monate ab heute' },
                        { href: '/differenz/tage-bis-ostern', label: 'Tage bis Ostern' }
                    ]
                    : [
                        { href: '/en/difference/days-until-christmas', label: 'Days until Christmas' },
                        { href: '/en/add/100-days-from-today', label: '100 days from today' },
                        { href: '/en/add/6-months-from-today', label: '6 months from today' },
                        { href: '/en/difference/days-until-easter', label: 'Days until Easter' }
                    ]
                ).map((chip) => (
                    <Chip key={chip.href} href={chip.href}>{chip.label}</Chip>
                ))}
            </nav>

            <div className="mt-10">
                <LiveDatePreview locale={locale} />
            </div>

            {/* ── Understand: what it does, how it works, common questions ── */}
            <HomepageSEO locale={locale} part="understand" />

            {/* ── Explore ───────────────────────────────────────────── */}
            <h2 id="tools-heading" className="text-2xl font-bold text-ink mt-20 mb-2">
                {locale === 'de' ? 'Alle Rechner' : 'All calculators'}
            </h2>
            <p className="text-ink-2 mb-6 max-w-2xl">
                {locale === 'de'
                    ? 'Jeder Rechner hat eine eigene Seite mit Erklärung und Beispielen.'
                    : 'Each calculator has its own page with an explanation and examples.'}
            </p>
            {/*
              Four near-identical cards written out four times, each retyping a
              label and description that routeLabels.ts already owns — the same
              source the nav, breadcrumbs, footer and related links read. That
              is exactly how one URL came to be called "Differenz" in the nav,
              "Tage Zählen" in the breadcrumb and "Datumsdifferenz" here.

              The icon chips were purple, blue, sky and green: four arbitrary
              hues carrying no meaning, and the source of several of the
              one-off colours the audit found. One accent now.
            */}
            <section id="tools" aria-labelledby="tools-heading" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 animate-slide-up-fade">
                {([
                    { key: 'differenz', href: ROUTES.differenz, Icon: SplitSquareHorizontal },
                    { key: 'addieren', href: ROUTES.addieren, Icon: PlusSquare },
                    { key: 'arbeitstage', href: ROUTES.arbeitstage, Icon: Briefcase },
                    { key: 'alter', href: ROUTES.alter, Icon: User }
                ] as const).map(({ key, href, Icon }) => {
                    const label = routeLabel(key, locale);
                    return (
                        <CardLink key={key} className="group">
                            <Link href={href} className="flex flex-col gap-3 p-5 text-left outline-none">
                                <span className="w-10 h-10 rounded-xl bg-accent-dim flex items-center justify-center text-accent shrink-0">
                                    <Icon className="w-5 h-5" aria-hidden="true" />
                                </span>
                                <span>
                                    <h3 className="text-ink font-bold text-lg mb-1 group-hover:text-accent transition-colors">
                                        {label.label}
                                    </h3>
                                    <span className="block text-ink-2 text-sm leading-snug">
                                        {label.description}
                                    </span>
                                </span>
                            </Link>
                        </CardLink>
                    );
                })}
            </section>



            {/*
              Prepared pages for the most-searched spans. These are navigation,
              not a second calculator: each chip is a crawlable link to a page
              that already states its answer. The free-text box sits here for
              the same reason — it routes to a prepared page rather than
              calculating, so it belongs beside the links and not above the tool.
            */}
            <section aria-labelledby="common-heading" className="mb-20 animate-slide-up-fade">
                <h2 id="common-heading" className="text-2xl font-bold text-ink mb-2">
                    {locale === 'de' ? 'Häufige Berechnungen' : 'Common calculations'}
                </h2>
                <p className="text-ink-2 mb-6 max-w-2xl">
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
