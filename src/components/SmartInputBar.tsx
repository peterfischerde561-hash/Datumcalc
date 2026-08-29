'use client';

import { useState, useId } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { INTENT_TRANSLATIONS, translateSlug } from '@/lib/seo/translations';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';

export function SmartInputBar() {
    const t = useTranslations('SmartInput');
    const [query, setQuery] = useState('');
    const searchId = useId();
    const router = useRouter();
    const params = useParams();
    const locale = (params?.locale as string) || 'de';

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        // MVP intent parsing
        const lower = query.toLowerCase();
        
        let intent = 'addieren';
        if (lower.includes('tage bis') || lower.includes('tage vor')) {
            intent = 'differenz';
        } else if (lower.includes('arbeitstage') || lower.includes('werktage')) {
            intent = 'arbeitstage';
        } else if (lower.includes('alter') || lower.includes('alt')) {
            intent = 'alter';
        }

        const locIntent = INTENT_TRANSLATIONS[locale][intent] || intent;
        const slug = lower.replace(/ /g, '-');
        const prefix = locale === 'de' ? '' : `/${locale}`;
        const url = `${prefix}/${locIntent}/${slug}`;

        router.push(url);
    };

    return (
        <div className="w-full max-w-3xl mx-auto mb-16 px-4 md:px-0">
            <form onSubmit={handleSearch} className="relative group">
                <div className="relative flex items-center bg-surface rounded-2xl border border-line-2 p-2 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/40 transition-colors">
                    <Search className="w-6 h-6 text-ink-3 ml-3" aria-hidden="true" />
                    {/*
                      A placeholder is not a label: it disappears on the first
                      keystroke and is not reliably announced. The visible label
                      is the surrounding design, so this one is for assistive
                      technology only.
                    */}
                    <label htmlFor={searchId} className="sr-only">
                        {t('placeholder')}
                    </label>
                    <input
                        id={searchId}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('placeholder')}
                        className="w-full bg-transparent text-ink placeholder-ink-3 px-4 py-3 text-[17px] focus:outline-none"
                    />
                    <Button type="submit" className="whitespace-nowrap shrink-0">
                        {t('button')}
                    </Button>
                </div>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-5 text-sm font-medium text-ink-3">
                    <span className="hidden sm:inline">{t('popular')}</span>
                    {/*
                  These two examples have real pages, so they are links rather
                  than buttons that only prefill the box: a crawlable route from
                  the homepage to two of its best-performing URLs.
                */}
                <Link
                    href={{ pathname: '/addieren/[...slug]', params: { slug: [translateSlug('100-tage-ab-heute', locale)] } }}
                    className="hover:text-accent hover:underline transition-colors"
                >
                    {t('example1')}
                </Link>
                    <Link
                    href={{ pathname: '/differenz/[...slug]', params: { slug: [translateSlug('tage-bis-weihnachten', locale)] } }}
                    className="hover:text-accent hover:underline transition-colors"
                >
                    {t('example2')}
                </Link>
                    <button type="button" onClick={() => setQuery(t('example3').replace('2024', new Date().getFullYear().toString()))} className="hover:text-accent transition-colors">
                        {t('example3').replace('2024', new Date().getFullYear().toString())}
                    </button>
                </div>

                {/* Helper text for tool cards below */}
                <div className="text-center mt-12 mb-6">
                    <p className="text-ink-3 font-bold text-sm uppercase tracking-widest">
                        {t('helper')}
                    </p>
                </div>
            </form>
        </div>
    );
}
