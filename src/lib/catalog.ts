import "server-only";
import { CATEGORIES, SEED_PRODUCTS, type SeedProduct } from "@/data/catalog";
import { getProductBySlug, getProducts } from "@/lib/repo";
import { englishSlug } from "@/lib/seo";

export async function loadCatalogProducts(): Promise<SeedProduct[]> {
    try {
        const docs = await getProducts();
        if (docs.length) {
            return docs.map((d) => ({
                slug: d.slug,
                categoryId: d.categoryId,
                name: d.name,
                shortDescription: d.shortDescription,
                description: d.description,
                moq: d.moq || "On request",
                sortOrder: d.sortOrder,
                specs: d.specs
            }));
        }
    } catch {
        /* Firestore unreachable — seed catalog */
    }
    return SEED_PRODUCTS;
}

export async function loadCatalogProduct(slug: string): Promise<SeedProduct | null> {
    const key = englishSlug(slug);
    try {
        const doc = await getProductBySlug(key);
        if (doc) {
            return {
                slug: doc.slug,
                categoryId: doc.categoryId,
                name: doc.name,
                shortDescription: doc.shortDescription,
                description: doc.description,
                moq: doc.moq || "On request",
                sortOrder: doc.sortOrder,
                specs: doc.specs
            };
        }
    } catch {
        /* fall back */
    }
    return SEED_PRODUCTS.find((p) => p.slug === key) || null;
}

export function productLabelFor(id: string | null | undefined): string {
    if (!id) return "";
    const key = englishSlug(id);
    return SEED_PRODUCTS.find((p) => p.slug === key)?.name || CATEGORIES.find((c) => c.id === key)?.en.name || key;
}
