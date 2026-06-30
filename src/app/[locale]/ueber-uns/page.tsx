import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/routing';
import { SITE_URL, DOMAIN } from '@/lib/constants';

export const revalidate = 86400; // 24 hours
export const dynamic = 'force-static';
import { INTENT_TRANSLATIONS, getCanonicalPath } from '@/lib/seo/translations';
import { CalculatorCore } from '@/components/calculator/CalculatorCore';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'Common.titles' });
    const siteUrl = SITE_URL;
    const fullUrl = `${siteUrl}${getCanonicalPath(locale, 'ueber-uns')}`;

    // Build hreflang alternates
    const languages: Record<string, string> = {};
    locales.forEach(loc => {
        languages[loc] = `${siteUrl}${getCanonicalPath(loc, 'ueber-uns')}`;
    });
    languages['x-default'] = `${siteUrl}${getCanonicalPath('de', 'ueber-uns')}`;

    return {
        title: locale === 'de' ? 'Über uns' : 'About us',
        description: locale === 'de' 
            ? `Erfahren Sie mehr über die Mission von ${DOMAIN}. Wie wir Kalenderlogik vereinfachen und höchste Präzision nach ISO-8601 bieten.`
            : `Learn more about the mission of ${DOMAIN}. How we simplify calendar logic and offer maximum precision according to ISO-8601.`,
        alternates: {
            canonical: fullUrl,
            languages
        },
        openGraph: {
            title: locale === 'de' ? 'Über uns' : 'About us',
            description: `Die Geschichte und Mission hinter ${DOMAIN}.`,
            url: fullUrl,
            type: 'website',
            locale: locale,
        }
    };
}

export default async function AboutUsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'Common.titles' });

    return (
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-12 tracking-tight text-center">
                {locale === 'de' ? (
                    <>Wir machen Zeit <span className="text-neon underline decoration-neon/20">berechenbar</span>.</>
                ) : (
                    <>We make time <span className="text-neon underline decoration-neon/20">calculable</span>.</>
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
                    <div className="w-32 h-32 shrink-0 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-4xl">
                        FS
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Felix Schmidt</h2>
                        <p className="text-neon font-bold text-sm uppercase tracking-widest mb-4">
                            {locale === 'de' ? 'Lead Developer & Kalender-Experte' : 'Lead Developer & Calendar Expert'}
                        </p>
                        <p className="text-slate-700 text-lg leading-relaxed">
                            {locale === 'de'
                                ? 'Felix ist das mathematische und technische Herz hinter dem Datumsrechner. Mit einem tiefen Verständnis für komplexe Zeit-Algorithmen stellt er sicher, dass jedes Datum exakt und fehlerfrei berechnet wird.'
                                : 'Felix is the mathematical and technical heart behind the Date Calculator. With a deep understanding of complex time algorithms, he ensures that every date is calculated exactly and without errors.'}
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
                                ? 'Wir haben unsere Core-Engine so entwickelt, dass sie alle Eventualitäten des gregorianischen Kalenders abdeckt. Schaltjahre, unregelmäßige Monatslängen und Arbeitstage-Konfigurationen werden sekundenschnell ohne Rundungsfehler verarbeitet. \n\nDabei setzen wir auf den internationalen Standard ISO-8601. Dies stellt sicher, dass unsere Berechnungen weltweit kompatibel und nachvollziehbar sind.'
                                : 'We have developed our core engine to cover all eventualities of the Gregorian calendar. Leap years, irregular month lengths, and working day configurations are processed in seconds without rounding errors. \n\nIn doing so, we rely on the international ISO-8601 standard. This ensures that our calculations are globally compatible and transparent.'}
                        </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-8 rounded-2xl flex flex-col justify-center text-center">
                        <span className="text-5xl font-bold text-neon mb-2">100%</span>
                        <span className="text-sm font-bold uppercase tracking-widest text-slate-500">
                            {locale === 'de' ? 'Mathematisch exakt' : 'Mathematically exact'}
                        </span>
                    </div>
                </section>

                {/* Technical Vision */}
                <section className="space-y-6">
                    <h2 className="text-3xl font-bold text-slate-900">
                        {locale === 'de' ? 'Unsere technologische Vision' : 'Our Technological Vision'}
                    </h2>
                    <p className="text-slate-700">
                        {locale === 'de'
                            ? `Hinter ${DOMAIN} steht ein agiles Team aus Software-Engineers und Kalender-Enthusiasten. Wir nutzen moderne Technologien wie Next.js und Turbopack, um eine blitzschnelle Performance zu garantieren – auch auf mobilen Endgeräten. \n\nIn der Zukunft planen wir die Integration weiterer Spezialrechner, wie zum Beispiel für islamische, jüdische oder chinesische Kalendersysteme, um die kulturelle Vielfalt der Zeitrechnung abzubilden.`
                            : `Behind ${DOMAIN} stands an agile team of software engineers and calendar enthusiasts. We use modern technologies like Next.js and Turbopack to guarantee lightning-fast performance – even on mobile devices. \n\nIn the future, we plan to integrate further special calculators, for example for Islamic, Jewish or Chinese calendar systems, to reflect the cultural diversity of time calculation.`}
                    </p>
                </section>

                {/* EEAT Signals */}
                <section className="border-l-4 border-neon pl-10 space-y-6">
                    <h2 className="text-3xl font-bold text-slate-900">
                        {locale === 'de' ? 'Transparenz & Qualität' : 'Transparency & Quality'}
                    </h2>
                    <p className="text-slate-700 leading-relaxed italic text-lg">
                        {locale === 'de'
                            ? 'Wir finanzieren dieses Projekt durch dezente Werbeanzeigen und Affiliate-Links, um den Dienst für unsere Nutzer dauerhaft kostenlos zu halten. Dabei legen wir größten Wert auf den Schutz Ihrer Privatsphäre und die Einhaltung höchster technischer Standards.'
                            : 'We finance this project through subtle advertisements and affiliate links in order to keep the service permanently free for our users. In doing so, we place the highest value on protecting your privacy and complying with the highest technical standards.'}
                    </p>
                </section>

                <section className="text-center bg-white rounded-2xl p-12 border border-slate-200 mt-16 shadow-sm">
                    <h2 className="text-2xl font-bold mb-8 text-slate-900">Testen Sie unsere Engine</h2>
                    <div className="max-w-3xl mx-auto">
                        <CalculatorCore />
                    </div>
                </section>
            </div>
        </main>
    );
}

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}
