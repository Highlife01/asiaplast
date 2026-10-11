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

            <section className="hero-bg py-16 text-white sm:py-20">
                <div className="container-x">
                    <p className="chip !border-white/20 !bg-white/10 !text-brand-green">Catalog</p>
                    <h1 className="mt-4 max-w-2xl font-display text-4xl font-extrabold sm:text-5xl">
                        {dict.sections.productsTitle}
                    </h1>
                    <p className="mt-4 max-w-2xl text-slate-300">{dict.sections.productsLead}</p>
                </div>
            </section>

            <section className="section">
                <div className="container-x">
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {CATEGORIES.map((c) => (
                            <CategoryCard key={c.id} category={c} locale={l} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="section bg-white pt-0">
                <div className="container-x">
                    <SectionHeading title={dict.sections.productsTitle} lead={dict.sections.productsLead} />
                    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map((p) => (
                            <ProductCard key={p.slug} product={p} locale={l} requestLabel={dict.sections.productsRequest} />
                        ))}
                    </div>
                    <div className="mt-12 rounded-2xl border border-dashed border-brand-green/40 bg-brand-green-light p-6 text-center">
                        <p className="font-display text-lg font-bold text-brand-navy">{dict.sections.ctaTitle}</p>
                        <p className="mt-1 text-sm text-slate-600">{dict.sections.ctaText}</p>
                        <Link href={localePath(l, "/quote")} className="btn-primary mt-4">{dict.site.ctaQuote}</Link>
                    </div>
                </div>
            </section>
        </>
    );
}
