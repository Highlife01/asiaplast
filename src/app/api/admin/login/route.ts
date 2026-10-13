import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { timingSafeEqual } from "crypto";
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE, getClientIp } from "@/lib/session";
import { rateLimitShared } from "@/lib/rateLimit";
import { logAudit } from "@/lib/repo";
import { recordLoginAttempt } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string): boolean {
    const left = Buffer.from(a);
    const right = Buffer.from(b);
    if (left.length !== right.length) return false;
    return timingSafeEqual(left, right);
}

function parseRoles(): string[] {
    const raw = (process.env.ADMIN_ROLES || "admin")
        .split(",")
        .map((part) => part.trim().toLowerCase())
        .filter(Boolean);
    const roles = new Set<string>(["admin"]);
    if (raw.includes("superadmin")) roles.add("superadmin");
    return [...roles];
}

export async function POST(request: Request) {
    const reqHeaders = await headers();
    const userAgent = reqHeaders.get("user-agent") || "Bilinmiyor";
    const ip = await getClientIp();

    try {
        const burst = await rateLimitShared(`admin-login:${ip}`, 5, 60_000);
        if (!burst.allowed) {
            await recordLoginAttempt({
                email: "unspecified",
                success: false,
                failureReason: "HÄ±z limiti aÅŸÄ±ldÄ± (Rate limit exceeded)",
                ip,
                userAgent,
                headers: reqHeaders
            }).catch(() => null);

            return NextResponse.json(
                { error: "Ã‡ok fazla giriÅŸ denemesi yapÄ±ldÄ±. LÃ¼tfen biraz bekleyin.", code: "RATE_LIMITED" },
                { status: 429, headers: { "Retry-After": String(burst.retryAfterSeconds) } }
            );
        }

        const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
        if (!body || !body.email || !body.password) {
            return NextResponse.json({ error: "E-posta ve ÅŸifre zorunludur" }, { status: 400 });
        }

        const email = body.email.trim().toLowerCase();
        const password = body.password;

        const expectedEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
        const expectedPass = process.env.ADMIN_PASSWORD || "";

        if (!expectedEmail || !expectedPass) {
            console.error("[admin-login] ADMIN_EMAIL / ADMIN_PASSWORD are not configured");
            return NextResponse.json({ error: "Kimlik doÄŸrulama sistemi hatasÄ±" }, { status: 500 });
        }

        const emailOk = safeEqual(email, expectedEmail);
        const passOk = safeEqual(password, expectedPass);

        if (!emailOk || !passOk) {
            await recordLoginAttempt({
                email,
                success: false,
                failureReason: "HatalÄ± e-posta veya ÅŸifre",
                ip,
                userAgent,
                headers: reqHeaders
            }).catch(() => null);

            return NextResponse.json({ error: "E-posta veya ÅŸifre hatalÄ±" }, { status: 401 });
        }

        const roles = parseRoles();
        const isSuper = roles.includes("superadmin");
        const ttlHours = Number(process.env.ADMIN_SESSION_TTL_HOURS || 12);
        const token = createSessionToken({
            uid: `admin_${email.replace(/[^a-z0-9]/g, "_")}`,
            email,
            displayName: isSuper ? "Super Admin" : "AsiaPlast Operator",
            roles,
            admin: true
        });

        const res = NextResponse.json({ ok: true, email });
        res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(ttlHours * 3600));

        await recordLoginAttempt({
            email,
            success: true,
            ip,
            userAgent,
            headers: reqHeaders
        }).catch(() => null);

        try {
            await logAudit(email, "login", "admin_session", { role: isSuper ? "superadmin" : "admin" });
        } catch {
            // Non-critical audit failure
        }

        return res;
    } catch (err) {
        console.error("[admin-login] error:", err);
        return NextResponse.json({ error: "Kimlik doÄŸrulama sistemi hatasÄ±" }, { status: 500 });
    }
}
