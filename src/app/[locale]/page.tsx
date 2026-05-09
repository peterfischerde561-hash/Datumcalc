import { CalculatorCore } from '@/components/calculator/CalculatorCore';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SmartInputBar } from '@/components/SmartInputBar';
import { HomepageSEO } from '@/components/seo/HomepageSEO';
import { locales, Link } from '@/i18n/routing';
import { SITE_URL } from "@/lib/constants";
import { ROUTES } from '@/lib/routes';
import { SplitSquareHorizontal, PlusSquare, Briefcase, User } from 'lucide-react';
import { LiveDatePreview } from '@/components/hero/LiveDatePreview';

export const dynamic = 'force-static';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'Header' });
    const siteUrl = SITE_URL;
    
    // Build hreflang alternates
    const languages: Record<string, string> = {};
    locales.forEach(loc => {
        languages[loc] = `${siteUrl}${loc === 'de' ? '' : `/${loc}`}`;
    });
    languages['x-default'] = `${siteUrl}`;

    return {
        title: locale === 'de' 
            ? "Datumsrechner online | Differenz berechnen & Tage addieren ✓" 
            : "Date Calculator Online | Count Days & Add Dates Precisely ✓",
        description: locale === 'de' 
            ? "Exakte Zeitberechnung online: Ermitteln Sie Datumsdifferenzen, addieren Sie Fristen oder berechnen Sie Arbeitstage nach ISO 8601 Standard."
            : "Exact time calculation online: determine date differences, add deadlines or calculate business days and working days per ISO 8601.",
        alternates: {
            canonical: `${siteUrl}${locale === 'de' ? '' : `/${locale}`}`,
            languages
        },
        openGraph: {
            title: locale === 'de' ? "Der präzise Datumsrechner online" : "The precise date calculator online",
            description: locale === 'de' ? "Kostenlose Tools für Zeitspannen und Fristen." : "Free tools for time spans and deadlines.",
            url: `${siteUrl}${locale === 'de' ? '' : `/${locale}`}`,
            type: 'website',
        }
    };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'Header' });

    return (
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
                {/* Left Column: Hero Content */}
                <header className="space-y-8 animate-slide-up-fade">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-neon-blue mb-2">
                        <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" aria-hidden="true"></span>
                        {locale === 'de' ? 'Kostenlos & ohne Anmeldung' : 'Free & No Registration'}
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                        {t('title')}
                    </h1>
                    <p className="text-lg md:text-xl text-white/50 max-w-xl font-medium leading-relaxed">
                        {locale === 'de' 
                            ? 'Berechnen Sie exakte Zeitspannen, addieren Sie Tage oder ermitteln Sie Netto-Arbeitstage. Schnell, präzise und 100% kostenlos.'
                            : 'Calculate exact time spans, add days or determine net business days. Fast, precise and 100% free.'}
                    </p>

                    {/* Smart Input Search integrated in Hero */}
                    <div className="w-full max-w-2xl">
                        <SmartInputBar />
                    </div>
                </header>

                {/* Right Column: Visual Element */}
                <div className="hidden lg:block animate-slide-up-fade" style={{ animationDelay: '0.2s' }}>
                    <LiveDatePreview locale={locale} />
                </div>
            </div>

            {/* Smart Hero CTA Selector - Now below Search */}
            <section id="tools" aria-label={locale === 'de' ? "Tools" : "Tools"} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-24 animate-slide-up-fade" style={{ animationDelay: '0.3s' }}>
                <Link href={ROUTES.differenz} className="group p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] text-left flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                        <SplitSquareHorizontal className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg mb-1">{locale === 'de' ? 'Datumsdifferenz' : 'Date Difference'}</h3>
                        <p className="text-white/50 text-sm leading-snug">{locale === 'de' ? 'Tage zwischen zwei Daten berechnen' : 'Calculate days between two dates'}</p>
                    </div>
                </Link>
                <Link href={ROUTES.addieren} className="group p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] text-left flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neon/20 flex items-center justify-center text-neon group-hover:scale-110 transition-transform">
                        <PlusSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg mb-1">{locale === 'de' ? 'Datum addieren' : 'Add to Date'}</h3>
                        <p className="text-white/50 text-sm leading-snug">{locale === 'de' ? 'Tage addieren oder abziehen' : 'Add or subtract days from a date'}</p>
                    </div>
                </Link>
                <Link href={ROUTES.arbeitstage} className="group p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] text-left flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neon-blue/20 flex items-center justify-center text-neon-blue group-hover:scale-110 transition-transform">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg mb-1">{locale === 'de' ? 'Arbeitstage' : 'Business Days'}</h3>
                        <p className="text-white/50 text-sm leading-snug">{locale === 'de' ? 'Netto-Arbeitstage ermitteln' : 'Calculate net business days'}</p>
                    </div>
                </Link>
                <Link href={ROUTES.alter} className="group p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] text-left flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg mb-1">{locale === 'de' ? 'Alter berechnen' : 'Age Calculator'}</h3>
                        <p className="text-white/50 text-sm leading-snug">{locale === 'de' ? 'Genaues Alter in Tagen & Jahren' : 'Exact age in days and years'}</p>
                    </div>
                </Link>
            </section>



            {/* Core Calculator Hub */}
            <section aria-label={locale === 'de' ? "Hauptrechner" : "Main Calculator"} className="w-full max-w-5xl mx-auto rounded-[2.5rem] border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-3xl p-6 md:p-10 min-h-[400px] shadow-[0_0_50px_rgba(0,0,0,0.5)] mb-24 animate-slide-up-fade" style={{ animationDelay: '0.2s' }}>
                <CalculatorCore />
            </section>

            {/* Semantic SEO & Content Blocks */}
            <HomepageSEO locale={locale} />
        </div>
    );
}

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}
