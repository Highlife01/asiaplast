import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Inter, Manrope, Noto_Sans_Arabic } from "next/font/google";
import { SITE_URL } from "@/lib/config";
import { DEFAULT_LOCALE, isLocale, isRtl, type Locale } from "@/lib/i18n/locales";
import PwaRegister from "@/components/PwaRegister";
import "./globals.css";

const inter = Inter({
    subsets: ["latin", "latin-ext"],
    variable: "--font-inter",
    display: "swap"
});

const manrope = Manrope({
    subsets: ["latin", "latin-ext"],
    variable: "--font-manrope",
    display: "swap"
});

const notoArabic = Noto_Sans_Arabic({
    subsets: ["arabic"],
    variable: "--font-arabic",
    display: "swap",
    preload: false
});

export const viewport: Viewport = {
    themeColor: "#0284c7",
    width: "device-width",
    initialScale: 1,
    maximumScale: 5
};

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    applicationName: "ASIAPLAST",
    title: {
        default: "ASIAPLAST — Global Garbage Bags & Industrial Bin Liners Manufacturer",
        template: "%s — ASIAPLAST"
    },
    description:
        "Wholesale garbage bags, heavy-duty refuse sacks, drawstring rolls, industrial bin liners and private-label polyethylene packaging manufacturer & exporter.",
    keywords: [
        "ASIAPLAST",
        "AsiaPlast Plastik",
        "asiaplastik.com.tr",
        "garbage bags manufacturer",
        "industrial bin liners",
        "heavy duty refuse sacks",
        "drawstring trash bags",
        "star seal garbage bags",
        "private label garbage bags",
        "toptan çöp poşeti üreticisi",
        "endüstriyel çöp torbası",
        "ihracat çöp poşeti",
        "Müllbeutel Hersteller",
        "sacs poubelle grossiste"
    ],
    authors: [{ name: "ASIAPLAST", url: SITE_URL }],
    creator: "ASIAPLAST",
    publisher: "ASIAPLAST",
    manifest: "/manifest.webmanifest",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "ASIAPLAST"
    },
    icons: {
        icon: "/icon.svg",
        apple: "/icons/icon-192.svg"
    },
    openGraph: {
        type: "website",
        siteName: "ASIAPLAST",
        url: SITE_URL,
        title: "ASIAPLAST — Global Garbage Bags & Industrial Bin Liners Manufacturer",
        description:
            "Wholesale garbage bags, heavy-duty refuse sacks, drawstring rolls, industrial bin liners and private-label polyethylene packaging manufacturer & exporter.",
        images: [
            {
                url: `${SITE_URL}/og-image.svg`,
                width: 1200,
                height: 630,
                alt: "ASIAPLAST — Global Garbage Bags Manufacturer"
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "ASIAPLAST — Global Garbage Bags & Industrial Bin Liners Manufacturer",
        description:
            "Wholesale garbage bags, heavy-duty refuse sacks, drawstring rolls, industrial bin liners and private-label polyethylene packaging manufacturer & exporter.",
        images: [`${SITE_URL}/og-image.svg`]
    }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const localeHeader = (await headers()).get("x-locale") || DEFAULT_LOCALE;
    const locale = (isLocale(localeHeader) ? localeHeader : DEFAULT_LOCALE) as Locale;

    return (
        <html lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"} suppressHydrationWarning>
            <body className={`${inter.variable} ${manrope.variable} ${notoArabic.variable} font-sans`}>
                <PwaRegister />
                {children}
            </body>
        </html>
    );
}
