export const LOCALES = ["en", "tr", "de", "fr", "es", "it", "pt", "ru", "nl", "pl", "ro", "bg", "el", "uk", "fa", "hi", "ur", "id", "ms", "vi", "th", "zh", "ja", "ko", "bn", "sw", "uz", "az", "he", "ar"] as const;

export type Locale = (typeof LOCALES)[number];

/** Fully translated & launch-ready locales (phase 1). */
export const ACTIVE_LOCALES: Locale[] = ["en", "tr", "de", "fr", "ar"];

export const DEFAULT_LOCALE: Locale = "en";

export const RTL_LOCALES: Locale[] = ["ar", "he", "fa", "ur"];

export const LOCALE_META: Record<Locale, { name: string; nativeName: string; hreflang: string }> = {
    en: { name: "English", nativeName: "English", hreflang: "en" },
    tr: { name: "Turkish", nativeName: "Türkçe", hreflang: "tr" },
    de: { name: "German", nativeName: "Deutsch", hreflang: "de" },
    fr: { name: "French", nativeName: "Français", hreflang: "fr" },
    ar: { name: "Arabic", nativeName: "العربية", hreflang: "ar" },
    es: { name: "Spanish", nativeName: "Español", hreflang: "es" },
    it: { name: "Italian", nativeName: "Italiano", hreflang: "it" },
    pt: { name: "Portuguese", nativeName: "Português", hreflang: "pt" },
    ru: { name: "Russian", nativeName: "Русский", hreflang: "ru" },
    nl: { name: "Dutch", nativeName: "Nederlands", hreflang: "nl" },
    pl: { name: "Polish", nativeName: "Polski", hreflang: "pl" },
    ro: { name: "Romanian", nativeName: "Română", hreflang: "ro" },
    bg: { name: "Bulgarian", nativeName: "Български", hreflang: "bg" },
    el: { name: "Greek", nativeName: "Ελληνικά", hreflang: "el" },
    uk: { name: "Ukrainian", nativeName: "Українська", hreflang: "uk" },
    fa: { name: "Persian", nativeName: "فارسی", hreflang: "fa" },
    hi: { name: "Hindi", nativeName: "हिन्दी", hreflang: "hi" },
    ur: { name: "Urdu", nativeName: "اردو", hreflang: "ur" },
    id: { name: "Indonesian", nativeName: "Bahasa Indonesia", hreflang: "id" },
    ms: { name: "Malay", nativeName: "Bahasa Melayu", hreflang: "ms" },
    vi: { name: "Vietnamese", nativeName: "Tiếng Việt", hreflang: "vi" },
    th: { name: "Thai", nativeName: "ไทย", hreflang: "th" },
    zh: { name: "Chinese", nativeName: "中文", hreflang: "zh" },
    ja: { name: "Japanese", nativeName: "日本語", hreflang: "ja" },
    ko: { name: "Korean", nativeName: "한국어", hreflang: "ko" },
    bn: { name: "Bengali", nativeName: "বাংলা", hreflang: "bn" },
    sw: { name: "Swahili", nativeName: "Kiswahili", hreflang: "sw" },
    uz: { name: "Uzbek", nativeName: "Oʻzbek", hreflang: "uz" },
    az: { name: "Azerbaijani", nativeName: "Azərbaycanca", hreflang: "az" },
    he: { name: "Hebrew", nativeName: "עברית", hreflang: "he" }
};

export function isLocale(value: string): value is Locale {
    return (LOCALES as readonly string[]).includes(value);
}

export function isRtl(locale: Locale): boolean {
    return RTL_LOCALES.includes(locale);
}

/** Resolve preferred locale from Accept-Language header (server-side only). */
export function localeFromAcceptLanguage(header: string | null): Locale {
    if (!header) return DEFAULT_LOCALE;
    const candidates = header
        .split(",")
        .map((part) => {
            const [tag, q] = part.trim().split(";q=");
            return { tag: tag.trim().toLowerCase(), q: q ? parseFloat(q) : 1 };
        })
        .sort((a, b) => b.q - a.q);
    for (const { tag } of candidates) {
        const base = tag.split("-")[0];
        if (isLocale(base) && (ACTIVE_LOCALES as readonly string[]).includes(base)) return base as Locale;
    }
    return DEFAULT_LOCALE;
}
