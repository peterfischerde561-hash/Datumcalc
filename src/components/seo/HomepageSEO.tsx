import { Link } from '@/i18n/routing';
import { ROUTES } from '@/lib/routes';
import { CheckCircle2, CalendarCheck2, Clock4, Users, ShieldCheck } from 'lucide-react';
import { SITE_URL } from '@/lib/constants';
import { translateSlug } from '@/lib/seo/translations';

const siteUrl = SITE_URL;
const dateModified = new Date().toISOString().split('T')[0];

const CONTENT: Record<string, any> = {
    de: {
        faqs: [
            {
                question: 'Sind die Berechnungen zeitzonenunabhängig?',
                answer: 'Ja. Die interne Logik unseres Datumsrechners greift auf lokalisierte und neutralisierte UTC-Zeitstempel zurück. Die Dauer zwischen zwei Daten bleibt unabhängig von Ihrer aktuellen Zeitzone exakt identisch.',
            },
            {
                question: 'Werden Feiertage bei den Arbeitstagen berücksichtigt?',
                answer: 'In der aktuellen Version werden reguläre Wochenenden (Samstag und Sonntag) sicher herausgefiltert. Eine automatische Berücksichtigung von gesetzlichen Feiertagen wird derzeit nicht nativ unterstützt, diese müssen manuell abgezogen werden.',
            },
            {
                question: 'Werden Schaltjahre wie der 29. Februar korrekt berechnet?',
                answer: 'Absolut. Unsere Core-Engine basiert auf ISO-8601-Standards und berechnet Schaltjahre, Schaltsekunden und wechselnde Monatslängen auf den Tag genau, ohne Rundungsfehler.',
            },
            {
                question: 'Wie viele Tage hat ein Jahr?',
                answer: 'Ein Normaljahr hat 365 Tage. Ein Schaltjahr hat 366 Tage und tritt alle vier Jahre auf (mit Ausnahmen für säkulare Jahre). Unser Rechner berücksichtigt dies automatisch.',
            },
            {
                question: 'Kann ich den Datumsrechner kostenlos nutzen?',
                answer: 'Ja, der Datumsrechner ist vollständig kostenlos und ohne Anmeldung nutzbar. Alle Berechnungen – Datumsdifferenz, Datum addieren und Arbeitstage – stehen unbegrenzt zur Verfügung.',
            },
        ],
        trustSignals: [
            { icon: CheckCircle2, label: 'ISO 8601 konform', color: 'text-green-400' },
            { icon: CalendarCheck2, label: 'Schaltjahre berechnet', color: 'text-neon-blue' },
            { icon: Clock4, label: 'Sekundenschnell', color: 'text-neon' },
            { icon: ShieldCheck, label: '100% kostenlos', color: 'text-white/70' },
        ],
        hero: {
            title: 'Entdecke den Datumsrechner',
            subtitle: 'Häufig gesuchte Fristen und Ereignisse auf einen Klick.',
            fristen: 'Beliebte Fristen',
            ereignisse: 'Ereignisse & Countdowns',
            ratgeber: 'Ratgeber & Wissen'
        },
        seo: {
            headline: 'Der ultimative Datumsrechner für Profis und Alltag',
            u1: 'Egal ob Sie Projektfristen planen, Ihr genaues Alter in Tagen berechnen oder wissen möchten, an welchem Wochentag ein bestimmtes Datum liegt – unser <strong>Datumsrechner</strong> liefert sekundenschnelle, präzise Antworten. Die Ergebnisse sind perfekt für Kalender, Countdowns und rechtliche Fristen.',
            u2: 'Mit unserem Tool können Sie <strong>Tage zwischen zwei Daten berechnen</strong>, <strong>Datum addieren oder subtrahieren</strong> sowie <strong>Netto-Arbeitstage</strong> ermitteln – alles in einem einzigen, intuitiven Interface. Keine Anmeldung, keine Werbung, kein Datenschutzproblem.',
            tableTitle: 'Anwendungsfälle im Überblick',
            th1: 'Anwendungsfall',
            th2: 'Empfohlenes Tool',
            th3: 'Typisches Beispiel',
            case1: 'Fristen & Kündigungen',
            case2: 'Projektplanung',
            case3: 'Event Countdowns',
            case4: 'Alter berechnen',
            footer: 'Unser System berücksichtigt dank fortschrittlicher <strong>ISO-8601 Kalender-Algorithmen</strong> komplexe Faktoren wie Schaltjahre sowie unregelmäßige Monatslängen völlig automatisch. Das garantiert 100% mathematische Genauigkeit – ohne Rundungsfehler.'
        },
        howto: {
            title: 'Wie funktioniert der Datumsrechner?',
            subtitle: 'In drei einfachen Schritten zum Ergebnis.',
            steps: [
                { title: 'Tool auswählen', desc: 'Wählen Sie aus Datumsdifferenz, Datum addieren, Arbeitstage oder Alter berechnen.' },
                { title: 'Datum eingeben', desc: 'Geben Sie Start- und Enddatum ein oder wählen Sie aus dem Kalender-Picker.' },
                { title: 'Ergebnis erhalten', desc: 'Das Ergebnis erscheint sofort – in Tagen, Wochen, Monaten und Jahren.' }
            ]
        },
        faqHeading: {
            title: 'Häufig gestellte Fragen',
            subtitle: 'Experten-Antworten rund um die Datumsberechnung.'
        }
    },
    en: {
        faqs: [
            {
                question: 'Are the calculations time zone independent?',
                answer: 'Yes. The internal logic of our date calculator uses localized and neutralized UTC timestamps. The duration between two dates remains exactly identical regardless of your current time zone.',
            },
            {
                question: 'Are public holidays taken into account for business days?',
                answer: 'In the current version, regular weekends (Saturday and Sunday) are safely filtered out. Automatic consideration of public holidays is not natively supported at this time; they must be subtracted manually.',
            },
            {
                question: 'Are leap years like February 29th calculated correctly?',
                answer: 'Absolutely. Our core engine is based on ISO 8601 standards and calculates leap years, leap seconds and changing month lengths to the exact day, without rounding errors.',
            },
            {
                question: 'How many days does a year have?',
                answer: 'A normal year has 365 days. A leap year has 366 days and occurs every four years (with exceptions for secular years). Our calculator takes this into account automatically.',
            },
            {
                question: 'Can I use the date calculator for free?',
                answer: 'Yes, the date calculator is completely free and can be used without registration. All calculations – date difference, adding dates and business days – are available unlimitedly.',
            },
        ],
        trustSignals: [
            { icon: CheckCircle2, label: 'ISO 8601 compliant', color: 'text-green-400' },
            { icon: CalendarCheck2, label: 'Leap years calculated', color: 'text-neon-blue' },
            { icon: Clock4, label: 'Lightning fast', color: 'text-neon' },
            { icon: ShieldCheck, label: '100% free', color: 'text-white/70' },
        ],
        hero: {
            title: 'Explore the Date Calculator',
            subtitle: 'Frequently searched deadlines and events at a click.',
            fristen: 'Popular Deadlines',
            ereignisse: 'Events & Countdowns',
            ratgeber: 'Guides & Knowledge'
        },
        seo: {
            headline: 'The Ultimate Date Calculator for Professionals and Everyday Life',
            u1: 'Whether you are planning project deadlines, calculating your exact age in days or want to know which day of the week a certain date falls on – our <strong>Date Calculator</strong> provides precise answers in seconds. The results are perfect for calendars, countdowns and legal deadlines.',
            u2: 'With our tool, you can <strong>calculate days between two dates</strong>, <strong>add or subtract dates</strong> as well as determine <strong>net business days</strong> – all in a single, intuitive interface. No registration, no ads, no privacy issues.',
            tableTitle: 'Usage Cases at a Glance',
            th1: 'Usage Case',
            th2: 'Recommended Tool',
            th3: 'Typical Example',
            case1: 'Deadlines & Notices',
            case2: 'Project Planning',
            case3: 'Event Countdowns',
            case4: 'Calculate Age',
            footer: 'Thanks to advanced <strong>ISO 8601 calendar algorithms</strong>, our system automatically takes into account complex factors such as leap years and irregular month lengths. This guarantees 100% mathematical accuracy – without rounding errors.'
        },
        howto: {
            title: 'How does the Date Calculator work?',
            subtitle: 'Result in three simple steps.',
            steps: [
                { title: 'Select Tool', desc: 'Choose from date difference, add date, business days or calculate age.' },
                { title: 'Enter Date', desc: 'Enter start and end dates or select from the calendar picker.' },
                { title: 'Get Result', desc: 'The result appears instantly – in days, weeks, months and years.' }
            ]
        },
        faqHeading: {
            title: 'Frequently Asked Questions',
            subtitle: 'Expert answers all about date calculation.'
        }
    }
};

export function HomepageSEO({ locale = 'de' }: { locale?: string }) {
    const loc = CONTENT[locale] ? locale : 'en';
    const c = CONTENT[loc];

    const topQueries = [
        '30-tage-ab-heute',
        '60-tage-ab-heute',
        '90-tage-ab-heute',
        '100-tage-ab-heute',
        '6-monate-ab-heute',
        '1-jahr-ab-heute'
    ].map(canonical => {
        const locSlug = translateSlug(canonical, loc);
        return {
            title: locSlug.replace(/-/g, ' '),
            href: ROUTES.getAddieren(locSlug)
        };
    });
 
    const eventQueries = [
        'tage-bis-weihnachten',
        'tage-bis-silvester',
        'tage-bis-ostern',
        'tage-bis-sommeranfang',
        'tage-bis-neujahr',
        'tage-bis-urlaub'
    ].map(slug => {
        const locSlug = translateSlug(slug, loc);
        return {
            title: locSlug.replace(/-/g, ' '),
            href: ROUTES.getDifferenz(locSlug)
        };
    });

    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': c.faqs.map((faq: any) => ({
            '@type': 'Question',
            'name': faq.question,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': faq.answer,
            },
        })),
    };

    const articleJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        '@id': `${siteUrl}/${loc}/#article`,
        'headline': c.seo.headline,
        'description': loc === 'de' ? 'Kostenloser Online-Datumsrechner für exakte Datumsdifferenzen.' : 'Free online date calculator for exact date differences.',
        'url': `${siteUrl}/${loc}`,
        'dateModified': dateModified,
        'datePublished': '2024-01-01',
        'author': {
            '@type': 'Person',
            'name': 'Felix Schmidt',
            'url': `${siteUrl}/${loc}/ueber-uns`,
        },
        'publisher': {
            '@type': 'Organization',
            'name': 'Datumsrechner',
            '@id': `${siteUrl}/#organization`,
        },
        'inLanguage': loc,
        'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': `${siteUrl}/${loc}`,
        },
    };

    return (
        <article className="w-full max-w-7xl mx-auto mt-24 mb-16 space-y-24">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

            {/* ── 1. Trust Signals Bar ── */}
            <section aria-label={loc === 'de' ? "Vertrauenssignale" : "Trust Signals"} className="flex flex-wrap justify-center gap-4 animate-slide-up-fade">
                {c.trustSignals.map(({ icon: Icon, label, color }: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] text-sm font-medium text-white/60">
                        <Icon className={`w-4 h-4 shrink-0 ${color}`} aria-hidden="true" />
                        {label}
                    </div>
                ))}
            </section>

            {/* ── 2. Internal Linking Mesh ── */}
            <nav aria-label={c.hero.title} className="space-y-10 animate-slide-up-fade">
                <header className="border-b border-white/10 pb-6 text-center md:text-left">
                    <h2 className="text-4xl font-extrabold tracking-tight">{c.hero.title}</h2>
                    <p className="text-white/50 mt-2 text-lg">{c.hero.subtitle}</p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Fristen */}
                    <div className="bg-white/[0.02] p-7 rounded-3xl border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
                        <h3 className="text-neon font-bold text-xl mb-5 flex items-center gap-2">
                            <CalendarCheck2 className="w-5 h-5" aria-hidden="true" />
                            {c.hero.fristen}
                        </h3>
                        <ul className="space-y-3">
                            {topQueries.map((q, i) => (
                                <li key={i}>
                                    <Link href={q.href as any} className="text-white/60 hover:text-white transition-colors flex items-center gap-2 group text-sm">
                                        <span className="text-neon/40 group-hover:text-neon text-xs" aria-hidden="true">▶</span>
                                        {q.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* Ereignisse */}
                    <div className="bg-white/[0.02] p-7 rounded-3xl border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
                        <h3 className="text-neon-blue font-bold text-xl mb-5 flex items-center gap-2">
                            <Clock4 className="w-5 h-5" aria-hidden="true" />
                            {c.hero.ereignisse}
                        </h3>
                        <ul className="space-y-3">
                            {eventQueries.map((q, i) => (
                                <li key={i}>
                                    <Link href={q.href as any} className="text-white/60 hover:text-white transition-colors flex items-center gap-2 group text-sm">
                                        <span className="text-neon-blue/40 group-hover:text-neon-blue text-xs" aria-hidden="true">▶</span>
                                        {q.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white/[0.02] p-7 rounded-3xl border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
                        <h3 className="text-white font-bold text-xl mb-5 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-400" aria-hidden="true" />
                            {c.hero.ratgeber}
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { de: 'schaltjahre-erklaert', en: 'leap-years-explained' },
                                { de: 'was-ist-ein-arbeitstag', en: 'what-is-a-business-day' },
                                { de: 'wochen-im-jahr', en: 'weeks-in-a-year' },
                                { de: 'iso-8601-erklaert', en: 'iso-8601-explained' }
                            ].map((g, i) => {
                                const slug = loc === 'de' ? g.de : g.en;
                                return (
                                    <li key={i}>
                                        <Link href={ROUTES.getRatgeber(slug)} className="text-white/60 hover:text-white transition-colors flex items-center gap-2 group text-sm">
                                            <span className="text-green-400/40 group-hover:text-green-400 text-xs" aria-hidden="true">▶</span>
                                            {slug.replace(/-/g, ' ')}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </nav>

            {/* ── 3. SEO Content Block ── */}
            <section aria-labelledby="seo-content-heading" className="animate-slide-up-fade" style={{ animationDelay: '0.1s' }}>
                <div className="prose prose-invert max-w-4xl mx-auto bg-[#0a0a0a]/80 backdrop-blur-xl rounded-[2.5rem] p-10 md:p-14 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                    <header>
                        <h2 id="seo-content-heading" className="text-3xl md:text-5xl font-extrabold mb-8 leading-tight tracking-tight">
                            {c.seo.headline}
                        </h2>
                    </header>
                    <p className="text-white/70 text-lg leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: c.seo.u1 }} />
                    <p className="text-white/70 text-lg leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: c.seo.u2 }} />
                    
                    <h3 className="text-white text-xl font-bold mb-4">{c.seo.tableTitle}</h3>
                    <div className="overflow-x-auto my-6 rounded-2xl border border-white/10">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.03]">
                                    <th scope="col" className="py-4 px-5 font-bold text-white/90">{c.seo.th1}</th>
                                    <th scope="col" className="py-4 px-5 font-bold text-white/90">{c.seo.th2}</th>
                                    <th scope="col" className="py-4 px-5 font-bold text-white/90 hidden md:table-cell">{c.seo.th3}</th>
                                </tr>
                            </thead>
                            <tbody className="text-white/60 divide-y divide-white/5">
                                <tr className="hover:bg-white/[0.02] transition-colors">
                                    <td className="py-4 px-5 text-neon font-medium">{c.seo.case1}</td>
                                    <td className="py-4 px-5"><Link href="/addieren" className="underline hover:text-white">Datum addieren</Link></td>
                                    <td className="py-4 px-5 hidden md:table-cell">"14 days from today"</td>
                                </tr>
                                <tr className="hover:bg-white/[0.02] transition-colors">
                                    <td className="py-4 px-5 text-neon-blue font-medium">{c.seo.case2}</td>
                                    <td className="py-4 px-5"><Link href="/arbeitstage" className="underline hover:text-white">Arbeitstage</Link></td>
                                    <td className="py-4 px-5 hidden md:table-cell">"Net business days Q4"</td>
                                </tr>
                                <tr className="hover:bg-white/[0.02] transition-colors">
                                    <td className="py-4 px-5 text-purple-400 font-medium">{c.seo.case3}</td>
                                    <td className="py-4 px-5"><Link href="/differenz" className="underline hover:text-white">Datumsdifferenz</Link></td>
                                    <td className="py-4 px-5 hidden md:table-cell">"Tage bis Weihnachten"</td>
                                </tr>
                                <tr className="hover:bg-white/[0.02] transition-colors">
                                    <td className="py-4 px-5 text-green-400 font-medium">{c.seo.case4}</td>
                                    <td className="py-4 px-5"><Link href="/alter" className="underline hover:text-white">Altersrechner</Link></td>
                                    <td className="py-4 px-5 hidden md:table-cell">"Alter am 01.01.2050"</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-white/70 text-lg leading-relaxed mt-6" dangerouslySetInnerHTML={{ __html: c.seo.footer }} />
                </div>
            </section>

            {/* ── 4. How It Works ── */}
            <section aria-labelledby="howto-heading" className="max-w-4xl mx-auto animate-slide-up-fade" style={{ animationDelay: '0.15s' }}>
                <header className="text-center mb-10">
                    <h2 id="howto-heading" className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">{c.howto.title}</h2>
                    <p className="text-white/50 text-lg">{c.howto.subtitle}</p>
                </header>
                <ol className="grid md:grid-cols-3 gap-6">
                    {c.howto.steps.map((step: any, i: number) => (
                        <li key={i} className={`relative p-7 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-sm shadow-xl`}>
                            <span className={`text-5xl font-black text-white/10 absolute top-4 right-6 select-none leading-none`}>
                                {i + 1}
                            </span>
                            <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-black text-neon bg-white/5 border border-white/10 mb-4`}>
                                {i + 1}
                            </span>
                            <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                            <p className="text-white/55 text-sm leading-relaxed">{step.desc}</p>
                        </li>
                    ))}
                </ol>
            </section>

            {/* ── 5. FAQs ── */}
            <section aria-labelledby="faq-heading" className="max-w-4xl mx-auto space-y-6 animate-slide-up-fade" style={{ animationDelay: '0.2s' }}>
                <header className="text-center mb-6">
                    <h2 id="faq-heading" className="text-4xl font-extrabold mb-3 tracking-tight">{c.faqHeading.title}</h2>
                    <p className="text-white/50 text-lg">{c.faqHeading.subtitle}</p>
                </header>
                <dl className="space-y-3">
                    {c.faqs.map((faq: any, i: number) => (
                        <details key={i} className="bg-white/[0.02] border border-white/[0.07] rounded-2xl px-6 py-5 group cursor-pointer hover:border-white/20 hover:bg-white/[0.04] transition-all">
                            <summary className="font-semibold text-lg list-none flex justify-between items-center text-white/85 group-hover:text-white">
                                <dt className="inline">{faq.question}</dt>
                                <span className="ml-4 shrink-0 text-neon group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <dd className="mt-4 border-l-2 border-neon-blue/30 pl-4">
                                <p className="text-white/60 leading-relaxed text-base">
                                    {faq.answer}
                                </p>
                            </dd>
                        </details>
                    ))}
                </dl>
            </section>
        </article>
    );
}
