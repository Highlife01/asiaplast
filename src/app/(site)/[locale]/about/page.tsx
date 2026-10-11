import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/site/JsonLd";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getAboutCopy } from "@/lib/i18n/content";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@/lib/i18n/locales";
import { buildMetadata, breadcrumbJsonLd, localePath, organizationJsonLd } from "@/lib/seo";

export const revalidate = 3600;

export function generateStaticParams() {
    return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const l = (isLocale(locale) ? locale : ("en" as Locale));
    const copy = getAboutCopy(l);
    return buildMetadata({ title: copy.title, description: copy.lead, path: "/about", locale: l });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const l = (isLocale(locale) ? locale : ("en" as Locale));
    const dict = getDictionary(l);
    const copy = getAboutCopy(l);

    return (
        <>
            <JsonLd data={organizationJsonLd()} />
            <JsonLd data={breadcrumbJsonLd([{ name: dict.nav.home, path: localePath(l, "/") }, { name: copy.title, path: localePath(l, "/about") }])} />
            <section className="hero-bg py-16 text-white sm:py-20">
                <div className="container-x">
                    <h1 className="font-display text-4xl font-extrabold sm:text-5xl">{copy.title}</h1>
                    <p className="mt-4 max-w-2xl text-slate-300">{copy.lead}</p>
                </div>
            </section>
            <section className="section">
                <div className="container-x grid gap-10 lg:grid-cols-[1.2fr_.8fr]">
                    <div className="space-y-5 text-slate-600 leading-relaxed">
                        {copy.paragraphs.map((p) => (
                            <p key={p}>{p}</p>
                        ))}
                    </div>
                    <div className="space-y-4">
                        {copy.items.map((item) => (
                            <div key={item.title} className="card p-5">
                                <h3 className="font-display font-bold text-brand-navy">{item.title}</h3>
                                <p className="mt-2 text-sm text-slate-600">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="section bg-white pt-0">
                <div className="container-x text-center">
                    <Link href={localePath(l, "/quote")} className="btn-primary">{dict.site.ctaQuote}</Link>
                </div>
            </section>
        </>
    );
}
