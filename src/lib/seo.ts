import { COMPANY, DEFAULT_COMPANY_SETTINGS, SITE_URL } from "./config";
import { ACTIVE_LOCALES, DEFAULT_LOCALE, LOCALE_META, type Locale } from "./i18n/locales";

export type MetaInput = {
    title: string;
    description: string;
    path: string; // path WITHOUT locale prefix, e.g. "/products/heavy-duty"
    locale: Locale;
    ogImage?: string;
    keywords?: string[];
    noindex?: boolean;
};

const OG_LOCALE_MAP: Partial<Record<Locale, string>> = {
    en: "en_US",
    tr: "tr_TR",
    de: "de_DE",
    fr: "fr_FR",
    ar: "ar_SA"
};

const DE_SLUGS: Record<string, string> = {
    "heavy-duty-garbage-bags": "schwere-muellbeutel",
    "household-garbage-bags": "muellbeutel-fuer-haushalte",
    "industrial-bin-liners": "industrielle-abfallsaecke",
    "drawstring-garbage-bags": "muellbeutel-mit-zugband",
    "star-seal-garbage-bags": "muellbeutel-mit-sternboden",
    "colored-garbage-bags": "farbige-muellbeutel",
    "custom-size-trash-bags": "muellbeutel-nach-mass",
    "private-label-garbage-bags": "private-label-muellbeutel"
};

/** Localized URL slug per product (English slug used as canonical key elsewhere). */
export function localizedSlug(enSlug: string, locale: Locale): string {
    if (locale === "de") return DE_SLUGS[enSlug] || enSlug;
    return enSlug;
}

const SLUG_TO_EN: Record<string, string> = Object.fromEntries(
    Object.entries(DE_SLUGS).map(([en, de]) => [de, en])
);

export function englishSlug(slug: string): string {
    return SLUG_TO_EN[slug] || slug;
}

/** Resolve localized path including product slug translation when applicable. */
export function localizedRoutePath(locale: Locale, path: string): string {
    const clean = path.startsWith("/") ? path : `/${path}`;
    if (clean.startsWith("/products/")) {
        const rawSlug = clean.slice("/products/".length).split("/")[0] || "";
        if (rawSlug) {
            const canonicalSlug = englishSlug(rawSlug);
            return localePath(locale, `/products/${localizedSlug(canonicalSlug, locale)}`);
        }
    }
    return localePath(locale, clean);
}

/** English has no prefix (`/products`). Other locales use `/tr`, `/de`, `/fr`, `/ar`. */
export function localePath(locale: Locale, path: string): string {
    const clean = path.startsWith("/") ? path : `/${path}`;
    if (locale === DEFAULT_LOCALE) return clean;
    return `/${locale}${clean === "/" ? "" : clean}`;
}

export function absoluteUrl(pathWithLocale: string): string {
    if (pathWithLocale.startsWith("http://") || pathWithLocale.startsWith("https://")) {
        return pathWithLocale;
    }
    return `${SITE_URL}${pathWithLocale.startsWith("/") ? pathWithLocale : `/${pathWithLocale}`}`;
}

/** hreflang alternates including x-default (points to English). */
export function alternatesFor(path: string): { languages: Record<string, string> } {
    const languages: Record<string, string> = {};
    for (const l of ACTIVE_LOCALES) {
        languages[LOCALE_META[l].hreflang] = absoluteUrl(localizedRoutePath(l, path));
    }
    languages["x-default"] = absoluteUrl(localizedRoutePath("en", path));
    return { languages };
}

export function buildMetadata(input: MetaInput) {
    const canonical = absoluteUrl(localizedRoutePath(input.locale, input.path));
    const ogImageUrl = absoluteUrl(input.ogImage || "/og-image.svg");
    const ogLocale = OG_LOCALE_MAP[input.locale] || "en_US";
    const alternateLocales = ACTIVE_LOCALES.filter((l) => l !== input.locale).map((l) => OG_LOCALE_MAP[l] || l);

    return {
        title: input.title,
        description: input.description,
        keywords: input.keywords,
        alternates: {
            canonical: input.noindex ? undefined : canonical,
            languages: input.noindex ? undefined : alternatesFor(input.path).languages
        },
        robots: input.noindex
            ? { index: false, follow: false }
            : {
                  index: true,
                  follow: true,
                  googleBot: {
                      index: true,
                      follow: true,
                      "max-video-preview": -1,
                      "max-image-preview": "large" as const,
                      "max-snippet": -1
                  }
              },
        openGraph: {
            title: input.title,
            description: input.description,
            url: canonical,
            siteName: "ASIAPLAST",
            locale: ogLocale,
            alternateLocale: alternateLocales,
            type: "website" as const,
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: input.title
                }
            ]
        },
        twitter: {
            card: "summary_large_image" as const,
            title: input.title,
            description: input.description,
            images: [ogImageUrl]
        }
    };
}

export function organizationJsonLd() {
    return {
        "@context": "https://schema.org",
        "@type": ["Organization", "Manufacturer"],
        "@id": `${SITE_URL}/#organization`,
        name: "ASIAPLAST",
        legalName: DEFAULT_COMPANY_SETTINGS.legalName,
        url: SITE_URL,
        logo: `${SITE_URL}/icon.svg`,
        image: `${SITE_URL}/og-image.svg`,
        description:
            "Global garbage bags manufacturer and exporter: wholesale trash bags, industrial bin liners and private-label packaging solutions.",
        email: COMPANY.email,
        telephone: DEFAULT_COMPANY_SETTINGS.phone,
        address: {
            "@type": "PostalAddress",
            addressLocality: DEFAULT_COMPANY_SETTINGS.city,
            addressCountry: "TR"
        },
        areaServed: "Worldwide",
        contactPoint: {
            "@type": "ContactPoint",
            contactType: "sales",
            telephone: DEFAULT_COMPANY_SETTINGS.phone,
            email: COMPANY.email,
            availableLanguage: ACTIVE_LOCALES.map((l) => LOCALE_META[l].name)
        }
    };
}

export function websiteJsonLd(locale: Locale = DEFAULT_LOCALE) {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "ASIAPLAST",
        alternateName: "AsiaPlast Plastik ve Ambalaj",
        url: SITE_URL,
        inLanguage: LOCALE_META[locale].hreflang,
        publisher: {
            "@id": `${SITE_URL}/#organization`
        }
    };
}

export function productJsonLd(p: {
    name: string;
    description: string;
    slug: string;
    image?: string;
    locale?: Locale;
}) {
    const locale = p.locale ?? DEFAULT_LOCALE;
    const canonicalSlug = englishSlug(p.slug);
    return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.name,
        sku: canonicalSlug,
        description: p.description,
        image: p.image ? [absoluteUrl(p.image)] : [`${SITE_URL}/og-image.svg`],
        category: "Garbage Bags & Bin Liners",
        brand: { "@type": "Brand", name: "ASIAPLAST" },
        manufacturer: { "@id": `${SITE_URL}/#organization` },
        url: absoluteUrl(localePath(locale, `/products/${localizedSlug(canonicalSlug, locale)}`))
        // No Offer markup: B2B quotation-based sales (prices on request).
    };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((it, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: it.name,
            item: absoluteUrl(it.path)
        }))
    };
}

export function articleJsonLd(a: { title: string; description: string; slug: string; dateModified?: string; locale?: Locale }) {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: a.title,
        description: a.description,
        dateModified: a.dateModified,
        inLanguage: LOCALE_META[a.locale ?? DEFAULT_LOCALE].hreflang,
        author: { "@type": "Organization", name: "ASIAPLAST", url: SITE_URL },
        publisher: { "@id": `${SITE_URL}/#organization` },
        url: absoluteUrl(localePath(a.locale ?? DEFAULT_LOCALE, `/knowledge/${a.slug}`))
    };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a }
        }))
    };
}
