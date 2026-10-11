import type { Metadata } from "next";
import QuoteForm from "@/components/site/QuoteForm";
import JsonLd from "@/components/site/JsonLd";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@/lib/i18n/locales";
import { buildMetadata, breadcrumbJsonLd, localePath } from "@/lib/seo";
import { SEED_PRODUCTS, CATEGORIES } from "@/data/catalog";

export const revalidate = 300;

export async function generateStaticParams() {
    return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

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

    const categories = CATEGORIES.map((c) => ({ id: c.id, name: c.en.name }));
    const productOptions = SEED_PRODUCTS.map((p) => ({
        id: p.slug,
        name: p.name,
        category: CATEGORIES.find((c) => c.id === p.categoryId)?.en.name || ""
    }));

    return (
        <>
            <JsonLd
                data={breadcrumbJsonLd([
                    { name: dict.nav.home, path: localePath(l, "/") },
                    { name: dict.nav.quote, path: localePath(l, "/quote") }
                ])}
            />
            <section className="hero-bg py-16 text-white sm:py-20">
                <div className="container-x">
                    <h1 className="font-display text-4xl font-extrabold sm:text-5xl">{dict.quote.title}</h1>
                    <p className="mt-4 max-w-2xl text-slate-300">{dict.quote.lead}</p>
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
                            <details key={f.q} className="card p-5">
                                <summary className="cursor-pointer list-none font-display text-sm font-bold text-brand-navy">
                                    <span className="mr-2 text-brand-green">▸</span>
                                    {f.q}
                                </summary>
                                <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
                            </details>
                        ))}
                        <div className="card p-5">
                            <h3 className="font-display text-sm font-bold text-brand-navy">{dict.sections.why4Title}</h3>
                            <p className="mt-2 text-sm text-slate-600">{dict.sections.why4Text}</p>
                        </div>
                    </aside>
                </div>
            </section>
        </>
    );
}
