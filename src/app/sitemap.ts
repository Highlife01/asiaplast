import type { MetadataRoute } from "next";
import { SEED_PRODUCTS } from "@/data/catalog";
import { SITE_URL } from "@/lib/config";
import { ACTIVE_LOCALES } from "@/lib/i18n/locales";
import { getProducts } from "@/lib/repo";
import { localePath, localizedSlug } from "@/lib/seo";

const STATIC_PATHS = [
    { path: "/", priority: 1, changeFrequency: "weekly" as const },
    { path: "/products", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/export", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/private-label", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/quote", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/faq", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.2, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.2, changeFrequency: "yearly" as const }
];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();
    const entries: MetadataRoute.Sitemap = [];

    for (const p of STATIC_PATHS) {
        for (const locale of ACTIVE_LOCALES) {
            entries.push({
                url: `${SITE_URL}${localePath(locale, p.path)}`,
                lastModified: now,
                changeFrequency: p.changeFrequency,
                priority: p.priority
            });
        }
    }

    const slugs = new Set<string>(SEED_PRODUCTS.map((p) => p.slug));
    try {
        for (const product of await getProducts()) slugs.add(product.slug);
    } catch {
        /* keep seed slugs */
    }

    for (const slug of slugs) {
        for (const locale of ACTIVE_LOCALES) {
            entries.push({
                url: `${SITE_URL}${localePath(locale, `/products/${localizedSlug(slug, locale)}`)}`,
                lastModified: now,
                changeFrequency: "weekly",
                priority: 0.8
            });
        }
    }

    return entries;
}
