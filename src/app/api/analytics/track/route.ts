import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { randomUUID } from "crypto";
import { recordVisitorEvent } from "@/lib/analytics";
import { getClientIp } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Keep only a handful of short string values from the client-supplied utm object. */
function sanitizeUtm(raw: unknown): Record<string, string> | undefined {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(raw as Record<string, unknown>).slice(0, 10)) {
        if (typeof value === "string") out[key.slice(0, 40)] = value.slice(0, 120);
    }
    return Object.keys(out).length ? out : undefined;
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const consent = cookieStore.get("ap_analytics_consent")?.value;

        if (consent !== "granted") {
            return NextResponse.json({ ok: false, reason: "CONSENT_REQUIRED" }, { status: 200 });
        }

        let sessionId = cookieStore.get("ap_visitor_session")?.value;
        let isNewSession = false;
        if (!sessionId) {
            sessionId = `vs_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
            isNewSession = true;
        }

        const body = (await request.json().catch(() => ({}))) || {};
        const reqHeaders = await headers();
        const userAgent = reqHeaders.get("user-agent") || "Bilinmiyor";
        const ip = await getClientIp();

        await recordVisitorEvent({
            sessionId,
            path: typeof body.path === "string" ? body.path.slice(0, 200) : "/",
            title: typeof body.title === "string" ? body.title.slice(0, 200) : "",
            referrer: typeof body.referrer === "string" ? body.referrer.slice(0, 300) : undefined,
            utm: sanitizeUtm(body.utm),
            screenResolution: typeof body.screenResolution === "string" ? body.screenResolution.slice(0, 30) : undefined,
            browserLanguage: typeof body.browserLanguage === "string" ? body.browserLanguage.slice(0, 30) : undefined,
            userAgent,
            ip,
            headers: reqHeaders
        });

        const res = NextResponse.json({ ok: true, sessionId });
        if (isNewSession) {
            res.cookies.set("ap_visitor_session", sessionId, {
                path: "/",
                maxAge: 30 * 86400, // 30 days session persistence
                sameSite: "lax",
                httpOnly: true,
                secure: process.env.NODE_ENV === "production"
            });
        }

        return res;
    } catch (err) {
        console.error("[analytics/track] error:", err);
        return NextResponse.json({ ok: false, error: "Track error" }, { status: 500 });
    }
}
