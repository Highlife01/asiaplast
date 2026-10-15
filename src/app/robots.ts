import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

const DISALLOW_PRIVATE = ["/dashboard", "/dashboard/", "/admin", "/admin/", "/api/"];

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: DISALLOW_PRIVATE
            },
            {
                userAgent: ["Googlebot", "Googlebot-Image", "Bingbot", "Yandex"],
                allow: ["/", "/images/", "/icons/"],
                disallow: DISALLOW_PRIVATE
            },
            {
                userAgent: ["GPTBot", "OAI-SearchBot", "PerplexityBot", "Google-Extended", "ClaudeBot"],
                allow: "/",
                disallow: DISALLOW_PRIVATE
            }
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL
    };
}
