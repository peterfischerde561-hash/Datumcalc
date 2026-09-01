import type { Metadata, ResolvingMetadata } from "next";
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/routing';
import { SITE_URL } from "@/lib/constants";
import { isIndexableLocale, hreflangAlternates } from "@/lib/seo/indexPolicy";
import { SiteSchema } from "@/components/seo/SiteSchema";
import Script from 'next/script';
import "../globals.css";

/*
 * Three faces, matching the reference: a display face for headings, a text face
 * for everything else, and a mono for figures.
 *
 * The pairing is the part a palette swap does not reproduce. Archivo is
 * noticeably more condensed and higher-contrast than the body face, so headings
 * read as headings at any size rather than as bold body text.
 */
const archivo = Archivo({
    variable: "--font-archivo",
    subsets: ["latin"],
    weight: ["600", "700", "800"],
    display: "swap",
});

const plexSans = IBM_Plex_Sans({
    variable: "--font-plex-sans",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
});

/*
 * Every figure this site exists to produce -- a day count, a countdown, a
 * calendar week -- is read as a value. A proportional font sets digits at
 * different widths, so a ticking number jitters and nudges its neighbours.
 */
const plexMono = IBM_Plex_Mono({
    variable: "--font-plex-mono",
    subsets: ["latin"],
    weight: ["400", "600", "700"],
    display: "swap",
});

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { locale } = await params;
    setRequestLocale(locale);
    
    const languages = hreflangAlternates((loc) => `${SITE_URL}${loc === 'de' ? '' : `/${loc}`}`);

    const defaultTitle = locale === 'de' 
        ? 'Datumsrechner – Tage, Arbeitstage & Alter berechnen'
        : 'Date Calculator – Count Days, Add Dates & Business Days';

    const defaultDescription = locale === 'de'
        ? 'Datumsrechner online: Datumsdifferenz, Arbeitstage & Alter kostenlos berechnen. Mit vollständiger Schaltjahrregel und Kalenderwochen nach ISO 8601. Ohne Anmeldung.'
        : 'Online date calculator: calculate date differences, business days & age for free. Full leap-year rule, calendar weeks per ISO 8601. No registration.';

    return {
        title: {
            default: defaultTitle,
            // The brand suffix follows the page's language. It was hardcoded to
            // the German name, so every English title ended "– Datumsrechner".
            template: locale === 'de' ? '%s – Datumsrechner' : '%s – Date Calculator'
        },
        description: defaultDescription,
        metadataBase: new URL(SITE_URL),
        alternates: {
            canonical: `${SITE_URL}${locale === 'de' ? '' : `/${locale}`}`,
            languages: languages,
        },
        icons: {
            icon: [
                { url: '/favicon.ico' },
                { url: '/logo.png', type: 'image/png' },
            ],
            shortcut: '/favicon.ico',
            apple: '/logo.png',
        },
        openGraph: {
            type: 'website',
            locale: locale,
            url: `${SITE_URL}${locale === 'de' ? '' : `/${locale}`}`,
            siteName: 'Datumsrechner',
            title: defaultTitle,
            description: defaultDescription,
            images: [
                {
                    url: '/og-image.png',
                    width: 1200,
                    height: 630,
                    alt: defaultTitle,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: defaultTitle,
            description: defaultDescription,
            images: ['/og-image.png'],
            creator: '@datumsrechner',
        },
        verification: {
            google: '7KUnH1MRuX53v_0Kzyg8GT_rlLgg-VJLs6w-5n6Byy8',
        },
        robots: {
            index: isIndexableLocale(locale),
            follow: true,
            googleBot: {
                index: isIndexableLocale(locale),
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}

export default async function LocaleLayout({
    children,
    params
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}>) {
    const { locale } = await params;
    setRequestLocale(locale);
    const messages = await getMessages();

    return (
        <html
            lang={locale}
            className={`${archivo.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
            suppressHydrationWarning
        >
            <head>
                {/*
                  Applies the saved theme before first paint.
                  Without it the page renders light, then flips to dark once
                  React hydrates -- a white flash on every navigation for anyone
                  who chose dark. It has to be inline and synchronous in <head>
                  for that reason; a component cannot run early enough.

                  No preference stored means no attribute, which leaves the
                  prefers-color-scheme media query in charge.
                */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}`
                    }}
                />
                <Script
                    src="https://www.googletagmanager.com/gtag/js?id=G-8WZW69GJ0K"
                    strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                    {`
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());

                      gtag('config', 'G-8WZW69GJ0K');
                    `}
                </Script>
                {/*
                  Organization and WebSite only. The WebApplication node moved
                  to the calculator routes: emitted from here it landed on
                  /impressum, /datenschutz, /agb and the guides, none of which
                  are the application. See components/seo/WebApplicationSchema.
                */}
                <SiteSchema locale={locale} />
            </head>
            <body className="min-h-full flex flex-col selection:bg-accent/30">
                <NextIntlClientProvider messages={messages} locale={locale}>
                    <Header />
                    <main id="main-content" className="flex-1 flex flex-col z-10" tabIndex={-1}>
                        {children}
                    </main>
                    <Footer />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}
