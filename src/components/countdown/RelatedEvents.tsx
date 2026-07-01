import NextLink from 'next/link';
import { EVENT_NAMES } from '@/lib/events';
import { translateSlug, getCanonicalPath } from '@/lib/seo/translations';

const EVENT_KEYS = ['weihnachten', 'silvester', 'neujahr', 'ostern', 'sommeranfang', 'urlaub'];

export function RelatedEvents({ locale, currentEventKey }: { locale: string; currentEventKey: string }) {
    const isDe = locale === 'de';
    const others = EVENT_KEYS.filter((k) => k !== currentEventKey);

    return (
        <section aria-label={isDe ? 'Weitere Countdowns' : 'More countdowns'} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">
                {isDe ? 'Weitere Countdowns' : 'More countdowns'}
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {others.map((key) => {
                    const ev = EVENT_NAMES[key];
                    const label = isDe ? ev.de.replace(/^Der /, '') : ev.en.replace(/^the /, '').replace(/^your /, '');
                    const locSlug = translateSlug(`tage-bis-${key}`, locale);
                    const href = getCanonicalPath(locale, 'differenz', locSlug);
                    return (
                        <li key={key}>
                            <NextLink
                                href={href}
                                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50 transition-all group"
                            >
                                <span className="font-medium text-slate-800 capitalize">
                                    {isDe ? `Tage bis ${label}` : `Days until ${label}`}
                                </span>
                                <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </NextLink>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
