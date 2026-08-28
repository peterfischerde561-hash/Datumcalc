import NextLink from 'next/link';
import { useTranslations } from 'next-intl';
import { translateSlug, getCanonicalPath } from '@/lib/seo/translations';
import { relatedFor } from '@/lib/seo/relatedLinks';
import { routeLabel, ToolKey } from '@/lib/seo/routeLabels';
import { Card } from '@/components/ui/Card';

/**
 * Related calculations for a programmatic page.
 *
 * Link selection lives in relatedLinks.ts; this component only renders it.
 * The previous version hardcoded the same fourteen links on every page,
 * including a link to the page itself.
 */
export function InternalLinksBlock({
    locale,
    intent,
    slug
}: {
    locale: string;
    intent: string;
    slug: string;
}) {
    const tEvents = useTranslations('Events');
    const isDe = locale === 'de';

    // `intent` arrives localized (/add vs /addieren); relatedFor keys on the
    // internal name.
    const internal = (
        { add: 'addieren', difference: 'differenz', business: 'arbeitstage', age: 'alter' } as Record<string, string>
    )[intent] ?? intent;

    const links = relatedFor(internal as ToolKey, slug).map((link) => {
        if (link.kind === 'hub') {
            const label = routeLabel(link.slug as ToolKey, locale);
            return {
                href: getCanonicalPath(locale, link.slug),
                label: label.label,
                type: isDe ? 'Übersicht' : 'Overview'
            };
        }

        if (link.kind === 'guide') {
            const guideSlug = translateSlug(link.slug, locale);
            return {
                href: getCanonicalPath(locale, 'ratgeber', guideSlug),
                label: isDe ? guideLabelDe(link.slug) : guideLabelEn(link.slug),
                type: isDe ? 'Ratgeber' : 'Guide'
            };
        }

        const locSlug = translateSlug(link.slug, locale);
        if (link.kind === 'event') {
            const key = link.slug.replace('tage-bis-', '');
            let name = key;
            try {
                name = tEvents(key);
            } catch {
                /* fall back to the key */
            }
            return {
                href: getCanonicalPath(locale, 'differenz', locSlug),
                label: isDe ? `Tage bis ${name}` : `Days until ${name}`,
                type: isDe ? 'Countdown' : 'Countdown'
            };
        }

        return {
            href: getCanonicalPath(locale, 'addieren', locSlug),
            label: locSlug.replace(/-/g, ' '),
            type: isDe ? 'Rechner' : 'Calculator'
        };
    });

    return (
        <Card as="section">
            <h2 className="text-xl font-bold mb-6 text-slate-900">
                {isDe ? 'Verwandte Berechnungen & Themen' : 'Related Calculations'}
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {links.map((link) => (
                    <li key={link.href}>
                        <NextLink
                            href={link.href}
                            className="block p-4 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                        >
                            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2 block">
                                {link.type}
                            </span>
                            <span className="text-slate-700 group-hover:text-slate-900 flex items-center gap-2 first-letter:uppercase">
                                {link.label}
                                <svg
                                    className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </NextLink>
                    </li>
                ))}
            </ul>
        </Card>
    );
}

function guideLabelDe(slug: string): string {
    return {
        'schaltjahre-erklaert': 'Schaltjahre erklärt',
        'was-ist-ein-arbeitstag': 'Was ist ein Arbeitstag?',
        'wochen-im-jahr': 'Wie viele Wochen hat ein Jahr?',
        'iso-8601-erklaert': 'ISO 8601 erklärt'
    }[slug] ?? slug.replace(/-/g, ' ');
}

function guideLabelEn(slug: string): string {
    return {
        'schaltjahre-erklaert': 'Leap years explained',
        'was-ist-ein-arbeitstag': 'What is a business day?',
        'wochen-im-jahr': 'How many weeks are in a year?',
        'iso-8601-erklaert': 'ISO 8601 explained'
    }[slug] ?? slug.replace(/-/g, ' ');
}
