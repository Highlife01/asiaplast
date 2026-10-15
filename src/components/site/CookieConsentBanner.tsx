"use client";

import type { Locale } from "@/lib/i18n/locales";
import VisitBeacon from "./VisitBeacon";

export default function CookieConsentBanner({
    locale
}: {
    locale: Locale;
    initialConsent?: "all" | "necessary" | null;
}) {
    return <VisitBeacon locale={locale} enabled={true} />;
}

