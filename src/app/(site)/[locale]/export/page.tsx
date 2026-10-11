import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/site/JsonLd";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getExportCopy } from "@/lib/i18n/content";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@/lib/i18n/locales";
import { buildMetadata, breadcrumbJsonLd, localePath } from "@/lib/seo";

export const revalidate = 3600;

export function generateStaticParams() {
    return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const l = (isLocale(locale) ? locale : ("en" as Locale));
    const copy = getExportCopy(l);
    return buildMetadata({ title: copy.title, description: copy.lead, path: "/export", locale: l });
}

export default async function ExportPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const l = (isLocale(locale) ? locale : ("en" as Locale));
    const dict = getDictionary(l);
    const copy = getExportCopy(l);

    return (
        <>
            <JsonLd data={breadcrumbJsonLd([{ name: dict.nav.home, path: localePath(l, "/") }, { name: copy.title, path: localePath(l, "/export") }])} />
            <section className="hero-bg py-16 text-white sm:py-20">
                <div className="container-x">
                    <h1 className="font-display text-4xl font-extrabold sm:text-5xl">{copy.title}</h1>
                    <p className="mt-4 max-w-2xl text-slate-300">{copy.lead}</p>
                </div>
            </section>
            <section className="section">
                <div className="container-x space-y-10">
                    <div className="max-w-3xl space-y-4 text-slate-600 leading-relaxed">
                        {copy.paragraphs.map((p) => (
                            <p key={p}>{p}</p>
                        ))}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {copy.items.map((item) => (
                            <div key={item.title} className="card p-5">
                                <h3 className="font-display font-bold text-brand-navy">{item.title}</h3>
                                <p className="mt-2 text-sm text-slate-600">{item.text}</p>
                            </div>
                        ))}
                    </div>
                    <Link href={localePath(l, "/quote")} className="btn-primary">{dict.site.ctaQuote}</Link>
                </div>
            </section>
        </>
    );
}
