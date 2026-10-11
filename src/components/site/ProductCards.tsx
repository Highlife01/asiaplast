import Link from "next/link";
import { CATEGORIES, type SeedProduct } from "@/data/catalog";
import { getCategoryCopy } from "@/lib/i18n/content";
import type { Locale } from "@/lib/i18n/locales";
import { localePath, localizedSlug } from "@/lib/seo";

export function ProductCard({ product, locale, requestLabel }: { product: SeedProduct; locale: Locale; requestLabel: string }) {
    const copy = getCategoryCopy(locale, product.categoryId);
    const category = CATEGORIES.find((c) => c.id === product.categoryId);
    const href = localePath(locale, `/products/${localizedSlug(product.slug, locale)}`);
    return (
        <article className="card group flex h-full flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-start justify-between gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-green-light text-2xl" aria-hidden>
                    {category?.icon || "•"}
                </span>
                <span className="rounded-full bg-surface-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {copy.name.split(" ").slice(0, 2).join(" ")}
                </span>
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-brand-navy">
                <Link href={href} className="hover:text-brand-green-dark">
                    {product.name}
                </Link>
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{product.shortDescription}</p>
            <div className="mt-5 flex items-center justify-between border-t border-surface-border pt-4">
                <span className="text-xs text-slate-400">MOQ: {product.moq}</span>
                <Link href={`${localePath(locale, "/quote")}?product=${product.slug}`} className="text-sm font-semibold text-brand-green-dark hover:text-brand-green">
                    {requestLabel} →
                </Link>
            </div>
        </article>
    );
}

export function CategoryCard({ category, locale }: { category: (typeof CATEGORIES)[number]; locale: Locale }) {
    const copy = getCategoryCopy(locale, category.id);
    return (
        <Link
            id={category.id}
            href={`${localePath(locale, "/products")}#${category.id}`}
            className="card group flex flex-col p-6 transition hover:-translate-y-0.5 hover:border-brand-green/40 hover:shadow-lg"
        >
            <span className="text-3xl" aria-hidden>{category.icon}</span>
            <h3 className="mt-3 font-display text-base font-bold text-brand-navy group-hover:text-brand-green-dark">
                {copy.name}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{copy.blurb}</p>
        </Link>
    );
}
