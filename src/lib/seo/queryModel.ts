import { cache } from 'react';

export type SearchIntentType = 'Informational' | 'Transactional' | 'Navigational';
export type PriorityLevel = 'High' | 'Medium' | 'Low';

export interface QueryDefinition {
    canonicalSlug: string;
    intentType: SearchIntentType;
    priority: PriorityLevel;
    calcMode: 'difference' | 'add_subtract' | 'business_days' | 'age';
    relatedEvents?: string[];
    isIndexable: boolean;
}

// Master map of how queries cluster
export const CANONICAL_QUERIES: Record<string, QueryDefinition> = {
    // Top volume days (Requested)
    '30-tage-ab-heute': { canonicalSlug: '30-tage-ab-heute', intentType: 'Transactional', priority: 'High', calcMode: 'add_subtract', isIndexable: true },
    '45-tage-ab-heute': { canonicalSlug: '45-tage-ab-heute', intentType: 'Transactional', priority: 'Low', calcMode: 'add_subtract', isIndexable: true },
    '60-tage-ab-heute': { canonicalSlug: '60-tage-ab-heute', intentType: 'Transactional', priority: 'High', calcMode: 'add_subtract', isIndexable: true },
    '90-tage-ab-heute': { canonicalSlug: '90-tage-ab-heute', intentType: 'Transactional', priority: 'High', calcMode: 'add_subtract', isIndexable: true },
    '100-tage-ab-heute': { canonicalSlug: '100-tage-ab-heute', intentType: 'Transactional', priority: 'High', calcMode: 'add_subtract', isIndexable: true },
    '120-tage-ab-heute': { canonicalSlug: '120-tage-ab-heute', intentType: 'Transactional', priority: 'Low', calcMode: 'add_subtract', isIndexable: true },
    '150-tage-ab-heute': { canonicalSlug: '150-tage-ab-heute', intentType: 'Transactional', priority: 'Low', calcMode: 'add_subtract', isIndexable: true },
    '200-tage-ab-heute': { canonicalSlug: '200-tage-ab-heute', intentType: 'Transactional', priority: 'Low', calcMode: 'add_subtract', isIndexable: true },
    '500-tage-ab-heute': { canonicalSlug: '500-tage-ab-heute', intentType: 'Transactional', priority: 'Low', calcMode: 'add_subtract', isIndexable: true },
    '730-tage-ab-heute': { canonicalSlug: '730-tage-ab-heute', intentType: 'Transactional', priority: 'Low', calcMode: 'add_subtract', isIndexable: true },
    '1000-tage-ab-heute': { canonicalSlug: '1000-tage-ab-heute', intentType: 'Transactional', priority: 'Low', calcMode: 'add_subtract', isIndexable: true },

    // Top volume months (Requested)
    '6-monate-ab-heute': { canonicalSlug: '6-monate-ab-heute', intentType: 'Transactional', priority: 'High', calcMode: 'add_subtract', isIndexable: true },

    // Top volume years (Requested)
    '1-jahr-ab-heute': { canonicalSlug: '1-jahr-ab-heute', intentType: 'Transactional', priority: 'High', calcMode: 'add_subtract', isIndexable: true },
    
    // Top Events (Requested)
    'tage-bis-weihnachten': { canonicalSlug: 'tage-bis-weihnachten', intentType: 'Informational', priority: 'High', calcMode: 'difference', isIndexable: true },
    'tage-bis-silvester': { canonicalSlug: 'tage-bis-silvester', intentType: 'Informational', priority: 'High', calcMode: 'difference', isIndexable: true },
    'tage-bis-neujahr': { canonicalSlug: 'tage-bis-neujahr', intentType: 'Informational', priority: 'High', calcMode: 'difference', isIndexable: true },
    'tage-bis-ostern': { canonicalSlug: 'tage-bis-ostern', intentType: 'Informational', priority: 'High', calcMode: 'difference', isIndexable: true },
    'tage-bis-sommeranfang': { canonicalSlug: 'tage-bis-sommeranfang', intentType: 'Informational', priority: 'High', calcMode: 'difference', isIndexable: true },
    'tage-bis-urlaub': { canonicalSlug: 'tage-bis-urlaub', intentType: 'Informational', priority: 'Medium', calcMode: 'difference', isIndexable: true },
};

// Aliases -> Canonical (Cannibalization control)
export const QUERY_ALIASES: Record<string, string> = {
    '100-tage-von-heute': '100-tage-ab-heute',
    'datum-nach-100-tagen': '100-tage-ab-heute',
    'wie-viele-tage-bis-weihnachten': 'tage-bis-weihnachten',
    'arbeitstage-in-diesem-jahr': 'arbeitstage-jahr',
    '180-tage-ab-heute': '6-monate-ab-heute',
    '365-tage-ab-heute': '1-jahr-ab-heute'
};

/**
 * Resolves an incoming slug to its canonical version.
 * Strictly enforces indexable variations to maintain the 220-page limit.
 */
export const resolveCanonicalQuery = cache((slugStr: string): { canonicalSlug: string; isExact: boolean, def?: QueryDefinition } => {
    // 1. Direct match in canonical map
    if (CANONICAL_QUERIES[slugStr]) {
        return { canonicalSlug: slugStr, isExact: true, def: CANONICAL_QUERIES[slugStr] };
    }
    
    // 2. Alias resolution
    if (QUERY_ALIASES[slugStr]) {
        const canonical = QUERY_ALIASES[slugStr];
        return { canonicalSlug: canonical, isExact: false, def: CANONICAL_QUERIES[canonical] };
    }

    // 3. Dynamic pattern - All others are marked as noindex to prevent GSC bloat
    const match = slugStr.match(/^(\d+)-(tage|monate|jahre)-ab-heute$/);
    if (match) {
        return {
            canonicalSlug: slugStr,
            isExact: true,
            def: {
                canonicalSlug: slugStr,
                intentType: 'Transactional',
                priority: 'Low',
                calcMode: 'add_subtract',
                isIndexable: false // Strict enforcement: only explicit variations are indexed
            }
        };
    }

    return { canonicalSlug: '', isExact: false };
});
