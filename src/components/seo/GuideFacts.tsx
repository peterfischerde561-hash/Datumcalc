import NextLink from 'next/link';
import { getTodayInTimeZone, isLeapYear } from '@/lib/date/civil';
import { getLeapYearFacts, leapYearTable, skippedCenturies } from '@/lib/seo/guideFacts';

/**
 * Computed sections for the guides.
 *
 * Everything here is year-relative — whether *this* year is a leap year, which
 * years come next, which centuries get skipped. Written as prose it would be
 * wrong within a year and nothing would fail. The static article body carries
 * the rule, which does not change; this carries the years, which do.
 *
 * Returns null for guides with no computed content, so the page renders nothing
 * rather than an empty heading.
 */
export function GuideFacts({ slug, locale }: { slug: string; locale: string }) {
    const isDe = locale === 'de';
    const isLeapGuide = slug === 'schaltjahre-erklaert' || slug === 'leap-years-explained';
    if (!isLeapGuide) return null;

    const today = getTodayInTimeZone();
    const facts = getLeapYearFacts(today);
    // Two decades: enough to show the pattern and, from the late 2090s, the
    // century that gets skipped.
    const rows = leapYearTable(today, 24);
    const skipped = skippedCenturies(today, 3);
    const thisYearIsLeap = isLeapYear(today.year);

    return (
        <div className="not-prose my-12 space-y-10">
            {/* Answers "Ist 2026 ein Schaltjahr?" — the query, with the year computed. */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 md:p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                    {isDe
                        ? `Ist ${today.year} ein Schaltjahr?`
                        : `Is ${today.year} a leap year?`}
                </h2>
                <p className="text-lg text-slate-700 leading-relaxed">
                    {isDe ? (
                        <>
                            <strong className="text-slate-900">
                                {thisYearIsLeap
                                    ? `Ja – ${today.year} ist ein Schaltjahr und hat 366 Tage.`
                                    : `Nein – ${today.year} ist kein Schaltjahr und hat 365 Tage.`}
                            </strong>{' '}
                            {thisYearIsLeap
                                ? `Der 29. Februar ${today.year} existiert also.`
                                : `${today.year} ist nicht ohne Rest durch 4 teilbar, deshalb gibt es keinen 29. Februar. Das nächste Schaltjahr ist ${facts.nextLeapYear}, das letzte war ${facts.previousLeapYear}.`}
                        </>
                    ) : (
                        <>
                            <strong className="text-slate-900">
                                {thisYearIsLeap
                                    ? `Yes – ${today.year} is a leap year and has 366 days.`
                                    : `No – ${today.year} is not a leap year and has 365 days.`}
                            </strong>{' '}
                            {thisYearIsLeap
                                ? `February 29 ${today.year} exists.`
                                : `${today.year} is not divisible by 4, so there is no February 29. The next leap year is ${facts.nextLeapYear}; the last was ${facts.previousLeapYear}.`}
                        </>
                    )}
                </p>
            </section>

            {/* The rule applied to years the reader can actually see. */}
            <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {isDe ? 'Die nächsten Schaltjahre' : 'The next leap years'}
                </h2>
                <p className="text-slate-600 mb-4">
                    {isDe
                        ? `Alle Schaltjahre ab ${today.year} – und die Jahrhundertjahre, die trotz Teilbarkeit durch 4 ausfallen.`
                        : `Every leap year from ${today.year} on – plus the century years that are skipped despite being divisible by 4.`}
                </p>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                                <th scope="col" className="py-3 px-4 font-semibold">{isDe ? 'Jahr' : 'Year'}</th>
                                <th scope="col" className="py-3 px-4 font-semibold">{isDe ? 'Schaltjahr?' : 'Leap year?'}</th>
                                <th scope="col" className="py-3 px-4 font-semibold">{isDe ? 'Tage' : 'Days'}</th>
                                <th scope="col" className="py-3 px-4 font-semibold">{isDe ? 'Grund' : 'Reason'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.map((r) => (
                                <tr key={r.year} className={r.isLeap ? '' : 'bg-amber-50/60'}>
                                    <td className="py-3 px-4 font-medium text-slate-900 tabular-nums">{r.year}</td>
                                    <td className="py-3 px-4">
                                        <span className={r.isLeap ? 'text-green-700 font-semibold' : 'text-amber-800 font-semibold'}>
                                            {r.isLeap ? (isDe ? 'Ja' : 'Yes') : (isDe ? 'Nein' : 'No')}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-slate-700 tabular-nums">{r.isLeap ? 366 : 365}</td>
                                    <td className="py-3 px-4 text-slate-600">
                                        {r.reason === 'divisible-by-4' && (isDe ? 'durch 4 teilbar' : 'divisible by 4')}
                                        {r.reason === 'century-kept' && (isDe ? 'durch 400 teilbar – Ausnahme von der Ausnahme' : 'divisible by 400 – exception to the exception')}
                                        {r.reason === 'century-skipped' && (isDe ? 'volles Jahrhundert, nicht durch 400 teilbar – fällt aus' : 'full century, not divisible by 400 – skipped')}
                                        {r.reason === 'not-divisible' && (isDe ? 'nicht durch 4 teilbar' : 'not divisible by 4')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-sm text-slate-600 mt-3">
                    {isDe
                        ? `Die nächsten ausfallenden Jahrhundertjahre: ${skipped.join(', ')}.`
                        : `The next skipped century years: ${skipped.join(', ')}.`}
                </p>
            </section>

            {/* Where the 29th actually bites, in this calculator's terms. */}
            <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    {isDe ? 'Was der 29. Februar in der Praxis bedeutet' : 'What February 29 means in practice'}
                </h2>
                <div className="space-y-5 text-slate-700 leading-relaxed">
                    <div>
                        <h3 className="font-bold text-slate-900 mb-1">
                            {isDe ? 'Geburtstag am 29. Februar' : 'A birthday on February 29'}
                        </h3>
                        <p>
                            {isDe ? (
                                <>
                                    Ein am 29. Februar geborener Mensch hat nur in Schaltjahren einen
                                    kalendarischen Geburtstag – zwischen {facts.previousLeapYear} und{' '}
                                    {facts.nextLeapYear} liegen drei Jahre ohne diesen Tag. Der{' '}
                                    <NextLink href="/alter" className="text-blue-700 hover:underline">Altersrechner</NextLink>{' '}
                                    ordnet den Geburtstag in Nicht-Schaltjahren dem 28. Februar zu, sodass
                                    das vollendete Lebensjahr eindeutig bleibt.
                                </>
                            ) : (
                                <>
                                    Someone born on February 29 has a calendar birthday only in leap
                                    years – there are three years without that date between{' '}
                                    {facts.previousLeapYear} and {facts.nextLeapYear}. The{' '}
                                    <NextLink href="/en/age" className="text-blue-700 hover:underline">age calculator</NextLink>{' '}
                                    assigns the birthday to February 28 in common years, so the completed
                                    year of life stays unambiguous.
                                </>
                            )}
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 mb-1">
                            {isDe ? 'Monatsfristen über den Februar' : 'Month-long periods across February'}
                        </h3>
                        <p>
                            {isDe ? (
                                <>
                                    {/* German quotation marks, and escaped: a bare " in JSX text is a lint error. */}
                                    &bdquo;Ein Monat ab dem 31. Januar&ldquo; endet nicht am 31. Februar – den
                                    gibt es nicht. Der{' '}
                                    <NextLink href="/addieren" className="text-blue-700 hover:underline">Datumsrechner</NextLink>{' '}
                                    begrenzt auf den letzten Tag des Zielmonats: auf den 28. Februar, in
                                    einem Schaltjahr auf den 29.
                                </>
                            ) : (
                                <>
                                    &ldquo;One month from January 31&rdquo; does not end on February 31 –
                                    there is no such date. The{' '}
                                    <NextLink href="/en/add" className="text-blue-700 hover:underline">date calculator</NextLink>{' '}
                                    clamps to the last day of the target month: February 28, or the 29th
                                    in a leap year.
                                </>
                            )}
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 mb-1">
                            {isDe ? 'Zeiträume, die einen 29. Februar enthalten' : 'Spans that contain a February 29'}
                        </h3>
                        <p>
                            {isDe ? (
                                <>
                                    Ein Zeitraum über ein Schaltjahr hinweg ist einen Tag länger, als die
                                    Jahreszahl vermuten lässt: 365 Tage ab dem 1. März{' '}
                                    {facts.nextLeapYear - 1} enden nicht am 1. März {facts.nextLeapYear},
                                    weil der 29. Februar dazwischenliegt. Die{' '}
                                    <NextLink href="/differenz" className="text-blue-700 hover:underline">Datumsdifferenz</NextLink>{' '}
                                    zählt ihn automatisch mit.
                                </>
                            ) : (
                                <>
                                    A span crossing a leap year is one day longer than the year count
                                    suggests: 365 days from March 1 {facts.nextLeapYear - 1} does not land
                                    on March 1 {facts.nextLeapYear}, because February 29 sits in between.
                                    The{' '}
                                    <NextLink href="/en/difference" className="text-blue-700 hover:underline">date difference calculator</NextLink>{' '}
                                    counts it automatically.
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
