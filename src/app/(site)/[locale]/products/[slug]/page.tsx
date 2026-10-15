import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import JsonLd from "@/components/site/JsonLd";
import QuoteForm from "@/components/site/QuoteForm";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCategoryCopy } from "@/lib/i18n/content";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { CATEGORIES } from "@/data/catalog";
import { loadCatalogProductWithRedirect, loadCatalogProducts } from "@/lib/catalog";
import { buildMetadata, productJsonLd, breadcrumbJsonLd, localePath, localizedSlug } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale, slug } = await params;
    const l = (isLocale(locale) ? locale : ("en" as Locale));
    const { product, redirectToSlug } = await loadCatalogProductWithRedirect(slug, l);
    if (redirectToSlug) {
        permanentRedirect(localePath(l, `/products/${localizedSlug(redirectToSlug, l)}`));
    }
    if (!product) {
        return buildMetadata({
            title: "Product not found",
            description: "",
            path: `/products/${slug}`,
            locale: l,
            noindex: true
        });
    }
    const dict = getDictionary(l);
    const fallbackImage =
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
            : "/images/products/star-seal.jpg";

    return buildMetadata({
        title: `${product.name} — ${dict.hero.badge}`,
        description: product.shortDescription,
        path: `/products/${product.slug}`,
        locale: l,
        ogImage: product.imageUrl || fallbackImage
    });
}

export default async function ProductDetailPage({ params }: Props) {
    const { locale, slug } = await params;
    const l = (isLocale(locale) ? locale : ("en" as Locale));
    const dict = getDictionary(l);
    const { product, redirectToSlug } = await loadCatalogProductWithRedirect(slug, l);

    if (redirectToSlug) {
        permanentRedirect(localePath(l, `/products/${localizedSlug(redirectToSlug, l)}`));
    }
    if (!product) notFound();

    const allProducts = await loadCatalogProducts(l);
    const related = allProducts
        .filter((p) => p.slug !== product.slug && p.categoryId === product.categoryId)
        .slice(0, 3)
        .map((p) => ({ slug: p.slug, name: p.name, shortDescription: p.shortDescription }));

    const categories = CATEGORIES.map((c) => ({ id: c.id, name: getCategoryCopy(l, c.id).name }));
    const productOptions = allProducts.map((p) => ({
        id: p.slug,
        name: p.name,
        categoryId: p.categoryId,
        category: getCategoryCopy(l, p.categoryId).name
    }));

    const fallbackImage =
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
            : "/images/products/star-seal.jpg";

    const imageUrl = product.imageUrl || fallbackImage;

    return (
        <>
            <JsonLd
                data={productJsonLd({
                    name: product.name,
                    description: product.shortDescription,
                    slug: product.slug,
                    image: imageUrl,
                    locale: l
                })}
            />
            <JsonLd
                data={breadcrumbJsonLd([
                    { name: dict.nav.home, path: localePath(l, "/") },
                    { name: dict.nav.products, path: localePath(l, "/products") },
                    { name: product.name, path: localePath(l, `/products/${localizedSlug(product.slug, l)}`) }
                ])}
            />

            <section className="hero-bg border-b border-slate-200/80 py-14 text-slate-900">
                <div className="container-x">
                    <nav className="text-xs text-slate-500 font-medium" aria-label="Breadcrumb">
                        <Link href={localePath(l, "/")} className="hover:text-brand-green">{dict.nav.home}</Link>
                        <span className="mx-2">/</span>
                        <Link href={localePath(l, "/products")} className="hover:text-brand-green">{dict.nav.products}</Link>
                        <span className="mx-2">/</span>
                        <span className="text-slate-900 font-bold">{product.name}</span>
                    </nav>
                    <h1 className="mt-4 max-w-3xl font-display text-3xl font-black text-slate-900 sm:text-4xl lg:text-5xl">
                        {product.name}
                    </h1>
                    <p className="mt-4 max-w-2xl text-slate-600 text-base sm:text-lg leading-relaxed">{product.shortDescription}</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <a href="#quote" className="btn-primary shadow-cta !px-6 !py-3">{dict.sections.productsRequest}</a>
                        <a href="#specs" className="btn-outline-dark !px-6 !py-3">{dict.sections.specTitle}</a>
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container-x grid gap-10 lg:grid-cols-[1.2fr_.8fr]">
                    <div>
                        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-slate-200/90 shadow-xl mb-8 bg-slate-100">
                            <img
                                src={imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-xs font-bold text-emerald-300 border border-emerald-500/30 shadow-lg">
                                    Export Grade Polyethylene
                                </span>
                                <span className="px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-xs font-bold text-white border border-white/20 shadow-lg">
                                    {getCategoryCopy(l, product.categoryId).name}
                                </span>
                            </div>
                        </div>

                        <h2 className="h2-title !text-2xl">
                            {l === "tr" ? "Ürün Açıklaması" : "Overview"}
                        </h2>
                        <p className="mt-4 leading-relaxed text-slate-600 whitespace-pre-line">{product.description}</p>

                        <h2 id="specs" className="h2-title mt-12 !text-2xl">{dict.sections.specTitle}</h2>
                        <div className="mt-4 overflow-x-auto rounded-xl border border-surface-border">
                            <table className="table-spec w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="w-1/3">{l === "tr" ? "Parametre" : "Parameter"}</th>
                                        <th>{l === "tr" ? "Teknik Özellik" : "Specification"}</th>
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
                            {l === "tr"
                                ? "Teknik değerler siparişe özel üretim föyüne göre yapılandırılır."
                                : "Specifications are indicative; every order is produced to the agreed technical sheet."}
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
