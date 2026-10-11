import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { updateQuoteStatus, logAudit } from "@/lib/repo";
import { db, COLLECTIONS } from "@/lib/firebaseAdmin";
import type { MessageStatus } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireSession();
        const { id } = await params;
        const body = (await request.json().catch(() => null)) as { status?: MessageStatus } | null;

        if (!body || !body.status) {
            return NextResponse.json({ error: "Status is required" }, { status: 400 });
        }

        await updateQuoteStatus(id, body.status, session.email);
        await logAudit(session.email, "update_quote_status", id, { status: body.status });

        return NextResponse.json({ ok: true, id, status: body.status });
    } catch (err) {
        console.error("[quote-update] error:", err);
        return NextResponse.json({ error: "Failed to update quote request" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireSession();
        const { id } = await params;

        await db().collection(COLLECTIONS.quoteRequests).doc(id).delete();
        await logAudit(session.email, "delete_quote", id);

        return NextResponse.json({ ok: true, id });
    } catch (err) {
        console.error("[quote-delete] error:", err);
        return NextResponse.json({ error: "Failed to delete quote" }, { status: 500 });
    }
}
