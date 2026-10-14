import type { Metadata } from "next";
import QuoteForm from "@/components/site/QuoteForm";
import JsonLd from "@/components/site/JsonLd";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCategoryCopy } from "@/lib/i18n/content";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { buildMetadata, breadcrumbJsonLd, localePath } from "@/lib/seo";
import { CATEGORIES } from "@/data/catalog";
import { loadCatalogProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const l = (isLocale(locale) ? locale : ("en" as Locale));
    const dict = getDictionary(l);
    return buildMetadata({ title: dict.quote.title, description: dict.quote.lead, path: "/quote", locale: l });
}

export default async function QuotePage({
    params,
    searchParams
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ product?: string }>;
}) {
    const { locale } = await params;
    const { product: preset } = await searchParams;
    const l = (isLocale(locale) ? locale : ("en" as Locale));
    const dict = getDictionary(l);

    const activeProducts = await loadCatalogProducts(l);
    const categories = CATEGORIES.map((c) => ({ id: c.id, name: getCategoryCopy(l, c.id).name }));
    const productOptions = activeProducts.map((p) => ({
        id: p.slug,
        name: p.name,
        categoryId: p.categoryId,
        category: getCategoryCopy(l, p.categoryId).name
    }));

    return (
        <>
            <JsonLd
                data={breadcrumbJsonLd([
                    { name: dict.nav.home, path: localePath(l, "/") },
                    { name: dict.nav.quote, path: localePath(l, "/quote") }
                ])}
            />
            <section className="hero-bg border-b border-slate-200/80 py-16 text-slate-900 sm:py-20">
                <div className="container-x">
                    <p className="chip mb-3">Fast Quotation Desk</p>
                    <h1 className="font-display text-4xl font-black text-slate-900 sm:text-5xl">{dict.quote.title}</h1>
                    <p className="mt-4 max-w-2xl text-slate-600 text-base sm:text-lg leading-relaxed">{dict.quote.lead}</p>
                </div>
            </section>

            <section className="section">
                <div className="container-x grid gap-10 lg:grid-cols-[1.1fr_.9fr]">
                    <QuoteForm
                        locale={l}
                        sourcePage="/quote"
                        categories={categories}
                        products={productOptions}
                        presetProductId={preset}
                    />
                    <aside className="space-y-4">
                        {dict.faq.slice(0, 3).map((f) => (
                            <details key={f.q} className="card p-6 group open:border-emerald-500/40">
                                <summary className="cursor-pointer list-none font-display text-sm font-bold text-slate-900 flex items-center justify-between">
                                    <span>{f.q}</span>
                                    <span className="text-brand-green font-bold transition-transform duration-200 group-open:rotate-90">▸</span>
                                </summary>
                                <p className="mt-3 text-sm leading-relaxed text-slate-600 pt-2 border-t border-slate-100">{f.a}</p>
                            </details>
                        ))}
                        <div className="card p-6 hover:border-emerald-500/40 transition-all">
                            <h3 className="font-display text-sm font-bold text-slate-900">{dict.sections.why4Title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">{dict.sections.why4Text}</p>
                        </div>
                    </aside>
                </div>
            </section>
        </>
    );
}
