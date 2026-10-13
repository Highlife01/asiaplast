import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { recordVisitorHeartbeat } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get("ap_visitor_session")?.value;
        if (!sessionId) {
            return NextResponse.json({ ok: false, reason: "NO_SESSION" }, { status: 200 });
        }

        const body = (await request.json().catch(() => ({}))) || {};
        const path = typeof body.path === "string" ? body.path.slice(0, 200) : "/";

        await recordVisitorHeartbeat(sessionId, path);
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[analytics/heartbeat] error:", err);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
