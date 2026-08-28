import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/routing';
import { SITE_URL, DOMAIN } from '@/lib/constants';

export const revalidate = 86400; // 24 hours
export const dynamic = 'force-static';
import { INTENT_TRANSLATIONS, getCanonicalPath } from '@/lib/seo/translations';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { CalculatorCore } from '@/components/calculator/CalculatorCore';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'Common.titles' });
    const siteUrl = SITE_URL;
    const fullUrl = `${siteUrl}${getCanonicalPath(locale, 'ueber-uns')}`;

    return buildPageMetadata({
        locale,
        title: locale === 'de' ? 'Über uns' : 'About us',
        description: locale === 'de' 
            ? `Erfahren Sie mehr über die Mission von ${DOMAIN}. Wie wir Kalenderlogik vereinfachen und höchste Präzision nach ISO-8601 bieten.`
            : `Learn more about the mission of ${DOMAIN}. How we simplify calendar logic and offer maximum precision according to ISO-8601.`,
        path: getCanonicalPath(locale, 'ueber-uns'),
        pathForLocale: (loc) => getCanonicalPath(loc, 'ueber-uns')
    });
}

export default async function AboutUsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'Common.titles' });

    return (
        <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/*
              No WebApplicationSchema here. The page embeds a CalculatorCore as
              a demonstration, but the page is about the project — the
              calculator is an illustration on it, not what it is.
            */}
            <Breadcrumbs
                className="mb-8"
                items={[
                    { name: locale === 'de' ? 'Startseite' : 'Home', item: locale === 'de' ? '/' : `/${locale}` },
                    { name: locale === 'de' ? 'Über uns' : 'About us', item: getCanonicalPath(locale, 'ueber-uns') }
                ]}
            />
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-12 tracking-tight text-center">
                {locale === 'de' ? (
                    <>Wir machen Zeit <span className="text-accent underline decoration-accent/20">berechenbar</span>.</>
                ) : (
                    <>We make time <span className="text-accent underline decoration-accent/20">calculable</span>.</>
                )}
            </h1>

            <div className="prose prose-lg max-w-4xl mx-auto space-y-16 mt-16 leading-relaxed">

                {/* Mission Section */}
                <section className="bg-white border border-slate-200 p-10 rounded-2xl shadow-sm">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">
                        {locale === 'de' ? 'Unsere Mission' : 'Our Mission'}
                    </h2>
                    <p className="text-slate-700 text-xl leading-relaxed">
                        {locale === 'de'
                            ? 'In einer digitalisierten Welt sind exakte Zeitspannen und Fristen oft entscheidend – sei es für berufliche Projekte, rechtliche Zeitrahmen oder persönliche Meilensteine. Unsere Mission ist es, komplexe Datumsberechnungen für jeden zugänglich, schnell und mathematisch präzise zu machen. \n\nWas als kleines Tool für den Eigenbedarf begann, hat sich zu einer umfassenden Plattform für Zeitmanagement-Tools entwickelt. Wir glauben fest daran, dass Präzision kein Privileg von Experten sein sollte, sondern ein Standard für alle Internetnutzer.'
                            : 'In a digitized world, exact time spans and deadlines are often crucial – whether for professional projects, legal timeframes, or personal milestones. Our mission is to make complex date calculations accessible to everyone, fast and mathematically precise. \n\nWhat began as a small tool for our own use has developed into a comprehensive platform for time management tools. We firmly believe that precision should not be a privilege of experts, but a standard for all internet users.'}
                    </p>
                </section>

                {/* Team & Author Section */}
                <section className="bg-white border border-slate-200 p-10 rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-8">
                    {/*
                      A profile for "Felix Schmidt" stood here, described as
                      "Lead Developer & Kalender-Experte" while the same name
                      appeared on the guides as "Mathematiker & Autor" and the
                      Impressum named a different operator entirely. The person
                      did not exist, so the section describes the method rather
                      than inventing someone to vouch for it.
                    */}
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">
                            {locale === 'de' ? 'Wie gerechnet wird' : 'How the calculation works'}
                        </h2>
                        <p className="text-slate-700 text-lg leading-relaxed">
                            {locale === 'de'
                                ? 'Alle Berechnungen laufen über eine gemeinsame Kalender-Bibliothek: Datumsarithmetik erfolgt auf ganzen Kalendertagen, nicht auf Zeitstempeln. Dadurch kann eine Zeitumstellung kein Datum um einen Tag verschieben. Die Schaltjahrregel, die Monatslängen und die ISO-8601-Kalenderwochen sind durch automatisierte Tests abgedeckt, inklusive der Grenzfälle um den 29. Februar und den Jahreswechsel.'
                                : 'Every calculation runs through one shared calendar library: date arithmetic works on whole calendar days rather than timestamps, so a daylight-saving change cannot shift a date by a day. The leap-year rule, month lengths and ISO 8601 calendar weeks are covered by automated tests, including the edge cases around February 29 and the turn of the year.'}
                        </p>
                    </div>
                </section>

                {/* Authority & Trust Section */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">
                            {locale === 'de' ? 'Präzision ohne Kompromisse' : 'Precision without Compromise'}
                        </h2>
                        <p className="text-slate-700 mb-6">
                            {locale === 'de'
                                ? 'Die Rechenlogik bildet den gregorianischen Kalender mit der vollständigen Schaltjahrregel ab und berücksichtigt die unterschiedlichen Monatslängen. Kalenderwochen folgen ISO 8601 – dem Standard für die Darstellung von Datumsangaben, der die Woche am Montag beginnen lässt und die erste Woche eines Jahres über den ersten Donnerstag bestimmt.\n\nGesetzliche Feiertage werden bei den Arbeitstagen derzeit nicht automatisch abgezogen; herausgefiltert werden Samstage und Sonntage.'
                                : 'The calculation maps the Gregorian calendar with the full leap-year rule and accounts for varying month lengths. Calendar weeks follow ISO 8601 – the standard for representing dates, which starts the week on Monday and defines the first week of a year by its first Thursday.\n\nPublic holidays are not currently deducted automatically from business days; Saturdays and Sundays are filtered out.'}
                        </p>
                    </div>
                    {/* "100% Mathematisch exakt" was here — a claim no
                        implementation can support. States the actual basis instead. */}
                    <div className="bg-blue-50 border border-blue-200 p-8 rounded-2xl flex flex-col justify-center gap-3">
                        <span className="text-sm font-bold uppercase tracking-widest text-slate-500">
                            {locale === 'de' ? 'Rechengrundlage' : 'Calculation basis'}
                        </span>
                        <ul className="text-slate-700 space-y-2 text-left">
                            <li>{locale === 'de' ? 'Gregorianischer Kalender' : 'Gregorian calendar'}</li>
                            <li>{locale === 'de' ? 'Vollständige Schaltjahrregel (4 / 100 / 400)' : 'Full leap-year rule (4 / 100 / 400)'}</li>
                            <li>{locale === 'de' ? 'Kalenderwochen nach ISO 8601' : 'Calendar weeks per ISO 8601'}</li>
                            <li>{locale === 'de' ? 'Stichtag in der Zeitzone Europe/Berlin' : 'Reference day in the Europe/Berlin timezone'}</li>
                        </ul>
                    </div>
                </section>

                {/* Technical Vision */}
                <section className="space-y-6">
                    <h2 className="text-3xl font-bold text-slate-900">
                        {locale === 'de' ? 'Unsere technologische Vision' : 'Our Technological Vision'}
                    </h2>
                    <p className="text-slate-700">
                        {locale === 'de'
                            ? `${DOMAIN} läuft auf Next.js und wird als statische Seite ausgeliefert, damit die Ergebnisse ohne Wartezeit erscheinen – auch auf mobilen Endgeräten. Die datumsabhängigen Seiten werden täglich zum Berliner Datumswechsel neu erzeugt.\n\nGeplant sind weitere Spezialrechner, etwa für Kalenderwochen und Fristen.`
                            : `${DOMAIN} runs on Next.js and is served as a static site, so results appear without waiting – on mobile devices too. Date-dependent pages are regenerated daily at the Berlin date boundary.\n\nFurther specialised calculators are planned, for calendar weeks and deadlines among others.`}
                    </p>
                </section>

                {/* EEAT Signals */}
                <section className="border-l-4 border-accent pl-10 space-y-6">
                    <h2 className="text-3xl font-bold text-slate-900">
                        {locale === 'de' ? 'Transparenz & Qualität' : 'Transparency & Quality'}
                    </h2>
                    {/*
                      This claimed the project was funded by "dezente
                      Werbeanzeigen und Affiliate-Links". There are none: no ad
                      network is loaded and no affiliate link is rendered
                      anywhere on the site. It was the only page asserting a
                      monetization that does not exist, and it is what the
                      homepage's removed "keine Werbung" line was contradicting.
                      The contradiction is resolved by deleting the false half.

                      Deliberately no replacement claim about funding. "Derzeit
                      werbefrei" would be true today and silently false the day
                      an ad script ships — the same decay this codebase keeps
                      removing elsewhere. What is stated below is only what the
                      code does, which stays true either way.
                    */}
                    <p className="text-slate-700 leading-relaxed text-lg">
                        {locale === 'de'
                            ? 'Der Datumsrechner ist ohne Anmeldung nutzbar. Die Daten, die Sie in den Rechner eingeben, werden im Browser verarbeitet und nicht an uns übertragen. Wie jede Berechnung zustande kommt, steht offen dokumentiert unter „Wie wir rechnen“ – einschließlich der Fälle, die der Rechner bewusst nicht abdeckt.'
                            : 'The date calculator works without registration. The dates you type into it are processed in your browser and are not transmitted to us. How every calculation is produced is documented openly under “How we calculate” – including the cases the calculator deliberately does not cover.'}
                    </p>
                </section>

                <section className="text-center bg-white rounded-2xl p-12 border border-slate-200 mt-16 shadow-sm">
                    <h2 className="text-2xl font-bold mb-8 text-slate-900">Testen Sie unsere Engine</h2>
                    <div className="max-w-3xl mx-auto">
                        <CalculatorCore />
                    </div>
                </section>
            </div>
        </div>
    );
}

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}
