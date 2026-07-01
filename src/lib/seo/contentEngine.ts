/**
 * Programmatic content generator.
 *
 * Goal: every page gets short, accurate, context-specific copy. We only state
 * what the calculator actually does — Gregorian calendar math with correct
 * leap-year handling. No leap seconds, no "years of experience", no
 * country-specific features that are not implemented.
 */

import { reverseTranslateSlug } from './translations';
import { EVENT_NAMES, getEventDateUTC } from '../events';

type Locale = string;

// Short, honest explanation variants for add/subtract pages. Each is
// parameterised with the concrete number + unit, so two different values never
// render identical prose.
// `nom` = nominative/accusative form ("30 Tage"), `dat` = dative form used after
// prepositions like "in", "von", "bei", "nach" ("30 Tagen"). English ignores `dat`.
const ADD_EXPLANATIONS: Record<string, ((num: number, nom: string, dat: string) => string)[]> = {
    de: [
        (num, nom, dat) => `Sie möchten wissen, welches Datum in genau ${num} ${dat} liegt? Der Rechner nimmt das heutige Datum als Startpunkt und zählt ${num} ${nom} vorwärts – die fortlaufende Aktualisierung im Browser sorgt dafür, dass das Ergebnis immer auf dem aktuellen Tag beruht.`,
        (num, nom, dat) => `Für eine Frist von ${num} ${dat} reicht grobes Kopfrechnen selten aus, weil Monate unterschiedlich lang sind und Schaltjahre einen zusätzlichen Tag einschieben. Der Rechner berücksichtigt beides automatisch und liefert das exakte Zieldatum samt Wochentag.`,
        (num, nom) => `Ob Liefertermin, Projektmeilenstein oder Kündigungsfrist: Wer ${num} ${nom} ab heute plant, braucht ein verlässliches Datum. Genau das ermittelt dieser Rechner, ohne dass Sie Kalenderseiten durchzählen müssen.`,
    ],
    en: [
        (num, nom) => `Want to know which date falls exactly ${num} ${nom} from now? The calculator takes today as the starting point and counts ${num} ${nom} forward. Because it updates in your browser, the result always reflects the current day.`,
        (num, nom) => `For a deadline of ${num} ${nom}, rough mental arithmetic rarely works: months have different lengths and leap years add an extra day. The calculator handles both automatically and returns the exact target date including the weekday.`,
        (num, nom) => `Whether it is a delivery date, a project milestone or a notice period, planning ${num} ${nom} from today calls for a reliable date. That is exactly what this calculator provides, without counting through a paper calendar.`,
    ],
};

const ADD_USE_CASES: Record<string, string[]> = {
    de: [
        'Vertrags- und Kündigungsfristen',
        'Liefer- und Zahlungstermine',
        'Projektmeilensteine und Deadlines',
        'Widerrufs- und Rückgabefristen',
        'Persönliche Countdowns und Jahrestage',
    ],
    en: [
        'Contract and notice periods',
        'Delivery and payment dates',
        'Project milestones and deadlines',
        'Cancellation and return windows',
        'Personal countdowns and anniversaries',
    ],
};

// Bespoke, page-specific context for each indexable add/subtract interval.
// Keyed by the canonical German slug. This is the unique, helpful paragraph
// that differentiates one interval page from another.
const ADD_CONTEXT: Record<string, { de: string; en: string }> = {
    '30-tage-ab-heute': {
        de: '30 Tage gehören zu den häufigsten Fristen im Alltag: Zahlungsziele auf Rechnungen, das gesetzliche Widerrufsrecht bei vielen Online-Käufen und kurze Kündigungsfristen werden oft in genau diesem Rahmen angegeben.',
        en: '30 days is one of the most common everyday deadlines: invoice payment terms, the statutory right of withdrawal for many online purchases and short notice periods are frequently set within exactly this window.',
    },
    '45-tage-ab-heute': {
        de: 'Eine Frist von 45 Tagen begegnet einem häufig bei verlängerten Zahlungszielen, Rückgabe- oder Reklamationsfenstern und mittelfristigen Projektabschnitten zwischen Monats- und Quartalsgrenzen.',
        en: 'A 45-day deadline often appears with extended payment terms, return or complaint windows and medium-term project phases sitting between a month and a quarter.',
    },
    '60-tage-ab-heute': {
        de: '60 Tage entsprechen rund zwei Monaten und sind ein typisches Zahlungsziel im Geschäftsverkehr (B2B) sowie eine gängige Kündigungs- oder Übergangsfrist in vielen Verträgen.',
        en: '60 days is roughly two months and is a typical payment term in business (B2B) as well as a common notice or transition period in many contracts.',
    },
    '90-tage-ab-heute': {
        de: '90 Tage decken etwa ein Quartal ab. Dieser Zeitraum wird gern für Probezeit-Etappen, 90-Tage-Pläne im neuen Job und befristete Aktions- oder Garantiezeiträume genutzt.',
        en: '90 days covers roughly a quarter. This span is popular for probation milestones, 90-day plans in a new job and limited promotional or warranty periods.',
    },
    '100-tage-ab-heute': {
        de: '100 Tage sind vor allem als symbolischer Meilenstein bekannt – etwa die „100-Tage-Bilanz“ neuer Amtsträger oder Mitarbeiter sowie für persönliche Challenges und Lernziele.',
        en: '100 days is best known as a symbolic milestone – such as the "first 100 days" review of new officials or employees, and for personal challenges and learning goals.',
    },
    '120-tage-ab-heute': {
        de: '120 Tage umfassen etwa vier Monate und tauchen häufig bei längeren Projektphasen, Förder- oder Antragsfristen und saisonalen Planungen auf.',
        en: '120 days spans about four months and often comes up with longer project phases, grant or application deadlines and seasonal planning.',
    },
    '150-tage-ab-heute': {
        de: '150 Tage liegen bei rund fünf Monaten – ein üblicher Horizont für mehrstufige Projekte, die Vorbereitung größerer Veranstaltungen oder mittelfristige Sparziele.',
        en: '150 days is around five months – a common horizon for multi-stage projects, the run-up to larger events or medium-term savings goals.',
    },
    '200-tage-ab-heute': {
        de: '200 Tage entsprechen gut einem halben Jahr und dienen oft als runde Wegmarke für langfristige Vorhaben, Trainingspläne oder Countdowns.',
        en: '200 days is a good half-year and often serves as a round marker for long-term plans, training schedules or countdowns.',
    },
    '500-tage-ab-heute': {
        de: '500 Tage sind rund 1,4 Jahre. Dieser ungewöhnliche, runde Zeitraum wird gern für langfristige Countdowns, Jubiläen oder ambitionierte Etappenziele gewählt.',
        en: '500 days is around 1.4 years. This unusual round span is popular for long-term countdowns, anniversaries or ambitious milestone goals.',
    },
    '730-tage-ab-heute': {
        de: '730 Tage entsprechen genau zwei Jahren (ohne Schaltjahr). Zwei Jahre sind unter anderem für die gesetzliche Gewährleistung bei Neuwaren und viele Verjährungs- und Garantiefristen relevant.',
        en: '730 days equals exactly two years (without a leap year). Two years is relevant for, among other things, the statutory warranty on new goods and many limitation and guarantee periods.',
    },
    '1000-tage-ab-heute': {
        de: '1000 Tage sind ungefähr 2,7 Jahre und ein beliebter „runder“ Meilenstein für Beziehungen, Projekte oder persönliche Jubiläen, der sich gut als Countdown verfolgen lässt.',
        en: '1000 days is roughly 2.7 years and a popular "round" milestone for relationships, projects or personal anniversaries that works well as a countdown.',
    },
    '6-monate-ab-heute': {
        de: 'Sechs Monate sind ein klassischer Halbjahres-Horizont: Sie entsprechen der üblichen Dauer einer Probezeit, vieler Kündigungsfristen zum Halbjahr und mittelfristiger Zielsetzungen.',
        en: 'Six months is a classic half-year horizon: it matches the usual length of a probation period, many half-yearly notice periods and medium-term goals.',
    },
    '1-jahr-ab-heute': {
        de: 'Ein Jahr ab heute ist die Bezugsgröße für zahlreiche Jahresfristen – vom Beginn vieler Verjährungsfristen über Garantie- und Abo-Laufzeiten bis hin zu persönlichen Jahrestagen.',
        en: 'One year from today is the reference point for numerous annual deadlines – from the start of many limitation periods to warranty and subscription terms and personal anniversaries.',
    },
};

function pickVariation<T>(arr: T[], seed: number): T {
    return arr[Math.abs(seed) % arr.length];
}

// Returns grammatically correct unit forms for the slug. `nom` is the
// nominative/accusative form, `dat` the dative form (German prepositions).
function unitForms(slug: string, num: number, isDe: boolean): { nom: string; dat: string } {
    if (slug.includes('tage') || slug.includes('days')) {
        return isDe ? { nom: 'Tage', dat: 'Tagen' } : { nom: 'days', dat: 'days' };
    }
    if (slug.includes('monate') || slug.includes('months')) {
        return isDe ? { nom: 'Monate', dat: 'Monaten' } : { nom: 'months', dat: 'months' };
    }
    if (slug.includes('jahr') || slug.includes('year')) {
        if (num === 1) return isDe ? { nom: 'Jahr', dat: 'Jahr' } : { nom: 'year', dat: 'year' };
        return isDe ? { nom: 'Jahre', dat: 'Jahren' } : { nom: 'years', dat: 'years' };
    }
    return isDe ? { nom: 'Einheiten', dat: 'Einheiten' } : { nom: 'units', dat: 'units' };
}

function isAddIntent(intent: string) {
    return intent === 'addieren' || intent === 'add';
}
function isDiffIntent(intent: string) {
    return intent === 'differenz' || intent === 'difference';
}

// Builds a "day of the week per year" table for the next 5 years. Returns
// undefined for events without a meaningful fixed date (e.g. "vacation").
function buildWeekdayTable(eventKey: string, locale: string): { year: number; date: string; weekday: string }[] | undefined {
    if (eventKey === 'urlaub') return undefined;
    const intlLoc = locale === 'de' ? 'de-DE' : 'en-US';
    const currentYear = new Date().getFullYear();
    const rows: { year: number; date: string; weekday: string }[] = [];
    for (let i = 0; i < 5; i++) {
        const year = currentYear + i;
        const d = getEventDateUTC(eventKey, year);
        if (!d) return undefined;
        rows.push({
            year,
            date: new Intl.DateTimeFormat(intlLoc, { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(d),
            weekday: new Intl.DateTimeFormat(intlLoc, { weekday: 'long', timeZone: 'UTC' }).format(d),
        });
    }
    return rows;
}

function resolveEventKey(slug: string, locale: string): string | null {
    const canonical = reverseTranslateSlug(slug, locale);
    const match = canonical.match(/^tage-bis-(.+)$/);
    if (!match) return null;
    const key = match[1];
    return EVENT_NAMES[key] ? key : null;
}

export function generateContextualInsight(num: number, unitNom: string, locale: string): string {
    const isDe = locale === 'de';
    const u = unitNom.toLowerCase();
    if (u === 'tage' || u === 'days') {
        const monthsApprox = (num / 30.44).toFixed(1);
        const weeksApprox = (num / 7).toFixed(1);
        if (num >= 30 && num < 365) {
            return isDe
                ? `Zur Einordnung: ${num} Tage entsprechen ungefähr ${monthsApprox} Monaten oder ${weeksApprox} Wochen. Das ist ein typischer Zeitraum für mittelfristige Fristen.`
                : `For context: ${num} days are roughly ${monthsApprox} months or ${weeksApprox} weeks – a typical span for medium-term deadlines.`;
        } else if (num >= 365) {
            const yearsApprox = (num / 365.25).toFixed(1);
            return isDe
                ? `Zur Einordnung: ${num} Tage entsprechen rund ${yearsApprox} Jahren.`
                : `For context: ${num} days are around ${yearsApprox} years.`;
        } else if (num >= 7) {
            return isDe
                ? `Zur Einordnung: ${num} Tage sind ungefähr ${weeksApprox} Wochen.`
                : `For context: ${num} days are about ${weeksApprox} weeks.`;
        }
    }
    return isDe
        ? `Je nach Startdatum kann das exakte Zieldatum aufgrund unterschiedlicher Monatslängen und Schaltjahre leicht variieren.`
        : `Depending on the start date, the exact target date can vary slightly due to different month lengths and leap years.`;
}

export function generateSEOContent(
    intent: string,
    slug: string,
    locale: Locale,
    numValue?: number
): {
    heading: string;
    paragraphs: string[];
    useCases: string[];
    weekdayTable?: { heading: string; rows: { year: number; date: string; weekday: string }[] };
} {
    const loc = locale === 'de' ? 'de' : 'en';
    const isDe = loc === 'de';

    // ── Countdown / difference pages ──
    if (isDiffIntent(intent)) {
        const eventKey = resolveEventKey(slug, locale);
        const ev = eventKey ? EVENT_NAMES[eventKey] : null;
        const name = ev ? (isDe ? ev.de : ev.en) : slug.replace(/-/g, ' ');
        const bis = ev ? (isDe ? ev.bisDe : ev.en) : name;

        const heading = isDe
            ? `Countdown bis ${bis}: So funktioniert die Berechnung`
            : `Countdown to ${name}: how it is calculated`;

        const paragraphs: string[] = [];
        if (ev && (ev.whenDe || ev.whenEn)) {
            paragraphs.push(isDe
                ? `${ev.de} findet ${ev.whenDe} statt. Der Countdown zählt die verbleibenden Tage bis ${bis} live mit und stellt nach Ablauf automatisch auf den nächsten Termin um.`
                : `${name.charAt(0).toUpperCase() + name.slice(1)} takes place ${ev.whenEn}. The countdown tracks the remaining days to ${name} live and automatically rolls over to the next occurrence once the date has passed.`);
        } else {
            paragraphs.push(isDe
                ? `Der Countdown zählt die verbleibenden Tage bis ${bis} und aktualisiert sich beim Laden der Seite anhand des heutigen Datums.`
                : `The countdown tracks the remaining days to ${name} and refreshes on page load based on today's date.`);
        }

        if (ev?.movable) {
            paragraphs.push(isDe
                ? `Anders als feste Feiertage richtet sich ${ev.de.replace(/^Der /, 'der ')} nach dem Mondkalender: Ostersonntag ist der erste Sonntag nach dem Frühlingsvollmond. Deshalb verschiebt sich das Datum von Jahr zu Jahr.`
                : `Unlike fixed holidays, Easter follows the lunar calendar: Easter Sunday is the first Sunday after the spring full moon, which is why the date shifts from year to year.`);
        }

        let weekdayTable;
        if (eventKey) {
            const rows = buildWeekdayTable(eventKey, locale);
            if (rows) {
                const headingName = isDe ? (ev ? ev.de.replace(/^Der /, 'der ') : name) : name;
                weekdayTable = {
                    heading: isDe
                        ? `Auf welchen Wochentag fällt ${headingName} in den nächsten Jahren?`
                        : `What day of the week is ${headingName} in the coming years?`,
                    rows,
                };
            }
        }

        return { heading, paragraphs, useCases: [], weekdayTable };
    }

    // ── Add / subtract pages (and generic fallback) ──
    const num = numValue || 0;
    const seed = num || slug.length;
    const { nom, dat } = unitForms(slug, num, isDe);

    const heading = isAddIntent(intent)
        ? (isDe ? `${num} ${nom} ab heute – so wird gerechnet` : `${num} ${nom} from today – how it is calculated`)
        : (isDe ? 'So funktioniert die Berechnung' : 'How the calculation works');

    const canonical = reverseTranslateSlug(slug, locale);
    const ctx = ADD_CONTEXT[canonical] ? ADD_CONTEXT[canonical][loc] : '';
    const explanation = pickVariation(ADD_EXPLANATIONS[loc], seed)(num, nom, dat);
    const insight = num ? generateContextualInsight(num, nom.toLowerCase(), loc) : '';

    const methodNote = isDe
        ? `Die Berechnung folgt dem **gregorianischen Kalender**: Ein Normaljahr hat 365 Tage, ein Schaltjahr 366. Schaltjahre treten alle vier Jahre auf – außer in vollen Jahrhunderten, die nicht durch 400 teilbar sind. Diese Regel ist im Rechner fest hinterlegt, sodass auch lange Zeiträume korrekt abgebildet werden.`
        : `The calculation follows the **Gregorian calendar**: a normal year has 365 days, a leap year 366. Leap years occur every four years – except in full centuries that are not divisible by 400. This rule is built into the calculator, so even long spans are mapped correctly.`;

    // Indexable intervals lead with their bespoke context (unique per page);
    // the generic rotating explanation is reserved for non-indexed variations.
    const paragraphs = (ctx ? [ctx, insight, methodNote] : [explanation, insight, methodNote]).filter(Boolean);

    const cases = ADD_USE_CASES[loc];
    const useCases = isAddIntent(intent)
        ? [pickVariation(cases, seed), pickVariation(cases, seed + 1), pickVariation(cases, seed + 2)]
        : [];

    return { heading, paragraphs, useCases };
}

export function generateDynamicFAQs(intent: string, slug: string, locale: Locale, numValue?: number) {
    const isDe = locale === 'de';

    // ── Countdown / difference FAQs ──
    if (isDiffIntent(intent)) {
        const eventKey = resolveEventKey(slug, locale);
        const ev = eventKey ? EVENT_NAMES[eventKey] : null;
        const name = ev ? (isDe ? ev.de : ev.en) : slug.replace(/-/g, ' ');
        const bis = ev ? (isDe ? ev.bisDe : ev.en) : name;

        const faqs = [
            {
                question: isDe ? `Wie viele Tage sind es noch bis ${bis}?` : `How many days are left until ${name}?`,
                answer: isDe
                    ? `Der Countdown oben zeigt die verbleibenden Tage bis ${bis} an. Er wird beim Laden der Seite anhand des aktuellen Datums berechnet und springt nach dem Termin automatisch auf das nächste Jahr.`
                    : `The countdown above shows the days remaining until ${name}. It is calculated from the current date on page load and rolls over to next year automatically once the date has passed.`,
            },
            {
                question: isDe ? 'Aktualisiert sich der Countdown automatisch?' : 'Does the countdown update automatically?',
                answer: isDe
                    ? 'Ja. Die Zahl wird direkt in Ihrem Browser aus dem heutigen Datum berechnet, sodass sie bei jedem Aufruf stimmt – ganz ohne gespeichertes oder veraltetes Datum.'
                    : 'Yes. The number is computed in your browser from today\'s date, so it is correct on every visit – with no stored or stale date.',
            },
        ];

        if (ev?.movable) {
            faqs.push({
                question: isDe ? `Warum ändert sich das Datum von ${bis} jedes Jahr?` : `Why does the date of ${name} change every year?`,
                answer: isDe
                    ? 'Ostersonntag ist der erste Sonntag nach dem ersten Frühlingsvollmond. Da sich der Mondzyklus nicht exakt mit dem Kalenderjahr deckt, fällt Ostern jedes Jahr auf ein anderes Datum zwischen dem 22. März und dem 25. April.'
                    : 'Easter Sunday is the first Sunday after the first spring full moon. Because the lunar cycle does not line up exactly with the calendar year, Easter falls on a different date between March 22 and April 25 each year.',
            });
        }

        return faqs;
    }

    // ── Add / subtract FAQs ──
    const { nom, dat } = unitForms(slug, numValue || 0, isDe);
    const isDays = nom === 'Tage' || nom === 'days';
    const valueNom = numValue ? `${numValue} ${nom}` : slug.replace(/-/g, ' ');
    const valueDat = numValue ? `${numValue} ${dat}` : valueNom;

    if (isDe) {
        return [
            {
                question: `Welches Datum ist in ${valueDat} ab heute?`,
                answer: `Der Rechner nimmt das heutige Datum als Startpunkt und zählt ${valueNom} vorwärts. Das Ergebnis oben wird live im Browser berechnet und zeigt das genaue Zieldatum inklusive Wochentag an.`,
            },
            {
                question: numValue && isDays
                    ? `Wie viele Monate sind ${valueNom}?`
                    : `Wofür nutzt man die Berechnung von ${valueDat}?`,
                answer: numValue && isDays
                    ? `${valueNom} entsprechen etwa ${(numValue / 30.44).toFixed(1)} Monaten, da ein Monat im Durchschnitt rund 30,44 Tage hat. Für das exakte Kalenderdatum nutzen Sie am besten den Rechner oben.`
                    : `Diese Berechnung wird häufig für Fristen, Liefertermine, Projektplanung und persönliche Countdowns wie Jahrestage genutzt.`,
            },
            {
                question: `Werden bei ${valueDat} auch Wochenenden mitgezählt?`,
                answer: `Ja, bei der Addition von Laufzeiten werden alle Kalendertage inklusive Samstag und Sonntag gezählt. Wenn Sie ausschließlich Werktage benötigen, verwenden Sie den Arbeitstage-Rechner.`,
            },
        ];
    }

    return [
        {
            question: `What date is ${valueNom} from today?`,
            answer: `The calculator takes today's date as the starting point and counts ${valueNom} forward. The result above is computed live in your browser and shows the exact target date including the weekday.`,
        },
        {
            question: numValue && isDays
                ? `How many months are ${valueNom}?`
                : `What is calculating ${valueNom} used for?`,
            answer: numValue && isDays
                ? `${valueNom} correspond to about ${(numValue / 30.44).toFixed(1)} months, since a month averages around 30.44 days. For the exact calendar date, use the calculator above.`
                : `This calculation is commonly used for deadlines, delivery dates, project planning and personal countdowns such as anniversaries.`,
        },
        {
            question: `Are weekends included in ${valueNom}?`,
            answer: `Yes, when adding durations all calendar days including Saturday and Sunday are counted. If you only need working days, use the business-day calculator.`,
        },
    ];
}
