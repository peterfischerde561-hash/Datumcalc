'use client';

import { useLocale, useTranslations } from 'next-intl';
import { locales, usePathname, useRouter, routing } from '@/i18n/routing';
import { useParams, usePathname as useNextPathname, useRouter as useNextRouter } from 'next/navigation';

import { translateSlug, reverseTranslateSlug, getCanonicalPath, INTENT_TRANSLATIONS } from '@/lib/seo/translations';
import { getLocalizedArticleSlug } from '@/lib/articles';

export function LanguageSwitcher() {
    const t = useTranslations('Common.languages');
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const params = useParams();
    const nextPathname = useNextPathname();
    const nextRouter = useNextRouter();

    const handleLocaleChange = (newLocale: string) => {
        const prefix = newLocale === 'de' ? '' : `/${newLocale}`;
        
        // Dynamic SEO routes (calculators)
        if (params && (params.intent || params.slug)) {
            const currentIntent = Array.isArray(params.intent) ? params.intent[0] : params.intent as string;
            const currentSlugArr = params.slug ? (Array.isArray(params.slug) ? params.slug : [params.slug]) : undefined;
            const currentSlugStr = currentSlugArr ? currentSlugArr.join('-') : undefined;

            // Resolve internal intent key (German)
            const internalIntent = Object.keys(INTENT_TRANSLATIONS[locale]).find(k => INTENT_TRANSLATIONS[locale][k] === currentIntent) || currentIntent;
            
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
            const internalPath = pathname as keyof typeof routing.pathnames;
            const localizedPath = (routing.pathnames as any)[internalPath]?.[newLocale] || pathname;
            nextRouter.push(`${prefix}${localizedPath}`);
        }
    };

    return (
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 text-xs font-medium uppercase tracking-widest">
            {locales.map((cur) => (
                <button
                    key={cur}
                    onClick={() => handleLocaleChange(cur)}
                    className={`transition-all duration-300 ${
                        locale === cur
                            ? 'text-blue-700 border-b border-blue-400 pb-0.5'
                            : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                    {t(cur)}
                </button>
            ))}
        </div>
    );
}
