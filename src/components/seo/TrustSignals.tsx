import { Link } from '@/i18n/routing';

export function TrustSignals({ locale = 'de' }: { locale?: string }) {
    const isDe = locale === 'de';
    const lastUpdated = new Date().toLocaleDateString(isDe ? 'de-DE' : 'en-US', {
        day: '2-digit', month: 'long', year: 'numeric'
    });

    return (
        <div className="flex flex-col items-center gap-8 mt-16 mb-12 animate-slide-up-fade">
            <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm group hover:border-neon/30 transition-all">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-white/70 text-xs font-bold uppercase tracking-widest">
                        {isDe ? 'ISO 8601 konform' : 'ISO 8601 compliant'}
                    </span>
                </div>
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm group hover:border-neon-blue/30 transition-all">
                    <svg className="w-4 h-4 text-neon-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-white/70 text-xs font-bold uppercase tracking-widest">
                        {isDe ? 'Verifizierte Rechenlogik' : 'Verified Logic'}
                    </span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 text-white/30 text-sm">
                <div className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                    {isDe ? 'Zuletzt aktualisiert:' : 'Last updated:'} {lastUpdated}
                </div>
                <div className="hidden sm:flex items-center gap-4">
                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                    <Link href="/ueber-uns" className="hover:text-white transition-colors">{isDe ? 'Über uns' : 'About us'}</Link>
                    <Link href="/datenschutz" className="hover:text-white transition-colors">{isDe ? 'Datenschutz' : 'Privacy'}</Link>
                </div>
            </div>
        </div>
    );
}
