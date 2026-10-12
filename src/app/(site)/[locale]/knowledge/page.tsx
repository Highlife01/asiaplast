import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@/lib/i18n/locales";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import JsonLd from "@/components/site/JsonLd";

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

const ARTICLES = [
    {
        slug: "garbage-bag-gauge-guide",
        title: "Garbage Bag Gauge Guide: Choosing the Right Micron",
        excerpt: "Why thickness alone doesn't define strength — resin blend, sealing and bag geometry matter as much as microns.",
        readTime: "5 min"
    },
    {
        slug: "star-seal-vs-flat-seal",
        title: "Star Seal vs Flat Seal: Which Base for Which Waste?",
        excerpt: "The engineering difference between seal types and when the extra cost of star seal pays for itself.",
        readTime: "4 min"
    },
    {
        slug: "container-loading-bin-liners",
        title: "Container Loading for Bin Liners: Packing Math",
        excerpt: "How carton dimensions, bale compression and pallet patterns decide how many bags fit a 40' HQ.",
        readTime: "6 min"
    },
    {
        slug: "private-label-checklist",
        title: "Private Label Garbage Bags: A Retailer's Checklist",
        excerpt: "From artwork files to barcode placement — everything to prepare before your first own-brand order.",
        readTime: "5 min"
    },
    {
        slug: "color-coded-waste-segregation",
        title: "Color-Coded Waste Segregation in Healthcare & Hospitality",
        excerpt: "Common color conventions for clinical, recyclable and organic streams across export markets.",
        readTime: "4 min"
    },
    {
        slug: "incoterms-for-plastic-importers",
        title: "Incoterms for Plastic Importers: EXW to DAP Explained",
        excerpt: "What each delivery term means for your landed cost, risk and customs clearance workload.",
        readTime: "7 min"
    }
];

export default async function KnowledgePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const l = (isLocale(locale) ? locale : ("en" as Locale));
    const dict = getDictionary(l);

    return (
        <>
            <JsonLd data={breadcrumbJsonLd([{ name: dict.nav.home, path: `/${l}` }, { name: dict.nav.knowledge, path: `/${l}/knowledge` }])} />
            <section className="hero-bg border-b border-slate-200/80 py-16 text-slate-900 sm:py-20">
                <div className="container-x">
                    <p className="chip mb-3">Technical Guides</p>
                    <h1 className="font-display text-4xl font-black text-slate-900 sm:text-5xl">{dict.nav.knowledge}</h1>
                    <p className="mt-4 max-w-2xl text-slate-600 text-base sm:text-lg leading-relaxed">
                        Sourcing guides written for buyers, not consumers — technical, practical and export-focused.
                    </p>
                </div>
            </section>

            <section className="section">
                <div className="container-x grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {ARTICLES.map((a) => (
                        <article key={a.slug} className="card flex h-full flex-col p-7 hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-200">
                            <span className="inline-block w-fit rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                {a.readTime} read
                            </span>
                            <h2 className="mt-3 font-display text-lg font-bold text-slate-900 leading-snug">{a.title}</h2>
                            <p className="mt-2.5 flex-1 text-sm leading-relaxed text-slate-600">{a.excerpt}</p>
                        </article>
                    ))}
                </div>
            </section>
        </>
    );
}
