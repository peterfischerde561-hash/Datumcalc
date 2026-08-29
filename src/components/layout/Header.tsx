'use client';

import { useState, useEffect, useRef } from 'react';
import { Link, usePathname, routing, locales } from '@/i18n/routing';
import { useParams, useRouter as useNextRouter } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import { getLocalizedArticleSlug } from '@/lib/articles';
import { translateSlug, reverseTranslateSlug, INTENT_TRANSLATIONS } from '@/lib/seo/translations';
import { routeLabel } from '@/lib/seo/routeLabels';
import {
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
import { ButtonLink } from '@/components/ui/Button';

export function Header() {
    const t = useTranslations('Header');
    const tCommon = useTranslations('Common.languages');
    const locale = useLocale();
    const pathname = usePathname();
    const params = useParams();
    const nextRouter = useNextRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const langRef = useRef<HTMLDivElement>(null);

    /*
     * The header was `fixed` and shrank from py-5 to py-3 past 60px of scroll,
     * driven by a scroll listener and a state update.
     *
     * Being fixed took it out of flow, and nothing put the space back: the
     * layout's <main> has no top offset, so every page had to pad its own top
     * to clear it. Only the homepage did (pt-28). On the other ten routes the
     * first ~80px of content sat underneath the header.
     *
     * `sticky` occupies its space and then follows the scroll, so the offset
     * problem cannot exist. The height is now constant, which is also what
     * makes sticky safe -- a header that resizes while stuck reflows the
     * document under it. That removes the scroll listener and the re-render
     * with it.
     */

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
        // Labels come from routeLabels.ts, the same source the breadcrumbs, the
        // homepage table and the related-links block use. The nav previously
        // read them from the Nav.* i18n strings, which is how one URL ended up
        // called "Differenz" here, "Tage Zählen" in the breadcrumb and
        // "Datumsdifferenz" on the tool card.
        { href: ROUTES.differenz, label: routeLabel('differenz', locale).label, icon: SplitSquareHorizontal, description: routeLabel('differenz', locale).description },
        { href: ROUTES.addieren, label: routeLabel('addieren', locale).label, icon: PlusSquare, description: routeLabel('addieren', locale).description },
        { href: ROUTES.arbeitstage, label: routeLabel('arbeitstage', locale).label, icon: Briefcase, description: routeLabel('arbeitstage', locale).description },
        { href: ROUTES.alter, label: routeLabel('alter', locale).label, icon: User, description: routeLabel('alter', locale).description },
        { href: ROUTES.ratgeber, label: routeLabel('ratgeber', locale).label, icon: BookOpen, description: routeLabel('ratgeber', locale).description },
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
            {/*
              Styled entirely by #skip-nav in globals.css. It previously carried
              that CSS *and* a stack of Tailwind focus utilities implementing a
              second, different reveal (absolute/top:-100% versus
              sr-only/focus:fixed). The Tailwind version also painted a hot-pink
              glow, rgba(255,0,85,0.5), left over from a neon theme this palette
              replaced.
            */}
            <a href="#main-content" id="skip-nav">
                {t('skipToContent')}
            </a>

            {/* ── Main Header ── */}
            <header
                role="banner"
                className="sticky top-0 z-50 w-full bg-background/85 backdrop-blur border-b border-line py-3"
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
                                className="w-10 h-10 rounded-xl border border-line shadow-sm group-hover:scale-105 transition-all duration-300 object-cover"
                            />
                            <strong
                                className="font-black text-lg sm:text-xl tracking-tighter text-ink leading-none select-none"
                            >
                                {t('title')}
                            </strong>
                        </Link>

                        {/* ── Desktop Navigation ── */}
                        <nav
                            aria-label={t('Nav.ariaLabel')}
                            /*
                              No SiteNavigationElement microdata. Structured
                              data is JSON-LD everywhere else after the schema
                              audit, and this was the last microdata island --
                              a second, weaker vocabulary describing navigation
                              the sitemap and internal links already express.
                            */
                            className="hidden lg:flex lg:flex-row items-center gap-1 bg-surface-2 px-2 py-1.5 rounded-2xl border border-line"
                        >
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        aria-current={isActive ? 'page' : undefined}
                                        title={link.description}
                                        className={`relative flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 group overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                                            isActive
                                                ? 'text-accent bg-accent-dim'
                                                : 'text-ink-2 hover:text-ink hover:bg-surface-3'
                                        }`}
                                    >
                                        <link.icon
                                            className={`w-4 h-4 shrink-0 transition-all ${
                                                isActive ? 'text-accent' : 'opacity-60 group-hover:opacity-100 group-hover:text-accent'
                                            }`}
                                            aria-hidden="true"
                                        />
                                        <span>{link.label}</span>
                                        {/* Was bg-neon-blue with a cyan glow,
                                            rgba(0,210,255,0.7) -- the other
                                            surviving artefact of the neon
                                            theme, on a navy palette. */}
                                        {isActive && (
                                            <span
                                                aria-hidden="true"
                                                className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-accent rounded-full"
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
                                    /* h-11 = 44px, the minimum comfortable
                                       target. Was px-3 py-2 on text-xs, which
                                       came out around 32px. */
                                    className="flex items-center gap-1.5 h-11 px-4 text-xs font-bold uppercase tracking-widest text-ink-2 hover:text-ink rounded-xl border border-line-2 bg-surface hover:bg-surface-2 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                >
                                    <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                                    {locale.toUpperCase()}
                                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                                </button>
                                {langOpen && (
                                    <div
                                        role="listbox"
                                        aria-labelledby="lang-toggle"
                                        className="absolute right-0 top-full mt-2 min-w-[9rem] bg-surface border border-line rounded-2xl shadow-lg overflow-hidden animate-slide-up-fade z-50 py-1.5"
                                    >
                                        {locales.map((loc) => (
                                            <button
                                                key={loc}
                                                role="option"
                                                aria-selected={locale === loc}
                                                onClick={() => handleLocaleChange(loc)}
                                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                                                    locale === loc
                                                        ? 'text-accent bg-accent-dim font-bold'
                                                        : 'text-ink-2 hover:text-ink hover:bg-surface font-medium'
                                                }`}
                                            >
                                                {tCommon(loc)}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* CTA */}
                            <ButtonLink
                                href={locale === 'de' ? '/#tools' : `/${locale}#tools`}
                                className="group"
                            >
                                {t('Nav.cta')}
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                            </ButtonLink>
                        </div>

                        {/* ── Mobile Menu Toggle ── */}
                        <button
                            aria-controls="mobile-nav"
                            aria-expanded={mobileMenuOpen}
                            aria-label={mobileMenuOpen ? t('Nav.closeMenu') : t('Nav.openMenu')}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden relative z-50 flex items-center justify-center h-11 w-11 rounded-xl text-ink-2 hover:text-ink bg-surface border border-line-2 hover:bg-surface-2 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
                /*
                 * The drawer stays mounted so it can animate, and it was hidden
                 * with opacity and pointer-events alone. pointer-events-none
                 * stops the mouse but not the keyboard: tabbing through a
                 * closed page walked into invisible links inside a dialog
                 * marked aria-modal, with no way to see where focus had gone.
                 *
                 * `inert` takes the whole subtree out of the tab order and the
                 * accessibility tree while leaving the transition intact.
                 */
                inert={!mobileMenuOpen}
                className={`fixed inset-0 z-40 lg:hidden flex flex-col transition-all duration-500 ease-in-out ${
                    mobileMenuOpen
                        ? 'opacity-100 pointer-events-auto'
                        : 'opacity-0 pointer-events-none'
                }`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-background/95 backdrop-blur-xl"
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
                        <span className="font-black text-lg tracking-tighter text-ink">{t('title')}</span>
                    </div>

                    <nav
                        aria-label={t('Nav.mobileNavLabel')}
                        className="flex flex-col gap-2 flex-1"
                    >
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    aria-current={isActive ? 'page' : undefined}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-4 px-6 py-5 rounded-2xl text-xl font-bold transition-all duration-200 ${
                                        isActive
                                            ? 'text-accent bg-accent-dim border border-accent-line'
                                            : 'text-ink-2 hover:text-ink hover:bg-surface-2'
                                    }`}
                                >
                                    <link.icon
                                        className={`w-6 h-6 shrink-0 ${isActive ? 'text-accent' : 'text-ink-3'}`}
                                        aria-hidden="true"
                                    />
                                    <span>{link.label}</span>
                                    {isActive && (
                                        <span aria-hidden="true" className="ml-auto w-2 h-2 rounded-full bg-accent shrink-0" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Mobile CTA */}
                    <ButtonLink
                        href={locale === 'de' ? '/#tools' : `/${locale}#tools`}
                        onClick={() => setMobileMenuOpen(false)}
                        size="large"
                        className="w-full mb-6 mt-4"
                    >
                        {t('Nav.cta')}
                        <ArrowRight className="w-5 h-5" aria-hidden="true" />
                    </ButtonLink>

                    {/* Mobile Language Switcher */}
                    <div className="border-t border-line pt-6">
                        {/* Was text-slate-400: 2.79:1 on white, under the 4.5:1
                            floor, on 12px uppercase text. slate-600 is 7:1. */}
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-2 mb-4 px-2">
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
                                            ? 'bg-accent-dim text-accent border border-accent-line'
                                            : 'text-ink-3 hover:text-ink border border-line hover:border-line-2 bg-surface'
                                    }`}
                                >
                                    <span className="capitalize">{tCommon(loc)}</span>
                                    <span className="text-xs text-ink-3 uppercase tracking-widest">{loc}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
