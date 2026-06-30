import { generateSEOContent } from '@/lib/seo/contentEngine';

export function SEOContentBlock({ intent, slug, locale }: { intent: string; slug: string; locale: string }) {
    const match = slug.match(/^(\d+)-/);
    const numValue = match ? parseInt(match[1]) : undefined;
    const content = generateSEOContent(intent, slug, locale, numValue);
    const isDe = locale === 'de';

    return (
        <section className="bg-white border border-slate-200 rounded-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">
                {content.heading}
            </h2>
            <div className="space-y-5 text-slate-700 leading-relaxed text-lg">
                {content.paragraphs.map((p, i) => {
                    const isH3 = p.startsWith('[H3] ');
                    const text = isH3 ? p.replace('[H3] ', '') : p;

                    const renderText = (t: string) => {
                        const parts = t.split(/(\*\*.*?\*\*)/g);
                        return parts.map((part, index) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={index} className="text-slate-900 font-bold">{part.slice(2, -2)}</strong>;
                            }
                            return part;
                        });
                    };

                    if (isH3) {
                        return <h3 key={i} className="text-xl font-bold text-slate-900 mt-8 mb-4">{renderText(text)}</h3>;
                    }
                    return (
                        <p key={i}>
                            {renderText(text)}
                        </p>
                    );
                })}
            </div>

            {content.weekdayTable && (
                <div className="mt-8 pt-8 border-t border-slate-200">
                    <h3 className="text-xl font-semibold mb-4 text-slate-900">{content.weekdayTable.heading}</h3>
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                                    <th scope="col" className="py-3 px-4 font-semibold">{isDe ? 'Jahr' : 'Year'}</th>
                                    <th scope="col" className="py-3 px-4 font-semibold">{isDe ? 'Datum' : 'Date'}</th>
                                    <th scope="col" className="py-3 px-4 font-semibold">{isDe ? 'Wochentag' : 'Day of the week'}</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-700 divide-y divide-slate-100">
                                {content.weekdayTable.rows.map((row) => (
                                    <tr key={row.year} className="hover:bg-slate-50">
                                        <td className="py-3 px-4 font-medium text-slate-900">{row.year}</td>
                                        <td className="py-3 px-4">{row.date}</td>
                                        <td className="py-3 px-4">{row.weekday}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {content.useCases.length > 0 && (
                <div className="mt-8 pt-8 border-t border-slate-200">
                    <h3 className="text-xl font-semibold mb-4 text-slate-900">{isDe ? 'Typische Anwendungsfälle' : 'Typical use cases'}</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                        {content.useCases.map((useCase, i) => (
                            <li key={i} className="flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                                {useCase}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
}
