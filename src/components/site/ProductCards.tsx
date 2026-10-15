import Link from "next/link";
import { CATEGORIES, type SeedProduct } from "@/data/catalog";
import { getCategoryCopy } from "@/lib/i18n/content";
import type { Locale } from "@/lib/i18n/locales";
import { localePath, localizedSlug } from "@/lib/seo";

const CATEGORY_IMAGES: Record<string, string> = {
    "heavy-duty": "/images/products/heavy-duty.jpg",
    "household": "/images/products/household.jpg",
    "industrial-liners": "/images/products/industrial-liners.jpg",
    "drawstring": "/images/products/drawstring.jpg",
    "star-seal": "/images/products/star-seal.jpg",
    "colored": "/images/products/colored.jpg",
    "custom-size": "/images/products/custom-size.jpg",
    "private-label": "/images/products/private-label.jpg"
};

const CATEGORY_SPECS: Record<string, string> = {
    "heavy-duty": "LDPE / HDPE · Puncture Resistant",
    "household": "Perforated Rolls · Easy Tie",
    "industrial-liners": "240L–1100L Wheelie Bins",
    "drawstring": "Quick-Glide Drawtape · Poly",
    "star-seal": "Leak-Proof Circular Bottom",
    "colored": "Segregation Blue/Yellow/Red",
    "custom-size": "Custom Width & Gauge OEM",
    "private-label": "Branded Retail Cartons & EAN"
};

export function ProductCard({
    product,
    locale,
    requestLabel
}: {
    product: SeedProduct & { imageUrl?: string | null };
    locale: Locale;
    requestLabel: string;
}) {
    const copy = getCategoryCopy(locale, product.categoryId);
    const category = CATEGORIES.find((c) => c.id === product.categoryId);
    const href = localePath(locale, `/products/${localizedSlug(product.slug, locale)}`);
    const imageUrl = product.imageUrl || CATEGORY_IMAGES[product.categoryId] || "/images/products/heavy-duty.jpg";
    const firstSpec = product.specs?.[0] ? `${product.specs[0].label}: ${product.specs[0].value}` : null;
    const spec = firstSpec || CATEGORY_SPECS[product.categoryId] || "Export Grade Polyethylene";

    return (
        <article className="group relative rounded-3xl border border-slate-200/80 bg-white p-4 shadow-card hover:shadow-card-hover hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100">
                    <img
                        src={imageUrl}
                        alt={product.name}
                        width={1200}
                        height={896}
                        decoding="async"
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/25 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-slate-800 border border-slate-200/80 shadow-xs">
                        {category?.icon} {copy.name.split(" ").slice(0, 2).join(" ")}
                    </span>

                    <span className="absolute bottom-3 left-3 max-w-[90%] truncate px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[11px] font-mono font-bold text-emerald-800 border border-emerald-200/80 shadow-xs">
                        {spec}
                    </span>
                </div>

                <div className="pt-4 px-1">
                    <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-brand-green transition">
                        <Link href={href}>{product.name}</Link>
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600 line-clamp-2">
                        {product.shortDescription}
                    </p>
                </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 px-1 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500 font-semibold">
                    MOQ: <strong className="text-slate-800">{product.moq}</strong>
                </span>
                <Link
                    href={`${localePath(locale, "/quote")}?product=${product.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-green hover:text-brand-green-dark group-hover:translate-x-0.5 transition-transform"
                >
                    <span>{requestLabel}</span>
                    <span>&rarr;</span>
                </Link>
            </div>
        </article>
    );
}

export function CategoryCard({
    category,
    locale
}: {
    category: (typeof CATEGORIES)[number];
    locale: Locale;
}) {
    const copy = getCategoryCopy(locale, category.id);
    const imageUrl = CATEGORY_IMAGES[category.id] || "/images/products/heavy-duty.jpg";
    const spec = CATEGORY_SPECS[category.id] || "Standard B2B Bulk";

    return (
        <Link
            id={category.id}
            href={`${localePath(locale, "/products")}#${category.id}`}
            className="group relative rounded-3xl border border-slate-200/80 bg-white p-4 shadow-card hover:shadow-card-hover hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
        >
            <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100">
                    <img
                        src={imageUrl}
                        alt={copy.name}
                        width={1200}
                        height={896}
                        decoding="async"
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

                    <span className="absolute top-3 left-3 text-2xl drop-shadow-sm">
                        {category.icon}
                    </span>

                    <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md text-[10px] font-mono font-bold text-emerald-800 border border-emerald-200/80 shadow-xs">
                        {spec}
                    </span>
                </div>

                <div className="pt-4 px-1">
                    <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-brand-green transition">
                        {copy.name}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600 line-clamp-2">
                        {copy.blurb}
                    </p>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 px-1 flex items-center justify-between text-xs font-bold text-brand-green">
                <span>Explore Technical Specs</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
        </Link>
    );
}
