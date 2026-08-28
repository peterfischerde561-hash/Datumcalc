import type { Metadata, ResolvingMetadata } from "next";
import { Inter } from "next/font/google";
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

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
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
        <html lang={locale} className={`${inter.variable} h-full antialiased`}>
            <head>
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
            <body className="min-h-full flex flex-col selection:bg-blue-200">
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
