import { Link } from '@/i18n/routing';

export function TrustSignals({ locale = 'de' }: { locale?: string }) {
    const isDe = locale === 'de';
    const lastUpdated = new Date().toLocaleDateString(isDe ? 'de-DE' : 'en-US', {
        day: '2-digit', month: 'long', year: 'numeric'
    });

    return (
        <div className="flex flex-col items-start gap-6 mt-8 pt-8 border-t border-slate-200">
            <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-slate-50 border border-slate-200">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-slate-600 text-xs font-semibold uppercase tracking-wide">
                        {isDe ? 'ISO 8601 konform' : 'ISO 8601 compliant'}
                    </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-slate-50 border border-slate-200">
                    <svg className="w-4 h-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-slate-600 text-xs font-semibold uppercase tracking-wide">
                        {isDe ? 'Verifizierte Rechenlogik' : 'Verified Logic'}
                    </span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-slate-500 text-sm">
                <div className="flex items-center gap-2">
                    {isDe ? 'Zuletzt aktualisiert:' : 'Last updated:'} {lastUpdated}
                </div>
                <div className="hidden sm:flex items-center gap-4">
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <Link href="/ueber-uns" className="hover:text-blue-700 hover:underline transition-colors">{isDe ? 'Über uns' : 'About us'}</Link>
                    <Link href="/datenschutz" className="hover:text-blue-700 hover:underline transition-colors">{isDe ? 'Datenschutz' : 'Privacy'}</Link>
                </div>
            </div>
        </div>
    );
}
