import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        id: "/",
        name: "ASIAPLAST — Global Garbage Bags & Liners Manufacturer",
        short_name: "ASIAPLAST",
        description: "Wholesale garbage bags, industrial bin liners, and private-label OEM manufacturing export portal.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        display_override: ["standalone", "minimal-ui"],
        orientation: "portrait-primary",
        background_color: "#0b1329",
        theme_color: "#10b981",
        lang: "en",
        dir: "auto",
        categories: ["business", "productivity", "shopping"],
        icons: [
            {
                src: "/favicon.ico",
                sizes: "16x16 32x32 48x48",
                type: "image/x-icon",
                purpose: "any"
            },
            {
                src: "/favicon-48x48.png",
                sizes: "48x48",
                type: "image/png",
                purpose: "any"
            },
            {
                src: "/apple-touch-icon.png",
                sizes: "180x180",
                type: "image/png",
                purpose: "any"
            },
            {
                src: "/icons/icon-192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any"
            },
            {
                src: "/icons/icon-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any"
            },
            {
                src: "/icons/maskable-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable"
            },
            {
                src: "/icon.svg",
                sizes: "any",
                type: "image/svg+xml",
                purpose: "any"
            },
            {
                src: "/icons/icon-192.svg",
                sizes: "192x192",
                type: "image/svg+xml",
                purpose: "any"
            },
            {
                src: "/icons/icon-512.svg",
                sizes: "512x512",
                type: "image/svg+xml",
                purpose: "any"
            },
            {
                src: "/icons/maskable-512.svg",
                sizes: "512x512",
                type: "image/svg+xml",
                purpose: "maskable"
            }
        ],
        shortcuts: [
            {
                name: "Request Quote (RFQ)",
                short_name: "RFQ",
                description: "Get container-scale pricing and specification options",
                url: "/quote",
                icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }]
            },
            {
                name: "Product Catalog",
                short_name: "Products",
                description: "Browse heavy-duty, medical and industrial liners",
                url: "/products",
                icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }]
            },
            {
                name: "Direct Contact Desk",
                short_name: "Contact",
                description: "Reach our global export sales office",
                url: "/contact",
                icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }]
            }
        ]
    };
}

