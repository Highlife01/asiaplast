import { COMPANY, SITE_URL } from "./config";
import { ACTIVE_LOCALES, DEFAULT_LOCALE, LOCALE_META, type Locale } from "./i18n/locales";

export type MetaInput = {
    title: string;
    description: string;
    path: string; // path WITHOUT locale prefix, e.g. "/products/heavy-duty"
    locale: Locale;
    ogImage?: string;
    noindex?: boolean;
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

/** English has no prefix (`/products`). Other locales use `/tr`, `/de`, `/fr`, `/ar`. */
export function localePath(locale: Locale, path: string): string {
    const clean = path.startsWith("/") ? path : `/${path}`;
    if (locale === DEFAULT_LOCALE) return clean;
    return `/${locale}${clean === "/" ? "" : clean}`;
}

export function absoluteUrl(pathWithLocale: string): string {
    return `${SITE_URL}${pathWithLocale.startsWith("/") ? pathWithLocale : `/${pathWithLocale}`}`;
}

/** hreflang alternates including x-default (points to English). */
export function alternatesFor(path: string): { languages: Record<string, string> } {
    const languages: Record<string, string> = {};
    for (const l of ACTIVE_LOCALES) {
        languages[LOCALE_META[l].hreflang] = absoluteUrl(localePath(l, path));
    }
    languages["x-default"] = absoluteUrl(localePath("en", path));
    return { languages };
}

export function buildMetadata(input: MetaInput) {
    const canonical = absoluteUrl(localePath(input.locale, input.path));
    return {
        title: input.title,
        description: input.description,
        alternates: {
            canonical: input.noindex ? undefined : canonical,
            languages: input.noindex ? undefined : alternatesFor(input.path).languages
        },
        robots: input.noindex ? { index: false, follow: false } : undefined,
        openGraph: {
            title: input.title,
            description: input.description,
            url: canonical,
            siteName: "ASIAPLAST",
            type: "website" as const,
            images: input.ogImage ? [{ url: input.ogImage }] : undefined
        },
        twitter: {
            card: "summary_large_image" as const,
            title: input.title,
            description: input.description
        }
    };
}

export function organizationJsonLd() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "ASIAPLAST",
        url: SITE_URL,
        description:
            "Global garbage bags manufacturer and exporter: wholesale trash bags, industrial bin liners and private-label packaging solutions.",
        email: COMPANY.email,
        areaServed: "Worldwide",
        contactPoint: {
            "@type": "ContactPoint",
            contactType: "sales",
            email: COMPANY.email,
            availableLanguage: ACTIVE_LOCALES.map((l) => LOCALE_META[l].name)
        }
    };
}

export function productJsonLd(p: { name: string; description: string; slug: string; locale?: Locale }) {
    const locale = p.locale ?? DEFAULT_LOCALE;
    return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.name,
        description: p.description,
        category: "Garbage Bags",
        brand: { "@type": "Brand", name: "ASIAPLAST" },
        url: absoluteUrl(localePath(locale, `/products/${localizedSlug(p.slug, locale)}`))
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
        author: { "@type": "Organization", name: "ASIAPLAST" },
        publisher: { "@type": "Organization", name: "ASIAPLAST" },
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
