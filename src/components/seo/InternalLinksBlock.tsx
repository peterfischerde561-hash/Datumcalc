import { Link } from '@/i18n/routing';
import { ROUTES } from '@/lib/routes';
import { translateSlug, INTENT_TRANSLATIONS } from '@/lib/seo/translations';
import { useTranslations } from 'next-intl';

export function InternalLinksBlock({ locale, intent, slug }: { locale: string; intent: string; slug: string }) {
    const t = useTranslations('Header.Nav');
    const tEvents = useTranslations('Events');
    
    const links: { label: string; href: any; type: string }[] = [];
    
    const match = slug.match(/^(\d+)-/);
    const numValue = match ? parseInt(match[1]) : 0;

    const isDe = locale === 'de';
    
    const allowedAddieren = [
        '30-tage-ab-heute',
        '60-tage-ab-heute',
        '90-tage-ab-heute',
        '100-tage-ab-heute',
        '6-monate-ab-heute',
        '1-jahr-ab-heute'
    ];

    allowedAddieren.forEach(s => {
        const locSlug = translateSlug(s, locale);
        const locLabel = locSlug.replace(/-/g, ' ');
        links.push({ 
            label: locLabel, 
            href: ROUTES.getAddieren(locSlug), 
            type: isDe ? 'Beliebt' : 'Popular' 
        });
    });

    // Add more event & guide links
    const events = [
        { key: 'weihnachten', slug: 'tage-bis-weihnachten' },
        { key: 'silvester', slug: 'tage-bis-silvester' },
        { key: 'neujahr', slug: 'tage-bis-neujahr' },
        { key: 'ostern', slug: 'tage-bis-ostern' },
        { key: 'sommeranfang', slug: 'tage-bis-sommeranfang' },
        { key: 'urlaub', slug: 'tage-bis-urlaub' }
    ];

    events.forEach(e => {
        const label = `${t('differenz')}: ${tEvents(e.key)}`;
        links.push({ 
            label, 
            href: ROUTES.getDifferenz(translateSlug(e.slug, locale)), 
            type: isDe ? 'Event' : 'Event' 
        });
    });

    links.push({ 
        label: t('arbeitstage'), 
        href: '/arbeitstage', 
        type: isDe ? 'Ratgeber' : 'Guide' 
    });

    links.push({ 
        label: t('ratgeber'), 
        href: '/ratgeber', 
        type: isDe ? 'Ratgeber' : 'Guide' 
    });

    return (
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 mb-12">
            <h2 className="text-xl font-bold mb-6 text-white">{isDe ? 'Verwandte Berechnungen & Themen' : 'Related Calculations'}</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {links.map((link, i) => (
                    <li key={i}>
                        <Link
                            href={link.href}
                            className="block p-4 rounded-xl bg-black/40 border border-white/5 hover:border-neon-blue/50 hover:bg-neon-blue/5 transition-all group"
                        >
                            <span className="text-xs font-medium text-neon uppercase tracking-wider mb-2 block">{link.type}</span>
                            <span className="text-white/80 group-hover:text-white flex items-center gap-2">
                                {link.label}
                                <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
