'use client';

import { useState } from 'react';

export function ConversionTools({ locale = 'de' }: { locale?: string }) {
    const isDe = locale === 'de';
    const [copied, setCopied] = useState(false);

    const copyLink = async () => {
        if (typeof window === 'undefined') return;
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard API unavailable (e.g. insecure context) – fail silently.
        }
    };

    return (
        <div className="flex flex-wrap justify-center gap-3 mt-8 mb-16 px-4">
            <button
                onClick={copyLink}
                aria-live="polite"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-all text-sm font-medium"
            >
                {copied ? (
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                )}
                {copied ? (isDe ? 'Link kopiert!' : 'Link copied!') : (isDe ? 'Link kopieren' : 'Copy link')}
            </button>
            <a
                href={isDe ? '/' : `/${locale}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-neon/10 hover:bg-neon/20 border border-neon/30 text-neon transition-all text-sm font-medium"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isDe ? 'Neue Berechnung' : 'New calculation'}
            </a>
        </div>
    );
}
