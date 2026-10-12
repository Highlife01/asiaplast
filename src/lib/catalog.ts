import "server-only";
import { CATEGORIES, getLocalizedProducts, getLocalizedProduct, type SeedProduct } from "@/data/catalog";
import { getProductBySlug, getProducts } from "@/lib/repo";
import { englishSlug } from "@/lib/seo";
import type { Locale } from "@/lib/i18n/locales";

export async function loadCatalogProducts(locale?: Locale): Promise<SeedProduct[]> {
    const localizedSeed = getLocalizedProducts(locale);
    try {
        const docs = await getProducts();
        if (docs.length) {
            return docs.map((d) => {
                const seedMatch = localizedSeed.find((s) => s.slug === d.slug);
                return {
                    slug: d.slug,
                    categoryId: d.categoryId,
                    name: seedMatch?.name || d.name,
                    shortDescription: seedMatch?.shortDescription || d.shortDescription,
                    description: seedMatch?.description || d.description,
                    standards: seedMatch?.standards,
                    moq: seedMatch?.moq || d.moq || "On request",
                    sortOrder: d.sortOrder,
                    specs: seedMatch?.specs || d.specs
                };
            });
        }
    } catch {
        /* Firestore unreachable — seed catalog */
    }
    return localizedSeed;
}

export async function loadCatalogProduct(slug: string, locale?: Locale): Promise<SeedProduct | null> {
    const key = englishSlug(slug);
    const localizedSeed = getLocalizedProduct(key, locale);
    try {
        const doc = await getProductBySlug(key);
        if (doc) {
            return {
                slug: doc.slug,
                categoryId: doc.categoryId,
                name: localizedSeed?.name || doc.name,
                shortDescription: localizedSeed?.shortDescription || doc.shortDescription,
                description: localizedSeed?.description || doc.description,
                standards: localizedSeed?.standards,
                moq: localizedSeed?.moq || doc.moq || "On request",
                sortOrder: doc.sortOrder,
                specs: localizedSeed?.specs || doc.specs
            };
        }
    } catch {
        /* fall back */
    }
    return localizedSeed;
}

export function productLabelFor(id: string | null | undefined, locale?: Locale): string {
    if (!id) return "";
    const key = englishSlug(id);
    const localized = getLocalizedProduct(key, locale);
    if (localized) return localized.name;
    const cat = CATEGORIES.find((c) => c.id === key);
    if (cat) {
        const l = (locale === "tr" || locale === "de" || locale === "fr" || locale === "ar") ? locale : "en";
        return cat[l]?.name || cat.en.name;
    }
    return key;
}
