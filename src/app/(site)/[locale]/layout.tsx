import { Suspense } from "react";
import { notFound } from "next/navigation";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import WhatsAppButton from "@/components/site/WhatsAppButton";
import CookieConsentBanner from "@/components/site/CookieConsentBanner";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@/lib/i18n/locales";
import { getCompanySettings } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const dynamicParams = false;

export function generateStaticParams() {
    return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale: raw } = await params;
    if (!isLocale(raw) || !ACTIVE_LOCALES.includes(raw)) notFound();
    const locale = raw as Locale;
    const dict = getDictionary(locale);
    const companySettings = await getCompanySettings();

    return (
        <>
            <Header locale={locale} labels={{ nav: dict.nav, language: dict.site.language }} cta={dict.site.ctaQuote} />
            <main id="main">{children}</main>
            <Footer
                locale={locale}
                companySettings={companySettings}
                labels={{
                    company: dict.footer.company,
                    products: dict.footer.products,
                    links: dict.footer.links,
                    about: dict.nav.about,
                    export: dict.nav.export,
                    privateLabel: dict.nav.privateLabel,
                    knowledge: dict.nav.knowledge,
                    faq: dict.nav.faq,
                    contactUs: dict.footer.contactUs,
                    language: dict.site.language,
                    rights: dict.footer.rights,
                    privacy: dict.footer.privacy,
                    terms: dict.footer.terms,
                    admin: dict.footer.admin
                }}
            />
            <WhatsAppButton locale={locale} phoneNumber={companySettings.whatsapp} />
            <Suspense fallback={null}>
                <CookieConsentBanner locale={locale} />
            </Suspense>
        </>
    );
}
