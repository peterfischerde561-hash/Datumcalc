import { Link } from '@/i18n/routing';
import { ROUTES } from '@/lib/routes';
import { ShieldCheck, Calculator, CalendarClock } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { LanguageSwitcher } from './LanguageSwitcher';
import { routeLabel } from '@/lib/seo/routeLabels';

export function Footer() {
    const locale = useLocale();
    const t = useTranslations('Header');
    const tCommon = useTranslations('Common');
    const isDe = locale === 'de';

    return (
        <footer className="w-full border-t border-line bg-surface py-16 mt-auto relative z-10 overflow-hidden">
            {/* Accent line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"></div>

            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                
                {/* Top: Semantic Clusters & Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    
                    {/* Brand & E-E-A-T */}
                    <div className="col-span-1 lg:col-span-2 space-y-6">
                        <span className="font-extrabold text-2xl tracking-tight text-ink flex items-center gap-2">
                            <CalendarClock className="w-6 h-6 text-accent" />
                            {t('title')}
                        </span>
                        <p className="text-ink-2 text-sm leading-relaxed max-w-sm">
                            {t('logoTagline')}
                        </p>
                        <div className="flex items-center gap-3 text-xs font-medium text-ink-2 bg-surface w-fit px-4 py-2 rounded-full border border-line">
                            <ShieldCheck className="w-4 h-4 text-success" />
                            {t('Nav.verified')}
                        </div>
                    </div>

                    {/* Cluster 1 */}
                    <nav aria-label="Footer Beliebte Rechner">
                        <h3 className="text-ink font-bold mb-4 flex items-center gap-2">
                            <Calculator className="w-4 h-4 text-accent" />
                            {isDe ? 'Werkzeuge' : 'Tools'}
                        </h3>
                        <ul className="space-y-3 text-sm text-ink-2">
                            {/* Same labels as the nav, breadcrumbs and related
                                links — see routeLabels.ts. */}
                            <li><Link href={ROUTES.differenz} className="hover:text-accent transition-colors">{routeLabel('differenz', locale).label}</Link></li>
                            <li><Link href={ROUTES.addieren} className="hover:text-accent transition-colors">{routeLabel('addieren', locale).label}</Link></li>
                            <li><Link href={ROUTES.arbeitstage} className="hover:text-accent transition-colors">{routeLabel('arbeitstage', locale).label}</Link></li>
                            <li><Link href={ROUTES.alter} className="hover:text-accent transition-colors">{routeLabel('alter', locale).label}</Link></li>
                        </ul>
                    </nav>

                    {/* Cluster 2 */}
                    <nav aria-label="Footer Ratgeber">
                        <h3 className="text-ink font-bold mb-4">{isDe ? 'Wissen' : 'Knowledge'}</h3>
                        <ul className="space-y-3 text-sm text-ink-2">
                            <li><Link href={ROUTES.getRatgeber(isDe ? 'schaltjahre-erklaert' : 'leap-years-explained')} className="hover:text-accent transition-colors">{isDe ? 'Schaltjahre erklärt' : 'Leap Years Explained'}</Link></li>
                            <li><Link href={ROUTES.getRatgeber(isDe ? 'was-ist-ein-arbeitstag' : 'what-is-a-business-day')} className="hover:text-accent transition-colors">{isDe ? 'Was ist ein Arbeitstag?' : 'What is a Business Day?'}</Link></li>
                            <li><Link href={ROUTES.getRatgeber(isDe ? 'wochen-im-jahr' : 'weeks-in-a-year')} className="hover:text-accent transition-colors">{isDe ? 'Wochen im Jahr' : 'Weeks in a Year'}</Link></li>
                        </ul>
                    </nav>
                </div>

                {/* Middle: Language Selection */}
                <div className="w-full py-8 border-t border-line border-b mb-8 text-center">
                    <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ink-3">{t('Nav.languageLabel')}</p>
                    <LanguageSwitcher />
                </div>                {/* Bottom: Legal */}
                <div className="flex flex-col md:flex-row justify-between items-center w-full gap-6 text-sm text-ink-3">
                    <p className="order-2 md:order-1">© {new Date().getFullYear()} Datumsrechner. Alle Rechte vorbehalten.</p>
                    
                    <nav aria-label="Footer Legal" className="flex flex-wrap justify-center gap-x-6 gap-y-4 order-1 md:order-2 font-medium">
                        <Link href={ROUTES.about} className="hover:text-accent transition-colors">{tCommon('titles.about')}</Link>
                        <Link href={ROUTES.methodik} className="hover:text-accent transition-colors">
                            {isDe ? 'Wie wir rechnen' : 'How we calculate'}
                        </Link>
                        <Link href={ROUTES.sitemap} className="hover:text-accent transition-colors">{tCommon('titles.sitemap')}</Link>
                        <Link href={ROUTES.datenschutz} className="hover:text-accent transition-colors">{tCommon('titles.privacy')}</Link>
                        <Link href={ROUTES.agb} className="hover:text-accent transition-colors">{tCommon('titles.terms')}</Link>
                        <Link href={ROUTES.impressum} className="hover:text-accent transition-colors">{tCommon('titles.imprint')}</Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
