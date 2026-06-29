import { generateSEOContent } from '@/lib/seo/contentEngine';

export function SEOContentBlock({ intent, slug, locale }: { intent: string; slug: string; locale: string }) {
    const match = slug.match(/^(\d+)-/);
    const numValue = match ? parseInt(match[1]) : undefined;
    const content = generateSEOContent(intent, slug, locale, numValue);
    const isDe = locale === 'de';

    return (
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 mt-12 mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">
                {content.heading}
            </h2>
            <div className="space-y-6 text-white/70 leading-relaxed text-lg">
                {content.paragraphs.map((p, i) => {
                    const isH3 = p.startsWith('[H3] ');
                    const text = isH3 ? p.replace('[H3] ', '') : p;
                    
                    const renderText = (t: string) => {
                        const parts = t.split(/(\*\*.*?\*\*)/g);
                        return parts.map((part, index) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={index} className="text-white font-bold">{part.slice(2, -2)}</strong>;
                            }
                            return part;
                        });
                    };

                    if (isH3) {
                        return <h3 key={i} className="text-xl font-bold text-white mt-8 mb-4">{renderText(text)}</h3>;
                    }
                    return (
                        <p key={i}>
                            {renderText(text)}
                        </p>
                    );
                })}
            </div>

            {content.weekdayTable && (
                <div className="mt-8 pt-8 border-t border-white/10">
                    <h3 className="text-xl font-semibold mb-4 text-neon">{content.weekdayTable.heading}</h3>
                    <div className="overflow-x-auto rounded-xl border border-white/10">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.03] text-white/80">
                                    <th scope="col" className="py-3 px-4 font-semibold">{isDe ? 'Jahr' : 'Year'}</th>
                                    <th scope="col" className="py-3 px-4 font-semibold">{isDe ? 'Datum' : 'Date'}</th>
                                    <th scope="col" className="py-3 px-4 font-semibold">{isDe ? 'Wochentag' : 'Day of the week'}</th>
                                </tr>
                            </thead>
                            <tbody className="text-white/70 divide-y divide-white/5">
                                {content.weekdayTable.rows.map((row) => (
                                    <tr key={row.year} className="hover:bg-white/[0.02]">
                                        <td className="py-3 px-4 font-medium text-white/90">{row.year}</td>
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
                <div className="mt-8 pt-8 border-t border-white/10">
                    <h3 className="text-xl font-semibold mb-4 text-neon">{isDe ? 'Typische Anwendungsfälle' : 'Typical use cases'}</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-white/70">
                        {content.useCases.map((useCase, i) => (
                            <li key={i} className="flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-neon-blue"></span>
                                {useCase}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
}
