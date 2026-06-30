import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

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
      // Spanish SEO Fallbacks
      { source: '/es/sumar/:slug*', destination: '/addieren/:slug*', permanent: true },
      { source: '/es/diferencia/:slug*', destination: '/differenz/:slug*', permanent: true },
      { source: '/es/laborables/:slug*', destination: '/arbeitstage/:slug*', permanent: true },
      { source: '/es/edad/:slug*', destination: '/alter/:slug*', permanent: true },
      { source: '/es/guia/:slug*', destination: '/ratgeber/:slug*', permanent: true },
      { source: '/es/:path*', destination: '/', permanent: true },

      // French SEO Fallbacks
      { source: '/fr/ajouter/:slug*', destination: '/addieren/:slug*', permanent: true },
      { source: '/fr/difference/:slug*', destination: '/differenz/:slug*', permanent: true },
      { source: '/fr/ouvrables/:slug*', destination: '/arbeitstage/:slug*', permanent: true },
      { source: '/fr/age/:slug*', destination: '/alter/:slug*', permanent: true },
      { source: '/fr/guide/:slug*', destination: '/ratgeber/:slug*', permanent: true },
      { source: '/fr/:path*', destination: '/', permanent: true },

      // Italian SEO Fallbacks
      { source: '/it/aggiungere/:slug*', destination: '/addieren/:slug*', permanent: true },
      { source: '/it/differenza/:slug*', destination: '/differenz/:slug*', permanent: true },
      { source: '/it/lavorativi/:slug*', destination: '/arbeitstage/:slug*', permanent: true },
      { source: '/it/eta/:slug*', destination: '/alter/:slug*', permanent: true },
      { source: '/it/guida/:slug*', destination: '/ratgeber/:slug*', permanent: true },
      { source: '/it/:path*', destination: '/', permanent: true },

      // Portuguese SEO Fallbacks
      { source: '/pt/adicionar/:slug*', destination: '/addieren/:slug*', permanent: true },
      { source: '/pt/diferenca/:slug*', destination: '/differenz/:slug*', permanent: true },
      { source: '/pt/uteis/:slug*', destination: '/arbeitstage/:slug*', permanent: true },
      { source: '/pt/idade/:slug*', destination: '/alter/:slug*', permanent: true },
      { source: '/pt/guia/:slug*', destination: '/ratgeber/:slug*', permanent: true },
      { source: '/pt/:path*', destination: '/', permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);

