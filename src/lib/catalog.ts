import { CATEGORIES, SEED_PRODUCTS, type SeedProduct } from "@/data/catalog";
import { getProductBySlug, getProducts, resolveProductSlugRedirect, type ProductDoc } from "@/lib/repo";
import { englishSlug } from "@/lib/seo";
import type { Locale } from "@/lib/i18n/locales";

if (typeof window !== "undefined") {
    throw new Error("catalog module can only be imported on the server.");
}

function localizeProduct(d: ProductDoc, locale?: Locale): SeedProduct {
    const tr = locale && d.translations?.[locale] ? d.translations[locale] : undefined;
    return {
        id: d.id,
        slug: d.slug,
        active: d.active,
        categoryId: d.categoryId,
        name: tr?.name?.trim() || d.name,
        shortDescription: tr?.shortDescription?.trim() || d.shortDescription,
        description: tr?.description?.trim() || d.description,
        imageUrl: d.imageUrl || null,
        moq: d.moq || "On request",
        sortOrder: d.sortOrder,
        specs: d.specs,
        translations: d.translations
    };
}

export async function loadCatalogProducts(locale?: Locale): Promise<SeedProduct[]> {
    try {
        const docs = await getProducts({ includeInactive: false });
        return docs.map((d) => localizeProduct(d, locale));
    } catch {
        return SEED_PRODUCTS;
    }
}

export async function loadCatalogProductWithRedirect(
    slug: string,
    locale?: Locale
): Promise<{ product: SeedProduct | null; redirectToSlug: string | null }> {
    const key = englishSlug(slug);
    try {
        const doc = await getProductBySlug(key);
        if (doc) {
            return { product: localizeProduct(doc, locale), redirectToSlug: null };
        }
        const redirected = await resolveProductSlugRedirect(key);
        if (redirected) {
            return { product: null, redirectToSlug: redirected };
        }
    } catch {
        // Fallback if Firestore transiently unavailable
    }
    return { product: null, redirectToSlug: null };
}

export async function loadCatalogProduct(slug: string, locale?: Locale): Promise<SeedProduct | null> {
    const { product } = await loadCatalogProductWithRedirect(slug, locale);
    return product;
}

export function productLabelFor(id: string | null | undefined): string {
    if (!id) return "";
    const key = englishSlug(id);
    return (
        SEED_PRODUCTS.find((p) => p.slug === key)?.name ||
        CATEGORIES.find((c) => c.id === key)?.en.name ||
        key
    );
}
