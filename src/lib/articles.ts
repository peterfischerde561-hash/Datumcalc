export interface Article {
    slug: string;
    title: string;
    description: string;
    readTime: string;
    /**
     * The specific things this article establishes — required, and specific to
     * this article. These previously came from the shared `Article.takeaways*`
     * i18n strings, so every guide displayed the same three generic bullets in
     * its highest-visibility position, and a leap-year article opened with
     * three sentences that said nothing about leap years. Because they lived in
     * the translation files they were also translated per locale while the
     * article bodies were not, which is how a French URL ended up serving
     * French bullets above a German article.
     *
     * Assert them against the article's own content. If you cannot write three
     * that are true only of this article, the article needs work, not filler.
     */
    takeaways: string[];
    content: string;
}

export const articles: Record<string, Article[]> = {
    de: [
        {
            slug: 'schaltjahre-erklaert',
            // Was "Schaltjahre erklärt – Warum gibt es den 29. Februar?", which
            // answers *why*. Every query GSC records for this page asks *when*:
            // "wann ist das nächste schaltjahr", "nächstes schaltjahr", "wann
            // ist schaltjahr". The ranking pages all title it as the question.
            // The article still explains the rule; the heading now matches what
            // people came to find out.
            title: 'Wann ist das nächste Schaltjahr?',
            description: 'Wann ist das nächste Schaltjahr und warum gibt es den 29. Februar? Die vollständige Schaltjahrregel mit Beispielen – und welche Jahre trotz Teilbarkeit durch 4 keine Schaltjahre sind.',
            readTime: '3 min',
            // Rules, not dates: which year comes next is computed and shown in
            // the direct answer above. A takeaway that names the next leap year
            // would be wrong the year after it passes.
            takeaways: [
                'Ein Schaltjahr hat 366 Tage – der 29. Februar wird alle vier Jahre eingeschoben.',
                '1900 war kein Schaltjahr, obwohl es durch 4 teilbar ist: volle Jahrhunderte fallen aus.',
                '2000 war dagegen eines, weil die Ausnahme für durch 400 teilbare Jahre greift.'
            ],
            content: `
          <h2>Was ist ein Schaltjahr?</h2>
          <p>Ein Schaltjahr hat 366 Tage statt der üblichen 365. Der zusätzliche Tag wird am Ende des Februars als <a href="/alter">29. Februar</a> eingefügt. Dies ist notwendig, um unseren Kalender mit dem Sonnenjahr (der Zeit, die die Erde für eine Umkreisung der Sonne benötigt) zu synchronisieren.</p>
          
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
          <p>Ob ein 29. Februar in einen Zeitraum fällt, zeigt die <a href="/differenz">Berechnung der Tage zwischen zwei Daten</a>. Wie sich die Schaltjahre auf die Wochenzählung auswirken, steht im Ratgeber <a href="/ratgeber/wochen-im-jahr">Wie viele Wochen hat ein Jahr?</a>.</p>
        `
        },
        {
            slug: 'was-ist-ein-arbeitstag',
            title: 'Was ist ein Arbeitstag? Definition & Gesetz',
            description: 'Was ist ein Arbeitstag? Definition, Unterschied zu Werktagen und was bei gesetzlichen Fristen zu beachten ist – einfach erklärt.',
            readTime: '3 min',
            takeaways: [
                'Arbeitstag meint in der Regel die 5-Tage-Woche von Montag bis Freitag.',
                'Werktag ist weiter gefasst: Nach dem Bundesurlaubsgesetz zählt auch der Samstag dazu.',
                'Steht im Vertrag „Werktage“, verkürzt sich eine Frist gegenüber „Arbeitstagen“ spürbar.'
            ],
            content: `
          <h2>Definition: Arbeitstag</h2>
          <p>Ein Arbeitstag ist ein Tag, an dem üblicherweise gearbeitet wird. Im Gegensatz zum Kalendertag oder Werktag werden hierbei Wochenenden und gesetzliche Feiertage grundsätzlich ausgeschlossen.</p>
          
          <h2>Unterscheidung zum Werktag</h2>
          <p>Oft werden diese Begriffe verwechselt. Nach dem Bundesurlaubsgesetz gelten alle Kalendertage, die nicht Sonn- oder gesetzliche Feiertage sind, als Werktage (also auch der Samstag). Ein Arbeitstag hingegen bezieht sich meist auf die individuelle 5-Tage-Woche (Montag bis Freitag).</p>
          
          <h2>Relevanz für Fristen</h2>
          <p>Wenn im Arbeitsvertrag von "Arbeitstagen" die Rede ist, zählen Samstage nicht mit. Steht dort jedoch "Werktage", muss der Samstag bei der Fristberechnung berücksichtigt werden. Beide Varianten lassen sich mit dem <a href="/arbeitstage">Arbeitstage-Rechner</a> unterscheiden. Wenn eine Frist dagegen in Kalendertagen läuft, hilft die Funktion <a href="/addieren">Datum addieren</a>.</p>
        `
        },
        {
            slug: 'wochen-im-jahr',
            title: 'Wie viele Wochen hat ein Jahr?',
            description: 'Hat ein Jahr immer 52 Wochen? Erfahre alles über ISO-Kalenderwochen und warum manche Jahre 53 Wochen haben.',
            readTime: '2 min',
            takeaways: [
                'Ein Gemeinjahr hat 52 Wochen und einen Resttag, ein Schaltjahr 52 Wochen und zwei.',
                'Deshalb verschiebt sich der Wochentag eines Datums jedes Jahr um eins – nach einem Schaltjahr um zwei.',
                'Ein Jahr hat 53 Kalenderwochen, wenn es an einem Donnerstag beginnt (Schaltjahre auch ab Mittwoch).'
            ],
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
          <p>Kalenderwochen sind unerlässlich für Lohnabrechnungen, Urlaubsplanung und Projektmanagement. Die Regeln dahinter erklärt der Ratgeber <a href="/ratgeber/iso-8601-erklaert">ISO 8601 einfach erklärt</a>. Für eine beliebige Zeitspanne zeigt die <a href="/differenz">Datumsdifferenz</a> die Kalenderwoche und den Tag des Jahres mit an.</p>
        `
        },
        {
            slug: 'iso-8601-erklaert',
            title: 'ISO 8601 einfach erklärt (Datum & Zeit)',
            description: 'ISO 8601 einfach erklärt: Der internationale Standard für Datum und Zeit – Aufbau, Beispiele und warum er wichtig ist.',
            readTime: '4 min',
            takeaways: [
                'ISO 8601 schreibt absteigend Jahr-Monat-Tag: 2026-08-24.',
                'Dadurch entfällt die Verwechslung zwischen US-Format (MM/DD/YYYY) und deutschem Format (DD.MM.YYYY).',
                'Weil die Stellen absteigend sortiert sind, ergibt alphabetisches Sortieren automatisch die richtige Reihenfolge.'
            ],
            content: `
          <h2>Was ist ISO 8601?</h2>
          <p>ISO 8601 ist der internationale Standard der ISO für die Darstellung von Datum und Uhrzeit. Er sorgt dafür, dass Zeitangaben weltweit eindeutig und maschinenlesbar sind.</p>
          
          <h2>Formatierung (YYYY-MM-DD)</h2>
          <p>Das bekannteste Merkmal ist die absteigende Sortierung: Jahr, Monat, Tag. Das Format <code>2024-03-24</code> ist absolut eindeutig und vermeidet Verwechslungen zwischen dem US-Format (MM/DD/YYYY) und dem europäischen Format (DD.MM.YYYY).</p>
          
          <h2>Warum wir ISO 8601 nutzen</h2>
          <p>Für Informatiker und Mathematiker ist dieser Standard essenziell, da Datumsangaben so lexikographisch korrekt sortiert werden können. Die Kalenderwochen auf dieser Seite folgen dieser Regel – warum manche Jahre 53 davon haben, steht im Ratgeber <a href="/ratgeber/wochen-im-jahr">Wie viele Wochen hat ein Jahr?</a>. Das Format lässt sich direkt im <a href="/differenz">Datumsrechner</a> nachvollziehen.</p>
        `
        }
    ],
    en: [
        {
            slug: 'leap-years-explained',
            title: 'When Is the Next Leap Year?',
            description: 'When is the next leap year, and why does February 29 exist? The full leap-year rule with examples – including which years are skipped despite being divisible by 4.',
            readTime: '3 min',
            takeaways: [
                'A leap year has 366 days – February 29 is inserted every four years.',
                '1900 was not a leap year despite being divisible by 4: full centuries are skipped.',
                '2000 was one, because the exception for years divisible by 400 applies.'
            ],
            content: `
          <h2>What is a Leap Year?</h2>
          <p>A leap year has 366 days instead of the usual 365. The extra day is added to the end of February – <a href="/en/age">February 29th</a>. This is necessary to synchronize our calendar with the solar year (the time it takes for the Earth to orbit the Sun).</p>
          
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
          <p>To see whether a February 29 falls inside a given period, use the <a href="/en/difference">date difference calculator</a>. How leap years affect week numbering is covered in <a href="/en/guide/weeks-in-a-year">How many weeks are in a year?</a>.</p>
        `
        },
        {
            slug: 'what-is-a-business-day',
            title: 'What is a Business Day? Definition & Rules',
            description: 'Learn everything about the term business day, how it differs from a working day and what to consider for deadlines.',
            readTime: '3 min',
            takeaways: [
                'A business day normally means the Monday-to-Friday working week.',
                'Weekends and public holidays are excluded, which is what separates it from a calendar day.',
                'Contracts that count "working days" instead of calendar days lengthen a deadline in practice.'
            ],
            content: `
          <h2>Definition: Business Day</h2>
          <p>A business day is a day on which work is normally performed. Unlike the calendar day or working day, weekends and public holidays are excluded.</p>
          
          <h2>Difference to Working Day</h2>
          <p>These terms are often confused. In many regions, all calendar days that are not Sundays or public holidays are considered working days (including Saturdays). A business day, however, mostly refers to the individual 5-day week (Monday to Friday).</p>
          
          <h2>Relevance for Deadlines</h2>
          <p>When employment contracts mention "business days", Saturdays do not count. But if they say "working days", Saturday must be included in the deadline calculation. Both variants can be distinguished with the <a href="/en/business">business day calculator</a>. If a deadline runs in calendar days instead, use <a href="/en/add">add to date</a>.</p>
        `
        },
        {
            slug: 'weeks-in-a-year',
            title: 'How Many Weeks Are in a Year?',
            description: 'Does a year always have 52 weeks? Find out more about ISO weeks, leap years, and why some years have 53 weeks.',
            readTime: '2 min',
            takeaways: [
                'A common year is 52 weeks plus one day; a leap year is 52 weeks plus two.',
                'That leftover day is why a given date shifts one weekday each year, and two after a leap year.',
                'A year has 53 ISO weeks when it starts on a Thursday (or a Wednesday, in a leap year).'
            ],
            content: `
          <h2>The 52-Week Rule</h2>
          <p>Normally, a year is assumed to have 52 weeks. If you divide 365 by 7 (days per week), you get exactly 52.14. A normal year thus has 52 full weeks and one remainder day. A leap year has 52 weeks and 2 remainder days.</p>
    
          <h2>When is there a 53rd Calendar Week?</h2>
          <p>The week numbering follows the strict ISO 8601 standard. It states internationally:</p>
          <blockquote style="border-left: 4px solid #ff0055; padding-left: 1rem; margin-top: 1rem; margin-bottom: 1rem; font-style: italic; background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 0.5rem;">
            Week 1 is the week that contains the first Thursday of the year.
          </blockquote>
          <p>Because of this, it happens that a year has 53 calendar weeks. This happens whenever a common year starts on a Thursday (or a leap year starts on a Wednesday or Thursday).</p>
          <p>For any span, the <a href="/en/difference">date difference calculator</a> also shows the calendar week and the day of the year. The numbering rules are covered in <a href="/en/guide/iso-8601-explained">ISO 8601 explained</a>.</p>
        `
        },
        {
            slug: 'iso-8601-explained',
            title: 'ISO 8601 Standard Explained: Date & Time',
            description: 'Why ISO 8601 is the most important standard for digital time measurement and how to apply it correctly.',
            readTime: '4 min',
            takeaways: [
                'ISO 8601 writes dates largest unit first: 2026-08-24.',
                'That removes the ambiguity between the US format (MM/DD/YYYY) and the European one (DD.MM.YYYY).',
                'Because the digits descend in significance, sorting the strings alphabetically also sorts them chronologically.'
            ],
            content: `
          <h2>What is ISO 8601?</h2>
          <p>ISO 8601 is the international ISO standard for the representation of date and time. It ensures that time data is globally unambiguous and machine-readable.</p>
          
          <h2>Formatting (YYYY-MM-DD)</h2>
          <p>The most well-known feature is the descending sorting: year, month, day. The format <code>2024-03-24</code> is absolutely unambiguous and avoids confusion between the US format (MM/DD/YYYY) and the European format (DD.MM.YYYY).</p>
          
          <h2>Why we use ISO 8601</h2>
          <p>For computer scientists and mathematicians, this standard is essential because date inputs can be sorted lexicographically correct.</p>
          <p>The calendar weeks shown on this site follow this rule — why some years have 53 of them is covered in <a href="/en/guide/weeks-in-a-year">How many weeks are in a year?</a>. You can see the format in use in the <a href="/en/difference">date difference calculator</a>.</p>
        `
        }
    ]
};

export function getArticles(locale: string): Article[] {
    return articles[locale] || articles['de'];
}

/**
 * Fail the build rather than shipping a guide whose most prominent block is
 * empty or padded. Runs at module load, so `next build` surfaces it.
 */
function assertArticlesAreComplete() {
    const problems: string[] = [];

    for (const [locale, list] of Object.entries(articles)) {
        for (const article of list) {
            const where = `${locale}/${article.slug}`;
            if (!Array.isArray(article.takeaways) || article.takeaways.length < 3) {
                problems.push(`${where}: needs at least 3 takeaways`);
                continue;
            }
            if (article.takeaways.some((t) => !t || t.trim().length < 20)) {
                problems.push(`${where}: has an empty or stub takeaway`);
            }
            if (new Set(article.takeaways).size !== article.takeaways.length) {
                problems.push(`${where}: has duplicate takeaways`);
            }
        }
    }

    // Catch the failure mode this replaced: the same bullet reused across
    // articles, which is filler wearing the shape of a summary.
    const seen = new Map<string, string>();
    for (const [locale, list] of Object.entries(articles)) {
        for (const article of list) {
            for (const point of article.takeaways ?? []) {
                const key = `${locale}::${point}`;
                const owner = seen.get(key);
                if (owner) {
                    problems.push(
                        `${locale}/${article.slug}: takeaway is shared with ${owner} — write one specific to this article`
                    );
                }
                seen.set(key, `${locale}/${article.slug}`);
            }
        }
    }

    if (problems.length) {
        throw new Error(`Invalid article content:\n  - ${problems.join('\n  - ')}`);
    }
}

assertArticlesAreComplete();

export function getArticleBySlug(slug: string, locale: string = 'de') {
    return (articles[locale] || articles['de'])?.find(a => a.slug === slug);
}

export const ARTICLE_SLUG_MAP: Record<string, Record<string, string>> = {
    de: {
        'schaltjahre-erklaert': 'leap-years-explained',
        'was-ist-ein-arbeitstag': 'what-is-a-business-day',
        'wochen-im-jahr': 'weeks-in-a-year',
        'iso-8601-erklaert': 'iso-8601-explained'
    },
    en: {
        'leap-years-explained': 'schaltjahre-erklaert',
        'what-is-a-business-day': 'was-ist-ein-arbeitstag',
        'weeks-in-a-year': 'wochen-im-jahr',
        'iso-8601-explained': 'iso-8601-erklaert'
    }
};

export function getLocalizedArticleSlug(slug: string, currentLocale: string, targetLocale: string): string {
    if (currentLocale === targetLocale) return slug;
    return ARTICLE_SLUG_MAP[currentLocale]?.[slug] || slug;
}
