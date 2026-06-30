import { Link } from '@/i18n/routing';
import { translateSlug } from '@/lib/seo/translations';
import { resolveCanonicalQuery } from '@/lib/seo/queryModel';

const SHORTCUTS = [
    { days: 30, color: 'hover:border-blue-400' },
    { days: 60, color: 'hover:border-sky-400' },
    { days: 90, color: 'hover:border-purple-400' },
    { days: 180, color: 'hover:border-green-400' },
    { days: 365, color: 'hover:border-slate-400' }
];

export function QuickShortcuts({ locale }: { locale: string }) {
    const isDe = locale === 'de';
    
    return (
        <div className="flex flex-wrap gap-2 mt-4 animate-slide-up-fade" style={{ animationDelay: '0.1s' }}>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mr-2 flex items-center">
                {isDe ? 'Beliebte Abfragen:' : 'Popular Queries:'}
            </span>
            {SHORTCUTS.map((s) => {
                const slug = `${s.days}-tage-ab-heute`;
                const { canonicalSlug } = resolveCanonicalQuery(slug);
                const finalSlug = canonicalSlug || slug;
                const locSlug = translateSlug(finalSlug, locale);
                return (
                    <Link 
                        key={s.days}
                        href={{
                            pathname: '/addieren/[...slug]',
                            params: { slug: [locSlug] }
                        }}
                        className={`px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:text-blue-700 transition-all ${s.color} hover:bg-slate-50`}
                    >
                        +{s.days} {isDe ? 'Tage' : 'Days'}
                    </Link>
                );
            })}
        </div>
    );
}
