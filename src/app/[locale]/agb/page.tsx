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
    const fullUrl = `${siteUrl}${getCanonicalPath(locale, 'agb')}`;

    // Build hreflang alternates
    const languages: Record<string, string> = {};
    locales.forEach(loc => {
        languages[loc] = `${siteUrl}${getCanonicalPath(loc, 'agb')}`;
    });
    languages['x-default'] = `${siteUrl}${getCanonicalPath('de', 'agb')}`;

    return {
        title: locale === 'de' ? 'Nutzungsbedingungen' : 'Terms of Service',
        description: locale === 'de' 
            ? `Allgemeine Geschäftsbedingungen für ${DOMAIN}. Informationen zur Nutzung unserer Tools, Haftung und mathematischen Genauigkeit.`
            : `General terms and conditions for ${DOMAIN}. Information on using our tools, liability and mathematical accuracy.`,
        alternates: {
            canonical: fullUrl,
            languages
        },
        openGraph: {
            title: locale === 'de' ? 'AGB' : 'Terms of Service',
            description: `Nutzungsbestimmungen von ${DOMAIN}.`,
            url: fullUrl,
            type: 'website',
            locale: locale,
        }
    };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'Common.titles' });

    return (
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-12 tracking-tight">
                {t('terms')}
            </h1>

            <div className="prose prose-invert prose-lg max-w-none space-y-12">
                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">
                        {locale === 'de' ? '1. Geltungsbereich & Akzeptanz' : '1. Scope & Acceptance'}
                    </h2>
                    <p className="text-white/70 leading-relaxed">
                        {locale === 'de'
                            ? `Die folgenden Geschäftsbedingungen regeln die Nutzung der Online-Tools auf ${DOMAIN}. Mit dem Zugriff auf unsere Website sowie der Nutzung unserer Rechenmechanismen erklären Sie sich mit diesen Bedingungen vollumfänglich einverstanden. Sollten Sie mit einzelnen Bestimmungen nicht einverstanden sein, ist die Nutzung des Dienstes zu unterlassen. \n\nDiese AGB gelten für alle Besucher, Nutzer und andere Personen, die auf den Dienst zugreifen oder diesen nutzen.`
                            : `The following terms and conditions govern the use of the online tools on ${DOMAIN}. By accessing our website and using our calculation mechanisms, you agree to these terms in full. If you do not agree with individual provisions, you must refrain from using the service. \n\nThese terms apply to all visitors, users, and other persons who access or use the service.`}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">
                        {locale === 'de' ? '2. Dienstleistungsbeschreibung & Verfügbarkeit' : '2. Service Description & Availability'}
                    </h2>
                    <p className="text-white/70 leading-relaxed">
                        {locale === 'de'
                            ? `${DOMAIN} stellt kostenlose webbasierte Rechen-Tools zur Verfügung, um Datumsdifferenzen, Zeitspannen, Arbeitstage und das Lebensalter zu berechnen. Die Ergebnisse dienen ausschließlich Informationszwecken und stellen keine rechtlich bindende Auskunft dar. \n\nWir bemühen uns um eine konstante Verfügbarkeit des Dienstes. Dennoch können technische Wartungsarbeiten oder unvorhergesehene Ausfälle die Erreichbarkeit einschränken. Es besteht kein Anspruch auf eine unterbrechungsfreie Nutzung oder die Speicherung Ihrer Berechnungsdaten auf unseren Systemen.`
                            : `${DOMAIN} provides free web-based calculation tools to calculate date differences, time spans, business days, and age. The results are for informational purposes only and do not constitute legally binding information. \n\nWe strive for constant availability of the service. However, technical maintenance work or unforeseen failures can limit accessibility. There is no claim to uninterrupted use or the storage of your calculation data on our systems.`}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">
                        {locale === 'de' ? '3. Haftungsausschluss für Rechenergebnisse' : '3. Disclaimer for Calculation Results'}
                    </h2>
                    <p className="text-white/70 leading-relaxed underline decoration-neon/20">
                        {locale === 'de'
                            ? 'Obwohl wir größte Sorgfalt bei der Entwicklung und Implementierung unserer Algorithmen (basierend auf ISO-8601 Standards) walten lassen, übernehmen wir keine Gewähr für die absolute Richtigkeit, Vollständigkeit oder Aktualität der bereitgestellten Ergebnisse. \n\nDie Nutzer sind ausdrücklich dazu angehalten, wichtige Berechnungen – insbesondere wenn diese rechtliche oder finanzielle Auswirkungen haben (z.B. Kündigungsfristen, Projektabrechnungen) – durch eine zweite, unabhängige Quelle zu verifizieren. Eine Haftung für materielle oder immaterielle Schäden, die aus der direkten oder indirekten Nutzung der Website entstehen, ist – soweit gesetzlich zulässig – vollständig ausgeschlossen.'
                            : 'Although we take the greatest care in the development and implementation of our algorithms (based on ISO-8601 standards), we assume no guarantee for the absolute correctness, completeness, or timeliness of the results provided. \n\nUsers are expressly encouraged to verify important calculations – especially if they have legal or financial implications (e.g., notice periods, project billing) – through a second, independent source. Liability for material or immaterial damage resulting from the direct or indirect use of the website is – as far as legally permissible – completely excluded.'}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">
                        {locale === 'de' ? '4. Geistiges Eigentum & Urheberrecht' : '4. Intellectual Property & Copyright'}
                    </h2>
                    <p className="text-white/70 leading-relaxed">
                        {locale === 'de'
                            ? 'Sämtliche Inhalte, das Design, die Quelltexte sowie die spezifischen Rechenlogiken auf dieser Website unterliegen dem Schutz des Urheberrechts und anderer Schutzgesetze. Die Vervielfältigung, Bearbeitung, Verbreitung oder Verwendung von Grafiken, Texten oder Code-Fragmenten ist ohne ausdrückliche schriftliche Genehmigung des Betreibers untersagt. \n\nAnfragen für die gewerbliche Nutzung unserer API oder Rechenlogik richten Sie bitte an die im Impressum hinterlegte Kontaktadresse.'
                            : 'All content, the design, the source code, and the specific calculation logic on this website are subject to the protection of copyright and other protective laws. The reproduction, processing, distribution, or use of graphics, text, or code fragments is prohibited without the express written permission of the operator. \n\nRequests for the commercial use of our API or calculation logic should be sent to the contact address provided in the imprint.'}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">
                        {locale === 'de' ? '5. Änderungen der Nutzungsbedingungen' : '5. Changes to the Terms of Use'}
                    </h2>
                    <p className="text-white/70 leading-relaxed">
                        {locale === 'de'
                            ? 'Der Betreiber behält sich das Recht vor, diese AGB sowie die bereitgestellten kostenlosen Dienste jederzeit ohne gesonderte Vorankündigung einzustellen oder inhaltlich zu verändern. Nutzer werden gebeten, diese Seite regelmäßig auf Aktualisierungen zu prüfen. Durch die fortgesetzte Nutzung der Website nach Änderungen an den Bedingungen erklären Sie sich mit den neuen AGB einverstanden.'
                            : 'The operator reserves the right to discontinue or change the content of these terms of use and the free services provided at any time without separate notice. Users are requested to check this page regularly for updates. By continued use of the website after changes to the terms, you agree to the new terms of use.'}
                    </p>
                </section>
            </div>
        </main>
    );
}

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}
