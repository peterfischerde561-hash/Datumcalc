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
    const fullUrl = `${siteUrl}${getCanonicalPath(locale, 'datenschutz')}`;

    // Build hreflang alternates
    const languages: Record<string, string> = {};
    locales.forEach(loc => {
        languages[loc] = `${siteUrl}${getCanonicalPath(loc, 'datenschutz')}`;
    });
    languages['x-default'] = `${siteUrl}${getCanonicalPath('de', 'datenschutz')}`;

    return {
        title: locale === 'de' ? 'Datenschutzerklärung' : 'Privacy Policy',
        description: locale === 'de' 
            ? `Informationen zum Datenschutz bei ${DOMAIN}. Wie wir Ihre Daten gemäß DSGVO schützen und warum wir auf Tracking verzichten.`
            : `Information on data protection at ${DOMAIN}. How we protect your data according to GDPR and why we refrain from tracking.`,
        alternates: {
            canonical: fullUrl,
            languages
        },
        openGraph: {
            title: locale === 'de' ? 'Datenschutz' : 'Privacy Policy',
            description: `Datenschutz-Informationen von ${DOMAIN}.`,
            url: fullUrl,
            type: 'website',
            locale: locale,
        }
    };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'Common.titles' });

    return (
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-12 tracking-tight">
                {t('privacy')}
            </h1>

            <div className="prose prose-lg max-w-none space-y-12">
                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                        {locale === 'de' ? '1. Datenschutz auf einen Blick' : '1. Data Protection at a Glance'}
                    </h2>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">
                        {locale === 'de' ? 'Allgemeine Hinweise' : 'General Notes'}
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                        {locale === 'de'
                            ? 'Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text aufgeführten Datenschutzerklärung. \n\nDer Schutz Ihrer Privatsphäre ist für uns kein bloßes Schlagwort, sondern ein technisches Designprinzip. Unsere Web-Applikation wurde nach dem Prinzip "Privacy by Design" entwickelt, um die Erhebung personenbezogener Daten auf das absolute Minimum zu reduzieren.'
                            : 'The following notes provide a simple overview of what happens to your personal data when you visit this website. Personal data are all data with which you can be personally identified. Detailed information on the subject of data protection can be found in our privacy policy listed below this text. \n\nProtecting your privacy is not just a catchphrase for us, but a technical design principle. Our web application was developed according to the "Privacy by Design" principle to reduce the collection of personal data to the absolute minimum.'}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                        {locale === 'de' ? '2. Datenerfassung auf dieser Website' : '2. Data Collection on This Website'}
                    </h2>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">
                        {locale === 'de' ? 'Cookies und technische Architektur' : 'Cookies and Technical Architecture'}
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                        {locale === 'de'
                            ? 'Unsere Website nutzt primär lokale Speichertechnologien des Browsers, um Ihre Präferenzen (wie etwa die gewählte Sprache oder den letzten Berechnungsmodus) zu speichern. Diese Daten verlassen niemals Ihren Computer und werden von uns nicht auf Servern ausgewertet. \n\nWir verzichten bewusst auf aggressive Drittanbieter-Tracker oder Analyse-Tools, die Nutzerprofile erstellen. Unser Hosting-Anbieter erfasst lediglich technisch notwendige Log-Files (z.B. IP-Adresse, Datum/Uhrzeit des Zugriffs, Browsertyp), die für den sicheren Betrieb der Infrastruktur gemäß Art. 6 Abs. 1 lit. f DSGVO unerlässlich sind. Diese Daten werden regelmäßig gelöscht und nicht mit anderen Datenquellen zusammengeführt.'
                            : 'Our website primarily uses local storage technologies of the browser to save your preferences (such as the selected language or the last calculation mode). This data never leaves your computer and is not evaluated by us on servers. \n\nWe deliberately refrain from aggressive third-party trackers or analysis tools that create user profiles. Our hosting provider only collects technically necessary log files (e.g. IP address, date/time of access, browser type), which are essential for the safe operation of the infrastructure according to Art. 6 Para. 1 lit. f GDPR. This data is regularly deleted and not merged with other data sources.'}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                        {locale === 'de' ? '3. SSL- bzw. TLS-Verschlüsselung' : '3. SSL or TLS Encryption'}
                    </h2>
                    <p className="text-slate-700 leading-relaxed italic">
                        {locale === 'de'
                            ? 'Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine SSL-bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von „http://“ auf „https://“ wechselt und an dem Schloss-Symbol in Ihrer Browserzeile. Wenn die SSL- bzw. TLS-Verschlüsselung aktiviert ist, können die Daten, die Sie an uns übermitteln, nicht von Dritten mitgelesen werden. Dies gilt insbesondere für alle Berechnungsanfragen, die Sie in unsere Tools eingeben.'
                            : 'This site uses SSL or TLS encryption for security reasons and to protect the transmission of confidential content. You can recognize an encrypted connection by the fact that the address line of the browser changes from "http://" to "https://" and by the lock symbol in your browser line. If SSL or TLS encryption is activated, the data you transmit to us cannot be read by third parties. This applies in particular to all calculation requests that you enter into our tools.'}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                        {locale === 'de' ? '4. Ihre Rechte: Auskunft, Löschung und Sperrung' : '4. Your Rights: Information, Deletion and Blocking'}
                    </h2>
                    <p className="text-slate-700 leading-relaxed">
                        {locale === 'de'
                            ? 'Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung und ggf. ein Recht auf Berichtigung, Sperrung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten können Sie sich jederzeit unter der im Impressum angegebenen Adresse an uns wenden. \n\nZusätzlich haben Sie das Recht auf Datenübertragbarkeit und ein Beschwerderecht bei der zuständigen Aufsichtsbehörde, sollten Sie der Ansicht sein, dass die Verarbeitung Ihrer Daten gegen das Datenschutzrecht verstößt.'
                            : 'Within the framework of the applicable legal provisions, you have the right at any time to free information about your stored personal data, its origin and recipients and the purpose of the data processing and, if applicable, a right to correction, blocking or deletion of this data. For this as well as for further questions on the subject of personal data, you can contact us at any time at the address given in the imprint. \n\nIn addition, you have the right to data portability and a right of appeal to the competent supervisory authority should you believe that the processing of your data violates data protection law.'}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                        {locale === 'de' ? '5. Hosting & CDN Dienste' : '5. Hosting & CDN Services'}
                    </h2>
                    <p className="text-slate-700 leading-relaxed">
                        {locale === 'de'
                            ? 'Wir hosten die Inhalte unserer Website bei einem professionellen Cloud-Infrastruktur-Anbieter. Die Bereitstellung erfolgt über ein Content Delivery Network (CDN), um die Ladezeiten weltweit zu minimieren und die Verfügbarkeit zu erhöhen. Dabei werden technisch notwendige Zugriffsdaten verarbeitet. Mit dem Anbieter wurde ein Vertrag über Auftragsverarbeitung (AVV) geschlossen, der die Einhaltung europäischer Datenschutzstandards garantiert.'
                            : 'We host the contents of our website with a professional cloud infrastructure provider. The provision is via a Content Delivery Network (CDN) to minimize loading times worldwide and increase availability. Technically necessary access data is processed in the process. A contract for order processing (AVV) has been concluded with the provider, which guarantees compliance with European data protection standards.'}
                    </p>
                </section>
            </div>
        </main>
    );
}

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}
