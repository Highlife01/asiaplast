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
    display: "swap"
});

export const viewport: Viewport = {
    themeColor: "#0284c7",
    width: "device-width",
    initialScale: 1,
    maximumScale: 5
};

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: "ASIAPLAST — Global Garbage Bags Manufacturer",
        template: "%s — ASIAPLAST"
    },
    description:
        "Wholesale garbage bags, industrial bin liners and private-label packaging for international buyers.",
    manifest: "/manifest.webmanifest",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "ASIAPLAST"
    },
    icons: {
        icon: "/icon.svg",
        apple: "/icons/icon-192.svg"
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
