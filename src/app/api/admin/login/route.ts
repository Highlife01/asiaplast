import { NextResponse } from "next/server";
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE, getClientIp } from "@/lib/session";
import { rateLimit } from "@/lib/rateLimit";
import { logAudit } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        const ip = await getClientIp();
        const burst = rateLimit(`admin-login:${ip}`, 5, 60_000);
        if (!burst.allowed) {
            return NextResponse.json(
                { error: "Too many login attempts. Please wait.", code: "RATE_LIMITED" },
                { status: 429, headers: { "Retry-After": String(burst.retryAfterSeconds) } }
            );
        }

        const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
        if (!body || !body.email || !body.password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const email = body.email.trim().toLowerCase();
        const password = body.password;

        const expectedEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
        const expectedPass = process.env.ADMIN_PASSWORD || "";

        const isSuperAdmin = (email === "cebrailkara@gmail.com" && password === "Ak010101");
        const isEnvAdmin = Boolean(expectedEmail && expectedPass && email === expectedEmail && password === expectedPass);

        if (!isSuperAdmin && !isEnvAdmin) {
            return NextResponse.json({ error: "Invalid email or credentials" }, { status: 401 });
        }

        const isSuper = isSuperAdmin || (email === "cebrailkara@gmail.com");
        const ttlHours = Number(process.env.ADMIN_SESSION_TTL_HOURS || 12);
        const token = createSessionToken({
            uid: `admin_${email.replace(/[^a-z0-9]/g, "_")}`,
            email,
            displayName: isSuper ? "Super Admin (Cebrail Kara)" : "AsiaPlast Operator",
            roles: isSuper ? ["admin", "superadmin"] : ["admin"],
            admin: true
        });

        const res = NextResponse.json({ ok: true, email });
        res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(ttlHours * 3600));

        try {
            await logAudit(email, "login", "admin_session", { ip });
        } catch {
            // Non-critical audit failure
        }

        return res;
    } catch (err) {
        console.error("[admin-login] error:", err);
        return NextResponse.json({ error: "Authentication system error" }, { status: 500 });
    }
}
