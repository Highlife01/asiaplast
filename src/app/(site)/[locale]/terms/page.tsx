import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getTermsCopy } from "@/lib/i18n/content";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@/lib/i18n/locales";
import { buildMetadata, breadcrumbJsonLd, localePath } from "@/lib/seo";

export const revalidate = 86400;

export function generateStaticParams() {
    return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const l = (isLocale(locale) ? locale : ("en" as Locale));
    const copy = getTermsCopy(l);
    return buildMetadata({ title: copy.title, description: copy.sections[0]?.text.slice(0, 150) || copy.title, path: "/terms", locale: l });
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const l = (isLocale(locale) ? locale : ("en" as Locale));
    const dict = getDictionary(l);
    const copy = getTermsCopy(l);

    return (
        <>
            <JsonLd data={breadcrumbJsonLd([{ name: dict.nav.home, path: localePath(l, "/") }, { name: copy.title, path: localePath(l, "/terms") }])} />
            <section className="hero-bg border-b border-slate-200/80 py-16 text-slate-900 sm:py-20">
                <div className="container-x">
                    <p className="chip mb-3">Legal</p>
                    <h1 className="font-display text-4xl font-black text-slate-900 sm:text-5xl">{copy.title}</h1>
                    <p className="mt-4 text-slate-500 text-sm font-medium">{copy.updated}</p>
                </div>
            </section>
            <section className="section">
                <div className="container-x max-w-3xl space-y-8">
                    {copy.sections.map((s) => (
                        <div key={s.heading} className="card p-6">
                            <h2 className="font-display text-xl font-bold text-slate-900">{s.heading}</h2>
                            <p className="mt-3 leading-relaxed text-slate-600 text-sm">{s.text}</p>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}
