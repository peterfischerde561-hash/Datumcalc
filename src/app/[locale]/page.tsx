import { CalculatorCore } from '@/components/calculator/CalculatorCore';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SmartInputBar } from '@/components/SmartInputBar';
import { HomepageSEO } from '@/components/seo/HomepageSEO';
import { locales, Link } from '@/i18n/routing';
import { SITE_URL } from "@/lib/constants";
import { ROUTES } from '@/lib/routes';
import { SplitSquareHorizontal, PlusSquare, Briefcase, User } from 'lucide-react';
import { LiveDatePreview } from '@/components/hero/LiveDatePreview';
import { QuickShortcuts } from '@/components/hero/QuickShortcuts';

export const revalidate = 86400; // 24 hours

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const siteUrl = SITE_URL;
    
    const title = locale === 'de' 
        ? 'Datumsrechner – Differenz, Arbeitstage & Alter online berechnen' 
        : 'Date Calculator – Count Days, Add Dates & Business Days';
    
    const description = locale === 'de' 
        ? 'Datumsrechner online: Datumsdifferenz, Arbeitstage & Alter kostenlos berechnen. ISO 8601 konform, mit Schaltjahren. Ohne Anmeldung.'
        : 'Online date calculator: calculate date differences, business days & age for free. ISO 8601 compliant, with leap years. No registration.';

    return {
        title,
        description,
        alternates: {
            canonical: `${siteUrl}${locale === 'de' ? '' : `/${locale}`}`,
            languages: locales.reduce((acc, loc) => ({
                ...acc,
                [loc]: `${siteUrl}${loc === 'de' ? '' : `/${loc}`}`
            }), { 'x-default': siteUrl })
        },
        openGraph: {
            title,
            description,
            url: `${siteUrl}${locale === 'de' ? '' : `/${locale}`}`,
            type: 'website',
            images: [
                {
                    url: '/og-image.png',
                    width: 1200,
                    height: 630,
                    alt: 'Datumsrechner – Differenz, Arbeitstage & Alter online berechnen',
                }
            ]
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['/og-image.png']
        }
    };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'Header' });

    return (
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 lg:pt-40 lg:pb-32">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-24">
                {/* Left Column: Hero Content */}
                <header className="lg:col-span-7 space-y-8 animate-slide-up-fade">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-neon-blue mb-2">
                        <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" aria-hidden="true"></span>
                        {locale === 'de' ? 'Mathematisch Präzise' : 'Mathematically Precise'}
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-[0.95] max-w-2xl bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                        {locale === 'de' ? (
                            <>Präziser <span className="text-white">Datumsrechner</span> für alle Fristen.</>
                        ) : (
                            <>Precise <span className="text-white">Date Calculator</span> for every deadline.</>
                        )}
                    </h1>
                    <p className="text-lg md:text-xl text-white/50 max-w-xl font-medium leading-relaxed">
                        {locale === 'de' 
                            ? 'Berechnen Sie exakte Zeitspannen, addieren Sie Tage oder ermitteln Sie Netto-Arbeitstage nach ISO-8601 Standard.'
                            : 'Calculate exact time spans, add days or determine net business days according to ISO-8601 standards.'}
                    </p>

                    {/* Smart Input Search integrated in Hero */}
                    <div className="w-full max-w-2xl space-y-6">
                        <SmartInputBar />
                        <QuickShortcuts locale={locale} />
                    </div>

                    <div className="flex flex-wrap items-center gap-6 pt-4">
                        <Link href="#tools" className="px-8 py-4 rounded-2xl bg-white text-black font-bold hover:bg-neon transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                            {locale === 'de' ? 'Rechner starten' : 'Start Calculator'}
                        </Link>
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#050505] bg-white/10 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i * 123}`} alt="User" />
                                </div>
                            ))}
                            <div className="pl-4 flex flex-col justify-center">
                                <span className="text-xs font-bold text-white leading-none">2.4k+</span>
                                <span className="text-[10px] text-white/40 uppercase tracking-tighter">{locale === 'de' ? 'Nutzer täglich' : 'Users daily'}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Right Column: Visual Element */}
                <div className="hidden lg:block lg:col-span-5 animate-slide-up-fade" style={{ animationDelay: '0.2s' }}>
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
