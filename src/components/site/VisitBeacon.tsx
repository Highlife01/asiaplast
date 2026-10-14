"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n/locales";

type NavigatorUAData = {
    brands?: { brand: string; version: string }[];
    mobile?: boolean;
    platform?: string;
    getHighEntropyValues?: (hints: string[]) => Promise<{
        platform?: string;
        platformVersion?: string;
        model?: string;
        mobile?: boolean;
        brands?: { brand: string; version: string }[];
        fullVersionList?: { brand: string; version: string }[];
    }>;
};

export default function VisitBeacon({
    locale,
    enabled
}: {
    locale: Locale;
    enabled: boolean;
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const lastSentRef = useRef<string>("");

    useEffect(() => {
        if (!enabled || !pathname) return;
        const key = `${pathname}?${searchParams?.toString() || ""}`;
        if (lastSentRef.current === key) return;
        lastSentRef.current = key;

        let cancelled = false;

        async function sendEvent() {
            try {
                let clientHints: Record<string, unknown> | null = null;
                const nav = navigator as Navigator & { userAgentData?: NavigatorUAData };
                if (nav.userAgentData) {
                    if (typeof nav.userAgentData.getHighEntropyValues === "function") {
                        clientHints = await nav.userAgentData
                            .getHighEntropyValues([
                                "platform",
                                "platformVersion",
                                "model",
                                "mobile",
                                "brands",
                                "fullVersionList"
                            ])
                            .catch(() => ({
                                platform: nav.userAgentData?.platform,
                                mobile: nav.userAgentData?.mobile,
                                brands: nav.userAgentData?.brands
                            }));
                    } else {
                        clientHints = {
                            platform: nav.userAgentData.platform,
                            mobile: nav.userAgentData.mobile,
                            brands: nav.userAgentData.brands
                        };
                    }
                }

                if (cancelled) return;

                let timezone = "Europe/Istanbul";
                try {
                    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    const offsetMin = -new Date().getTimezoneOffset();
                    const sign = offsetMin >= 0 ? "+" : "-";
                    const hrs = Math.floor(Math.abs(offsetMin) / 60);
                    timezone = `${tz} (UTC${sign}${hrs})`;
                } catch {
                    // Fallback
                }

                await fetch("/api/analytics/collect", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    keepalive: true,
                    body: JSON.stringify({
                        path: pathname,
                        locale,
                        referrer: typeof document !== "undefined" ? document.referrer || "" : "",
                        utmSource: searchParams?.get("utm_source") || "",
                        utmMedium: searchParams?.get("utm_medium") || "",
                        utmCampaign: searchParams?.get("utm_campaign") || "",
                        utmTerm: searchParams?.get("utm_term") || "",
                        utmContent: searchParams?.get("utm_content") || "",
                        screenWidth: typeof window !== "undefined" ? window.screen?.width || 0 : 0,
                        screenHeight: typeof window !== "undefined" ? window.screen?.height || 0 : 0,
                        language: typeof navigator !== "undefined" ? navigator.language || "" : "",
                        timezone,
                        clientHints
                    })
                });
            } catch {
                // Silent fail for analytics beacon
            }
        }

        void sendEvent();

        return () => {
            cancelled = true;
        };
    }, [enabled, pathname, searchParams, locale]);

    return null;
}
