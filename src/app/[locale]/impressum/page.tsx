import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/routing';
import { SITE_URL, DOMAIN } from '@/lib/constants';

export const revalidate = 86400; // 24 hours
export const dynamic = 'force-static';
import { INTENT_TRANSLATIONS, getCanonicalPath } from '@/lib/seo/translations';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'Common.titles' });
    const siteUrl = SITE_URL;
    const fullUrl = `${siteUrl}${getCanonicalPath(locale, 'impressum')}`;

    return buildPageMetadata({
        locale,
        title: locale === 'de' ? 'Impressum' : 'Imprint & Legal Notice',
        description: locale === 'de'
            ? `Impressum und gesetzliche Anbieterkennzeichnung für ${DOMAIN}. Erfahren Sie mehr über unsere Transparenz, Kontaktmöglichkeiten und Rechtssicherheit.`
            : `Imprint and legal provider identification for ${DOMAIN}. Find all contact details, legal notice, and regulatory information about our website.`,
        path: getCanonicalPath(locale, 'impressum'),
        pathForLocale: (loc) => getCanonicalPath(loc, 'impressum')
    });
}

export default async function ImprintPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'Common.titles' });

    return (
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-12 tracking-tight">
                {t('imprint')}
            </h1>

            <div className="prose prose-lg max-w-none space-y-12">
                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Angaben gemäß § 5 DDG</h2>
                    <p className="text-slate-700 leading-relaxed font-bold">
                        Betreiber der Website:<br />
                        Sheikh Farooq <br />
                        [Deine Straße / Hausnummer] <br />
                        [Deine PLZ / Stadt]
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Kontakt</h2>
                    <p className="text-slate-700 leading-relaxed">
                        Wir legen großen Wert auf Transparenz und Erreichbarkeit. Sollten Sie Fragen zu unseren Berechnungen oder technische Anregungen haben, können Sie uns jederzeit kontaktieren.<br /><br />
                        E-Mail: info@{DOMAIN} <br />
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                        {locale === 'de' ? 'Unsere Mission: Kalendarische Präzision' : 'Our Mission: Calendar Precision'}
                    </h2>
                    <p className="text-slate-700 leading-relaxed">
                        {locale === 'de'
                            ? `Die Website ${DOMAIN} wurde mit dem Ziel entwickelt, komplexe Zeitberechnungen für jedermann zugänglich zu machen. Zeit ist unsere kostbarste Ressource, und wir glauben, dass Werkzeuge zur Verwaltung dieser Ressource präzise, schnell und kostenlos sein sollten. \n\nDie Berechnungen bilden den gregorianischen Kalender mit der vollständigen Schaltjahrregel und den unterschiedlichen Monatslängen ab; Kalenderwochen folgen ISO 8601.`
                            : `The ${DOMAIN} website was developed with the goal of making complex time calculations accessible to everyone. Time is our most precious resource, and we believe that tools for managing this resource should be precise, fast, and free. \n\nThe calculations map the Gregorian calendar with the full leap-year rule and varying month lengths; calendar weeks follow ISO 8601.`}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                        {locale === 'de' ? 'Transparenz & Vertrauen' : 'Transparency & Trust'}
                    </h2>
                    <p className="text-slate-700 leading-relaxed italic">
                        {locale === 'de'
                            ? 'Die Arbeitstage-Berechnung filtert derzeit Samstage und Sonntage; gesetzliche Feiertage werden nicht automatisch abgezogen, da sie je nach Bundesland unterschiedlich sind. Eine Erweiterung um länderspezifische Feiertage ist vorgesehen.'
                            : 'The business-day calculation currently filters Saturdays and Sundays; public holidays are not deducted automatically, because they differ by federal state. Support for region-specific holidays is planned.'}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
                    <p className="text-slate-700 leading-relaxed">
                        Sheikh Farooq <br />
                        [Adresse siehe oben]
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Haftung für Inhalte</h2>
                    <p className="text-slate-700 leading-relaxed">
                        Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen. Haftungsansprüche, die sich auf Schäden materieller oder ideeller Art beziehen, welche durch die Nutzung der dargebotenen Informationen verursacht wurden, sind grundsätzlich ausgeschlossen, sofern kein nachweislich vorsätzliches oder grob fahrlässiges Verschulden vorliegt.
                    </p>
                </section>
            </div>
        </main>
    );
}

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}
