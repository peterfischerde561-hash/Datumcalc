import { Link } from '@/i18n/routing';
import { ROUTES } from '@/lib/routes';
import { CheckCircle2, CalendarCheck2, Clock4, ShieldCheck } from 'lucide-react';
import { translateSlug } from '@/lib/seo/translations';
import { routeLabel } from '@/lib/seo/routeLabels';

/*
 * `siteUrl` and a module-scope `dateModified` stood here, left over from the
 * homepage Article JSON-LD that was removed with the fabricated byline. Nothing
 * read either one. The date was the worse of the two: `new Date()` at module
 * scope is evaluated once when the module is first loaded and then frozen into
 * every prerendered page, so it advertised the build date as the last
 * modification for as long as the page stayed cached.
 */

const CONTENT: Record<string, any> = {
    de: {
        /*
         * These answer the things people actually get wrong about date
         * arithmetic, not the things a site likes being asked. "Kann ich den
         * Rechner kostenlos nutzen?" had no search value and no confusion
         * behind it; the inclusive/exclusive question is the reason two
         * calculators disagree and is the single most common misunderstanding
         * in this category.
         *
         * They carry FAQPage markup, so every answer has to be true of the
         * implementation. Check them against /wie-wir-rechnen when it changes.
         */
        faqs: [
            {
                question: 'Wird der Starttag mitgezählt?',
                answer: 'Standardmäßig nicht. Der Rechner zählt die vollen Tage zwischen zwei Daten: Vom 1. bis zum 3. März sind es 2 Tage. Wenn Sie beide Endtage einschließen möchten (inklusive Zählweise), addieren Sie einen Tag hinzu – für Aufenthaltsdauern wie Hotelnächte ist meist die exklusive Zählweise gemeint.',
            },
            {
                question: 'Warum zeigen zwei Datumsrechner unterschiedliche Ergebnisse?',
                answer: 'Fast immer wegen der Zählweise. Zählt ein Rechner beide Endtage mit (inklusive) und ein anderer nur die vollen Tage dazwischen (exklusive), unterscheiden sich die Ergebnisse um genau einen Tag. Beide sind richtig – sie beantworten nur unterschiedliche Fragen. Dieser Rechner zählt exklusiv und schreibt das auf jeder Seite dazu.',
            },
            {
                question: 'Zählen Wochenenden und Feiertage mit?',
                answer: 'Bei der Datumsdifferenz und beim Addieren zählen alle Kalendertage, also auch Samstag und Sonntag. Der Arbeitstage-Rechner filtert Wochenenden heraus. Gesetzliche Feiertage werden dort abgezogen, sobald Sie ein Bundesland auswählen – ohne Auswahl bleiben sie im Ergebnis, weil ohne Bundesland nicht feststeht, welche Feiertage gelten.',
            },
            {
                question: 'Was ist der Unterschied zwischen Kalendertagen, Werktagen und Arbeitstagen?',
                answer: 'Kalendertage sind alle Tage. Werktage sind nach dem Bundesurlaubsgesetz alle Tage außer Sonn- und gesetzlichen Feiertagen – der Samstag zählt also mit. Arbeitstage meinen üblicherweise die 5-Tage-Woche von Montag bis Freitag. Steht in einem Vertrag „Werktage“ statt „Arbeitstage“, verkürzt sich eine Frist dadurch spürbar.',
            },
            {
                question: 'Werden Schaltjahre wie der 29. Februar korrekt berechnet?',
                answer: 'Ja. Der Rechner bildet den gregorianischen Kalender mit der vollständigen Schaltjahrregel ab: alle vier Jahre, außer in vollen Jahrhunderten, die nicht durch 400 teilbar sind. Deshalb war 2000 ein Schaltjahr und 1900 keines. Fällt ein 29. Februar in einen Zeitraum, wird er automatisch mitgezählt.',
            },
            {
                question: 'Hängt das Ergebnis von meiner Zeitzone ab?',
                answer: 'Nein. Die Berechnung läuft auf ganzen Kalendertagen, nicht auf Zeitstempeln – eine Zeitumstellung kann ein Ergebnis daher nicht um einen Tag verschieben. Als „heute“ gilt der laufende Kalendertag in der Zeitzone Europe/Berlin, damit jede Seite für alle Besucher dieselbe Antwort nennt.',
            },
        ],
        // ISO 8601 defines how dates are *represented*; it does not certify
        // arithmetic. It is cited only where it is load-bearing — week
        // numbering — rather than as a blanket badge.
        trustSignals: [
            { icon: CalendarCheck2, label: 'Gregorianischer Kalender', color: 'text-green-600' },
            { icon: CheckCircle2, label: 'Vollständige Schaltjahrregel', color: 'text-neon-blue' },
            { icon: Clock4, label: 'Kalenderwochen nach ISO 8601', color: 'text-neon' },
            { icon: ShieldCheck, label: 'Kostenlos, ohne Anmeldung', color: 'text-slate-700' },
        ],
        hero: {
            title: 'Entdecke den Datumsrechner',
            subtitle: 'Häufig gesuchte Fristen und Ereignisse auf einen Klick.',
            fristen: 'Beliebte Fristen',
            ereignisse: 'Ereignisse & Countdowns',
            ratgeber: 'Ratgeber & Wissen'
        },
        seo: {
            headline: 'Datumsrechner für Fristen, Arbeitstage und Countdowns',
            u1: 'Egal ob Sie Projektfristen planen, Ihr genaues Alter in Tagen berechnen oder wissen möchten, an welchem Wochentag ein bestimmtes Datum liegt – unser <strong>Datumsrechner</strong> liefert sekundenschnelle, präzise Antworten. Die Ergebnisse sind perfekt für Kalender, Countdowns und rechtliche Fristen.',
            // This line used to read "keine Werbung", which contradicted a
            // funding claim on /ueber-uns. That claim has since been removed as
            // false — the site currently carries no ads and no affiliate links.
            //
            // The wording still avoids "werbefrei" on purpose. It would be true
            // today and silently false the day an ad script ships, and nobody
            // would notice. What it says instead holds either way.
            u2: 'Mit unserem Tool können Sie <strong>Tage zwischen zwei Daten berechnen</strong>, <strong>Datum addieren oder subtrahieren</strong> sowie <strong>Netto-Arbeitstage</strong> ermitteln – alles in einem einzigen, intuitiven Interface. Keine Anmeldung, keine Datenweitergabe: Ihre Eingaben im Rechner verlassen den Browser nicht.',
            tableTitle: 'Anwendungsfälle im Überblick',
            th1: 'Anwendungsfall',
            th2: 'Empfohlenes Tool',
            th3: 'Typisches Beispiel',
            case1: 'Fristen & Kündigungen',
            case2: 'Projektplanung',
            case3: 'Event Countdowns',
            case4: 'Alter berechnen',
            footer: 'Der Rechner bildet den <strong>gregorianischen Kalender</strong> mit der vollständigen Schaltjahrregel ab und berücksichtigt unterschiedliche Monatslängen automatisch. Kalenderwochen folgen <strong>ISO 8601</strong>: Die Woche beginnt am Montag, und die erste Woche eines Jahres ist die mit dem ersten Donnerstag.'
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
                question: 'Is the start day counted?',
                answer: 'Not by default. The calculator counts the full days between two dates: from 1 March to 3 March is 2 days. To include both endpoints (inclusive counting), add one day – for stays such as hotel nights the exclusive count is usually what is meant.',
            },
            {
                question: 'Why do two date calculators give different results?',
                answer: 'Almost always because of the counting method. If one counts both endpoints (inclusive) and another counts only the full days between them (exclusive), the results differ by exactly one day. Both are correct – they answer different questions. This calculator counts exclusively and says so on every page.',
            },
            {
                question: 'Are weekends and public holidays included?',
                answer: 'For date differences and for adding days, every calendar day counts, including Saturday and Sunday. The business-day calculator filters weekends out. Public holidays are deducted there as soon as you select a German state – without one they stay in the result, because which holidays apply is undetermined.',
            },
            {
                question: 'What is the difference between calendar days, Werktage and Arbeitstage?',
                answer: 'Calendar days are every day. Under the German Federal Leave Act, Werktage are all days except Sundays and public holidays, so Saturday counts. Arbeitstage usually mean the Monday-to-Friday working week. A contract that says "Werktage" rather than "Arbeitstage" shortens a deadline noticeably.',
            },
            {
                question: 'Are leap years like February 29 calculated correctly?',
                answer: 'Yes. The calculator maps the Gregorian calendar with the full leap-year rule: every four years, except full centuries not divisible by 400. That is why 2000 was a leap year and 1900 was not. A February 29 falling inside a span is counted automatically.',
            },
            {
                question: 'Does the result depend on my time zone?',
                answer: 'No. The calculation runs on whole calendar days rather than timestamps, so a daylight-saving change cannot shift a result by a day. "Today" means the current calendar day in the Europe/Berlin time zone, so every page states one answer for all visitors.',
            },
        ],
        trustSignals: [
            { icon: CalendarCheck2, label: 'Gregorian calendar', color: 'text-green-600' },
            { icon: CheckCircle2, label: 'Full leap-year rule', color: 'text-neon-blue' },
            { icon: Clock4, label: 'ISO 8601 calendar weeks', color: 'text-neon' },
            { icon: ShieldCheck, label: 'Free, no registration', color: 'text-slate-700' },
        ],
        hero: {
            title: 'Explore the Date Calculator',
            subtitle: 'Frequently searched deadlines and events at a click.',
            fristen: 'Popular Deadlines',
            ereignisse: 'Events & Countdowns',
            ratgeber: 'Guides & Knowledge'
        },
        seo: {
            headline: 'Date Calculator for Deadlines, Business Days and Countdowns',
            u1: 'Whether you are planning project deadlines, calculating your exact age in days or want to know which day of the week a certain date falls on – our <strong>Date Calculator</strong> provides precise answers in seconds. The results are perfect for calendars, countdowns and legal deadlines.',
            u2: 'With our tool, you can <strong>calculate days between two dates</strong>, <strong>add or subtract dates</strong> as well as determine <strong>net business days</strong> – all in a single, intuitive interface. No registration and no data sharing: the dates you enter stay in your browser.',
            tableTitle: 'Usage Cases at a Glance',
            th1: 'Usage Case',
            th2: 'Recommended Tool',
            th3: 'Typical Example',
            case1: 'Deadlines & Notices',
            case2: 'Project Planning',
            case3: 'Event Countdowns',
            case4: 'Calculate Age',
            footer: 'The calculator maps the <strong>Gregorian calendar</strong> with the full leap-year rule and accounts for varying month lengths automatically. Calendar weeks follow <strong>ISO 8601</strong>: the week starts on Monday, and the first week of a year is the one containing the first Thursday.'
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

export function HomepageSEO({
    locale = 'de',
    part = 'understand'
}: {
    locale?: string;
    /** 'understand' explains the tool; 'explore' links away from it. */
    part?: 'understand' | 'explore';
}) {
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

    /*
     * The homepage previously emitted Article JSON-LD naming "Felix Schmidt"
     * as a Person author, with datePublished 2024-01-01. Two problems: the
     * homepage is a calculator, not an article, and the author did not exist.
     * Article markup on a tool page is schema coverage for its own sake, and
     * an author node turns a fabricated byline into a machine-readable claim.
     *
     * Nothing replaces it here. The layout already declares the site-level
     * WebApplication (@id .../#webapp) on every page, so describing the
     * calculator again would be a second node for one entity.
     *
     * The FAQPage below stays: those questions are written by hand and are
     * visible on the page, unlike the template-generated FAQs on the
     * programmatic pages, which carry no markup.
     */

    /*
     * Rendered in two parts so the page can put the guide content directly
     * under the calculator and keep every "go somewhere else" block after
     * it. As one component these were locked into a single position, which
     * put the link mesh above the explanation of what the tool even is.
     */
    if (part === 'explore') {
        return (
            <article className="w-full max-w-7xl mx-auto mt-20 mb-16 space-y-24">
{/* ── 4. Explore: related calculations and guides ── */}
            <nav aria-label={c.hero.title} className="space-y-10 animate-slide-up-fade">
                <header className="border-b border-slate-200 pb-6 text-center md:text-left">
                    <h2 className="text-4xl font-extrabold tracking-tight">{c.hero.title}</h2>
                    <p className="text-slate-600 mt-2 text-lg">{c.hero.subtitle}</p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Fristen */}
                    <div className="bg-white p-7 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all duration-300">
                        <h3 className="text-neon font-bold text-xl mb-5 flex items-center gap-2">
                            <CalendarCheck2 className="w-5 h-5" aria-hidden="true" />
                            {c.hero.fristen}
                        </h3>
                        <ul className="space-y-3">
                            {topQueries.map((q, i) => (
                                <li key={i}>
                                    <Link href={q.href as any} className="text-slate-700 hover:text-blue-700 transition-colors flex items-center gap-2 group text-sm">
                                        <span className="text-neon/40 group-hover:text-neon text-xs" aria-hidden="true">▶</span>
                                        {q.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* Ereignisse */}
                    <div className="bg-white p-7 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all duration-300">
                        <h3 className="text-neon-blue font-bold text-xl mb-5 flex items-center gap-2">
                            <Clock4 className="w-5 h-5" aria-hidden="true" />
                            {c.hero.ereignisse}
                        </h3>
                        <ul className="space-y-3">
                            {eventQueries.map((q, i) => (
                                <li key={i}>
                                    <Link href={q.href as any} className="text-slate-700 hover:text-blue-700 transition-colors flex items-center gap-2 group text-sm">
                                        <span className="text-neon-blue/40 group-hover:text-neon-blue text-xs" aria-hidden="true">▶</span>
                                        {q.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white p-7 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all duration-300">
                        <h3 className="text-slate-900 font-bold text-xl mb-5 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" aria-hidden="true" />
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
                                        <Link href={ROUTES.getRatgeber(slug)} className="text-slate-700 hover:text-blue-700 transition-colors flex items-center gap-2 group text-sm">
                                            <span className="text-green-600/40 group-hover:text-green-600 text-xs" aria-hidden="true">▶</span>
                                            {slug.replace(/-/g, ' ')}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </nav>

            
{/* ── 5. Trust signals ── */}
            <section aria-label={loc === 'de' ? "Vertrauenssignale" : "Trust Signals"} className="flex flex-wrap justify-center gap-4 animate-slide-up-fade">
                {c.trustSignals.map(({ icon: Icon, label, color }: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700">
                        <Icon className={`w-4 h-4 shrink-0 ${color}`} aria-hidden="true" />
                        {label}
                    </div>
                ))}
            </section>
            </article>
        );
    }

    return (
        <article className="w-full max-w-7xl mx-auto mt-20 mb-16 space-y-24">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />


            {/* ── 1. Understand: what the calculator does ── */}
            <section aria-labelledby="seo-content-heading" className="animate-slide-up-fade" style={{ animationDelay: '0.1s' }}>
                <div className="prose max-w-4xl mx-auto bg-white rounded-2xl p-10 md:p-14 border border-slate-200 shadow-sm">
                    <header>
                        <h2 id="seo-content-heading" className="text-3xl md:text-5xl font-extrabold mb-8 leading-tight tracking-tight">
                            {c.seo.headline}
                        </h2>
                    </header>
                    <p className="text-slate-700 text-lg leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: c.seo.u1 }} />
                    <p className="text-slate-700 text-lg leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: c.seo.u2 }} />
                    
                    <h3 className="text-slate-900 text-xl font-bold mb-4">{c.seo.tableTitle}</h3>
                    <div className="overflow-x-auto my-6 rounded-lg border border-slate-200">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th scope="col" className="py-4 px-5 font-bold text-slate-900">{c.seo.th1}</th>
                                    <th scope="col" className="py-4 px-5 font-bold text-slate-900">{c.seo.th2}</th>
                                    <th scope="col" className="py-4 px-5 font-bold text-slate-900 hidden md:table-cell">{c.seo.th3}</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-700 divide-y divide-slate-100">
                                {([
                                    { key: 'addieren', href: '/addieren', useCase: c.seo.case1, tone: 'text-blue-700' },
                                    { key: 'arbeitstage', href: '/arbeitstage', useCase: c.seo.case2, tone: 'text-neon-blue' },
                                    { key: 'differenz', href: '/differenz', useCase: c.seo.case3, tone: 'text-purple-600' },
                                    { key: 'alter', href: '/alter', useCase: c.seo.case4, tone: 'text-green-600' }
                                ] as const).map((row) => {
                                    const rl = routeLabel(row.key, loc);
                                    return (
                                        <tr key={row.key} className="hover:bg-slate-50 transition-colors">
                                            <td className={`py-4 px-5 font-medium ${row.tone}`}>{row.useCase}</td>
                                            <td className="py-4 px-5">
                                                <Link href={row.href} className="underline hover:text-blue-700">
                                                    {rl.label}
                                                </Link>
                                            </td>
                                            <td className="py-4 px-5 hidden md:table-cell">&ldquo;{rl.example}&rdquo;</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-slate-700 text-lg leading-relaxed mt-6" dangerouslySetInnerHTML={{ __html: c.seo.footer }} />
                </div>
            </section>

            
{/* ── 2. Understand: how it works ── */}
            <section aria-labelledby="howto-heading" className="max-w-4xl mx-auto animate-slide-up-fade" style={{ animationDelay: '0.15s' }}>
                <header className="text-center mb-10">
                    <h2 id="howto-heading" className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">{c.howto.title}</h2>
                    <p className="text-slate-600 text-lg">{c.howto.subtitle}</p>
                </header>
                <ol className="grid md:grid-cols-3 gap-6">
                    {c.howto.steps.map((step: any, i: number) => (
                        <li key={i} className={`relative p-7 rounded-2xl bg-white border border-slate-200 shadow-sm`}>
                            <span className={`text-5xl font-black text-slate-200 absolute top-4 right-6 select-none leading-none`}>
                                {i + 1}
                            </span>
                            <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-black text-blue-700 bg-blue-50 border border-blue-100 mb-4`}>
                                {i + 1}
                            </span>
                            <h3 className="text-slate-900 font-bold text-lg mb-2">{step.title}</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">{step.desc}</p>
                        </li>
                    ))}
                </ol>
            </section>

            
{/* ── 3. Understand: common questions ── */}
            <section aria-labelledby="faq-heading" className="max-w-4xl mx-auto space-y-6 animate-slide-up-fade" style={{ animationDelay: '0.2s' }}>
                <header className="text-center mb-6">
                    <h2 id="faq-heading" className="text-4xl font-extrabold mb-3 tracking-tight">{c.faqHeading.title}</h2>
                    <p className="text-slate-600 text-lg">{c.faqHeading.subtitle}</p>
                </header>
                <dl className="space-y-3">
                    {c.faqs.map((faq: any, i: number) => (
                        <details key={i} className="bg-white border border-slate-200 rounded-xl px-6 py-5 group cursor-pointer hover:border-blue-300 transition-all">
                            <summary className="font-semibold text-lg list-none flex justify-between items-center text-slate-800 group-hover:text-blue-700">
                                <dt className="inline">{faq.question}</dt>
                                <span aria-hidden="true" className="ml-4 shrink-0 text-neon group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <dd className="mt-4 border-l-2 border-neon-blue/30 pl-4">
                                <p className="text-slate-700 leading-relaxed text-base">
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
