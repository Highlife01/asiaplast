import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
    SESSION_COOKIE,
    getSessionBag,
    serializeSessionBag,
    sessionCookieOptions,
    verifySameOrigin
} from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    const bag = await getSessionBag();
    return NextResponse.json({
        ok: true,
        consent: bag.consent || null
    });
}

export async function POST(request: Request) {
    try {
        if (!(await verifySameOrigin(request))) {
            return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
        }

        const body = (await request.json().catch(() => null)) as { consent?: string } | null;
        const consent = body?.consent === "all" ? "all" : body?.consent === "necessary" ? "necessary" : null;
        if (!consent) {
            return NextResponse.json({ error: "Geçersiz çerez tercihi" }, { status: 400 });
        }

        const bag = await getSessionBag();
        bag.consent = consent;

        if (consent === "all") {
            const now = Date.now();
            if (!bag.vid) bag.vid = `v_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
            if (!bag.sid || !bag.sidExp || bag.sidExp < now) {
                bag.sid = `s_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
            }
            bag.sidExp = now + 30 * 60_000;
        } else {
            delete bag.vid;
            delete bag.sid;
            delete bag.sidExp;
        }

        const res = NextResponse.json({
            ok: true,
            consent: bag.consent
        });

        res.cookies.set(SESSION_COOKIE, serializeSessionBag(bag), sessionCookieOptions(180 * 86400));
        return res;
    } catch (err) {
        console.error("[consent] error:", err);
        return NextResponse.json({ error: "Çerez tercihi kaydedilemedi" }, { status: 500 });
    }
}
