import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin", "/admin/", "/api/"]
            },
            // Explicitly welcome major AI crawlers (GEO): they may read public content.
            { userAgent: "GPTBot", allow: "/" },
            { userAgent: "OAI-SearchBot", allow: "/" },
            { userAgent: "PerplexityBot", allow: "/" },
            { userAgent: "Google-Extended", allow: "/" }
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL
    };
}
