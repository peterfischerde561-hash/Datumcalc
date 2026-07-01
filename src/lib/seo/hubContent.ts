/**
 * Category-level content for the four tool hubs. Each hub gets its own
 * explainer + FAQ covering the entities and questions specific to that intent
 * (semantic-SEO depth), so no two hubs read or rank the same.
 */

export interface HubLocaleContent {
    explainerHeading: string;
    explainer: string[]; // paragraphs
    faqs: { q: string; a: string }[];
}

export const HUB_CONTENT: Record<string, { de: HubLocaleContent; en: HubLocaleContent }> = {
    differenz: {
        de: {
            explainerHeading: 'Datumsdifferenz: Tage zwischen zwei Daten berechnen',
            explainer: [
                'Die Datumsdifferenz gibt an, wie viel Zeit zwischen einem Start- und einem Enddatum liegt. Der Rechner ermittelt die Spanne wahlweise in Tagen, Wochen und Monaten und berücksichtigt dabei automatisch unterschiedliche Monatslängen und Schaltjahre.',
                'Wichtig ist die Frage, ob der erste Tag mitgezählt wird. Zählt man beide Endpunkte (inklusive Zählweise), ergibt sich ein Tag mehr, als wenn nur die vollen Tage dazwischen gezählt werden (exklusive Zählweise). Für Aufenthaltsdauern – etwa im Hotel oder auf Reisen – ist meist die Anzahl der Nächte, also die exklusive Differenz, relevant.',
                'Neben der reinen Tageszahl ist oft die Kalenderwoche nach ISO 8601 interessant: Sie beginnt am Montag, und die erste Woche eines Jahres ist jene mit dem ersten Donnerstag. So lassen sich Zeitspannen auch über Jahresgrenzen hinweg eindeutig einordnen.',
            ],
            faqs: [
                { q: 'Wird der erste Tag mitgezählt?', a: 'Standardmäßig zählt der Rechner die vollen Tage zwischen den beiden Daten (exklusive Zählweise). Wenn Sie beide Endtage einschließen möchten, addieren Sie einen Tag hinzu.' },
                { q: 'Wie viele Wochen und Monate sind das?', a: 'Der Rechner rechnet die Tagesdifferenz zusätzlich in Wochen (÷ 7) und in Monate um. Da Monate unterschiedlich lang sind, ist die Monatsangabe ein kalendarischer Durchschnittswert.' },
                { q: 'Spielt die Zeitzone eine Rolle?', a: 'Nein. Die Berechnung erfolgt auf Basis reiner Kalendertage. Die Dauer zwischen zwei Daten bleibt unabhängig von Ihrer Zeitzone gleich.' },
                { q: 'Werden Schaltjahre berücksichtigt?', a: 'Ja. Fällt der 29. Februar in die Spanne, wird er automatisch mitgezählt, weil der Rechner den vollständigen gregorianischen Kalender abbildet.' },
            ],
        },
        en: {
            explainerHeading: 'Date difference: calculating days between two dates',
            explainer: [
                'The date difference tells you how much time lies between a start and an end date. The calculator returns the span in days, weeks and months and automatically accounts for varying month lengths and leap years.',
                'A key question is whether the first day is counted. Counting both endpoints (inclusive) gives one more day than counting only the full days in between (exclusive). For stays – a hotel booking or a trip – the number of nights, i.e. the exclusive difference, is usually what matters.',
                'Beyond the raw day count, the ISO 8601 calendar week is often useful: it starts on Monday, and the first week of a year is the one containing the first Thursday. This makes spans that cross year boundaries unambiguous.',
            ],
            faqs: [
                { q: 'Is the first day included?', a: 'By default the calculator counts the full days between the two dates (exclusive). If you want to include both endpoints, add one day.' },
                { q: 'How many weeks and months is that?', a: 'The calculator also converts the day difference into weeks (÷ 7) and months. Because months vary in length, the month figure is a calendar average.' },
                { q: 'Does the time zone matter?', a: 'No. The calculation is based on pure calendar days, so the duration between two dates is the same regardless of your time zone.' },
                { q: 'Are leap years taken into account?', a: 'Yes. If February 29 falls within the span it is counted automatically, because the calculator maps the full Gregorian calendar.' },
            ],
        },
    },
    addieren: {
        de: {
            explainerHeading: 'Datum addieren & subtrahieren: Fristen sicher bestimmen',
            explainer: [
                'Beim Addieren oder Subtrahieren wird zu einem Startdatum eine bestimmte Anzahl an Tagen, Wochen, Monaten oder Jahren hinzugerechnet oder abgezogen. Das Ergebnis ist ein konkretes Kalenderdatum samt Wochentag – ideal für Liefertermine, Projektmeilensteine und rechtliche Fristen.',
                'Im deutschen Fristenrecht ist der Fristbeginn genau geregelt: Nach § 187 BGB wird der Tag des Ereignisses (etwa der Zugang einer Kündigung) bei Tagesfristen nicht mitgezählt; die Frist beginnt am Folgetag. Nach § 188 BGB endet eine nach Wochen oder Monaten bestimmte Frist an dem Tag der letzten Woche bzw. des letzten Monats, der dem Ereignistag entspricht.',
                'Beim Addieren von Monaten ist die Monatslänge zu beachten: Gibt es den Zieltag nicht (etwa den 31. in einem kürzeren Monat), wird auf den letzten Tag des Monats abgerundet. Diese Regeln bildet der Rechner automatisch ab, sodass das Ergebnis auch über Schaltjahre hinweg korrekt bleibt.',
            ],
            faqs: [
                { q: 'Zählt der heutige Tag bei der Frist mit?', a: 'Bei „ab heute“ rechnet der Rechner den heutigen Tag als Tag 0 und zählt die Tage vorwärts. Im rechtlichen Sinne beginnt eine Frist nach § 187 BGB in der Regel erst am Folgetag des Ereignisses.' },
                { q: 'Was passiert am Monatsende?', a: 'Wenn der Zieltag im Zielmonat nicht existiert (z. B. der 31. im Februar), wird auf den letzten gültigen Tag des Monats gerundet.' },
                { q: 'Kann ich auch rückwärts rechnen?', a: 'Ja. Mit einem negativen Wert bzw. der Subtraktion ermitteln Sie ein Datum in der Vergangenheit – nützlich, um von einem Stichtag aus den Fristbeginn zu bestimmen.' },
                { q: 'Werden Wochenenden übersprungen?', a: 'Nein, addiert werden Kalendertage inklusive Wochenenden. Für reine Werktage nutzen Sie den Arbeitstage-Rechner.' },
            ],
        },
        en: {
            explainerHeading: 'Add & subtract dates: determine deadlines reliably',
            explainer: [
                'Adding or subtracting adds or removes a number of days, weeks, months or years from a start date. The result is a concrete calendar date including the weekday – ideal for delivery dates, project milestones and legal deadlines.',
                'How the first day is treated matters. For an "from today" calculation the calculator uses today as day 0 and counts forward. In many legal contexts the day of the triggering event is excluded and the period starts the next day, so always check the convention that applies to your deadline.',
                'When adding months, month length matters: if the target day does not exist (for example the 31st in a shorter month), the result rolls back to the last day of that month. The calculator applies these rules automatically, so the result stays correct across leap years too.',
            ],
            faqs: [
                { q: 'Is today counted in the deadline?', a: 'For an "from today" calculation, today is treated as day 0 and the days are counted forward. Legal deadlines often start on the day after the triggering event, so verify the rule that applies to you.' },
                { q: 'What happens at the end of a month?', a: 'If the target day does not exist in the target month (e.g. the 31st in February), the result is rolled back to the last valid day of that month.' },
                { q: 'Can I calculate backwards?', a: 'Yes. Using a negative value or subtraction returns a date in the past – useful for finding when a period started, counting back from a fixed date.' },
                { q: 'Are weekends skipped?', a: 'No, calendar days including weekends are added. For working days only, use the business-day calculator.' },
            ],
        },
    },
    arbeitstage: {
        de: {
            explainerHeading: 'Arbeitstage & Werktage: der Unterschied zählt',
            explainer: [
                'Arbeitstage sind die Tage, an denen üblicherweise gearbeitet wird – in der Regel Montag bis Freitag. Der Rechner ermittelt die Netto-Arbeitstage zwischen zwei Daten und blendet Samstage und Sonntage aus, sodass Sie den tatsächlichen Arbeitsaufwand für Projekte oder Fristen sehen.',
                'Zu unterscheiden ist zwischen Werktagen und Arbeitstagen. Werktage sind alle Tage außer Sonn- und gesetzlichen Feiertagen – der Samstag ist rechtlich ein Werktag. Arbeitstage meinen dagegen meist die reine Fünf-Tage-Woche ohne Wochenende. Diese Unterscheidung ist etwa bei Kündigungs- und Lieferfristen relevant.',
                'Gesetzliche Feiertage sind in Deutschland Ländersache: Zwischen den Bundesländern gibt es deutliche Unterschiede, etwa bei Fronleichnam oder dem Reformationstag. Auch Brückentage – einzelne Arbeitstage zwischen Feiertag und Wochenende – beeinflussen die Zahl der effektiven Arbeitstage in einem Zeitraum.',
            ],
            faqs: [
                { q: 'Was ist der Unterschied zwischen Werktagen und Arbeitstagen?', a: 'Werktage sind alle Tage außer Sonn- und Feiertagen (der Samstag zählt dazu). Arbeitstage bezeichnen meist die Fünf-Tage-Woche von Montag bis Freitag.' },
                { q: 'Werden gesetzliche Feiertage abgezogen?', a: 'Der Rechner filtert zuverlässig die Wochenenden heraus. Gesetzliche Feiertage unterscheiden sich je nach Bundesland und sollten für Ihr Bundesland gesondert berücksichtigt werden.' },
                { q: 'Warum unterscheiden sich Feiertage je nach Bundesland?', a: 'In Deutschland legen die Länder die Feiertage fest. Tage wie Fronleichnam oder der Reformationstag sind nur in einem Teil der Bundesländer gesetzliche Feiertage.' },
                { q: 'Was sind Brückentage?', a: 'Brückentage sind einzelne Arbeitstage, die zwischen einem Feiertag und dem Wochenende liegen. Mit wenigen Urlaubstagen lässt sich so eine längere freie Zeit erreichen.' },
            ],
        },
        en: {
            explainerHeading: 'Business days & working days: the difference matters',
            explainer: [
                'Business days are the days on which work usually takes place – typically Monday to Friday. The calculator determines the net business days between two dates and removes Saturdays and Sundays, so you see the real working effort for projects or deadlines.',
                'It is worth distinguishing working days from business days. In German law a working day (Werktag) is every day except Sundays and public holidays, so Saturday counts. Business days usually mean the five-day week without the weekend. This distinction matters for notice and delivery periods.',
                'Public holidays in Germany are set by each federal state, so they differ noticeably between regions – for example Corpus Christi or Reformation Day. Bridge days – single working days between a holiday and the weekend – also affect the number of effective business days in a period.',
            ],
            faqs: [
                { q: 'What is the difference between working days and business days?', a: 'Working days (Werktage) are all days except Sundays and public holidays, so Saturday is included. Business days usually mean the five-day week, Monday to Friday.' },
                { q: 'Are public holidays deducted?', a: 'The calculator reliably filters out weekends. Public holidays differ by federal state and should be accounted for separately for your region.' },
                { q: 'Why do holidays differ by federal state?', a: 'In Germany the states define their holidays. Days such as Corpus Christi or Reformation Day are public holidays in only some states.' },
                { q: 'What are bridge days?', a: 'Bridge days are single working days that fall between a public holiday and the weekend. With a few days off you can turn them into a longer break.' },
            ],
        },
    },
    alter: {
        de: {
            explainerHeading: 'Alter berechnen: auf den Tag genau',
            explainer: [
                'Der Altersrechner ermittelt aus dem Geburtsdatum und einem Stichtag das genaue Alter – in vollen Jahren sowie zusätzlich in Monaten, Wochen und Tagen. So sehen Sie nicht nur, wie alt jemand ist, sondern auch, wie viel Zeit seit dem letzten Geburtstag vergangen ist.',
                'Maßgeblich ist das vollendete Lebensjahr: Man ist so viele Jahre alt, wie Geburtstage bereits vergangen sind. Das laufende Lebensjahr wird erst am nächsten Geburtstag vollendet. Diese Zählweise ist auch rechtlich entscheidend, etwa für die Volljährigkeit oder Altersgrenzen.',
                'Ein Sonderfall sind am 29. Februar Geborene: In Nicht-Schaltjahren fällt ihr rechnerischer Geburtstag auf den 28. Februar oder den 1. März, je nach Auslegung. Der Rechner arbeitet hier konsistent nach dem Kalender, sodass das vollendete Lebensjahr korrekt bestimmt wird.',
            ],
            faqs: [
                { q: 'Wie wird das Alter genau berechnet?', a: 'Der Rechner zählt die vollendeten Jahre zwischen Geburtsdatum und Stichtag und gibt den Rest zusätzlich in Monaten, Wochen und Tagen an.' },
                { q: 'Was bedeutet „vollendetes Lebensjahr"?', a: 'Das vollendete Lebensjahr ist die Anzahl der bereits vergangenen Geburtstage. Am Geburtstag selbst vollendet man das entsprechende Lebensjahr und ist dann so viele Jahre alt.' },
                { q: 'Wie wird bei einem Geburtstag am 29. Februar gerechnet?', a: 'In Nicht-Schaltjahren gibt es den 29. Februar nicht. Der Rechner ordnet den Geburtstag konsistent nach dem Kalender zu, sodass das vollendete Lebensjahr korrekt bleibt.' },
                { q: 'Kann ich das Alter zu einem beliebigen Stichtag berechnen?', a: 'Ja. Geben Sie neben dem Geburtsdatum ein beliebiges Bezugsdatum an, um das Alter zu diesem Zeitpunkt zu bestimmen – auch in der Zukunft.' },
            ],
        },
        en: {
            explainerHeading: 'Calculate age: down to the day',
            explainer: [
                'The age calculator uses a date of birth and a reference date to determine the exact age – in full years plus months, weeks and days. So you see not only how old someone is, but also how much time has passed since their last birthday.',
                'What counts is the completed year of life: you are as many years old as birthdays have already passed. The current year of life is only completed on the next birthday. This counting also matters legally, for example for the age of majority or age limits.',
                'A special case is people born on February 29: in non-leap years their nominal birthday falls on February 28 or March 1, depending on interpretation. The calculator works consistently by the calendar, so the completed year of life is determined correctly.',
            ],
            faqs: [
                { q: 'How exactly is age calculated?', a: 'The calculator counts the completed years between the date of birth and the reference date and shows the remainder in months, weeks and days.' },
                { q: 'What does "completed year of life" mean?', a: 'It is the number of birthdays that have already passed. On the birthday itself you complete that year of life and are then that many years old.' },
                { q: 'How is a February 29 birthday handled?', a: 'In non-leap years February 29 does not exist. The calculator assigns the birthday consistently by the calendar so the completed year of life stays correct.' },
                { q: 'Can I calculate age for any reference date?', a: 'Yes. Alongside the date of birth, enter any reference date to determine the age at that point in time – including in the future.' },
            ],
        },
    },
};
