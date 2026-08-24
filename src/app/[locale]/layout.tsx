import type { Metadata, ResolvingMetadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/routing';
import { SITE_URL } from "@/lib/constants";
import { isIndexableLocale, hreflangAlternates } from "@/lib/seo/indexPolicy";
import Script from 'next/script';
import "../globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

const siteUrl = SITE_URL;

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
            template: `%s – Datumsrechner`
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

    const webAppSchema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "@id": `${siteUrl}/#webapp`,
        "name": locale === "de" ? "Datumsrechner" : "Date Calculator",
        "url": siteUrl,
        "applicationCategory": "CalculatorApplication",
        "operatingSystem": "All",
        "inLanguage": locale,
        "description": locale === "de"
            ? "Kostenloser Online-Datumsrechner für exakte Zeitspannen, Fristen und Arbeitstage – mit Kalenderwochen nach ISO 8601."
            : "Free online date calculator for exact durations, deadlines and business days – with calendar weeks per ISO 8601.",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "EUR"
        },
        "creator": {
            "@type": "Organization",
            "name": "Datumsrechner",
            "url": siteUrl
        },
        "featureList": [
            "Date difference calculator",
            "Add/subtract days from a date",
            "Business days calculator",
            "Age calculator",
            "Countdown to events"
        ],
        // The stated answer on each page is server-rendered; JavaScript is only
        // needed for the interactive calculator and the live countdown.
        "browserRequirements": "Works in all modern browsers. JavaScript is required only for the interactive calculator."
    };

    const orgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        "name": "Datumsrechner",
        "url": siteUrl,
        "logo": {
            "@type": "ImageObject",
            "url": `${siteUrl}/logo.png`,
            "width": 1024,
            "height": 1024
        },
        "sameAs": []
    };

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
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
                />
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
