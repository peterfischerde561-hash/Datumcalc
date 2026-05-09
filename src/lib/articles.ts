export interface Article {
    slug: string;
    title: string;
    description: string;
    publishedAt: string;
    readTime: string;
    content: string;
}

export const articles: Record<string, Article[]> = {
    de: [
        {
            slug: 'schaltjahre-erklaert',
            title: 'Schaltjahre erklärt – Warum gibt es den 29. Februar?',
            description: 'Was ist ein Schaltjahr und warum gibt es den 29. Februar? Alle Regeln, Beispiele und die Berechnung einfach erklärt.',
            publishedAt: '24. März 2024',
            readTime: '3 min',
            content: `
          <h2>Was ist ein Schaltjahr?</h2>
          <p>Ein Schaltjahr hat 366 Tage statt der üblichen 365. Der zusätzliche Tag wird am Ende des Februars als 29. Februar eingefügt. Dies ist notwendig, um unseren Kalender mit dem Sonnenjahr (der Zeit, die die Erde für eine Umkreisung der Sonne benötigt) zu synchronisieren.</p>
          
          <h2>Warum brauchen wir Schaltjahre?</h2>
          <p>Die Erde benötigt etwa 365,2422 Tage, um die Sonne einmal komplett zu umrunden. Würden wir strikt jedes Jahr 365 Tage nutzen, würde sich unser Kalender alle vier Jahre um fast einen ganzen Tag verschieben. Nach 100 Jahren wären das schon 24 Tage! Der Sommer im Juli würde irgendwann mitten in den Winter fallen.</p>
          
          <h2>Die Schaltjahr-Regel</h2>
          <p>Die Berechnung ist nicht so simpel wie "alle vier Jahre". Die genaue weltweite Regel lautet:</p>
          <ul>
            <li>Ein Jahr ist ein Schaltjahr, wenn es restlos durch 4 teilbar ist.</li>
            <li><strong>Ausnahme:</strong> Ist das Jahr durch 100 teilbar, ist es <em>kein</em> Schaltjahr.</li>
            <li><strong>Ausnahme von der Ausnahme:</strong> Ist das Jahr durch 400 teilbar, ist es <em>doch</em> wieder ein Schaltjahr.</li>
          </ul>
          <p>Deshalb war das Jahr 2000 ein Schaltjahr, das Jahr 1900 jedoch nicht.</p>
        `
        },
        {
            slug: 'was-ist-ein-arbeitstag',
            title: 'Was ist ein Arbeitstag? – Definition, Werktage & Fristen',
            description: 'Was ist ein Arbeitstag? Definition, Unterschied zu Werktagen und was bei gesetzlichen Fristen zu beachten ist – einfach erklärt.',
            publishedAt: '25. März 2024',
            readTime: '3 min',
            content: `
          <h2>Definition: Arbeitstag</h2>
          <p>Ein Arbeitstag ist ein Tag, an dem üblicherweise gearbeitet wird. Im Gegensatz zum Kalendertag oder Werktag werden hierbei Wochenenden und gesetzliche Feiertage grundsätzlich ausgeschlossen.</p>
          
          <h2>Unterscheidung zum Werktag</h2>
          <p>Oft werden diese Begriffe verwechselt. Nach dem Bundesurlaubsgesetz gelten alle Kalendertage, die nicht Sonn- oder gesetzliche Feiertage sind, als Werktage (also auch der Samstag). Ein Arbeitstag hingegen bezieht sich meist auf die individuelle 5-Tage-Woche (Montag bis Freitag).</p>
          
          <h2>Relevanz für Fristen</h2>
          <p>Wenn im Arbeitsvertrag von "Arbeitstagen" die Rede ist, zählen Samstage nicht mit. Steht dort jedoch "Werktage", muss der Samstag bei der Fristberechnung berücksichtigt werden. Mit unserem Rechner kannst du beide Varianten präzise unterscheiden.</p>
        `
        },
        {
            slug: 'wochen-im-jahr',
            title: 'Wie viele Wochen hat ein Jahr? – 52 oder 53 Wochen?',
            description: 'Hat ein Jahr immer 52 Wochen? Erfahre alles über ISO-Kalenderwochen und warum manche Jahre 53 Wochen haben.',
            publishedAt: '20. März 2024',
            readTime: '2 min',
            content: `
          <h2>Die 52-Wochen-Regel</h2>
          <p>Normalerweise geht man davon aus, dass ein Jahr 52 Wochen hat. Teilt man 365 durch 7 (Tage pro Woche), erhält man exakt 52,14. Ein normales Jahr hat also 52 volle Wochen und einen Resttag. Ein Schaltjahr hat 52 Wochen und 2 Resttage.</p>
    
          <h2>Wann gibt es eine 53. Kalenderwoche?</h2>
          <p>Die Zählweise der Wochen folgt dem strengen ISO 8601 Standard. Dieser besagt international:</p>
          <blockquote style="border-left: 4px solid #ff0055; padding-left: 1rem; margin-top: 1rem; margin-bottom: 1rem; font-style: italic; background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 0.5rem;">
            Woche 1 ist diejenige Woche, die den ersten Donnerstag des Jahres enthält.
          </blockquote>
          <p>Aufgrund dessen kommt es vor, dass ein Jahr 53 Kalenderwochen hat. Das passiert immer dann, wenn ein Gemeinjahr an einem Donnerstag beginnt (oder ein Schaltjahr an einem Mittwoch oder Donnerstag startet).</p>
    
          <h2>Zusammenfassung für die Planung</h2>
          <p>Kalenderwochen sind unerlässlich für Lohnabrechnungen, Urlaubsplanung und Projektmanagement. Mit unserem Datumsrechner kannst du dir für jede beliebige Zeitspanne auch die exakten Kalender-Metriken anzeigen lassen.</p>
        `
        },
        {
            slug: 'iso-8601-erklaert',
            title: 'ISO 8601 einfach erklärt – Datum & Zeit richtig formatieren',
            description: 'ISO 8601 einfach erklärt: Der internationale Standard für Datum und Zeit – Aufbau, Beispiele und warum er wichtig ist.',
            publishedAt: '26. März 2024',
            readTime: '4 min',
            content: `
          <h2>Was ist ISO 8601?</h2>
          <p>ISO 8601 ist der internationale Standard der ISO für die Darstellung von Datum und Uhrzeit. Er sorgt dafür, dass Zeitangaben weltweit eindeutig und maschinenlesbar sind.</p>
          
          <h2>Formatierung (YYYY-MM-DD)</h2>
          <p>Das bekannteste Merkmal ist die absteigende Sortierung: Jahr, Monat, Tag. Das Format <code>2024-03-24</code> ist absolut eindeutig und vermeidet Verwechslungen zwischen dem US-Format (MM/DD/YYYY) und dem europäischen Format (DD.MM.YYYY).</p>
          
          <h2>Warum wir ISO 8601 nutzen</h2>
          <p>Für Informatiker und Mathematiker ist dieser Standard essenziell, da Datumsangaben so lexikographisch korrekt sortiert werden können. Unser Datumsrechner basiert intern vollständig auf diesen standardisierten Zeitstempeln, um höchste mathematische Präzision zu garantieren.</p>
        `
        }
    ],
    en: [
        {
            slug: 'leap-years-explained',
            title: 'Leap Years Explained: Why February 29th Exists',
            description: 'Everything you need to know about leap years. Learn why our calendar needs an extra day every four years and how it is calculated.',
            publishedAt: 'March 24, 2024',
            readTime: '3 min',
            content: `
          <h2>What is a Leap Year?</h2>
          <p>A leap year has 366 days instead of the usual 365. The extra day is added to the end of February – February 29th. This is necessary to synchronize our calendar with the solar year (the time it takes for the Earth to orbit the Sun).</p>
          
          <h2>Why do we need Leap Years?</h2>
          <p>The Earth takes approximately 365.2422 days to complete one orbit around the Sun. If we strictly used 365 days every year, our calendar would shift by nearly a full day every four years. After 100 years, that would be 24 days! Summer in July would eventually occur in the middle of winter.</p>
          
          <h2>The Leap Year Rule</h2>
          <p>The calculation is not as simple as "every four years." The exact global rule is:</p>
          <ul>
            <li>A year is a leap year if it is divisible by 4.</li>
            <li><strong>Exception:</strong> If the year is divisible by 100, it is <em>not</em> a leap year.</li>
            <li><strong>Exception to the exception:</strong> If the year is divisible by 400, it <em>is</em> a leap year after all.</li>
          </ul>
          <p>That's why the year 2000 was a leap year, but the year 1900 was not.</p>
        `
        },
        {
            slug: 'what-is-a-business-day',
            title: 'What is a Business Day? Definition and Legal Regulations',
            description: 'Learn everything about the term business day, how it differs from a working day and what to consider for deadlines.',
            publishedAt: 'March 25, 2024',
            readTime: '3 min',
            content: `
          <h2>Definition: Business Day</h2>
          <p>A business day is a day on which work is normally performed. Unlike the calendar day or working day, weekends and public holidays are excluded.</p>
          
          <h2>Difference to Working Day</h2>
          <p>These terms are often confused. In many regions, all calendar days that are not Sundays or public holidays are considered working days (including Saturdays). A business day, however, mostly refers to the individual 5-day week (Monday to Friday).</p>
          
          <h2>Relevance for Deadlines</h2>
          <p>When employment contracts mention "business days", Saturdays do not count. But if they say "working days", Saturday must be included in the deadline calculation. With our calculator, you can precisely distinguish both variants.</p>
        `
        },
        {
            slug: 'weeks-in-a-year',
            title: 'How Many Weeks Are in a Year?',
            description: 'Does a year always have 52 weeks? Find out more about ISO weeks, leap years, and why some years have 53 weeks.',
            publishedAt: 'March 20, 2024',
            readTime: '2 min',
            content: `
          <h2>The 52-Week Rule</h2>
          <p>Normally, a year is assumed to have 52 weeks. If you divide 365 by 7 (days per week), you get exactly 52.14. A normal year thus has 52 full weeks and one remainder day. A leap year has 52 weeks and 2 remainder days.</p>
    
          <h2>When is there a 53rd Calendar Week?</h2>
          <p>The week numbering follows the strict ISO 8601 standard. It states internationally:</p>
          <blockquote style="border-left: 4px solid #ff0055; padding-left: 1rem; margin-top: 1rem; margin-bottom: 1rem; font-style: italic; background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 0.5rem;">
            Week 1 is the week that contains the first Thursday of the year.
          </blockquote>
          <p>Because of this, it happens that a year has 53 calendar weeks. This happens whenever a common year starts on a Thursday (or a leap year starts on a Wednesday or Thursday).</p>
        `
        },
        {
            slug: 'iso-8601-explained',
            title: 'ISO 8601 Explained: The International Standard for Date and Time',
            description: 'Why ISO 8601 is the most important standard for digital time measurement and how to apply it correctly.',
            publishedAt: 'March 26, 2024',
            readTime: '4 min',
            content: `
          <h2>What is ISO 8601?</h2>
          <p>ISO 8601 is the international ISO standard for the representation of date and time. It ensures that time data is globally unambiguous and machine-readable.</p>
          
          <h2>Formatting (YYYY-MM-DD)</h2>
          <p>The most well-known feature is the descending sorting: year, month, day. The format <code>2024-03-24</code> is absolutely unambiguous and avoids confusion between the US format (MM/DD/YYYY) and the European format (DD.MM.YYYY).</p>
          
          <h2>Why we use ISO 8601</h2>
          <p>For computer scientists and mathematicians, this standard is essential because date inputs can be sorted lexicographically correct. Our date calculator relies entirely on these standardized timestamps internally to guarantee maximum mathematical precision.</p>
        `
        }
    ]
};

export function getArticles(locale: string): Article[] {
    return articles[locale] || articles['de'];
}

export function getArticleBySlug(slug: string, locale: string = 'de') {
    return (articles[locale] || articles['de'])?.find(a => a.slug === slug);
}
