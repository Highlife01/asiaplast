import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/site/JsonLd";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@/lib/i18n/locales";
import { buildMetadata, faqJsonLd, breadcrumbJsonLd, localePath } from "@/lib/seo";

export const revalidate = 300;

export async function generateStaticParams() {
    return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const l = (isLocale(locale) ? locale : ("en" as Locale));
    const dict = getDictionary(l);
    return buildMetadata({
        title: dict.sections.faqTitle,
        description: dict.faq[0]?.a?.slice(0, 150) || "",
        path: "/faq",
        locale: l
    });
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const l = (isLocale(locale) ? locale : ("en" as Locale));
    const dict = getDictionary(l);
    const quoteHref = localePath(l, "/quote");

    return (
        <>
            <JsonLd data={faqJsonLd([...dict.faq])} />
            <JsonLd data={breadcrumbJsonLd([{ name: dict.nav.home, path: localePath(l, "/") }, { name: dict.sections.faqTitle, path: localePath(l, "/faq") }])} />
            <section className="hero-bg py-16 text-white sm:py-20">
                <div className="container-x">
                    <h1 className="font-display text-4xl font-extrabold sm:text-5xl">{dict.sections.faqTitle}</h1>
                </div>
            </section>
            <section className="section">
                <div className="container-x max-w-3xl space-y-4">
                    {dict.faq.map((f) => (
                        <details key={f.q} className="card p-6">
                            <summary className="cursor-pointer list-none font-display text-base font-bold text-brand-navy">
                                <span className="mr-2 text-brand-green">▸</span>
                                {f.q}
                            </summary>
                            <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
                        </details>
                    ))}
                    <div className="card mt-8 p-6 text-center">
                        <p className="font-display font-bold text-brand-navy">{dict.sections.ctaTitle}</p>
                        <Link href={quoteHref} className="btn-primary mt-4">{dict.site.ctaQuote}</Link>
                    </div>
                </div>
            </section>
        </>
    );
}
