import { ExternalLink, Mail } from 'lucide-react';

export function AffiliateCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto mt-8">
            {/* Card 1 */}
            <div className="group relative rounded-3xl border border-white/5 bg-[#0a0a0a]/50 p-6 overflow-hidden transition-colors hover:border-white/10 hover:bg-[#0a0a0a]">
                <div className="absolute top-0 right-0 p-4">
                    <div className="w-12 h-12 rounded-bl-3xl bg-gradient-to-br from-neon to-neon-blue flex items-center justify-center -mt-8 -mr-8 opacity-80 group-hover:opacity-100 transition-opacity">
                        <span className="text-white font-bold text-lg mt-3 mr-3">%</span>
                    </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Zeit sparen mit Notion</h3>
                <p className="text-sm text-white/50 mb-6 leading-relaxed max-w-[85%]">
                    Fristen, Notizen und Kalender an einem Ort verwalten.
                </p>
                <a href="#" className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                    Jetzt testen <ExternalLink className="w-4 h-4" />
                </a>
            </div>

            {/* Card 2 */}
            <div className="group relative rounded-3xl border border-white/5 bg-[#0a0a0a]/50 p-6 overflow-hidden transition-colors hover:border-white/10 hover:bg-[#0a0a0a]">
                <div className="absolute top-0 right-0 p-4">
                    <div className="w-12 h-12 rounded-bl-3xl bg-gradient-to-br from-neon to-neon-blue flex items-center justify-center -mt-8 -mr-8 opacity-80 group-hover:opacity-100 transition-opacity">
                        <span className="text-white font-bold text-lg mt-3 mr-3">%</span>
                    </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Rechtssichere Verträge</h3>
                <p className="text-sm text-white/50 mb-6 leading-relaxed max-w-[85%]">
                    Nutze Vorlagen, die immer das richtige Fristdatum enthalten. Ohne Anwalt.
                </p>
                <a href="#" className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                    Zur Bibliothek <ExternalLink className="w-4 h-4" />
                </a>
            </div>
        </div>
    );
}

export function NewsletterSignup() {
    return (
        <div className="w-full max-w-4xl mx-auto mt-8 rounded-3xl border border-white/5 bg-gradient-to-b from-[#0a0a0a]/80 to-[#050505] p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-neon/10 blur-[60px] pointer-events-none" />
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-neon-blue to-neon rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,0,85,0.2)]">
                <Mail className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Bleib auf dem Laufenden</h3>
            <p className="text-white/50 max-w-md mx-auto mb-8 text-sm leading-relaxed">
                Erhalte unsere besten Tipps zu Zeitmanagement, Produktivität und neuen Funktionen einmal im Monat. Kein Spam.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                    type="email"
                    placeholder="E-Mail Adresse"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-neon transition-colors"
                    required
                />
                <button type="submit" className="bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors">
                    Abonnieren
                </button>
            </form>
        </div>
    );
}
