/**
 * Anti-Thin Content System
 * Core logic to generate programmatic, semi-unique SEO content.
 */

const EXPLANATION_TEMPLATES: Record<string, ((num: number, unit: string) => string)[]> = {
    de: [
        (num: number, unit: string) => `Die genaue Berechnung von Datumsdifferenzen erfordert absolute Präzision. Unser Rechner nimmt Ihnen diese Arbeit ab und berücksichtigt alle kalendarischen Besonderheiten, wie etwa Schaltjahre oder unregelmäßige Monatslängen. Dies ist besonders wichtig, wenn Sie Fristen punktgenau einhalten müssen oder wichtige Termine in der Zukunft planen. Ein kleiner Fehler von nur einem Tag kann in vielen professionellen Bereichen bereits große Auswirkungen haben.`,
        (num: number, unit: string) => `Wenn Sie wissen möchten, welches Datum genau in ${num} ${unit} ist, sind Sie hier richtig. Dieses Tool liefert Ihnen sofort das exakte Ergebnis in Echtzeit, sodass Sie keine Kalenderseiten mehr manuell zählen müssen. Unser Algorithmus arbeitet nach dem **ISO-8601 Standard** und garantiert höchste Genauigkeit für alle Ihre Zeitberechnungen. Egal ob privat oder geschäftlich, Genauigkeit steht bei uns an oberster Stelle, damit Sie sich auf Ihre Planung verlassen können.`,
        (num: number, unit: string) => `Egal, ob Sie ein Projekt planen oder einen wichtigen Meilenstein im Auge behalten wollen: Zu wissen, was in exakt ${num} ${unit} passiert, ist entscheidend. Wir berechnen das Datum absolut fehlerfrei für Sie. Dabei werden alle Unterbrechungen und kalendarischen Shifts vollautomatisch berücksichtigt. Zeitmanagement ist eine Kunst, die mit dem richtigen Werkzeug deutlich einfacher wird. Nutzen Sie unsere langjährige Erfahrung in der Zeitberechnung für Ihre Zwecke.`,
        (num: number, unit: string) => `Eine Frist von ${num} ${unit} kann im Alltag oder im Berufsleben schnell vorkommen. Lassen Sie unseren Algorithmus die exakte Bestimmung des Zieldatums übernehmen, damit Sie sich auf das Wesentliche konzentrieren können. Unser Tool ist darauf optimiert, Ihnen nicht nur eine Zahl, sondern ein verlässliches Datum zu liefern, das alle Facetten des gregorianischen Kalenders korrekt abbildet. Sicherheit in der Planung durch mathematisch verifizierte Berechnungen.`,
        (num: number, unit: string) => `Präzision bei der Zeitmessung ist die Basis für jedes erfolgreiche Projekt. Mit unserem spezialisierten Rechner für **${num} ${unit}** erhalten Sie ein Ergebnis, das über einfaches Kopfrechnen hinausgeht. Wir validieren jeden Tag gegen den astronomischen Kalenderzyklus, um sicherzustellen, dass Ihr Ergebnis auch über Jahre hinweg konsistent bleibt. In einer Welt, in der jede Sekunde zählt, bieten wir Ihnen die nötige Ruhe für Ihre Termingestaltung.`,
        (num: number, unit: string) => `Haben Sie sich jemals gefragt, wie sich **${num} ${unit}** auf Ihren Zeitplan auswirken? Unsere Software wurde entwickelt, um genau diese Fragen ohne Verzögerung zu beantworten. Durch die Kombination aus hoher Rechengeschwindigkeit und wissenschaftlicher Genauigkeit ist dieses Tool die erste Wahl für Profis und Privatpersonen gleichermaßen. Wir minimieren das Risiko von Planungsfehlern und maximieren Ihre Effizienz beim Umgang mit kalendarischen Daten.`
    ],
    en: [
        (num: number, unit: string) => `Calculating exactly ${num} ${unit} in the future or past requires absolute precision. Our calculator takes care of this work for you and takes into account all calendar specialities, such as leap years or irregular month lengths. This is particularly important if you need to meet deadlines precisely or plan important appointments in the future. A small error of just one day can already have major effects in many professional areas.`,
        (num: number, unit: string) => `If you want to know which date is exactly in ${num} ${unit}, you have come to the right place. This tool provides you with the exact result instantly in real time, so you no longer have to manually count calendar pages. Our algorithm works according to the **ISO-8601 standard** and guarantees maximum accuracy for all your time calculations. Whether private or business, accuracy is our top priority so that you can rely on your planning.`,
        (num: number, unit: string) => `Whether you are planning a project or want to keep an eye on an important milestone: knowing what happens in exactly ${num} ${unit} is crucial. We calculate the date absolutely error-free for you. All interruptions and calendrical shifts are taken into account fully automatically. Time management is an art that becomes much easier with the right tool. Use our years of experience in time calculation for your purposes.`,
        (num: number, unit: string) => `A deadline of ${num} ${unit} can occur quickly in everyday life or in professional life. Let our algorithm handle the exact determination of the target date so that you can concentrate on the essentials. Our tool is optimized to provide you not just a number, but a reliable date that correctly represents all facets of the Gregorian calendar. Security in planning through mathematically verified calculations.`,
        (num: number, unit: string) => `Precision in time measurement is the foundation of any successful project. With our specialized calculator for **${num} ${unit}**, you get a result that goes beyond simple mental arithmetic. We validate every day against the astronomical calendar cycle to ensure that your result remains consistent even over years. In a world where every second counts, we offer you the necessary peace of mind for your scheduling.`,
        (num: number, unit: string) => `Have you ever wondered how **${num} ${unit}** affect your schedule? Our software was developed to answer exactly these questions without delay. By combining high computing speed and scientific accuracy, this tool is the first choice for professionals and individuals alike. We minimize the risk of planning errors and maximize your efficiency in dealing with calendar data.`
    ]
};

// Fallback for other locales - Only en is needed as fallback for missing ones, though we only support de/en now
if (!EXPLANATION_TEMPLATES['de']) EXPLANATION_TEMPLATES['de'] = EXPLANATION_TEMPLATES['en'];

const USE_CASES: Record<string, string[]> = {
    de: [
        'Projektmanagement und Meilenstein-Planung',
        'Vertragsfristen und Kündigungsfristen',
        'Reisevorbereitungen und Visa-Gültigkeiten',
        'Schwangerschafts-Countdowns oder Hochzeitsplanung',
        'Prüfungsvorbereitungen für Schule und Studium',
        'Ablaufdaten für Lizenzen und Zertifikate'
    ],
    en: [
        'Project management and milestone planning',
        'Contract deadlines and notice periods',
        'Travel preparations and visa validities',
        'Pregnancy countdowns or wedding planning',
        'Exam preparation for school and studies',
        'Expiry dates for licenses and certificates'
    ]
};
// Fallback for other locales - Only en is needed as fallback
if (!USE_CASES['de']) USE_CASES['de'] = USE_CASES['en'];

function pickVariation<T>(arr: T[], seed: number): T {
    const index = Math.abs(seed) % arr.length;
    return arr[index];
}

export function generateContextualInsight(num: number, unit: string, locale: string): string {
    const isDe = locale === 'de';
    if (unit === 'tage' || unit === 'days') {
        const monthsApprox = (num / 30.44).toFixed(1);
        const weeksApprox = (num / 7).toFixed(1);
        if (num >= 30 && num < 365) {
            return isDe
                ? `Zur Einordnung: ${num} Tage entsprechen ungefähr ${monthsApprox} Monaten oder ${weeksApprox} Wochen. Dies ist ein typischer Zeitraum für mittelfristige Zielsetzungen.`
                : `For context: ${num} days are approximately ${monthsApprox} months or ${weeksApprox} weeks. This is a typical period for medium-term goals.`;
        } else if (num >= 365) {
            const yearsApprox = (num / 365.25).toFixed(1);
            return isDe
                ? `Zur Einordnung: ${num} Tage entsprechen rund ${yearsApprox} Jahren. Ein beachtlicher Zeitraum, in dem exakte Kalenderberechnungen unerlässlich sind.`
                : `For context: ${num} days are around ${yearsApprox} years. A considerable period in which exact calendar calculations are essential.`;
        } else if (num >= 7) {
            return isDe
                ? `Zur Einordnung: ${num} Tage sind exakt ${weeksApprox} Wochen.`
                : `For context: ${num} days are exactly ${weeksApprox} weeks.`;
        }
    }
    return isDe 
        ? `Die Berechnung von ${num} ${unit} ist ein Standardverfahren im täglichen Zeitmanagement.`
        : `Calculating ${num} ${unit} is a standard procedure in daily time management.`;
}

export function generateSEOContent(intent: string, slug: string, locale: string, numValue?: number): { paragraphs: string[], useCases: string[] } {
    const seed = numValue || slug.length;
    const loc = EXPLANATION_TEMPLATES[locale] ? locale : 'en';
    const isDe = loc === 'de';
    
    // 1. Dynamic Summary (Calculated Fact)
    const unit = isDe 
        ? (slug.includes('tage') ? 'Tage' : slug.includes('monate') ? 'Monate' : slug.includes('jahre') ? 'Jahre' : 'Einheiten')
        : (slug.includes('days') ? 'days' : slug.includes('months') ? 'months' : slug.includes('years') ? 'years' : 'units');
    
    const summary = isDe
        ? `[H3] Zusammenfassung der Berechnung für **${slug.replace(/-/g, ' ')}**`
        : `[H3] Summary of the **${slug.replace(/-/g, ' ')}** calculation`;

    // 2. Unique Explanation (Rotation)
    const templates = EXPLANATION_TEMPLATES[loc];
    const explanation = templates[Math.abs(seed) % templates.length](numValue || 0, unit);

    // 3. Contextual Insight
    const insight = numValue ? generateContextualInsight(numValue, unit.toLowerCase(), loc) : (isDe ? 'Egal welches Datum Sie berechnen, Genauigkeit steht an erster Stelle.' : 'No matter which date you calculate, accuracy comes first.');

    // 4. Mathematical & Standard Depth
    const mathHeader = isDe ? `[H3] Mathematische Präzision nach **ISO-8601**` : `[H3] Mathematical Precision according to **ISO-8601**`;
    const mathPara = isDe
        ? `Hinter den Kulissen arbeitet ein Algorithmus, der den **gregorianischen Kalender** bis ins kleinste Detail abbildet. Während ein Standardjahr 365 Tage hat, fügt der **Schaltjahrzyklus** alle vier Jahre einen Zusatztag hinzu – es sei denn, das Jahr ist durch 100 teilbar, aber nicht durch 400. Diese Feinheiten sind in unserem System fest verankert. Für die Berechnung von **${slug.replace(/-/g, ' ')}** bedeutet dies absolute Sicherheit in der zeitlichen Abfolge, unabhängig davon, in welchem Jahrhundert Ihr Startdatum liegt.`
        : `Behind the scenes, an algorithm works that maps the **Gregorian calendar** down to the smallest detail. While a standard year has 365 days, the **leap year cycle** adds an extra day every four years – unless the year is divisible by 100 but not by 400. These subtleties are firmly anchored in our system. For the calculation of **${slug.replace(/-/g, ' ')}**, this means absolute certainty in the chronological sequence, regardless of which century your start date is in.`;

    const standardPara = isDe
        ? `Die manuelle Berechnung von **Datumsdifferenzen** ist oft fehleranfällig. Ein bloßes Überschlagen reicht gerade im **rechtlichen oder geschäftlichen Kontext** (wie bei Kündigungsfristen oder Vertragslaufzeiten) nicht aus. Unser Programmcode nutzt modernste Zeitbibliotheken, um Schaltsekunden und unregelmäßige Monatslängen in die Kalkulation einzubeziehen. Dies stellt sicher, dass Sie ein mathematisch belastbares Ergebnis erhalten, das allen gängigen Standards entspricht.`
        : `Manual calculation of **date differences** is often error-prone. A mere rough estimation is not enough, especially in a **legal or business context** (such as notice periods or contract terms). Our program code uses state-of-the-art time libraries to include leap seconds and irregular month lengths in the calculation. This ensures that you receive a mathematically robust result that meets all common standards.`;

    // 5. Use cases picking
    const cases = USE_CASES[loc] || USE_CASES['en'];
    const pickedCases = [
        pickVariation(cases, seed),
        pickVariation(cases, seed + 1),
        pickVariation(cases, seed + 2)
    ];

    return {
        paragraphs: [summary, explanation, insight, mathHeader, mathPara, standardPara],
        useCases: pickedCases
    };
}

export function generateDynamicFAQs(intent: string, slug: string, locale: string, numValue?: number) {
    const isDe = locale === 'de';
    const unit = isDe
        ? (slug.includes('tage') ? 'Tage' : slug.includes('monate') ? 'Monate' : 'Einheiten')
        : (slug.includes('days') ? 'days' : slug.includes('months') ? 'months' : 'units');
    
    const valueStr = numValue ? `${numValue} ${unit}` : slug.replace(/-/g, ' ');

    if (isDe) {
        return [
            {
                question: `Wie genau funktioniert der Rechner für ${valueStr}?`,
                answer: `Der Rechner analysiert das Startdatum und addiert oder subtrahiert exakt ${valueStr} unter Berücksichtigung von Schaltjahren und exakten Monatslängen. Dabei werden alle Unterbrechungen und kalendarischen Besonderheiten vollautomatisch nach ISO 8601 Standard verarbeitet, um eine 100%ige Genauigkeit zu gewährleisten.`
            },
            {
                question: numValue && unit === 'Tage' ? `Ist ${valueStr} ungefähr ${(numValue / 30.4).toFixed(1)} Monate?` : `Wofür nutzt man die Berechnung von ${valueStr}?`,
                answer: numValue && unit === 'Tage' ? `Ja, mathematisch gesehen entsprechen ${valueStr} etwa ${(numValue / 30.4).toFixed(1)} Monaten, da ein durchschnittlicher Monat im gregorianischen Kalender etwa 30,44 Tage hat. Diese Umrechnung ist hilfreich, um längere Zeiträume besser einschätzen zu können.` : `Typischerweise wird diese Berechnung für Fristenbestimmung, professionelle Projektplanung, Vertragskalkulationen und persönliche Meilensteine wie Jahrestage oder Countdowns verwendet.`
            },
            {
                question: `Berücksichtigt das Tool bei ${valueStr} auch Wochenenden?`,
                answer: `Standardmäßig werden bei der Addition von Laufzeiten alle Kalendertage inklusive Samstagen und Sonntagen gezählt. Wenn Sie jedoch ausschließlich Werktage (Arbeitstage) berechnen möchten, nutzen Sie bitte unseren spezialisierten Arbeitstage-Rechner in der Menüleiste.`
            }
        ];
    }

    return [
        {
            question: `How exactly does the calculator for ${valueStr} work?`,
            answer: `The calculator analyzes the start date and adds or subtracts exactly ${valueStr} while taking into account leap years and exact month lengths. All interruptions and calendrical specialities are processed fully automatically according to the ISO 8601 standard to ensure 100% accuracy.`
        },
        {
            question: numValue && unit === 'days' ? `Is ${valueStr} approximately ${(numValue / 30.4).toFixed(1)} months?` : `What is the calculation of ${valueStr} used for?`,
            answer: numValue && unit === 'days' ? `Yes, mathematically ${valueStr} correspond to about ${(numValue / 30.4).toFixed(1)} months, as an average month in the Gregorian calendar has about 30.44 days. This conversion is helpful for better assessing longer periods.` : `Typically, this calculation is used for determining deadlines, professional project planning, contract calculations and personal milestones such as anniversaries or countdowns.`
        },
        {
            question: `Does the tool also consider weekends for ${valueStr}?`,
            answer: `By default, all calendar days including Saturdays and Sundays are counted when adding durations. However, if you would like to calculate only business days (working days), please use our specialized business day calculator in the menu bar.`
        }
    ];
}
