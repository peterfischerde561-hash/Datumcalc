import { Link } from '@/i18n/routing';
import { translateSlug } from '@/lib/seo/translations';

const SHORTCUTS = [
    { days: 30, color: 'hover:border-neon/50' },
    { days: 60, color: 'hover:border-neon-blue/50' },
    { days: 90, color: 'hover:border-purple-500/50' },
    { days: 180, color: 'hover:border-green-500/50' },
    { days: 365, color: 'hover:border-white/50' }
];

export function QuickShortcuts({ locale }: { locale: string }) {
    const isDe = locale === 'de';
    
    return (
        <div className="flex flex-wrap gap-2 mt-4 animate-slide-up-fade" style={{ animationDelay: '0.1s' }}>
            <span className="text-white/30 text-xs font-bold uppercase tracking-widest mr-2 flex items-center">
                {isDe ? 'Beliebte Abfragen:' : 'Popular Queries:'}
            </span>
            {SHORTCUTS.map((s) => {
                const slug = `${s.days}-tage-ab-heute`;
                const locSlug = translateSlug(slug, locale);
                return (
                    <Link 
                        key={s.days}
                        href={{
                            pathname: '/addieren/[...slug]',
                            params: { slug: [locSlug] }
                        }}
                        className={`px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs font-medium text-white/60 hover:text-white transition-all ${s.color} hover:bg-white/10`}
                    >
                        +{s.days} {isDe ? 'Tage' : 'Days'}
                    </Link>
                );
            })}
        </div>
    );
}
