/**
 * Related-link selection.
 *
 * Replaces a hardcoded list of fourteen links that was identical on every
 * programmatic page. That list had three defects: it included the current page
 * (the 100-day page listed "100 tage ab heute" in its own related block), it
 * grouped /arbeitstage under "Ratgeber" though it is a calculator, and it had
 * no proximity — from the 100-day page the genuinely related pages are 90, 120
 * and 150, none of which appeared. A `numValue` was even parsed for this and
 * then never used.
 *
 * Selection now follows the shape the audit specified:
 *
 *   nearest neighbours by value (excluding self)
 *   + event countdowns
 *   + one topically relevant guide
 *   + the parent hub
 *
 * The parent-hub link matters most for the countdown pages, which linked only
 * to each other: six pages passing authority around a closed ring with no way
 * out and no route back up to /differenz.
 */

import { CANONICAL_QUERIES } from './queryModel';
import { ToolKey } from './routeLabels';

export type RelatedLink = {
    /** Canonical German slug, or a hub/guide path when `kind` says so. */
    slug: string;
    kind: 'offset' | 'event' | 'guide' | 'hub';
};

/**
 * Approximate day span for ordering by proximity. Months and years are mapped
 * to their average length purely so "6 Monate" sorts sensibly between 150 and
 * 200 days; nothing is calculated from these numbers.
 */
function approximateDays(slug: string): number | null {
    const m = slug.match(/^(\d+)-(tage|monate|jahre|jahr)-ab-heute$/);
    if (!m) return null;
    const n = parseInt(m[1], 10);
    if (m[2] === 'tage') return n;
    if (m[2] === 'monate') return Math.round(n * 30.44);
    return Math.round(n * 365.25);
}

const OFFSET_SLUGS = Object.values(CANONICAL_QUERIES)
    .filter((d) => d.calcMode === 'add_subtract' && d.isIndexable)
    .map((d) => d.canonicalSlug);

const EVENT_SLUGS = Object.values(CANONICAL_QUERIES)
    .filter((d) => d.calcMode === 'difference' && d.isIndexable)
    .map((d) => d.canonicalSlug);

/** A guide that genuinely bears on the page, not a generic "Ratgeber" link. */
function guideFor(intent: ToolKey, slug: string): string {
    if (intent === 'arbeitstage') return 'was-ist-ein-arbeitstag';
    if (slug.startsWith('tage-bis-ostern')) return 'schaltjahre-erklaert';
    if (intent === 'differenz') return 'wochen-im-jahr';
    // Long day spans cross at least one 29 February.
    const days = approximateDays(slug);
    if (days !== null && days >= 365) return 'schaltjahre-erklaert';
    return 'wochen-im-jahr';
}

/**
 * Related links for a programmatic page, in display order.
 * Never includes the page it is called for.
 */
export function relatedFor(intent: ToolKey, slug: string): RelatedLink[] {
    const links: RelatedLink[] = [];
    const isEvent = slug.startsWith('tage-bis-');

    if (isEvent) {
        // Other countdowns, then a route out of the ring.
        for (const s of EVENT_SLUGS.filter((s) => s !== slug).slice(0, 3)) {
            links.push({ slug: s, kind: 'event' });
        }
        // Concrete offset pages, so a countdown reader can reach the other tool.
        for (const s of ['30-tage-ab-heute', '100-tage-ab-heute']) {
            if (OFFSET_SLUGS.includes(s)) links.push({ slug: s, kind: 'offset' });
        }
    } else {
        const value = approximateDays(slug);
        const neighbours =
            value === null
                ? OFFSET_SLUGS.filter((s) => s !== slug).slice(0, 3)
                : OFFSET_SLUGS.filter((s) => s !== slug)
                      .map((s) => ({ s, d: Math.abs((approximateDays(s) ?? 0) - value) }))
                      .sort((a, b) => a.d - b.d)
                      .slice(0, 3)
                      .map((x) => x.s);

        for (const s of neighbours) links.push({ slug: s, kind: 'offset' });
        for (const s of EVENT_SLUGS.slice(0, 2)) links.push({ slug: s, kind: 'event' });
    }

    links.push({ slug: guideFor(intent, slug), kind: 'guide' });

    // Route up to the parent hub — the link the countdown ring was missing.
    links.push({ slug: isEvent ? 'differenz' : intent, kind: 'hub' });

    return links;
}
