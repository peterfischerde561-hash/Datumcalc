// Test slug translations
const SLUG_TOKEN_TRANSLATIONS = {
    de: { 
        'tage': 'tage', 'monate': 'monate', 'jahre': 'jahre', 
        'ab-heute': 'ab-heute', 'tage-bis': 'tage-bis',
        'weihnachten': 'weihnachten', 'silvester': 'silvester', 'neujahr': 'neujahr',
        'ostern': 'ostern', 'sommeranfang': 'sommeranfang', 'urlaub': 'urlaub'
    },
    en: { 
        'tage': 'days', 'monate': 'months', 'jahre': 'years', 
        'ab-heute': 'from-today', 'tage-bis': 'days-until',
        'weihnachten': 'christmas', 'silvester': 'new-year', 'neujahr': 'new-year',
        'ostern': 'easter', 'sommeranfang': 'summer-solstice', 'urlaub': 'vacation'
    }
};

function translateSlug(slug, locale) {
    const tokens = locale === 'de' ? {} : SLUG_TOKEN_TRANSLATIONS[locale];
    if (!tokens) return slug;

    let localized = slug;
    // Sort keys by length descending to replace "tage-bis" before "tage"
    const sortedKeys = Object.entries(SLUG_TOKEN_TRANSLATIONS['de'])
        .sort((a, b) => b[1].length - a[1].length);

    sortedKeys.forEach(([key, deVal]) => {
        const regex = new RegExp(`\\b${deVal}\\b`, 'g');
        localized = localized.replace(regex, tokens[key] || deVal);
    });
    return localized;
}

function reverseTranslateSlug(slug, locale) {
    let canonical = slug;

    const applyReverse = (loc) => {
        const tokens = SLUG_TOKEN_TRANSLATIONS[loc];
        if (!tokens) return;
        
        const sortedEntries = Object.entries(tokens)
            .sort((a, b) => b[1].length - a[1].length);

        sortedEntries.forEach(([key, locVal]) => {
            const regex = new RegExp(`\\b${locVal}\\b`, 'g');
            canonical = canonical.replace(regex, SLUG_TOKEN_TRANSLATIONS['de'][key]);
        });
    };

    if (locale && locale !== 'de') {
        applyReverse(locale);
    }

    const allLocales = Object.keys(SLUG_TOKEN_TRANSLATIONS);
    allLocales.forEach(loc => {
        if (loc === 'de' || loc === locale) return;
        applyReverse(loc);
    });

    return canonical;
}

console.log("de to en: '200-tage-ab-heute' ->", translateSlug('200-tage-ab-heute', 'en'));
console.log("de to en: '365-tage-ab-heute' ->", translateSlug('365-tage-ab-heute', 'en'));
console.log("en to de: '200-days-from-today' ->", reverseTranslateSlug('200-days-from-today', 'en'));
console.log("en to de: '200-tage-from-today' ->", reverseTranslateSlug('200-tage-from-today', 'en'));
