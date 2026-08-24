import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { CANONICAL_TIMEZONE, formatCivilDate, getTodayInTimeZone } from '@/lib/date/civil';

export const dynamic = 'force-dynamic';

/**
 * Refresh date-dependent pages when the Europe/Berlin calendar day changes.
 *
 * Scheduling note: Berlin is UTC+1 in winter and UTC+2 in summer, so no fixed
 * UTC time is "Berlin midnight" year-round. This runs at 23:00 UTC, which is
 * 00:00 Berlin in winter and 01:00 Berlin in summer — after the date boundary
 * in *both* offsets. The handler never assumes what day it is from the
 * schedule; it asks for the Berlin civil date itself.
 *
 * The operation is idempotent: running it twice in one Berlin day revalidates
 * nothing the second time, and running it late simply refreshes with the
 * correct date. Pages also carry `revalidate = 3600`, so a missed run degrades
 * to at most an hour of staleness rather than a frozen date.
 */

// Best-effort guard against redundant work within a warm instance. Correctness
// does not depend on it — a cold start just means one extra revalidation pass,
// which is harmless. A durable store would make the skip reliable, not safer.
let lastProcessedBerlinDate: string | null = null;

// Route patterns whose output embeds "today". Revalidating the pattern
// refreshes every generated page under it.
const DATE_DEPENDENT_ROUTES = [
    '/[locale]/[intent]/[...slug]',
    '/[locale]/[intent]',
    '/[locale]'
] as const;

function isAuthorized(request: Request): boolean {
    const secret = process.env.CRON_SECRET;

    // Without a configured secret, only allow outside production so a
    // misconfigured deploy fails closed rather than exposing the endpoint.
    if (!secret) return process.env.NODE_ENV !== 'production';

    const auth = request.headers.get('authorization');
    if (auth === `Bearer ${secret}`) return true;

    const token = new URL(request.url).searchParams.get('token');
    return token === secret;
}

export async function GET(request: Request) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const today = formatCivilDate(getTodayInTimeZone(CANONICAL_TIMEZONE));
    const force = new URL(request.url).searchParams.get('force') === '1';

    if (!force && lastProcessedBerlinDate === today) {
        return NextResponse.json({
            success: true,
            skipped: true,
            berlinDate: today,
            message: 'Already processed for this Berlin date.'
        });
    }

    const revalidated: string[] = [];
    try {
        for (const route of DATE_DEPENDENT_ROUTES) {
            revalidatePath(route, 'page');
            revalidated.push(route);
        }
    } catch (error: unknown) {
        // Leave lastProcessedBerlinDate untouched so the next run retries.
        return NextResponse.json(
            {
                success: false,
                berlinDate: today,
                revalidated,
                message: 'Revalidation failed; this Berlin date was not marked processed.',
                error: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }

    // Only mark success once every path has been revalidated.
    lastProcessedBerlinDate = today;

    return NextResponse.json({
        success: true,
        skipped: false,
        berlinDate: today,
        timezone: CANONICAL_TIMEZONE,
        revalidated
    });
}
