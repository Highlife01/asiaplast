/**
 * Product category definitions and seed catalog.
 * Categories here are the launch draft — the live catalog is managed in the
 * admin dashboard (Firestore `products` collection). Seed data doubles as the
 * build-time fallback so the site renders before Firestore is seeded.
 */

export type Category = {
    id: string;
    icon: string;
    en: { name: string; blurb: string };
};

export const CATEGORIES: Category[] = [
    {
        id: "heavy-duty",
        icon: "🛢️",
        en: {
            name: "Heavy Duty Garbage Bags",
            blurb: "High load-bearing sacks for construction sites, municipal sanitation and industrial waste streams."
        }
    },
    {
        id: "household",
        icon: "🏠",
        en: {
            name: "Household Garbage Bags",
            blurb: "Retail-ready rolls and T-shirt bags in small, medium and large sizes with color options."
        }
    },
    {
        id: "industrial-liners",
        icon: "🏭",
        en: {
            name: "Industrial Bin Liners",
            blurb: "Large-volume liners for factories, hotels, hospitals, restaurants and cleaning companies."
        }
    },
    {
        id: "drawstring",
        icon: "🎀",
        en: {
            name: "Drawstring Garbage Bags",
            blurb: "Convenient draw-tape closure bags for easy lifting and hygienic tying."
        }
    },
    {
        id: "star-seal",
        icon: "⭐",
        en: {
            name: "Star-Seal Garbage Bags",
            blurb: "Star-bottom seals distribute weight evenly — the professional choice for leak resistance."
        }
    },
    {
        id: "colored",
        icon: "🎨",
        en: {
            name: "Colored Garbage Bags",
            blurb: "Color-coded waste separation bags in blue, yellow, red, green and custom shades."
        }
    },
    {
        id: "custom-size",
        icon: "📐",
        en: {
            name: "Custom Size Trash Bags",
            blurb: "Made-to-order widths, lengths and gauges for non-standard bins and machinery."
        }
    },
    {
        id: "private-label",
        icon: "🏷️",
        en: {
            name: "Private Label Garbage Bags",
            blurb: "Your brand, print and carton — retail-ready packaging produced to your artwork."
        }
    }
];

export type SeedProduct = {
    id?: string;
    slug: string;
    active?: boolean;
    categoryId: string;
    name: string;
    shortDescription: string;
    description: string;
    imageUrl?: string | null;
    moq: string;
    sortOrder: number;
    specs: { label: string; value: string }[];
    translations?: Record<string, { name?: string; shortDescription?: string; description?: string }>;
};

export const SEED_PRODUCTS: SeedProduct[] = [
    {
        slug: "heavy-duty-garbage-bags",
        categoryId: "heavy-duty",
        name: "Heavy Duty Garbage Bags",
        shortDescription: "Puncture-resistant LDPE/HDPE sacks engineered for construction and industrial waste.",
        description:
            "Heavy duty garbage bags from ASIAPLAST are produced from virgin or recycled LDPE/HDPE blends with elevated gauge for maximum tear and puncture resistance. Every batch is gauge-controlled and seal-tested before packing. Available flat or on rolls, in black and custom colors, with optional print.",
        moq: "Negotiable per specification",
        sortOrder: 1,
        specs: [
            { label: "Material", value: "LDPE / HDPE / recycled blends" },
            { label: "Thickness", value: "40 – 200 micron (1.6 – 8.0 mil)" },
            { label: "Width", value: "50 – 150 cm" },
            { label: "Length", value: "70 – 250 cm" },
            { label: "Colors", value: "Black, grey, custom" },
            { label: "Sealing", value: "Star seal / flat seal / gusseted" },
            { label: "Packing", value: "Rolls or flat-packed in cartons" },
            { label: "Print", value: "Up to 6 colors flexo" }
        ]
    },
    {
        slug: "household-garbage-bags",
        categoryId: "household",
        name: "Household Garbage Bags",
        shortDescription: "Retail-ready rolls in S/M/L sizes with odor-controlled and color options.",
        description:
            "Household garbage bags are produced for private-label retail programs: draw rolls, T-shirt (vest) carrier bags and caddy liners. Consistent winding, clean perforation and strong bottom seals reduce in-store complaints and returns.",
        moq: "Negotiable per specification",
        sortOrder: 2,
        specs: [
            { label: "Material", value: "LDPE / recycled blends" },
            { label: "Thickness", value: "10 – 50 micron" },
            { label: "Sizes", value: "20L, 35L, 60L, 80L, 120L equivalents" },
            { label: "Formats", value: "Draw rolls, T-shirt bags, caddy liners" },
            { label: "Colors", value: "Black, blue, green, custom" },
            { label: "Packing", value: "Printed bags / display cartons" },
            { label: "Print", value: "Up to 6 colors flexo" }
        ]
    },
    {
        slug: "industrial-bin-liners",
        categoryId: "industrial-liners",
        name: "Industrial Bin Liners",
        shortDescription: "Large-volume liners sized for 240L–1100L containers and compactors.",
        description:
            "Industrial bin liners are sized to standard wheelie bins, dumpsters and compactors. Reinforced gussets and heavy gauges handle wet, sharp and compacted waste. Ideal for facility management, hospitality and municipal contracts.",
        moq: "Negotiable per specification",
        sortOrder: 3,
        specs: [
            { label: "Material", value: "LDPE / HDPE" },
            { label: "Thickness", value: "30 – 150 micron" },
            { label: "Fit", value: "240L, 660L, 1100L bins & compactors" },
            { label: "Colors", value: "Black, natural, color-coded" },
            { label: "Sealing", value: "Star seal / flat seal" },
            { label: "Packing", value: "Baled or cartoned" }
        ]
    },
    {
        slug: "drawstring-garbage-bags",
        categoryId: "drawstring",
        name: "Drawstring Garbage Bags",
        shortDescription: "Draw-tape closure bags for one-hand tying and odor containment.",
        description:
            "Drawstring garbage bags feature an integrated draw-tape rim that grips the bin rim and closes with one pull. A premium retail format popular in households, offices and healthcare settings.",
        moq: "Negotiable per specification",
        sortOrder: 4,
        specs: [
            { label: "Material", value: "LDPE" },
            { label: "Thickness", value: "15 – 40 micron" },
            { label: "Closure", value: "Integrated draw-tape rim" },
            { label: "Sizes", value: "20L – 120L equivalents" },
            { label: "Colors", value: "Custom" },
            { label: "Packing", value: "Rolls in printed bags" }
        ]
    },
    {
        slug: "star-seal-garbage-bags",
        categoryId: "star-seal",
        name: "Star-Seal Garbage Bags",
        shortDescription: "Star-bottom construction eliminates seam stress and leaks.",
        description:
            "Star-seal garbage bags are sealed at the base in a star pattern, distributing weight evenly across the seal and eliminating the weak corner found in flat-seal bags. The professional janitorial and sanitation standard.",
        moq: "Negotiable per specification",
        sortOrder: 5,
        specs: [
            { label: "Material", value: "LDPE / HDPE" },
            { label: "Thickness", value: "20 – 100 micron" },
            { label: "Base", value: "Star seal" },
            { label: "Sizes", value: "60L – 500L equivalents" },
            { label: "Colors", value: "Black, natural, custom" },
            { label: "Packing", value: "Coreless rolls or flat" }
        ]
    },
    {
        slug: "colored-garbage-bags",
        categoryId: "colored",
        name: "Colored Garbage Bags",
        shortDescription: "Color-coded bags for waste separation programs.",
        description:
            "Colored garbage bags support waste-separation schemes in municipalities, healthcare and hospitality: blue for recycling, yellow for clinical, red for hazardous streams, and any custom shade for brand programs.",
        moq: "Negotiable per specification",
        sortOrder: 6,
        specs: [
            { label: "Material", value: "LDPE / HDPE" },
            { label: "Thickness", value: "15 – 80 micron" },
            { label: "Standard colors", value: "Blue, yellow, red, green, opaque" },
            { label: "Custom colors", value: "Pantone matching available" },
            { label: "Sizes", value: "20L – 500L equivalents" },
            { label: "Packing", value: "Rolls or flat-packed" }
        ]
    },
    {
        slug: "custom-size-trash-bags",
        categoryId: "custom-size",
        name: "Custom Size Trash Bags",
        shortDescription: "Made-to-measure gauges, widths and lengths for any bin or machine.",
        description:
            "Custom size trash bags are produced to your drawing: non-standard widths, lengths, gauges, gussets, apertures and sealing. Send the bin dimensions or a sample and receive a fit-verified proposal.",
        moq: "Negotiable per specification",
        sortOrder: 7,
        specs: [
            { label: "Material", value: "LDPE / HDPE / blends" },
            { label: "Thickness", value: "10 – 200 micron" },
            { label: "Dimensions", value: "Made to order" },
            { label: "Features", value: "Gussets, apertures, printing, venting" },
            { label: "Sampling", value: "Fit-verified pre-production samples" }
        ]
    },
    {
        slug: "private-label-garbage-bags",
        categoryId: "private-label",
        name: "Private Label Garbage Bags",
        shortDescription: "Your brand on retail-ready rolls, printed bags and cartons.",
        description:
            "Private label garbage bags give retailers and importers a complete own-brand program: artwork printing on bags and cartons, custom counts per roll, display-ready packing and barcode labeling.",
        moq: "Negotiable per specification",
        sortOrder: 8,
        specs: [
            { label: "Brand print", value: "Up to 6 colors flexo" },
            { label: "Carton", value: "Custom printed cartons & labels" },
            { label: "Counts", value: "Custom bags-per-roll / rolls-per-carton" },
            { label: "Barcodes", value: "EAN / UPC labeling" },
            { label: "Artwork support", value: "Pre-press proofs provided" }
        ]
    }
];
