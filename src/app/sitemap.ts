import type { MetadataRoute } from "next";
import { SEED_PRODUCTS } from "@/data/catalog";
import { getKnowledgeArticles } from "@/data/knowledge";
import { SITE_URL } from "@/lib/config";
import { ACTIVE_LOCALES } from "@/lib/i18n/locales";
import { getProducts } from "@/lib/repo";
import { alternatesFor, localePath, localizedSlug } from "@/lib/seo";

const STATIC_PATHS = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/products", priority: 0.95, changeFrequency: "weekly" as const },
    { path: "/quote", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/private-label", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/export", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/about", priority: 0.75, changeFrequency: "monthly" as const },
    { path: "/knowledge", priority: 0.75, changeFrequency: "weekly" as const },
    { path: "/faq", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const }
];

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();
    const entries: MetadataRoute.Sitemap = [];

    for (const p of STATIC_PATHS) {
        const alternates = alternatesFor(p.path);
        for (const locale of ACTIVE_LOCALES) {
            entries.push({
                url: `${SITE_URL}${localePath(locale, p.path)}`,
                lastModified: now,
                changeFrequency: p.changeFrequency,
                priority: locale === "tr" || locale === "en" ? p.priority : Number((p.priority * 0.95).toFixed(2)),
                alternates
            });
        }
    }

    const slugDates = new Map<string, Date>();
    for (const seed of SEED_PRODUCTS) {
        slugDates.set(seed.slug, now);
    }
    try {
        for (const product of await getProducts()) {
            const updated = product.updatedAt ? new Date(product.updatedAt) : now;
            slugDates.set(product.slug, Number.isNaN(updated.getTime()) ? now : updated);
        }
    } catch {
        /* keep seed slugs */
    }

    for (const [slug, lastMod] of slugDates.entries()) {
        const alternates = alternatesFor(`/products/${slug}`);
        for (const locale of ACTIVE_LOCALES) {
            entries.push({
                url: `${SITE_URL}${localePath(locale, `/products/${localizedSlug(slug, locale)}`)}`,
                lastModified: lastMod,
                changeFrequency: "weekly",
                priority: 0.85,
                alternates
            });
        }
    }

    for (const article of getKnowledgeArticles()) {
        const articlePath = `/knowledge/${article.slug}`;
        const alternates = alternatesFor(articlePath);
        const articleDate = article.updated ? new Date(article.updated) : now;
        const lastMod = Number.isNaN(articleDate.getTime()) ? now : articleDate;
        for (const locale of ACTIVE_LOCALES) {
            entries.push({
                url: `${SITE_URL}${localePath(locale, articlePath)}`,
                lastModified: lastMod,
                changeFrequency: "monthly",
                priority: 0.7,
                alternates
            });
        }
    }

    return entries;
}
