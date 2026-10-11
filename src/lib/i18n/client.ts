import { getDictionary } from "./dictionaries";
import type { Locale } from "./locales";

/** Lightweight client-safe dictionary accessor (no server deps). */
export function useI18n(locale: Locale) {
    return getDictionary(locale);
}
