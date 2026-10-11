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
    "heavy-duty": "120–150 µm · Puncture Proof",
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
    product: SeedProduct;
    locale: Locale;
    requestLabel: string;
}) {
    const copy = getCategoryCopy(locale, product.categoryId);
    const category = CATEGORIES.find((c) => c.id === product.categoryId);
    const href = localePath(locale, `/products/${localizedSlug(product.slug, locale)}`);
    const imageUrl = CATEGORY_IMAGES[product.categoryId] || "/images/products/heavy-duty.jpg";
    const spec = CATEGORY_SPECS[product.categoryId] || "Export Grade Polyethylene";

    return (
        <article className="group relative rounded-3xl border border-slate-200/90 bg-white p-4 shadow-sm hover:shadow-2xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div>
                {/* Product 4K Image Container with Zoom Effect */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100">
                    <img
                        src={imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Category pill */}
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-emerald-300 border border-emerald-500/30">
                        {category?.icon} {copy.name.split(" ").slice(0, 2).join(" ")}
                    </span>

                    {/* Spec Tag */}
                    <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-sm text-[11px] font-mono font-bold text-white">
                        {spec}
                    </span>
                </div>

                {/* Details */}
                <div className="pt-4 px-1">
                    <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition">
                        <Link href={href}>
                            {product.name}
                        </Link>
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600 line-clamp-2">
                        {product.shortDescription}
                    </p>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-3.5 border-t border-slate-100 px-1 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500 font-semibold">
                    MOQ: <strong className="text-slate-800">{product.moq}</strong>
                </span>
                <Link
                    href={`${localePath(locale, "/quote")}?product=${product.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 hover:text-emerald-700 group-hover:translate-x-0.5 transition-transform"
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
            className="group relative rounded-3xl border border-slate-200/90 bg-white p-4 shadow-sm hover:shadow-2xl hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between overflow-hidden"
        >
            <div>
                {/* 4K Photographic Visual */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100">
                    <img
                        src={imageUrl}
                        alt={copy.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-70 group-hover:opacity-40 transition-opacity" />

                    <span className="absolute top-3 left-3 text-2xl drop-shadow-md">
                        {category.icon}
                    </span>

                    <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-sm text-[10px] font-mono font-bold text-emerald-300 border border-emerald-500/30">
                        {spec}
                    </span>
                </div>

                <div className="pt-4 px-1">
                    <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">
                        {copy.name}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600 line-clamp-2">
                        {copy.blurb}
                    </p>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 px-1 flex items-center justify-between text-xs font-bold text-emerald-600">
                <span>Explore Technical Specs</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
        </Link>
    );
}
