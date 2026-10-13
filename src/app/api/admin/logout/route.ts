import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import { rejectCrossOrigin } from "@/lib/adminGuard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    const blocked = rejectCrossOrigin(request);
    if (blocked) return blocked;
    const res = NextResponse.json({ ok: true });
    // Expire cookie immediately
    res.cookies.set(SESSION_COOKIE, "", sessionCookieOptions(0));
    return res;
}
