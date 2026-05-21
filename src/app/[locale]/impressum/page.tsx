import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/routing';
import { SITE_URL, DOMAIN } from '@/lib/constants';

export const revalidate = 86400; // 24 hours
export const dynamic = 'force-static';
import { INTENT_TRANSLATIONS, getCanonicalPath } from '@/lib/seo/translations';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'Common.titles' });
    const siteUrl = SITE_URL;
    const fullUrl = `${siteUrl}${getCanonicalPath(locale, 'impressum')}`;

    // Build hreflang alternates
    const languages: Record<string, string> = {};
    locales.forEach(loc => {
        languages[loc] = `${siteUrl}${getCanonicalPath(loc, 'impressum')}`;
    });
    languages['x-default'] = `${siteUrl}${getCanonicalPath('de', 'impressum')}`;

    return {
        title: locale === 'de' ? 'Impressum' : 'Imprint & Legal Notice',
        description: locale === 'de' 
            ? `Impressum und gesetzliche Anbieterkennzeichnung für ${DOMAIN}. Erfahren Sie mehr über unsere Transparenz, Kontaktmöglichkeiten und Rechtssicherheit.`
            : `Imprint and legal provider identification for ${DOMAIN}. Find all contact details, legal notice, and regulatory information about our website.`,
        alternates: {
            canonical: fullUrl,
            languages
        },
        openGraph: {
            title: locale === 'de' ? 'Impressum' : 'Imprint & Legal Notice',
            description: `Rechtliche Informationen von ${DOMAIN}.`,
            url: fullUrl,
            type: 'website',
            locale: locale,
        }
    };
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

            <div className="prose prose-invert prose-lg max-w-none space-y-12">
                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">Angaben gemäß § 5 TMG</h2>
                    <p className="text-white/70 leading-relaxed font-bold">
                        Betreiber der Website:<br />
                        Sheikh Farooq <br />
                        [Deine Straße / Hausnummer] <br />
                        [Deine PLZ / Stadt]
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">Kontakt</h2>
                    <p className="text-white/70 leading-relaxed">
                        Wir legen großen Wert auf Transparenz und Erreichbarkeit. Sollten Sie Fragen zu unseren Berechnungen oder technische Anregungen haben, können Sie uns jederzeit kontaktieren.<br /><br />
                        E-Mail: info@{DOMAIN} <br />
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">
                        {locale === 'de' ? 'Unsere Mission: Kalendarische Präzision' : 'Our Mission: Calendar Precision'}
                    </h2>
                    <p className="text-white/70 leading-relaxed">
                        {locale === 'de'
                            ? `Die Website ${DOMAIN} wurde mit dem Ziel entwickelt, komplexe Zeitberechnungen für jedermann zugänglich zu machen. Zeit ist unsere kostbarste Ressource, und wir glauben, dass Werkzeuge zur Verwaltung dieser Ressource präzise, schnell und kostenlos sein sollten. \n\nUnsere Algorithmen werden regelmäßig nach ISO-8601 Standards geprüft. Dabei berücksichtigen wir nicht nur einfache Tagesadditionen, sondern auch tiefgehende kalendarische Verschiebungen, Schaltjahr-Logiken und unregelmäßige Monatszyklen. Jedes Ergebnis, das Sie auf dieser Seite sehen, ist das Resultat einer mathematisch verifizierten Kette von Berechnungen.`
                            : `The ${DOMAIN} website was developed with the goal of making complex time calculations accessible to everyone. Time is our most precious resource, and we believe that tools for managing this resource should be precise, fast, and free. \n\nOur algorithms are regularly checked according to ISO-8601 standards. We take into account not only simple day additions, but also deep calendar shifts, leap year logic, and irregular month cycles. Every result you see on this page is the result of a mathematically verified chain of calculations.`}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">
                        {locale === 'de' ? 'Transparenz & Vertrauen' : 'Transparency & Trust'}
                    </h2>
                    <p className="text-white/70 leading-relaxed italic">
                        {locale === 'de'
                            ? 'In einer digitalen Welt, die oft von ungenauen Informationen geprägt ist, setzen wir auf Fakten. Unser Team arbeitet kontinuierlich an der Erweiterung der Funktionalitäten, etwa der Integration länderspezifischer Feiertage für die Arbeitstage-Berechnung. Wir verstehen uns als Partner für Projektmanager, Juristen und Privatpersonen, die auf exakte Daten angewiesen sind.'
                            : 'In a digital world often characterized by inaccurate information, we focus on facts. Our team is continuously working on expanding the functionalities, such as integrating country-specific holidays for business day calculations. We see ourselves as partners for project managers, lawyers, and private individuals who rely on exact data.'}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
                    <p className="text-white/70 leading-relaxed">
                        Sheikh Farooq <br />
                        [Adresse siehe oben]
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">Haftung für Inhalte</h2>
                    <p className="text-white/70 leading-relaxed">
                        Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen. Dennoch prüfen wir unsere Rechenlogik regelmäßig auf Anomalien, um Ihnen die bestmögliche Erfahrung zu bieten. Haftungsansprüche, die sich auf Schäden materieller oder ideeller Art beziehen, welche durch die Nutzung der dargebotenen Informationen verursacht wurden, sind grundsätzlich ausgeschlossen, sofern kein nachweislich vorsätzliches oder grob fahrlässiges Verschulden vorliegt.
                    </p>
                </section>
            </div>
        </main>
    );
}

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}
