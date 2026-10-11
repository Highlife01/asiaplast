import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin";
import { ADMIN_SESSION_TTL_HOURS } from "@/lib/config";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        const body = (await request.json().catch(() => null)) as { idToken?: string } | null;
        if (!body?.idToken) {
            return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
        }

        const decoded = await adminAuth().verifyIdToken(body.idToken);
        if (decoded.admin !== true) {
            return NextResponse.json({ error: "Not an admin account" }, { status: 403 });
        }

        const token = createSessionToken({
            uid: decoded.uid,
            email: decoded.email || "",
            displayName: decoded.name || decoded.email || "Admin",
            roles: Array.isArray(decoded.roles) ? decoded.roles.map(String) : ["admin"],
            admin: true
        });

        const maxAge = Number(ADMIN_SESSION_TTL_HOURS || 12) * 3600;
        (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions(maxAge));
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[admin/session]", err);
        return NextResponse.json({ error: "Session could not be created. Check Firebase admin credentials and ADMIN_SESSION_SECRET." }, { status: 500 });
    }
}
