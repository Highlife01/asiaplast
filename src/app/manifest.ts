import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "ASIAPLAST — Global Garbage Bags & Liners Manufacturer",
        short_name: "ASIAPLAST",
        description: "Wholesale garbage bags, industrial bin liners, and private-label OEM manufacturing export portal.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait-primary",
        background_color: "#0a192f",
        theme_color: "#0284c7",
        categories: ["business", "productivity", "shopping"],
        icons: [
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
                icons: [{ src: "/icon.svg", sizes: "96x96" }]
            },
            {
                name: "Product Catalog",
                short_name: "Products",
                description: "Browse heavy-duty, medical and industrial liners",
                url: "/products",
                icons: [{ src: "/icon.svg", sizes: "96x96" }]
            },
            {
                name: "Direct Contact Desk",
                short_name: "Contact",
                description: "Reach our global export sales office",
                url: "/contact",
                icons: [{ src: "/icon.svg", sizes: "96x96" }]
            }
        ]
    };
}
