import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
    SESSION_COOKIE,
    getClientIp,
    getSessionBag,
    serializeSessionBag,
    sessionCookieOptions,
    verifySameOrigin,
    verifySessionToken
} from "@/lib/session";
import { rateLimit } from "@/lib/rateLimit";
import {
    extractGeoFromHeaders,
    parseUserAgentAndHints,
    sanitizePathForAnalytics,
    sanitizeReferrer
} from "@/lib/analytics";
import { recordVisitorSessionEvent } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ClientHintsPayload = {
    platform?: string;
    platformVersion?: string;
    model?: string;
    mobile?: boolean;
};

export async function POST(request: Request) {
    try {
        if (!(await verifySameOrigin(request))) {
            return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
        }

        const ip = await getClientIp();
        const rl = rateLimit(`analytics:${ip}`, 40, 60_000);
        if (!rl.allowed) {
            return NextResponse.json({ ok: false, error: "Rate limited" }, { status: 429 });
        }

        const bag = await getSessionBag();
        if (bag.consent === "necessary") {
            return NextResponse.json({
                ok: true,
                tracked: false,
                reason: "CONSENT_OPTED_OUT"
            });
        }

        const body = (await request.json().catch(() => null)) as {
            path?: string;
            locale?: string;
            referrer?: string;
            utmSource?: string;
            utmMedium?: string;
            utmCampaign?: string;
            utmTerm?: string;
            utmContent?: string;
            screenWidth?: number;
            screenHeight?: number;
            language?: string;
            timezone?: string;
            clientHints?: ClientHintsPayload | null;
            isTest?: boolean;
        } | null;

        if (!body) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const cleanPath = sanitizePathForAnalytics(body.path);
        // Never record /dashboard or /admin visits in anonymous visitor analytics
        if (cleanPath.startsWith("/dashboard") || cleanPath.startsWith("/admin")) {
            return NextResponse.json({ ok: true, tracked: false, reason: "ADMIN_PATH_IGNORED" });
        }

        // Also separate authenticated admin sessions unless explicitly testing
        const testHeader = request.headers.get("x-asiaplast-test") === "1";
        const isTest = Boolean(body.isTest || testHeader);
        if (bag.admin && !isTest) {
            const adminSess = await verifySessionToken(bag.admin);
            if (adminSess) {
                return NextResponse.json({ ok: true, tracked: false, reason: "ADMIN_SESSION_SEPARATED" });
            }
        }

        const nowMs = Date.now();
        if (!bag.vid) {
            bag.vid = `v_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
        }
        if (!bag.sid || !bag.sidExp || bag.sidExp < nowMs) {
            bag.sid = `s_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
        }
        bag.sidExp = nowMs + 30 * 60_000;

        const ua = request.headers.get("user-agent") || "";
        const acceptLang = request.headers.get("accept-language") || "";
        const secChUa = request.headers.get("sec-ch-ua") || "";
        const secChUaMobile = request.headers.get("sec-ch-ua-mobile") || "";
        const secChUaPlatform = request.headers.get("sec-ch-ua-platform") || body.clientHints?.platform || "";
        const secChUaPlatformVersion = request.headers.get("sec-ch-ua-platform-version") || "";
        const secChUaModel = request.headers.get("sec-ch-ua-model") || "";

        const geo = extractGeoFromHeaders(request.headers);
        const parsedDevice = parseUserAgentAndHints(
            ua,
            {
                secChUa,
                secChUaMobile,
                secChUaPlatform,
                secChUaPlatformVersion,
                secChUaModel,
                acceptLanguage: acceptLang
            },
            body.clientHints?.model || null,
            body.clientHints?.platformVersion || null
        );

        const sw = Number(body.screenWidth || 0);
        const sh = Number(body.screenHeight || 0);
        const screenSize =
            Number.isFinite(sw) && Number.isFinite(sh) && sw > 0 && sh > 0 && sw < 20000 && sh < 20000
                ? `${Math.round(sw)}x${Math.round(sh)}`
                : "Veri alınamadı";

        const language = String(body.language || acceptLang.split(",")[0] || "Bilinmiyor")
            .trim()
            .slice(0, 32);
        const timezone = String(body.timezone || "Europe/Istanbul (UTC+3)")
            .trim()
            .slice(0, 64);

        const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "asiaplast.web.app";
        const referrer = sanitizeReferrer(body.referrer, host);

        const resRecord = await recordVisitorSessionEvent({
            sessionId: bag.sid,
            visitorId: bag.vid,
            consentGranted: true,
            isTest,
            at: new Date(nowMs).toISOString(),
            timezone,
            path: cleanPath,
            locale: String(body.locale || "en").slice(0, 8),
            referrer,
            utmSource: String(body.utmSource || "").trim().slice(0, 80),
            utmMedium: String(body.utmMedium || "").trim().slice(0, 80),
            utmCampaign: String(body.utmCampaign || "").trim().slice(0, 120),
            utmTerm: String(body.utmTerm || "").trim().slice(0, 120),
            utmContent: String(body.utmContent || "").trim().slice(0, 120),
            countryCode: geo.countryCode,
            countryName: geo.countryName,
            region: geo.region,
            city: geo.city,
            geoSource: geo.source,
            deviceType: parsedDevice.deviceType,
            deviceBrand: parsedDevice.deviceBrand,
            deviceModel: parsedDevice.deviceModel,
            osName: parsedDevice.osName,
            osVersion: parsedDevice.osVersion,
            browserName: parsedDevice.browserName,
            browserVersion: parsedDevice.browserVersion,
            language: language || "Bilinmiyor",
            screenSize,
            botStatus: parsedDevice.botStatus,
            botReason: parsedDevice.botReason
        });

        const res = NextResponse.json({
            ok: true,
            tracked: true,
            sessionId: bag.sid,
            deduplicated: resRecord.deduplicated
        });

        res.cookies.set(SESSION_COOKIE, serializeSessionBag(bag), sessionCookieOptions(180 * 86400));

        return res;
    } catch (err) {
        console.error("[analytics-collect] error:", err);
        return NextResponse.json({ ok: false, error: "Analytics event failed" }, { status: 500 });
    }
}
