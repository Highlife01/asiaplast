import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@/lib/i18n/locales";
import { buildMetadata, breadcrumbJsonLd, localePath } from "@/lib/seo";
import JsonLd from "@/components/site/JsonLd";
import { getKnowledgeArticles } from "@/data/knowledge";

export const revalidate = 3600;

export async function generateStaticParams() {
    return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const l = (isLocale(locale) ? locale : ("en" as Locale));
    const dict = getDictionary(l);
    return buildMetadata({
        title: `${dict.nav.knowledge} — Garbage Bag Sourcing Guides`,
        description: "Technical guides for wholesale buyers: gauges, seals, packing and private label.",
        path: "/knowledge",
        locale: l
    });
}

export default async function KnowledgePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const l = (isLocale(locale) ? locale : ("en" as Locale));
    const dict = getDictionary(l);
    const articles = getKnowledgeArticles();

    return (
        <>
            <JsonLd
                data={breadcrumbJsonLd([
                    { name: dict.nav.home, path: localePath(l, "/") },
                    { name: dict.nav.knowledge, path: localePath(l, "/knowledge") }
                ])}
            />
            <section className="hero-bg border-b border-slate-200/80 py-16 text-slate-900 sm:py-20">
                <div className="container-x">
                    <p className="chip mb-3">Technical Guides</p>
                    <h1 className="font-display text-4xl font-black text-slate-900 sm:text-5xl">{dict.nav.knowledge}</h1>
                    <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                        Sourcing guides written for buyers, not consumers — technical, practical and export-focused.
                    </p>
                </div>
            </section>

            <section className="section">
                <div className="container-x grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {articles.map((a) => (
                        <Link
                            key={a.slug}
                            href={localePath(l, `/knowledge/${a.slug}`)}
                            className="card flex h-full flex-col p-7 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/40"
                        >
                            <article className="flex h-full flex-col">
                                <span className="inline-block w-fit rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    {a.readTime} read
                                </span>
                                <h2 className="mt-3 font-display text-lg font-bold leading-snug text-slate-900">{a.title}</h2>
                                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-slate-600">{a.excerpt}</p>
                            </article>
                        </Link>
                    ))}
                </div>
            </section>
        </>
    );
}
