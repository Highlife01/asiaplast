import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/dashboard", "/dashboard/", "/admin", "/admin/", "/api/"]
            },
            { userAgent: "GPTBot", allow: "/", disallow: ["/dashboard", "/dashboard/", "/admin", "/admin/", "/api/"] },
            { userAgent: "OAI-SearchBot", allow: "/", disallow: ["/dashboard", "/dashboard/", "/admin", "/admin/", "/api/"] },
            { userAgent: "PerplexityBot", allow: "/", disallow: ["/dashboard", "/dashboard/", "/admin", "/admin/", "/api/"] },
            { userAgent: "Google-Extended", allow: "/", disallow: ["/dashboard", "/dashboard/", "/admin", "/admin/", "/api/"] }
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL
    };
}
