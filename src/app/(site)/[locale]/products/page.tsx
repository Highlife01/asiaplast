import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/site/SectionHeading";
import JsonLd from "@/components/site/JsonLd";
import { ProductCard, CategoryCard } from "@/components/site/ProductCards";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@/lib/i18n/locales";
import { buildMetadata, breadcrumbJsonLd, localePath } from "@/lib/seo";
import { CATEGORIES } from "@/data/catalog";
import { loadCatalogProducts } from "@/lib/catalog";

export const revalidate = 300;

export async function generateStaticParams() {
    return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const l = (isLocale(locale) ? locale : ("en" as Locale));
    const dict = getDictionary(l);
    return buildMetadata({
        title: `${dict.sections.productsTitle} — Wholesale Garbage Bags & Bin Liners`,
        description: dict.sections.productsLead,
        path: "/products",
        locale: l
    });
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const l = (isLocale(locale) ? locale : ("en" as Locale));
    const dict = getDictionary(l);
    const products = await loadCatalogProducts();

    return (
        <>
            <JsonLd
                data={breadcrumbJsonLd([
                    { name: dict.nav.home, path: localePath(l, "/") },
                    { name: dict.nav.products, path: localePath(l, "/products") }
                ])}
            />

            <section className="hero-bg border-b border-slate-200/80 py-16 text-slate-900 sm:py-20">
                <div className="container-x">
                    <p className="chip mb-3">Complete Catalog</p>
                    <h1 className="font-display text-4xl font-black text-slate-900 sm:text-5xl">
                        {dict.sections.productsTitle}
                    </h1>
                    <p className="mt-4 max-w-2xl text-slate-600 text-base sm:text-lg leading-relaxed">{dict.sections.productsLead}</p>
                </div>
            </section>

            <section className="section bg-slate-50/60">
                <div className="container-x">
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {CATEGORIES.map((c) => (
                            <CategoryCard key={c.id} category={c} locale={l} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="section bg-white">
                <div className="container-x">
                    <SectionHeading title={dict.sections.productsTitle} lead={dict.sections.productsLead} />
                    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map((p) => (
                            <ProductCard key={p.slug} product={p} locale={l} requestLabel={dict.sections.productsRequest} />
                        ))}
                    </div>
                    <div className="mt-16 rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-8 sm:p-10 text-center shadow-sm">
                        <p className="font-display text-2xl font-black text-slate-900">{dict.sections.ctaTitle}</p>
                        <p className="mt-2 text-base text-slate-600 max-w-xl mx-auto">{dict.sections.ctaText}</p>
                        <Link href={localePath(l, "/quote")} className="btn-primary mt-6 shadow-cta !px-8 !py-4">{dict.site.ctaQuote}</Link>
                    </div>
                </div>
            </section>
        </>
    );
}
