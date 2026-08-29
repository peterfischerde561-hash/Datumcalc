import { cn } from '@/lib/ui/cn';

/**
 * The page container.
 *
 * Eight different max-widths were in use -- 3xl, 4xl, 5xl, 6xl, 7xl and more --
 * chosen per page rather than per purpose, so moving between routes shifted the
 * text column under the reader. The horizontal padding and vertical rhythm were
 * re-typed each time too, which is where `py-16` came from on pages that then
 * had nothing to clear the header with.
 *
 * Three widths, named for what they hold:
 *
 *   prose   reading measure for article bodies (~65 characters)
 *   page    the default: calculators, hubs, legal text
 *   wide    grids that genuinely need the room, like the sitemap
 */
type Width = 'prose' | 'page' | 'wide';

/*
 * 800px reading measure and a 1200px page, matching the reference's
 * --max-width-content and --max-width.
 */
const WIDTHS: Record<Width, string> = {
    prose: 'max-w-[800px]',
    page: 'max-w-[1200px]',
    wide: 'max-w-[1200px]'
};

export function PageShell({
    width = 'page',
    className,
    children
}: {
    width?: Width;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex-1 w-full">
            <div
                className={cn(
                    'mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16',
                    WIDTHS[width],
                    className
                )}
            >
                {children}
            </div>
        </div>
    );
}

/**
 * A page's opening block: h1, optional standfirst.
 *
 * The h1 was styled per page and had drifted to three different scales for the
 * same level -- text-4xl md:text-5xl on the hubs and guides, and
 * text-4xl md:text-5xl lg:text-7xl on /ueber-uns, which skipped 6xl entirely.
 */
export function PageHeader({
    title,
    lead,
    className,
    children
}: {
    title: React.ReactNode;
    lead?: React.ReactNode;
    className?: string;
    children?: React.ReactNode;
}) {
    /*
     * No size classes on the h1 -- globals.css sizes headings fluidly with
     * clamp(), which is what stopped the same level rendering at three
     * different scales across routes.
     */
    return (
        <header className={cn('mb-10 space-y-4', className)}>
            <h1>{title}</h1>
            {lead && <p className="text-lg text-ink-2 max-w-2xl">{lead}</p>}
            {children}
        </header>
    );
}
