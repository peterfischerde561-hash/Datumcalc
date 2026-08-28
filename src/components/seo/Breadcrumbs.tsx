import NextLink from 'next/link';
import { ChevronRight } from 'lucide-react';
import { SITE_URL } from '@/lib/constants';
import { BreadcrumbSchema } from './BreadcrumbSchema';

/**
 * Visible breadcrumb trail and its BreadcrumbList markup, from one list.
 *
 * BreadcrumbSchema's contract says the visible breadcrumbs must carry the same
 * labels as the markup. Three pages emitted the markup with no visible trail at
 * all — both /ratgeber levels and the calculator hubs — which is structured data
 * describing navigation the reader cannot see. Two other pages hand-rolled the
 * visible trail next to a separate schema call, so the two could drift.
 *
 * Taking one array and rendering both makes the mismatch unrepresentable.
 *
 * The last item is the current page: rendered as text rather than a link, since
 * linking a page to itself is noise for both readers and crawlers, but still
 * present in the markup because BreadcrumbList expects the trail to terminate
 * at the page it describes.
 */
export function Breadcrumbs({
    items,
    className = ''
}: {
    items: { name: string; item: string }[];
    className?: string;
}) {
    return (
        <>
            <BreadcrumbSchema items={items} />
            <nav
                aria-label="Breadcrumb"
                className={`flex flex-wrap text-sm text-slate-500 items-center gap-x-2 gap-y-1 ${className}`}
            >
                {items.map((entry, index) => {
                    const isLast = index === items.length - 1;
                    const href = entry.item.startsWith('http')
                        ? entry.item.replace(SITE_URL, '') || '/'
                        : entry.item;

                    return (
                        <span key={entry.item} className="flex items-center gap-x-2">
                            {index > 0 && (
                                <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
                            )}
                            {isLast ? (
                                <span aria-current="page" className="text-slate-700">
                                    {entry.name}
                                </span>
                            ) : (
                                <NextLink
                                    href={href}
                                    className="hover:text-blue-700 hover:underline transition-colors"
                                >
                                    {entry.name}
                                </NextLink>
                            )}
                        </span>
                    );
                })}
            </nav>
        </>
    );
}
