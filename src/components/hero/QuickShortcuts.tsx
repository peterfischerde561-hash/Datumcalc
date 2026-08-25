import { Link } from '@/i18n/routing';
import { translateSlug } from '@/lib/seo/translations';
import { resolveCanonicalQuery } from '@/lib/seo/queryModel';

/**
 * The chip label must describe the page it opens.
 *
 * Previously the list was days-only, so `180` and `365` resolved through
 * QUERY_ALIASES to the 6-month and 1-year pages but were still labelled
 * "+180 Tage" and "+365 Tage". Six calendar months is not 180 days, and a year
 * is 365 or 366 — mislabelling calendar arithmetic as day arithmetic in the
 * hero of a calendar-accuracy site is self-inflicted.
 */
const SHORTCUTS: { slug: string; de: string; en: string; color: string }[] = [
    { slug: '30-tage-ab-heute', de: '+30 Tage', en: '+30 days', color: 'hover:border-blue-400' },
    { slug: '60-tage-ab-heute', de: '+60 Tage', en: '+60 days', color: 'hover:border-sky-400' },
    { slug: '90-tage-ab-heute', de: '+90 Tage', en: '+90 days', color: 'hover:border-purple-400' },
    { slug: '6-monate-ab-heute', de: '+6 Monate', en: '+6 months', color: 'hover:border-green-400' },
    { slug: '1-jahr-ab-heute', de: '+1 Jahr', en: '+1 year', color: 'hover:border-slate-400' }
];

export function QuickShortcuts({ locale }: { locale: string }) {
    const isDe = locale === 'de';
    
    return (
        <div className="flex flex-wrap gap-2 mt-4 animate-slide-up-fade" style={{ animationDelay: '0.1s' }}>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mr-2 flex items-center">
                {isDe ? 'Beliebte Abfragen:' : 'Popular Queries:'}
            </span>
            {SHORTCUTS.map((s) => {
                const { canonicalSlug } = resolveCanonicalQuery(s.slug);
                const locSlug = translateSlug(canonicalSlug || s.slug, locale);
                return (
                    <Link
                        key={s.slug}
                        href={{
                            pathname: '/addieren/[...slug]',
                            params: { slug: [locSlug] }
                        }}
                        className={`px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:text-blue-700 transition-all ${s.color} hover:bg-slate-50`}
                    >
                        {isDe ? s.de : s.en}
                    </Link>
                );
            })}
        </div>
    );
}
