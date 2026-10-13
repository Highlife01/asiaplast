import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import JsonLd from "@/components/site/JsonLd";
import QuoteForm from "@/components/site/QuoteForm";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@/lib/i18n/locales";
import { getProducts } from "@/lib/repo";
import { SEED_PRODUCTS, CATEGORIES } from "@/data/catalog";
import { loadCatalogProduct, loadCatalogProducts } from "@/lib/catalog";
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

async function loadProduct(slug: string, locale?: Locale) {
    return loadCatalogProduct(slug, locale);
}

const UI_TEXT: Partial<
    Record<
        Locale,
        {
            overview: string;
            specTitle: string;
            paramCol: string;
            valCol: string;
            moqLabel: string;
            tdsButton: string;
            tdsSub: string;
            standardBadge: string;
            indicativeNote: string;
        }
    >
> = {
    tr: {
        overview: "Ürün Açıklaması & Üretim Standartları",
        specTitle: "Teknik Parametreler ve Spesifikasyon",
        paramCol: "Teknik Parametre",
        valCol: "Spesifikasyon Değeri",
        moqLabel: "Minimum Sipariş (MOQ)",
        tdsButton: "Teknik Veri Föyünü İndir (TDS / PDF)",
        tdsSub: "Kalite kontrol ve ithalat gümrük denetimleri için doğrulanmış fabrika föyü",
        standardBadge: "Standart Uygunluğu",
        indicativeNote: "Spesifikasyonlar gösterge niteliğindedir; her sipariş alıcı ile anlaşılan kilitli teknik şartnameye göre üretilir."
    },
    en: {
        overview: "Technical Overview & Quality Standards",
        specTitle: "Technical Parameters & Specification",
        paramCol: "Parameter",
        valCol: "Specification Value",
        moqLabel: "Minimum Order Quantity (MOQ)",
        tdsButton: "Download Technical Datasheet (TDS / PDF)",
        tdsSub: "Verified manufacturer datasheet for QA and customs clearance",
        standardBadge: "Standard Compliance",
        indicativeNote: "Specifications are indicative; every production run is manufactured against the locked technical sheet."
    },
    de: {
        overview: "Produktübersicht & Fertigungsstandards",
        specTitle: "Technische Parameter & Spezifikationen",
        paramCol: "Technischer Parameter",
        valCol: "Spezifikationswert",
        moqLabel: "Mindestbestellmenge (MOQ)",
        tdsButton: "Technisches Datenblatt herunterladen (TDS / PDF)",
        tdsSub: "Verifiziertes Werksdatenblatt für Qualitätsprüfung und Zollabfertigung",
        standardBadge: "Normenkonformität",
        indicativeNote: "Die Angaben sind Richtwerte; jede Charge wird nach dem vereinbarten technischen Datenblatt gefertigt."
    },
    fr: {
        overview: "Présentation Technique & Normes d'Usine",
        specTitle: "Paramètres Techniques & Spécification",
        paramCol: "Paramètre Technique",
        valCol: "Spécification Usine",
        moqLabel: "Quantité Minimale (MOQ)",
        tdsButton: "Télécharger la Fiche Technique (TDS / PDF)",
        tdsSub: "Fiche technique d'usine certifiée pour contrôles qualité et douanes",
        standardBadge: "Conformité aux Normes",
        indicativeNote: "Spécifications indicatives ; chaque lot est produit selon le cahier des charges technique validé."
    },
    ar: {
        overview: "نظرة عامة ومعايير الجودة والإنتاج",
        specTitle: "المعايير الفنية والمواصفات",
        paramCol: "المعيار الفني",
        valCol: "قيمة المواصفة",
        moqLabel: "الحد الأدنى للطلب (MOQ)",
        tdsButton: "تحميل صحيفة البيانات الفنية (TDS / PDF)",
        tdsSub: "بيانات معتمدة من المصنع لفرق الجودة والتخليص الجمركي",
        standardBadge: "مطابقة المعايير",
        indicativeNote: "المواصفات استرشادية؛ ويتم تصنيع كل شحنة وفقاً لدفتر الشروط والمواصفات المتفق عليها."
    }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale, slug } = await params;
    const l = (isLocale(locale) ? locale : ("en" as Locale));
    const product = await loadProduct(slug, l);
    if (!product) {
        return buildMetadata({ title: "Product not found", description: "", path: `/products/${slug}`, locale: l, noindex: true });
    }
    const dict = getDictionary(l);
    return buildMetadata({
        title: `${product.name} | ASIAPLAST ${dict.hero.badge}`,
        description: product.shortDescription,
        path: `/products/${slug}`,
        locale: l
    });
}

export default async function ProductDetailPage({ params }: Props) {
    const { locale, slug } = await params;
    const l = (isLocale(locale) ? locale : ("en" as Locale));
    const dict = getDictionary(l);
    const ui = UI_TEXT[l] || UI_TEXT.en!;
    const product = await loadProduct(slug, l);
    if (!product) notFound();

    let related: { slug: string; name: string; shortDescription: string }[] = [];
    try {
        const all = await loadCatalogProducts(l);
        related = all
            .filter((p) => p.slug !== product.slug && p.categoryId === product.categoryId)
            .slice(0, 3)
            .map((p) => ({ slug: p.slug, name: p.name, shortDescription: p.shortDescription }));
    } catch {
        const all = await loadCatalogProducts(l);
        related = all
            .filter((p) => p.slug !== product.slug && p.categoryId === product.categoryId)
            .slice(0, 3)
            .map((p) => ({ slug: p.slug, name: p.name, shortDescription: p.shortDescription }));
    }

    const activeLang = (l === "tr" || l === "de" || l === "fr" || l === "ar") ? l : "en";
    const categories = CATEGORIES.map((c) => ({
        id: c.id,
        name: c[activeLang]?.name || c.en.name
    }));

    const productOptions = (await loadCatalogProducts(l)).map((p) => ({
        id: p.slug,
        name: p.name,
        category: CATEGORIES.find((c) => c.id === p.categoryId)?.[activeLang]?.name || ""
    }));

    const categoryImage =
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
            : product.categoryId === "custom-size"
            ? "/images/products/custom-size.jpg"
            : product.categoryId === "private-label"
            ? "/images/products/private-label.jpg"
            : "/images/products/star-seal.jpg";

    return (
        <>
            <JsonLd data={productJsonLd({ name: product.name, description: product.shortDescription, slug: product.slug, locale: l })} />
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
                        <a href="#specs" className="btn-outline-dark !px-6 !py-3">{ui.specTitle}</a>
                    </div>
                </div>
            </section>

            <section className="section bg-white">
                <div className="container-x grid gap-10 lg:grid-cols-[1.2fr_.8fr]">
                    <div>
                        {/* 4K Product Showcase Image */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-slate-200/90 shadow-xl mb-8 bg-slate-100">
                            <Image
                                src={categoryImage}
                                alt={product.name}
                                fill
                                priority
                                sizes="(min-width: 1024px) 60vw, 100vw"
                                className="object-cover"
                            />
                            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-xs font-bold text-emerald-300 border border-emerald-500/30 shadow-lg">
                                    Direct Manufacturer &bull; Export Grade
                                </span>
                                {product.standards && (
                                    <span className="px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-xs font-bold text-white border border-white/20 shadow-lg">
                                        {product.standards}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Technical Overview */}
                        <h2 className="h2-title !text-2xl">{ui.overview}</h2>
                        <p className="mt-4 leading-relaxed text-slate-600 text-base sm:text-lg">{product.description}</p>

                        {/* Standard Compliance Card */}
                        {product.standards && (
                            <div className="mt-6 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
                                <span className="text-xl">🛡️</span>
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 block mb-0.5">
                                        {ui.standardBadge}
                                    </span>
                                    <p className="text-xs text-emerald-800 font-medium">
                                        {product.standards}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Technical Specification Table */}
                        <h2 id="specs" className="h2-title mt-12 !text-2xl">{ui.specTitle}</h2>
                        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
                            <table className="table-spec w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="w-2/5 py-3.5 px-4 text-left font-bold text-xs uppercase tracking-wider text-slate-700">{ui.paramCol}</th>
                                        <th className="py-3.5 px-4 text-left font-bold text-xs uppercase tracking-wider text-slate-700">{ui.valCol}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {product.specs.map((s) => (
                                        <tr key={s.label} className="border-b border-slate-100 hover:bg-slate-50/60 transition">
                                            <td className="py-3 px-4 font-semibold text-brand-navy text-sm">{s.label}</td>
                                            <td className="py-3 px-4 text-slate-600 text-sm font-medium">{s.value}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-emerald-50/40">
                                        <td className="py-3.5 px-4 font-bold text-emerald-900 text-sm">{ui.moqLabel}</td>
                                        <td className="py-3.5 px-4 font-bold text-emerald-800 text-sm">{product.moq}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-3 text-xs text-slate-500 italic">
                            * {ui.indicativeNote}
                        </p>

                        {/* TDS Download Banner */}
                        <div className="mt-8 p-6 rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                            <div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-2 border border-emerald-500/40">
                                    <span>📄</span> Technical Datasheet (TDS)
                                </span>
                                <p className="font-display font-bold text-white text-base">{product.name}</p>
                                <p className="text-xs text-slate-400 mt-1 max-w-md">{ui.tdsSub}</p>
                            </div>
                            <a
                                href={`mailto:export@asiaplast.com?subject=TDS%20Request:%20${encodeURIComponent(product.name)}&body=Hello%20ASIAPLAST,%20please%20send%20the%20technical%20datasheet%20(TDS)%20for%20${encodeURIComponent(product.name)}.`}
                                className="px-5 py-3 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-emerald-400 transition whitespace-nowrap shadow-md"
                            >
                                {ui.tdsButton} &rarr;
                            </a>
                        </div>
                    </div>

                    <aside id="quote" className="lg:sticky lg:top-24 lg:self-start">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
                            <h2 className="h2-title !text-xl">{dict.sections.productsRequest}</h2>
                            <p className="mt-2 text-xs text-slate-500 leading-relaxed">{dict.quote.lead}</p>
                            <div className="mt-6">
                                <QuoteForm
                                    locale={l}
                                    sourcePage={`/products/${product.slug}`}
                                    categories={categories}
                                    products={productOptions}
                                    presetProductId={product.slug}
                                />
                            </div>
                        </div>
                    </aside>
                </div>
            </section>

            {related.length > 0 && (
                <section className="section bg-slate-50/70 border-t border-slate-200/80">
                    <div className="container-x">
                        <h2 className="h2-title">{dict.sections.relatedTitle}</h2>
                        <div className="mt-8 grid gap-5 sm:grid-cols-3">
                            {related.map((r) => (
                                <Link
                                    key={r.slug}
                                    href={localePath(l, `/products/${localizedSlug(r.slug, l)}`)}
                                    className="card p-6 transition hover:-translate-y-1 hover:shadow-card-hover bg-white border border-slate-200/80 rounded-3xl"
                                >
                                    <h3 className="font-display font-bold text-brand-navy text-lg">{r.name}</h3>
                                    <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-3">{r.shortDescription}</p>
                                    <span className="inline-block mt-4 text-xs font-bold text-brand-green">
                                        {ui.specTitle} &rarr;
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
