import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

/**
 * Retired locale prefixes, mapped segment by segment to their German
 * equivalents.
 *
 * These locales were never real: they produced pages whose chrome was
 * translated while the body stayed German. They are gone, but Google still
 * holds URLs under them, so each one is redirected to the closest equivalent
 * rather than to the homepage — a blanket redirect to `/` is a soft-404
 * pattern and Google treats it as one.
 */
const RETIRED_LOCALES: Record<string, Record<string, string>> = {
    es: { sumar: 'addieren', diferencia: 'differenz', laborables: 'arbeitstage', edad: 'alter', guia: 'ratgeber' },
    fr: { ajouter: 'addieren', difference: 'differenz', ouvrables: 'arbeitstage', age: 'alter', guide: 'ratgeber' },
    it: { aggiungere: 'addieren', differenza: 'differenz', lavorativi: 'arbeitstage', eta: 'alter', guida: 'ratgeber' },
    pt: { adicionar: 'addieren', diferenca: 'differenz', uteis: 'arbeitstage', idade: 'alter', guia: 'ratgeber' },
};

function retiredLocaleRedirects() {
    const rules: { source: string; destination: string; permanent: boolean }[] = [];

    for (const [locale, segments] of Object.entries(RETIRED_LOCALES)) {
        for (const [foreign, german] of Object.entries(segments)) {
            /*
             * The bare segment must come before the wildcard.
             *
             * `/es/sumar/:slug*` also matches `/es/sumar` with an empty slug,
             * and produced `/addieren/` — which `trailingSlash: false` then
             * redirects again to `/addieren`. That is a wasted hop on every
             * hub URL under every retired locale, caused entirely by rule
             * ordering.
             */
            rules.push({ source: `/${locale}/${foreign}`, destination: `/${german}`, permanent: true });
            rules.push({ source: `/${locale}/${foreign}/:slug*`, destination: `/${german}/:slug*`, permanent: true });
        }

        // Locale root, then anything left over.
        rules.push({ source: `/${locale}`, destination: '/', permanent: true });
        rules.push({ source: `/${locale}/:path*`, destination: '/', permanent: true });
    }

    return rules;
}

const nextConfig: NextConfig = {
    trailingSlash: false,
    generateBuildId: async () => {
        return 'datumsrechner-' + new Date().toISOString().slice(0, 10)
    },
    async headers() {
        return [
            {
                // Hashed, immutable build assets — safe to cache forever.
                source: '/_next/static/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
            {
                // HTML pages (everything except _next assets): the browser must always
                // revalidate, while the CDN may cache briefly with stale-while-revalidate.
                // NEVER cache HTML immutably — it references hashed JS that changes on deploy.
                source: '/((?!_next/).*)',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' },
                ],
            },
        ]
    },
    async redirects() {
        return [
            /*
             * German is the default locale and is served without a prefix, so
             * every /de/... URL is a duplicate of its unprefixed form.
             *
             * next-intl's middleware already normalized these, but as a 307 —
             * a *temporary* redirect, which tells Google to keep the prefixed
             * URL indexed and keep re-checking it. GSC still lists /de/*
             * duplicates months later for exactly that reason.
             *
             * Declaring them here runs before the middleware and makes them
             * 308 (permanent, method-preserving). No loop is possible: the
             * destination never begins with /de/, and the bare /de case needs
             * its own rule because `/de/:path*` does not match `/de`.
             *
             * Note this matches the /de/ segment only — /dezember-... and
             * similar are unaffected.
             */
            { source: '/de', destination: '/', permanent: true },
            { source: '/de/:path*', destination: '/:path*', permanent: true },

            ...retiredLocaleRedirects(),
        ];
    },
};

export default withNextIntl(nextConfig);
