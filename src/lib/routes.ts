export const ROUTES = {
    home: '/',
    about: '/ueber-uns',
    agb: '/agb',
    datenschutz: '/datenschutz',
    impressum: '/impressum',
    sitemap: '/sitemap',
    methodik: '/methodik',
    
    // Main Tools
    addieren: '/addieren',
    differenz: '/differenz',
    arbeitstage: '/arbeitstage',
    alter: '/alter',
    
    // Ratgeber
    ratgeber: '/ratgeber',
    
    // Dynamic Routes
    getRatgeber: (slug: string) => ({
        pathname: '/ratgeber/[slug]',
        params: { slug }
    } as const),
    
    getAddieren: (slug: string | string[]) => ({
        pathname: '/addieren/[...slug]',
        params: { slug: Array.isArray(slug) ? slug : [slug] }
    } as const),
    
    getDifferenz: (slug: string | string[]) => ({
        pathname: '/differenz/[...slug]',
        params: { slug: Array.isArray(slug) ? slug : [slug] }
    } as const),
    
    getArbeitstage: (slug: string | string[]) => ({
        pathname: '/arbeitstage/[...slug]',
        params: { slug: Array.isArray(slug) ? slug : [slug] }
    } as const),
    
    getAlter: (slug: string | string[]) => ({
        pathname: '/alter/[...slug]',
        params: { slug: Array.isArray(slug) ? slug : [slug] }
    } as const),
} as const;

export type RoutePath = typeof ROUTES[keyof typeof ROUTES];
