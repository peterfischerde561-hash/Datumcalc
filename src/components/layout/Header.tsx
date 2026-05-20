'use client';

import { useState, useEffect, useRef } from 'react';
import { Link, usePathname, useRouter, routing, locales } from '@/i18n/routing';
import NextLink from 'next/link';
import { useParams, usePathname as useNextPathname, useRouter as useNextRouter } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import { getLocalizedArticleSlug } from '@/lib/articles';
import { translateSlug, reverseTranslateSlug, getCanonicalPath, INTENT_TRANSLATIONS } from '@/lib/seo/translations';
import {
    CalendarDays,
    Menu,
    X,
    SplitSquareHorizontal,
    PlusSquare,
    BookOpen,
    Briefcase,
    ArrowRight,
    Globe,
    ChevronDown,
    User,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export function Header() {
    const t = useTranslations('Header');
    const tCommon = useTranslations('Common.languages');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const nextPathname = useNextPathname();
    const nextRouter = useNextRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const langRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 60);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close lang dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (langRef.current && !langRef.current.contains(e.target as Node)) {
                setLangOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    const navLinks = [
        { href: ROUTES.differenz, label: t('Nav.differenz'), icon: SplitSquareHorizontal, description: t('Nav.differenzDesc') },
        { href: ROUTES.addieren,  label: t('Nav.addieren'),   icon: PlusSquare,             description: t('Nav.addierenDesc') },
        { href: ROUTES.arbeitstage, label: t('Nav.arbeitstage'), icon: Briefcase,           description: t('Nav.arbeitstageDesc') },
        { href: ROUTES.alter,     label: t('Nav.alter'),      icon: User,                   description: t('Nav.alterDesc') },
        { href: ROUTES.ratgeber,  label: t('Nav.ratgeber'),   icon: BookOpen,               description: t('Nav.ratgeberDesc') },
    ];

    const handleLocaleChange = (newLocale: string) => {
        const prefix = newLocale === 'de' ? '' : `/${newLocale}`;
        
        // Dynamic SEO routes (calculators)
        if (params && (params.intent || params.slug)) {
            const currentIntent = Array.isArray(params.intent) ? params.intent[0] : params.intent as string;
            const currentSlugArr = params.slug ? (Array.isArray(params.slug) ? params.slug : [params.slug]) : undefined;
            const currentSlugStr = currentSlugArr ? currentSlugArr.join('-') : undefined;

            // Resolve internal intent key (German)
            let internalIntent = Object.keys(INTENT_TRANSLATIONS[locale]).find(k => INTENT_TRANSLATIONS[locale][k] === currentIntent) || currentIntent;
            
            // Handle Ratgeber / guide routes specially
            if (pathname.includes('/ratgeber') || pathname.includes('/guide') || pathname.includes('/guia') || pathname.includes('/guida')) {
                const guideIntent = INTENT_TRANSLATIONS[newLocale]['ratgeber'] || 'ratgeber';
                const slugStr = Array.isArray(params.slug) ? params.slug.join('/') : (params.slug || '');
                const locSlug = getLocalizedArticleSlug(slugStr, locale, newLocale);
                nextRouter.push(`${prefix}/${guideIntent}/${locSlug}`);
            } else if (currentSlugStr) {
                // Calculator deep link
                const canonicalSlug = reverseTranslateSlug(currentSlugStr, locale);
                const locSlug = translateSlug(canonicalSlug, newLocale);
                const locIntent = INTENT_TRANSLATIONS[newLocale][internalIntent] || internalIntent;
                nextRouter.push(`${prefix}/${locIntent}/${locSlug}`);
            } else {
                // Intent landing page
                const locIntent = INTENT_TRANSLATIONS[newLocale][internalIntent] || internalIntent;
                nextRouter.push(`${prefix}/${locIntent}`);
            }
        } else {
            // Static pages (About, Terms, etc.)
            // pathname from next-intl is the unlocalized version (e.g. /ueber-uns)
            const internalPath = pathname as keyof typeof routing.pathnames;
            const localizedPath = (routing.pathnames as any)[internalPath]?.[newLocale] || pathname;
            nextRouter.push(`${prefix}${localizedPath}`);
        }
        
        setLangOpen(false);
        setMobileMenuOpen(false);
    };


    return (
        <>
            {/* ── Skip-to-content link (SEO + A11y) ── */}
            <a
                href="#main-content"
                id="skip-nav"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-5 focus:py-2.5 focus:rounded-xl focus:bg-neon focus:text-white focus:font-bold focus:text-sm focus:shadow-[0_0_20px_rgba(255,0,85,0.5)] focus:outline-none"
            >
                {t('skipToContent')}
            </a>

            {/* ── Main Header ── */}
            <header
                role="banner"
                className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ease-in-out ${
                    isScrolled
                        ? 'bg-[#030303]/90 backdrop-blur-2xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] py-3'
                        : 'bg-transparent py-5'
                }`}
            >
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between gap-4">

                        {/* ── Logo / Brand Entity ── */}
                        <Link
                            href={ROUTES.home}
                            title={t('title')}
                            aria-label={`${t('title')} – ${t('logoTagline')}`}
                            className="flex items-center gap-3 group relative z-50 shrink-0"
                        >
                            <img
                                src="/logo.png"
                                alt={locale === 'de' ? 'Datumsrechner Logo' : 'Date Calculator Logo'}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-xl border border-white/20 shadow-[0_0_16px_rgba(0,210,255,0.25)] group-hover:shadow-[0_0_24px_rgba(255,0,85,0.45)] group-hover:scale-105 transition-all duration-300 object-cover"
                            />
                            <strong
                                className="font-black text-lg sm:text-xl tracking-tighter text-white leading-none select-none"
                            >
                                {t('title')}
                            </strong>
                        </Link>

                        {/* ── Desktop Navigation ── */}
                        <nav
                            aria-label={t('Nav.ariaLabel')}
                            className="hidden lg:flex lg:flex-row items-center gap-1 bg-white/[0.04] px-2 py-1.5 rounded-2xl border border-white/[0.08] backdrop-blur-md shadow-inner"
                            itemScope
                            itemType="https://schema.org/SiteNavigationElement"
                        >
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        aria-current={isActive ? 'page' : undefined}
                                        title={link.description}
                                        itemProp="url"
                                        className={`relative flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 group overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-neon-blue/70 ${
                                            isActive
                                                ? 'text-white bg-white/10 shadow-sm'
                                                : 'text-white/55 hover:text-white hover:bg-white/[0.06]'
                                        }`}
                                    >
                                        <link.icon
                                            className={`w-4 h-4 shrink-0 transition-all ${
                                                isActive ? 'text-neon-blue' : 'opacity-50 group-hover:opacity-100 group-hover:text-neon'
                                            }`}
                                            aria-hidden="true"
                                        />
                                        <span itemProp="name">{link.label}</span>
                                        {isActive && (
                                            <span
                                                aria-hidden="true"
                                                className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-neon-blue rounded-t-full shadow-[0_-2px_8px_rgba(0,210,255,0.7)]"
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* ── Desktop Right Controls ── */}
                        <div className="hidden lg:flex items-center gap-3 shrink-0">

                            {/* Language Dropdown */}
                            <div ref={langRef} className="relative">
                                <button
                                    id="lang-toggle"
                                    aria-haspopup="listbox"
                                    aria-expanded={langOpen}
                                    aria-label={t('Nav.languageLabel')}
                                    onClick={() => setLangOpen(!langOpen)}
                                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-neon-blue/70"
                                >
                                    <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                                    {locale.toUpperCase()}
                                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                                </button>
                                {langOpen && (
                                    <div
                                        role="listbox"
                                        aria-labelledby="lang-toggle"
                                        className="absolute right-0 top-full mt-2 min-w-[9rem] bg-[#111]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] overflow-hidden animate-slide-up-fade z-50 py-1.5"
                                    >
                                        {locales.map((loc) => (
                                            <button
                                                key={loc}
                                                role="option"
                                                aria-selected={locale === loc}
                                                onClick={() => handleLocaleChange(loc)}
                                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                                                    locale === loc
                                                        ? 'text-neon-blue bg-neon-blue/10 font-bold'
                                                        : 'text-white/60 hover:text-white hover:bg-white/[0.05] font-medium'
                                                }`}
                                            >
                                                {tCommon(loc)}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* CTA */}
                            <NextLink
                                href={locale === 'de' ? '/#tools' : `/${locale}#tools`}
                                className="group flex items-center gap-2 bg-white text-black font-bold text-sm px-5 py-2.5 rounded-xl hover:scale-[1.03] hover:bg-white/90 transition-all duration-200 shadow-[0_2px_12px_rgba(255,255,255,0.15)] hover:shadow-[0_4px_20px_rgba(255,255,255,0.25)] outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                            >
                                {t('Nav.cta')}
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                            </NextLink>
                        </div>

                        {/* ── Mobile Menu Toggle ── */}
                        <button
                            aria-controls="mobile-nav"
                            aria-expanded={mobileMenuOpen}
                            aria-label={mobileMenuOpen ? t('Nav.closeMenu') : t('Nav.openMenu')}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden relative z-50 p-2.5 rounded-xl text-white/70 hover:text-white bg-white/[0.04] border border-white/10 hover:border-white/20 hover:bg-white/[0.08] transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-neon-blue/70"
                        >
                            <span aria-hidden="true">
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Mobile Drawer ── */}
            <div
                id="mobile-nav"
                role="dialog"
                aria-modal="true"
                aria-label={t('Nav.mobileNavLabel')}
                className={`fixed inset-0 z-40 lg:hidden flex flex-col transition-all duration-500 ease-in-out ${
                    mobileMenuOpen
                        ? 'opacity-100 pointer-events-auto'
                        : 'opacity-0 pointer-events-none'
                }`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-[#030303]/97 backdrop-blur-3xl"
                    aria-hidden="true"
                    onClick={() => setMobileMenuOpen(false)}
                />

                {/* Drawer content */}
                <div
                    className={`relative flex flex-col h-full px-6 pt-24 pb-10 transition-transform duration-500 ease-in-out ${
                        mobileMenuOpen ? 'translate-y-0' : '-translate-y-4'
                    }`}
                >
                    {/* Brand inside drawer */}
                    <div className="flex items-center gap-3 mb-10 opacity-60">
                        <img src="/logo.png" alt="Datumsrechner Logo" className="w-6 h-6 rounded-lg object-cover" />
                        <span className="font-black text-lg tracking-tighter text-white">{t('title')}</span>
                    </div>

                    <nav
                        aria-label={t('Nav.mobileNavLabel')}
                        itemScope
                        itemType="https://schema.org/SiteNavigationElement"
                        className="flex flex-col gap-2 flex-1"
                    >
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    itemProp="url"
                                    aria-current={isActive ? 'page' : undefined}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-4 px-6 py-5 rounded-2xl text-xl font-bold transition-all duration-200 ${
                                        isActive
                                            ? 'text-white bg-white/10 border border-white/10'
                                            : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                                    }`}
                                >
                                    <link.icon
                                        className={`w-6 h-6 shrink-0 ${isActive ? 'text-neon-blue' : 'text-white/30'}`}
                                        aria-hidden="true"
                                    />
                                    <span itemProp="name">{link.label}</span>
                                    {isActive && (
                                        <span aria-hidden="true" className="ml-auto w-2 h-2 rounded-full bg-neon-blue animate-pulse shrink-0" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Mobile CTA */}
                    <NextLink
                        href={locale === 'de' ? '/#tools' : `/${locale}#tools`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-neon to-neon-blue text-white font-bold text-base px-8 py-4 rounded-2xl shadow-[0_4px_24px_rgba(255,0,85,0.3)] hover:shadow-[0_6px_32px_rgba(255,0,85,0.5)] hover:scale-[1.02] transition-all duration-200 mb-6 mt-4"
                    >
                        {t('Nav.cta')}
                        <ArrowRight className="w-5 h-5" aria-hidden="true" />
                    </NextLink>

                    {/* Mobile Language Switcher */}
                    <div className="border-t border-white/5 pt-6">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/25 mb-4 px-2">
                            {t('Nav.languageLabel')}
                        </p>
                        <div className="flex flex-col gap-2">
                            {locales.map((loc) => (
                                <button
                                    key={loc}
                                    onClick={() => handleLocaleChange(loc)}
                                    aria-pressed={locale === loc}
                                    className={`w-full text-left px-5 py-4 rounded-2xl text-base font-bold transition-all duration-200 flex items-center justify-between ${
                                        locale === loc
                                            ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/30'
                                            : 'text-white/40 hover:text-white/70 border border-white/5 hover:border-white/15 bg-white/[0.02]'
                                    }`}
                                >
                                    <span className="capitalize">{tCommon(loc)}</span>
                                    <span className="text-[10px] opacity-40 uppercase tracking-widest">{loc}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
