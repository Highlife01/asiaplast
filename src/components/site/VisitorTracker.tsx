"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[2]) : null;
}

export default function VisitorTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const lastTrackedPath = useRef<string>("");
    const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);

    function isTrackingAllowed(): boolean {
        const consent = getCookie("ap_analytics_consent");
        return consent === "granted";
    }

    function sendTrackingEvent(path: string) {
        if (!isTrackingAllowed()) return;

        const utm: Record<string, string> = {};
        if (searchParams) {
            ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((k) => {
                const val = searchParams.get(k);
                if (val) utm[k.replace("utm_", "")] = val;
            });
        }

        const screenResolution =
            typeof window !== "undefined" && window.screen
                ? `${window.screen.width}x${window.screen.height}`
                : undefined;

        const browserLanguage =
            typeof navigator !== "undefined" ? navigator.language : undefined;

        const payload = {
            path,
            title: typeof document !== "undefined" ? document.title : "",
            referrer: typeof document !== "undefined" && document.referrer ? document.referrer : undefined,
            utm: Object.keys(utm).length > 0 ? utm : undefined,
            screenResolution,
            browserLanguage
        };

        fetch("/api/analytics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }).catch(() => null);
    }

    function sendHeartbeat(path: string, keepalive = false) {
        if (!isTrackingAllowed()) return;
        fetch("/api/analytics/heartbeat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path }),
            keepalive
        }).catch(() => null);
    }

    useEffect(() => {
        // Track on path change
        if (pathname && pathname !== lastTrackedPath.current) {
            lastTrackedPath.current = pathname;
            sendTrackingEvent(pathname);
        }

        // Set up 30-second heartbeat interval
        if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = setInterval(() => {
            if (document.visibilityState === "visible") {
                sendHeartbeat(pathname || "/");
            }
        }, 30000);

        // Visibility & unload listeners for accurate duration
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                sendHeartbeat(pathname || "/", true);
            }
        };

        const handleConsentChange = (e: Event) => {
            const customEvent = e as CustomEvent<{ granted: boolean }>;
            if (customEvent.detail?.granted) {
                sendTrackingEvent(pathname || "/");
            }
        };

        window.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("analytics_consent_changed", handleConsentChange);

        return () => {
            if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
            window.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("analytics_consent_changed", handleConsentChange);
        };
    }, [pathname, searchParams]);

    return null;
}
