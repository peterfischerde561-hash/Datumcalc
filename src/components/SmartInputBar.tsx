'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { INTENT_TRANSLATIONS } from '@/lib/seo/translations';

export function SmartInputBar() {
    const t = useTranslations('SmartInput');
    const [query, setQuery] = useState('');
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
                <div className="relative flex items-center bg-white rounded-2xl border border-slate-300 p-2 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
                    <Search className="w-6 h-6 text-slate-400 ml-3" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('placeholder')}
                        className="w-full bg-transparent text-slate-900 placeholder-slate-400 px-4 py-3 text-[17px] focus:outline-none"
                    />
                    <button
                        type="submit"
                        className="bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-800 transition-colors whitespace-nowrap"
                    >
                        {t('button')}
                    </button>
                </div>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-5 text-sm font-medium text-slate-500">
                    <span className="hidden sm:inline">{t('popular')}</span>
                    <button type="button" onClick={() => setQuery(t('example1'))} className="hover:text-blue-700 transition-colors">{t('example1')}</button>
                    <button type="button" onClick={() => setQuery(t('example2'))} className="hover:text-blue-700 transition-colors">{t('example2')}</button>
                    <button type="button" onClick={() => setQuery(t('example3').replace('2024', new Date().getFullYear().toString()))} className="hover:text-blue-700 transition-colors">
                        {t('example3').replace('2024', new Date().getFullYear().toString())}
                    </button>
                </div>

                {/* Helper text for tool cards below */}
                <div className="text-center mt-12 mb-6">
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">
                        {t('helper')}
                    </p>
                </div>
            </form>
        </div>
    );
}
