import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/site/JsonLd";
import QuoteForm from "@/components/site/QuoteForm";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@/lib/i18n/locales";
import { getProducts } from "@/lib/repo";
import { SEED_PRODUCTS, CATEGORIES } from "@/data/catalog";
import { loadCatalogProduct } from "@/lib/catalog";
import { buildMetadata, productJsonLd, breadcrumbJsonLd, localePath, localizedSlug } from "@/lib/seo";

export const revalidate = 300;

export async function generateStaticParams() {
    const params: { locale: string; slug: string }[] = [];
    for (const locale of ACTIVE_LOCALES) {
        for (const p of SEED_PRODUCTS) params.push({ locale, slug: localizedSlug(p.slug, locale) });
    }
    return params;
}

type Props = { params: Promise<{ locale: string; slug: string }> };

async function loadProduct(slug: string) {
    return loadCatalogProduct(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale, slug } = await params;
    const l = (isLocale(locale) ? locale : ("en" as Locale));
    const product = await loadProduct(slug);
    if (!product) {
        return buildMetadata({ title: "Product not found", description: "", path: `/products/${slug}`, locale: l, noindex: true });
    }
    const dict = getDictionary(l);
    return buildMetadata({
        title: `${product.name} — ${dict.hero.badge}`,
        description: product.shortDescription,
        path: `/products/${slug}`,
        locale: l
    });
}

export default async function ProductDetailPage({ params }: Props) {
    const { locale, slug } = await params;
    const l = (isLocale(locale) ? locale : ("en" as Locale));
    const dict = getDictionary(l);
    const product = await loadProduct(slug);
    if (!product) notFound();

    let related: { slug: string; name: string; shortDescription: string }[] = [];
    try {
        const all = await getProducts();
        related = all
            .filter((p) => p.slug !== product.slug && p.categoryId === product.categoryId)
            .slice(0, 3)
            .map((p) => ({ slug: p.slug, name: p.name, shortDescription: p.shortDescription }));
    } catch {
        related = SEED_PRODUCTS.filter((p) => p.slug !== product.slug && p.categoryId === product.categoryId)
            .slice(0, 3)
            .map((p) => ({ slug: p.slug, name: p.name, shortDescription: p.shortDescription }));
    }

    const categories = CATEGORIES.map((c) => ({ id: c.id, name: c.en.name }));
    const productOptions = SEED_PRODUCTS.map((p) => ({
        id: p.slug,
        name: p.name,
        category: CATEGORIES.find((c) => c.id === p.categoryId)?.en.name || ""
    }));

    return (
        <>
            <JsonLd data={productJsonLd({ name: product.name, description: product.shortDescription, slug: product.slug })} />
            <JsonLd
                data={breadcrumbJsonLd([
                    { name: dict.nav.home, path: localePath(l, "/") },
                    { name: dict.nav.products, path: localePath(l, "/products") },
                    { name: product.name, path: localePath(l, `/products/${localizedSlug(product.slug, l)}`) }
                ])}
            />

            <section className="hero-bg py-14 text-white">
                <div className="container-x">
                    <nav className="text-xs text-slate-400" aria-label="Breadcrumb">
                        <Link href={localePath(l, "/")} className="hover:text-brand-green">{dict.nav.home}</Link>
                        <span className="mx-2">/</span>
                        <Link href={localePath(l, "/products")} className="hover:text-brand-green">{dict.nav.products}</Link>
                        <span className="mx-2">/</span>
                        <span className="text-slate-200">{product.name}</span>
                    </nav>
                    <h1 className="mt-4 max-w-3xl font-display text-3xl font-extrabold sm:text-4xl lg:text-5xl">
                        {product.name}
                    </h1>
                    <p className="mt-4 max-w-2xl text-slate-300">{product.shortDescription}</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <a href="#quote" className="btn-primary">{dict.sections.productsRequest}</a>
                        <a href="#specs" className="btn-outline-light">{dict.sections.specTitle}</a>
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container-x grid gap-10 lg:grid-cols-[1.2fr_.8fr]">
                    <div>
                        {/* 4K Product Showcase Image */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-slate-200/90 shadow-xl mb-8 bg-slate-100">
                            <img
                                src={
                                    product.categoryId === "heavy-duty"
                                        ? "/images/products/heavy-duty.jpg"
                                        : product.categoryId === "household"
                                        ? "/images/products/household.jpg"
                                        : product.categoryId === "industrial-liners"
                                        ? "/images/products/industrial-liners.jpg"
                                        : product.categoryId === "drawstring"
                                        ? "/images/products/drawstring.jpg"
                                        : product.categoryId === "colored"
                                        ? "/images/products/colored.jpg"
                                        : product.categoryId === "private-label"
                                        ? "/images/products/private-label.jpg"
                                        : "/images/products/star-seal.jpg"
                                }
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-xs font-bold text-emerald-300 border border-emerald-500/30 shadow-lg">
                                    Export Grade Polyethylene
                                </span>
                                <span className="px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-xs font-bold text-white border border-white/20 shadow-lg">
                                    EN 13592 &bull; ASTM D1709 Tested
                                </span>
                            </div>
                        </div>

                        <h2 className="h2-title !text-2xl">Overview</h2>
                        <p className="mt-4 leading-relaxed text-slate-600">{product.description}</p>

                        <h2 id="specs" className="h2-title mt-12 !text-2xl">{dict.sections.specTitle}</h2>
                        <div className="mt-4 overflow-x-auto rounded-xl border border-surface-border">
                            <table className="table-spec w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="w-1/3">Parameter</th>
                                        <th>Specification</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {product.specs.map((s) => (
                                        <tr key={s.label}>
                                            <td className="font-semibold text-brand-navy">{s.label}</td>
                                            <td>{s.value}</td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td className="font-semibold text-brand-navy">MOQ</td>
                                        <td>{product.moq}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-3 text-xs text-slate-400">
                            Specifications are indicative; every order is produced to the agreed technical sheet.
                        </p>
                    </div>

                    <aside id="quote" className="lg:sticky lg:top-24 lg:self-start">
                        <h2 className="h2-title !text-xl">{dict.sections.productsRequest}</h2>
                        <p className="mt-2 text-sm text-slate-500">{dict.quote.lead}</p>
                        <div className="mt-4">
                            <QuoteForm
                                locale={l}
                                sourcePage={`/products/${product.slug}`}
                                categories={categories}
                                products={productOptions}
                                presetProductId={product.slug}
                            />
                        </div>
                    </aside>
                </div>
            </section>

            {related.length > 0 && (
                <section className="section bg-white">
                    <div className="container-x">
                        <h2 className="h2-title">{dict.sections.relatedTitle}</h2>
                        <div className="mt-8 grid gap-5 sm:grid-cols-3">
                            {related.map((r) => (
                                <Link key={r.slug} href={localePath(l, `/products/${localizedSlug(r.slug, l)}`)} className="card p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
                                    <h3 className="font-display font-bold text-brand-navy">{r.name}</h3>
                                    <p className="mt-2 text-sm text-slate-600">{r.shortDescription}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
