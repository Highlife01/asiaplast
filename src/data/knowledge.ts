export type KnowledgeSection = {
    heading: string;
    paragraphs: string[];
};

export type KnowledgeArticle = {
    slug: string;
    title: string;
    excerpt: string;
    readTime: string;
    updated: string;
    sections: KnowledgeSection[];
};

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
    {
        slug: "garbage-bag-gauge-guide",
        title: "Garbage Bag Gauge Guide: Choosing the Right Micron",
        excerpt:
            "Why thickness alone doesn't define strength — resin blend, sealing and bag geometry matter as much as microns.",
        readTime: "5 min",
        updated: "2026-10-13",
        sections: [
            {
                heading: "Micron is a starting point, not a strength rating",
                paragraphs: [
                    "Buyers often lock a micron (or mil) number into a tender as if it were tensile strength. Gauge is the nominal wall thickness of the film. It does not tell you dart impact, tear, elongation or seal integrity. Two 20 µm bags can perform very differently if one is virgin LLDPE blend and the other is high-recycle, poorly mixed film.",
                    "For wholesale programs, specify gauge together with resin family (HDPE, LDPE, LLDPE or blend), dart drop (g), tear (N) and seal type. Then lock a technical sheet per SKU so each production run is measured against the same numbers."
                ]
            },
            {
                heading: "Typical starting ranges",
                paragraphs: [
                    "Household kitchen liners often sit in the 12–20 µm range with LLDPE or HDPE/LLDPE blends. Office and light commercial can liners are commonly 16–25 µm. Heavy-duty industrial and municipal sacks usually start around 30 µm and can exceed 80 µm for demolition or wet organic waste.",
                    "Star-seal construction can allow a slightly lower gauge for the same load because the base distributes stress. Flat-seal bags of the same micron will often fail first at the bottom corners under wet weight. Do not swap seal type without re-testing the SKU."
                ]
            },
            {
                heading: "What to put on the RFQ",
                paragraphs: [
                    "Send width, length, open or gusseted, drawstring or not, colour, printing, packing (rolls vs sheets, bags per roll, rolls per carton), target micron ± tolerance, and destination climate. Tropical humidity and high-fill wet waste need more dart impact than dry office waste at the same gauge.",
                    "ASIAPLAST quotes against a locked specification, not a catalogue micron. If you only have a competitor sample, send it with your target volume and we will reverse-spec and propose an equivalent or stronger film."
                ]
            }
        ]
    },
    {
        slug: "star-seal-vs-flat-seal",
        title: "Star Seal vs Flat Seal: Which Base for Which Waste?",
        excerpt: "The engineering difference between seal types and when the extra cost of star seal pays for itself.",
        readTime: "4 min",
        updated: "2026-10-13",
        sections: [
            {
                heading: "How the two bases actually fail",
                paragraphs: [
                    "A flat (or gusseted) seal joins two or more film layers in a straight line across the bottom. Load concentrates at the two outer corners. Sharp or wet waste finds those corners first. A star seal gathers the tube into a multi-panel base so the bottom is more three-dimensional and the stress is shared.",
                    "Star seal also tends to sit flatter in a bin, which reduces side-wall stretch on first fill. That is why many retail can-liner programs default to star seal even when the micron is modest."
                ]
            },
            {
                heading: "When flat seal is still the right call",
                paragraphs: [
                    "Flat and gusseted seals remain common for large industrial sacks, square cartons of folded bags, and SKUs where the buyer already has a packing pattern built around a rectangular base. They are also simpler to inspect on a line and can be cheaper at very high gauges where the film itself carries the load.",
                    "If your waste is dry, bulky and not dropped from height, a well-specified flat-seal HDPE sack often outperforms a thin star-seal liner on cost per kilo of waste moved."
                ]
            },
            {
                heading: "Specifying it in the order",
                paragraphs: [
                    "Write the seal type on the technical sheet: star, flat, gusseted, or bottom-weld with side gusset. Add leak test method if the bag will hold liquids. Do not assume “star seal” from a product photo — packing photos can hide a gusseted fold.",
                    "For mixed retail + industrial tenders, run two SKUs rather than forcing one seal onto both jobs. The extra SKU usually costs less than field failures and claims."
                ]
            }
        ]
    },
    {
        slug: "container-loading-bin-liners",
        title: "Container Loading for Bin Liners: Packing Math",
        excerpt: "How carton dimensions, bale compression and pallet patterns decide how many bags fit a 40' HQ.",
        readTime: "6 min",
        updated: "2026-10-13",
        sections: [
            {
                heading: "The container is sold by volume, not by bag count",
                paragraphs: [
                    "A 40' high cube is roughly 76 m³ of usable volume once you allow for pallet height, dunnage and door loss. Bag count is a result of carton size, bags per carton, and how those cartons cube on the pallet. Changing micron by 2 µm can change roll diameter enough to drop a layer and lose thousands of bags per box.",
                    "Always quote packing as: bags per roll (or pack), rolls per carton, carton L×W×H, cartons per pallet, pallets per 20' / 40' HQ. Without those six numbers, landed cost per bag is guesswork."
                ]
            },
            {
                heading: "Compression vs presentation",
                paragraphs: [
                    "Industrial liners can be compressed harder than retail-ready printed rolls. Retail cartons need crush resistance for supermarket DCs; over-compression marks print and collapses display packs. Private-label programs usually lock both inner pack artwork and outer carton burst strength.",
                    "If you need maximum bags per HQ, ask for export packing (higher compression, plainer cartons). If you need shelf-ready, accept a lower bag count and price the freight accordingly."
                ]
            },
            {
                heading: "What we calculate on an RFQ",
                paragraphs: [
                    "Give destination port, preferred Incoterm, palletised or floor-loaded, and whether you can receive 40' HQ. We return bag count per container, estimated gross weight, and lead time from film to FOB. Weights matter for CIF quotes — film density and core type move the scale more than buyers expect.",
                    "Do not mix SKUs in one carton unless the DC can split them. Mixed cartons look efficient on a spreadsheet and create receiving errors at the warehouse."
                ]
            }
        ]
    },
    {
        slug: "private-label-checklist",
        title: "Private Label Garbage Bags: A Retailer's Checklist",
        excerpt: "From artwork files to barcode placement — everything to prepare before your first own-brand order.",
        readTime: "5 min",
        updated: "2026-10-13",
        sections: [
            {
                heading: "Lock the SKU before you lock the print",
                paragraphs: [
                    "Print sits on a film that already has a width, gauge, colour, seal and pack count. Changing bags-per-roll after artwork is approved forces a reprint of the pack panel (count, dimensions, barcode). Approve the technical sheet first, then the dieline.",
                    "Send vector artwork (AI/PDF) with fonts outlined, pantone or CMYK targets, and a 1:1 mock-up of the roll band or carton. Low-resolution JPG mock-ups are not production files."
                ]
            },
            {
                heading: "Barcode, claims and language",
                paragraphs: [
                    "Retailers need GTIN placement, quiet zones and contrast that survive film flex. Avoid putting barcodes on high-stretch zones near the drawstring. Sustainability claims (recycled content, recyclable) must match the actual resin blend and destination labelling rules — we will not print a claim the film cannot support.",
                    "Multi-language packs are normal for export private label. Freeze copy before plate or cylinder work. Last-minute legal text changes are the most common cause of delayed first shipments."
                ]
            },
            {
                heading: "First-order practicalities",
                paragraphs: [
                    "Typical private-label MOQ is one 20' container per printed SKU, sometimes higher for complex colour. Allow time for a printed sample or a short pilot run if the brand is new. Carton markings, inner tickets and master labels should match the DC ASN format.",
                    "Send this checklist with the RFQ: SKU table, packing, artwork status, barcode owner, target ship window, and who signs the locked sheet. Incomplete briefs are the main reason own-brand launches slip."
                ]
            }
        ]
    },
    {
        slug: "color-coded-waste-segregation",
        title: "Color-Coded Waste Segregation in Healthcare & Hospitality",
        excerpt: "Common color conventions for clinical, recyclable and organic streams across export markets.",
        readTime: "4 min",
        updated: "2026-10-13",
        sections: [
            {
                heading: "Colour is a process control, not decoration",
                paragraphs: [
                    "Hospitals, hotels and FM contractors use bag colour so staff sort waste without reading a spec sheet. The colour must be consistent batch to batch. A ‘yellow’ that drifts toward amber will be rejected by a clinical waste contractor even if the film is strong enough.",
                    "Specify colour by a reference (pantone or a retained master sample), not by a word. Pigment loading also affects opacity and, at high levels, can change dart impact slightly — we adjust the blend so strength stays on spec."
                ]
            },
            {
                heading: "Conventions differ by market",
                paragraphs: [
                    "There is no single global colour code. Clinical infectious waste is often yellow or orange; sharps and cytotoxic streams may be purple or yellow with markings; general landfill black or grey; recycling clear, blue or green; food/organic often green or brown. Always follow the destination facility’s written protocol, not a generic internet chart.",
                    "Some buyers also require printed hazard text or biohazard marks. Those are graphics on the technical sheet, not an extra afterthought at packing."
                ]
            },
            {
                heading: "How we quote coloured programs",
                paragraphs: [
                    "Send the colour map (stream → colour → gauge → volume), whether bags are printed, and whether you need identical dimensions across colours so bins stay interchangeable. Mixed-colour containers are normal; we palletise by SKU unless you ask for rainbow pallets for kit assembly.",
                    "If you are replacing an incumbent, send a sample of each colour. Matching both hue and mechanical spec avoids a dual inventory during the switch."
                ]
            }
        ]
    },
    {
        slug: "incoterms-for-plastic-importers",
        title: "Incoterms for Plastic Importers: EXW to DAP Explained",
        excerpt: "What each delivery term means for your landed cost, risk and customs clearance workload.",
        readTime: "7 min",
        updated: "2026-10-13",
        sections: [
            {
                heading: "The term decides who owns freight and risk",
                paragraphs: [
                    "Incoterms are not payment terms. They allocate export packing, origin handling, main freight, insurance, destination charges and import clearance. Garbage bags are light for their volume, so ocean freight per kilo is sensitive to cube. The wrong term makes a cheap FOB look expensive at the warehouse door.",
                    "ASIAPLAST commonly quotes EXW, FOB, CIF and DAP. We state the named place on the offer. A CIF without a named port is not a complete quote."
                ]
            },
            {
                heading: "What each common term actually covers",
                paragraphs: [
                    "EXW: you collect at our works. You arrange export formalities unless we agree to assist. Useful if you already have a forwarder in Turkey. FOB: we deliver on board at the named port; you take ocean freight and everything after. CIF: we arrange freight and minimum insurance to the named destination port; you still handle import clearance and on-carriage. DAP: we deliver to the named place, ready for unloading; duties and import GST/VAT remain yours unless the contract says otherwise.",
                    "Insurance on CIF is the Incoterms minimum unless you ask for a higher cover. High-value private-label first shipments often need an explicit insurance clause, not the default."
                ]
            },
            {
                heading: "How to choose on the RFQ",
                paragraphs: [
                    "If you have a strong forwarder and want control of the ocean rate, FOB is usually cleaner. If you want a single landed number to a port, ask CIF. If your team does not want to touch origin logistics, ask DAP to a warehouse — and send the full delivery address and receiving constraints (40' HQ, tail-lift, booking slot).",
                    "Always pair the Incoterm with volume (pallets or containers), ready date, and whether phytosanitary or packing declarations are needed. We return a complete offer: film spec, packing list math, lead time and the chosen term — prices stay on request, never on the public site."
                ]
            }
        ]
    }
];

export function getKnowledgeArticles(): KnowledgeArticle[] {
    return KNOWLEDGE_ARTICLES;
}

export function getKnowledgeArticle(slug: string): KnowledgeArticle | undefined {
    return KNOWLEDGE_ARTICLES.find((article) => article.slug === slug);
}

export function getRelatedKnowledge(slug: string, limit = 3): KnowledgeArticle[] {
    return KNOWLEDGE_ARTICLES.filter((article) => article.slug !== slug).slice(0, limit);
}
