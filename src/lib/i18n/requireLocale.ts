import { notFound } from "next/navigation";
import { ACTIVE_LOCALES, DEFAULT_LOCALE, isLocale, type Locale } from "./locales";

export function requireLocale(raw: string | undefined): Locale {
    if (!raw || !isLocale(raw) || !ACTIVE_LOCALES.includes(raw)) notFound();
    return raw;
}

export function localeOrDefault(raw: string | undefined): Locale {
    if (raw && isLocale(raw) && ACTIVE_LOCALES.includes(raw)) return raw;
    return DEFAULT_LOCALE;
}
