import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/site/Hero";
import SectionHeading from "@/components/site/SectionHeading";
import JsonLd from "@/components/site/JsonLd";
import { ProductCard, CategoryCard } from "@/components/site/ProductCards";
import { CATEGORIES } from "@/data/catalog";
import { loadCatalogProducts } from "@/lib/catalog";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getIndustries } from "@/lib/i18n/content";
import { localeOrDefault } from "@/lib/i18n/requireLocale";
import { buildMetadata, organizationJsonLd, faqJsonLd, breadcrumbJsonLd, localePath } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const l = localeOrDefault(locale);
    const dict = getDictionary(l);
    return buildMetadata({
        title: `${dict.site.name} — ${dict.hero.title}`,
        description: dict.site.subtagline,
        path: "/",
        locale: l
    });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const l = localeOrDefault(locale);
    const dict = getDictionary(l);
    const products = await loadCatalogProducts();
    const industries = getIndustries(l);

    const why = [
        { title: dict.sections.why1Title, text: dict.sections.why1Text, icon: "1" },
        { title: dict.sections.why2Title, text: dict.sections.why2Text, icon: "2" },
        { title: dict.sections.why3Title, text: dict.sections.why3Text, icon: "3" },
        { title: dict.sections.why4Title, text: dict.sections.why4Text, icon: "4" }
    ];

    return (
        <>
            <JsonLd data={organizationJsonLd()} />
            <JsonLd data={faqJsonLd([...dict.faq])} />
            <JsonLd data={breadcrumbJsonLd([{ name: dict.nav.home, path: localePath(l, "/") }])} />

            <Hero dict={dict} locale={l} />

            <section className="section bg-slate-50/60" id="categories">
                <div className="container-x">
                    <SectionHeading eyebrow="Catalog" title={dict.sections.productsTitle} lead={dict.sections.productsLead} />
                    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {CATEGORIES.map((c) => (
                            <CategoryCard key={c.id} category={c} locale={l} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="section bg-white border-y border-slate-200/80">
                <div className="container-x">
                    <SectionHeading eyebrow="B2B Excellence" title={dict.sections.whyTitle} lead={dict.sections.whyLead} center />
                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {why.map((w) => (
                            <div key={w.title} className="card p-7 hover:-translate-y-1 hover:border-emerald-500/40 transition-all duration-300">
                                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-green to-brand-teal text-sm font-black text-white shadow-md shadow-brand-green/20" aria-hidden>
                                    {w.icon}
                                </span>
                                <h3 className="mt-4 font-display text-lg font-bold text-slate-900">{w.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">{w.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section" id="featured">
                <div className="container-x">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <SectionHeading eyebrow="Products" title={dict.sections.productsTitle} lead={dict.sections.productsLead} />
                        <Link href={localePath(l, "/products")} className="btn-outline-dark">
                            {dict.sections.productsViewAll} &rarr;
                        </Link>
                    </div>
                    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {products.slice(0, 6).map((p) => (
                            <ProductCard key={p.slug} product={p} locale={l} requestLabel={dict.sections.productsRequest} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="section bg-gradient-to-b from-slate-50 via-emerald-50/20 to-white border-y border-slate-200/80">
                <div className="container-x">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="chip mb-3">Sectors</p>
                        <h2 className="font-display text-3xl font-black text-slate-900 sm:text-4xl">{dict.sections.industriesTitle}</h2>
                    </div>
                    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {industries.map((item) => (
                            <div key={item.name} className="card p-6 hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200">
                                <h3 className="font-display text-base font-bold text-slate-900">{item.name}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section bg-white">
                <div className="container-x grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
                    <SectionHeading eyebrow="FAQ" title={dict.sections.faqTitle} />
                    <div className="space-y-4">
                        {dict.faq.map((f) => (
                            <details key={f.q} className="card p-5 group open:border-emerald-500/40">
                                <summary className="cursor-pointer list-none font-display text-sm font-bold text-slate-900 flex items-center justify-between">
                                    <span>{f.q}</span>
                                    <span className="text-brand-green font-bold transition-transform duration-200 group-open:rotate-90">▸</span>
                                </summary>
                                <p className="mt-3 text-sm leading-relaxed text-slate-600 pt-2 border-t border-slate-100">{f.a}</p>
                            </details>
                        ))}
                        <Link href={localePath(l, "/faq")} className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-green hover:text-brand-green-dark transition">
                            <span>{dict.sections.faqTitle}</span>
                            <span>&rarr;</span>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="hero-bg section border-t border-slate-200/80 text-slate-900">
                <div className="container-x text-center max-w-3xl mx-auto">
                    <p className="chip mb-3">Global Export</p>
                    <h2 className="font-display text-3xl font-black text-slate-900 sm:text-4xl">{dict.sections.ctaTitle}</h2>
                    <p className="mx-auto mt-4 max-w-xl text-slate-600 text-base sm:text-lg">{dict.sections.ctaText}</p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Link href={localePath(l, "/quote")} className="btn-primary !px-8 !py-4 !text-base shadow-cta">{dict.site.ctaQuote}</Link>
                        <Link href={localePath(l, "/contact")} className="btn-outline-dark !px-8 !py-4 !text-base">{dict.nav.contact}</Link>
                    </div>
                </div>
            </section>
        </>
    );
}
