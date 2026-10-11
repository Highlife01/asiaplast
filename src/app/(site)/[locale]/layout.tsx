import { notFound } from "next/navigation";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import WhatsAppButton from "@/components/site/WhatsAppButton";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@/lib/i18n/locales";

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

    return (
        <>
            <Header locale={locale} labels={{ nav: dict.nav, language: dict.site.language }} cta={dict.site.ctaQuote} />
            <main id="main">{children}</main>
            <Footer
                locale={locale}
                labels={{
                    company: dict.footer.company,
                    products: dict.footer.products,
                    links: dict.footer.links,
                    about: dict.nav.about,
                    export: dict.nav.export,
                    privateLabel: dict.nav.privateLabel,
                    contactUs: dict.footer.contactUs,
                    language: dict.site.language,
                    rights: dict.footer.rights,
                    privacy: dict.footer.privacy,
                    terms: dict.footer.terms,
                    admin: dict.footer.admin
                }}
            />
            <WhatsAppButton locale={locale} />
        </>
    );
}
