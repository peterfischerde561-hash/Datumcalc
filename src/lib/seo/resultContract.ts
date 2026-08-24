/**
 * What each indexable route family must expose in its server-rendered HTML.
 *
 * The route validator reads this map; it contains no per-route regexes. Adding
 * a page family means adding an expectation here, which is also what makes any
 * future programmatic cluster testable without new validator code.
 *
 * Keys are glob-ish path patterns matched against the pathname; `*` matches any
 * run of characters within a segment.
 */

import type { ResultType } from '@/components/seo/ResultValue';

export type RouteExpectation = {
    /** Result types that must be present, each with a non-empty value. */
    required: ResultType[];
    /** Human note used in validator output when an expectation fails. */
    describe: string;
};

export const ROUTE_EXPECTATIONS: Record<string, RouteExpectation> = {
    '/addieren/*-tage-ab-heute': {
        required: ['target-date', 'iso-week', 'day-of-year'],
        describe: 'Day offset must state the target date, its ISO week and its day of year.'
    },
    '/addieren/*-monate-ab-heute': {
        required: ['target-date', 'iso-week', 'day-of-year'],
        describe: 'Month offset must state the target date.'
    },
    '/addieren/*-jahr*-ab-heute': {
        required: ['target-date', 'iso-week', 'day-of-year'],
        describe: 'Year offset must state the target date.'
    },
    '/differenz/tage-bis-*': {
        required: ['days-remaining', 'target-date'],
        describe: 'Countdown must state the days remaining and the date it counts to.'
    },
    '/en/add/*-days-from-today': {
        required: ['target-date', 'iso-week', 'day-of-year'],
        describe: 'English day offset must state the target date.'
    },
    '/en/difference/days-until-*': {
        required: ['days-remaining', 'target-date'],
        describe: 'English countdown must state the days remaining and the target date.'
    }
};

/** Turn a pattern into a matcher. `*` does not cross a `/`. */
export function matchesPattern(pathname: string, pattern: string): boolean {
    const source =
        '^' +
        pattern
            .split('*')
            .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('[^/]*') +
        '$';
    return new RegExp(source).test(pathname);
}

/** The expectation for a pathname, or null when the route family is unlisted. */
export function expectationFor(pathname: string): RouteExpectation | null {
    const key = Object.keys(ROUTE_EXPECTATIONS).find((p) => matchesPattern(pathname, p));
    return key ? ROUTE_EXPECTATIONS[key] : null;
}
