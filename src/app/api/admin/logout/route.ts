import { NextResponse } from "next/server";
import {
    getSession,
    getSessionBag,
    revokeSession,
    serializeSessionBag,
    SESSION_COOKIE,
    sessionCookieOptions,
    verifySameOrigin
} from "@/lib/session";
import { logAudit } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    if (!(await verifySameOrigin(request))) {
        return NextResponse.json({ error: "Geçersiz istek kaynağı" }, { status: 403 });
    }

    const session = await getSession();
    if (session) {
        await revokeSession(session);
        await logAudit(session.email, "admin_logout", session.uid).catch(() => undefined);
    }

    const bag = await getSessionBag();
    delete bag.admin;

    const res = NextResponse.json({ ok: true });
    const serialized = serializeSessionBag(bag);
    if (serialized) {
        res.cookies.set(SESSION_COOKIE, serialized, sessionCookieOptions(60 * 60 * 24 * 180));
    } else {
        res.cookies.set(SESSION_COOKIE, "", sessionCookieOptions(0));
    }
    return res;
}
