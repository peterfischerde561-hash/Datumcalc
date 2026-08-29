import { setRequestLocale } from 'next-intl/server';
import NextLink from 'next/link';
import { ChevronRight } from 'lucide-react';
import { SITE_URL } from '@/lib/constants';
import { getCanonicalPath } from '@/lib/seo/translations';
import { buildPageMetadata, canonicalUrl } from '@/lib/seo/metadata';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { CANONICAL_TIMEZONE, getTodayInTimeZone } from '@/lib/date/civil';
import { formatCivilDate } from '@/lib/date/civil';
import { getLeapYearFacts } from '@/lib/seo/guideFacts';

export const revalidate = 3600;
export const dynamic = 'force-static';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const isDe = locale === 'de';

    return buildPageMetadata({
        locale,
        title: isDe ? 'Wie wir rechnen' : 'How we calculate',
        description: isDe
            ? 'Die Rechengrundlage im Detail: gregorianischer Kalender, Schaltjahrregel, inklusive und exklusive Zählweise, Kalenderwochen nach ISO 8601, Zeitzone und Arbeitstage.'
            : 'The calculation basis in detail: Gregorian calendar, leap-year rule, inclusive and exclusive counting, ISO 8601 calendar weeks, timezone handling and business days.',
        path: getCanonicalPath(locale, 'methodik'),
        pathForLocale: (loc) => getCanonicalPath(loc, 'methodik')
    });
}

/**
 * Methodology page.
 *
 * States only what the implementation actually does, including where it stops.
 * It exists because the site previously asserted quality instead of showing it
 * ("100% mathematische Genauigkeit", "Verifizierte Rechenlogik"). Those claims
 * are gone; this is what replaces them. It is also the one place the
 * methodology is written down, rather than a paragraph duplicated onto every
 * programmatic page.
 *
 * Anything added here must be true of the code. If a limitation is
 * uncomfortable — public holidays are not deducted — it is stated, not omitted.
 */
export default async function MethodologyPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const isDe = locale === 'de';

    const today = getTodayInTimeZone();
    const leap = getLeapYearFacts(today);
    const path = getCanonicalPath(locale, 'methodik');

    const breadcrumbItems = [
        { name: isDe ? 'Startseite' : 'Home', item: canonicalUrl(locale === 'de' ? '/' : `/${locale}`) },
        { name: isDe ? 'Wie wir rechnen' : 'How we calculate', item: `${SITE_URL}${path}` }
    ];

    const sections = isDe
        ? [
              {
                  h: 'Kalender',
                  body: [
                      'Alle Berechnungen verwenden den gregorianischen Kalender – auch für Datumsangaben vor seiner Einführung 1582 (proleptische Anwendung). Historische Kalenderumstellungen einzelner Länder werden nicht abgebildet.',
                      'Gerechnet wird auf ganzen Kalendertagen, nicht auf Zeitstempeln. Ein Datum hat in dieser Logik keine Uhrzeit.'
                  ]
              },
              {
                  h: 'Schaltjahre',
                  body: [
                      'Ein Jahr ist ein Schaltjahr, wenn es durch 4 teilbar ist – außer es ist durch 100 teilbar, dann nicht; außer es ist zusätzlich durch 400 teilbar, dann doch. Deshalb war 2000 ein Schaltjahr und 1900 keines.',
                      `Nach dieser Regel ist das nächste Schaltjahr ${leap.nextLeapYear}, und ${leap.nextSkippedCentury} fällt als volles Jahrhundert aus.`
                  ]
              },
              {
                  h: 'Zählweise: inklusive oder exklusive',
                  body: [
                      'Die Datumsdifferenz zählt standardmäßig die vollen Tage zwischen zwei Daten (exklusive Zählweise). Vom 1. bis zum 3. März sind das 2 Tage.',
                      'Zählt man beide Endtage mit (inklusive Zählweise), ergibt sich ein Tag mehr. Für Aufenthaltsdauern – etwa Hotelnächte – ist meist die exklusive Zählweise gemeint.'
                  ]
              },
              {
                  h: 'Monate und Jahre addieren',
                  body: [
                      'Beim Addieren von Monaten wird auf das Monatsende begrenzt, wenn der Zieltag nicht existiert: 31. Januar plus ein Monat ergibt den 28. Februar, im Schaltjahr den 29. Februar.',
                      'Dasselbe gilt für Jahre: Der 29. Februar plus ein Jahr ergibt in einem Gemeinjahr den 28. Februar. Diese Begrenzung ist nicht umkehrbar – ein Monat vor und zurück führt nicht zwingend zum Ausgangsdatum.'
                  ]
              },
              {
                  h: 'Kalenderwochen nach ISO 8601',
                  body: [
                      'Die Woche beginnt am Montag. Kalenderwoche 1 ist die Woche, die den ersten Donnerstag des Jahres enthält. Dadurch kann der 1. Januar noch zur letzten Woche des Vorjahres gehören und der 31. Dezember bereits zur Woche 1 des Folgejahres.',
                      'Aus derselben Regel folgt, dass manche Jahre 53 Kalenderwochen haben.'
                  ]
              },
              {
                  h: 'Arbeitstage und Feiertage',
                  body: [
                      'Als Arbeitstage gelten Montag bis Freitag. Samstage und Sonntage werden herausgefiltert.',
                      'Gesetzliche Feiertage werden nur abgezogen, wenn Sie ein Bundesland auswählen – ohne Auswahl bleiben sie im Ergebnis, weil ohne Bundesland nicht feststeht, welche Feiertage gelten. Fällt ein Feiertag auf ein Wochenende, wird er nicht doppelt abgezogen.',
                      'Die Feiertagsdaten werden berechnet, nicht jahrweise gepflegt: feste Termine aus Monat und Tag, bewegliche aus dem Osterdatum. Karfreitag liegt zwei Tage vor Ostersonntag, Christi Himmelfahrt 39 Tage danach, Fronleichnam 60. Der Buß- und Bettag ist der Mittwoch vor dem 23. November.',
                      'Nicht abgebildet sind Feiertage, die innerhalb eines Bundeslandes auf Gemeindeebene gelten: Fronleichnam in Teilen von Sachsen und Thüringen sowie Mariä Himmelfahrt in überwiegend katholischen Gemeinden Bayerns. Diese Fälle lassen sich am Bundesland allein nicht entscheiden, deshalb zählt der Rechner sie nicht als Feiertag.'
                  ]
              },
              {
                  h: 'Zeitzone und Stichtag',
                  body: [
                      `Als „heute" gilt der laufende Kalendertag in der Zeitzone ${CANONICAL_TIMEZONE}. Dieser Stichtag ist für alle Besucher identisch, unabhängig vom eigenen Standort – nur so nennt jede Seite dieselbe Antwort.`,
                      'Die Datumsarithmetik selbst arbeitet ohne Zeitzone. Eine Sommer-/Winterzeitumstellung kann ein Ergebnis daher nicht um einen Tag verschieben.'
                  ]
              },
              {
                  h: 'Aktualität',
                  body: [
                      `Datumsabhängige Seiten werden stündlich neu erzeugt und zusätzlich einmal täglich nach Mitternacht in der Zeitzone ${CANONICAL_TIMEZONE}. Der aktuelle Stichtag dieser Seite ist der ${formatCivilDate(today)}.`
                  ]
              },
              {
                  h: 'Grenzen',
                  body: [
                      'Nicht abgebildet werden: gesetzliche Feiertage, Schaltsekunden, historische Kalenderreformen, nicht-gregorianische Kalender und Zeitzonen außerhalb des Stichtags.',
                      'Wenn eine Frist rechtlich zählt, prüfen Sie das Ergebnis gegen die maßgebliche Regelung. Dieser Rechner ist ein Werkzeug, keine Rechtsauskunft.'
                  ]
              }
          ]
        : [
              {
                  h: 'Calendar',
                  body: [
                      'All calculations use the Gregorian calendar, including for dates before its introduction in 1582 (proleptic use). Country-specific historical calendar reforms are not modelled.',
                      'Arithmetic runs on whole calendar days rather than timestamps. A date has no time of day in this model.'
                  ]
              },
              {
                  h: 'Leap years',
                  body: [
                      'A year is a leap year when it is divisible by 4 – except when divisible by 100, in which case it is not; except when it is also divisible by 400, in which case it is. That is why 2000 was a leap year and 1900 was not.',
                      `By that rule the next leap year is ${leap.nextLeapYear}, and ${leap.nextSkippedCentury} is skipped as a full century.`
                  ]
              },
              {
                  h: 'Counting: inclusive or exclusive',
                  body: [
                      'The date difference counts the full days between two dates by default (exclusive). From 1 March to 3 March is 2 days.',
                      'Counting both endpoints (inclusive) gives one more day. For stays – hotel nights, for instance – the exclusive count is usually what is meant.'
                  ]
              },
              {
                  h: 'Adding months and years',
                  body: [
                      'Adding months clamps to the end of the month when the target day does not exist: 31 January plus one month is 28 February, or 29 February in a leap year.',
                      'The same applies to years: 29 February plus one year is 28 February in a common year. This clamping is not reversible – a month forward and back does not always return the original date.'
                  ]
              },
              {
                  h: 'ISO 8601 calendar weeks',
                  body: [
                      'The week starts on Monday. Week 1 is the week containing the first Thursday of the year. As a result, 1 January can still belong to the last week of the previous year, and 31 December can already belong to week 1 of the next.',
                      'The same rule is why some years have 53 calendar weeks.'
                  ]
              },
              {
                  h: 'Business days and public holidays',
                  body: [
                      'Business days are Monday to Friday. Saturdays and Sundays are filtered out.',
                      'Public holidays are deducted only when you select a German state – without one they stay in the result, because which holidays apply is undetermined. A holiday falling on a weekend is not deducted twice.',
                      'Holiday dates are computed rather than maintained year by year: fixed ones from their month and day, movable ones from Easter. Good Friday is two days before Easter Sunday, Ascension 39 days after, Corpus Christi 60. Buß- und Bettag is the Wednesday before 23 November.',
                      'Not modelled: holidays that apply at municipality level within a state – Corpus Christi in parts of Saxony and Thuringia, and Assumption Day in predominantly Catholic municipalities of Bavaria. Neither can be decided from the state alone, so the calculator does not treat them as holidays.'
                  ]
              },
              {
                  h: 'Timezone and reference day',
                  body: [
                      `"Today" means the current calendar day in the ${CANONICAL_TIMEZONE} timezone. This reference day is the same for every visitor regardless of location – that is what lets every page state one answer.`,
                      'The date arithmetic itself is timezone-free, so a daylight-saving change cannot shift a result by a day.'
                  ]
              },
              {
                  h: 'Freshness',
                  body: [
                      `Date-dependent pages are regenerated hourly and again once daily after midnight in the ${CANONICAL_TIMEZONE} timezone. The current reference day for this page is ${formatCivilDate(today)}.`
                  ]
              },
              {
                  h: 'Limits',
                  body: [
                      'Not modelled: public holidays, leap seconds, historical calendar reforms, non-Gregorian calendars, and timezones other than the reference day.',
                      'Where a deadline matters legally, check the result against the governing rule. This calculator is a tool, not legal advice.'
                  ]
              }
          ];

    return (
        <div className="flex-1 w-full bg-surface text-ink">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <BreadcrumbSchema items={breadcrumbItems} />

                <nav aria-label="Breadcrumb" className="flex text-sm text-ink-3 items-center space-x-2 mb-8">
                    <NextLink href={locale === 'de' ? '/' : `/${locale}`} className="hover:text-accent hover:underline">
                        {isDe ? 'Startseite' : 'Home'}
                    </NextLink>
                    <ChevronRight className="w-4 h-4 text-ink-3" aria-hidden="true" />
                    <span className="text-ink-2 font-medium" aria-current="page">
                        {isDe ? 'Wie wir rechnen' : 'How we calculate'}
                    </span>
                </nav>

                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-ink mb-6">
                    {isDe ? 'Wie wir rechnen' : 'How we calculate'}
                </h1>

                <p className="text-xl text-ink-2 leading-relaxed mb-12">
                    {isDe
                        ? 'Diese Seite beschreibt die Regeln hinter jedem Ergebnis auf datums-rechner.com – einschließlich der Fälle, die der Rechner bewusst nicht abdeckt.'
                        : 'This page describes the rules behind every result on datums-rechner.com – including the cases the calculator deliberately does not cover.'}
                </p>

                <div className="space-y-10">
                    {sections.map((section) => (
                        <section key={section.h}>
                            <h2 className="text-2xl font-bold text-ink mb-3">{section.h}</h2>
                            <div className="space-y-3 text-lg text-ink-2 leading-relaxed">
                                {section.body.map((p) => (
                                    <p key={p}>{p}</p>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}
