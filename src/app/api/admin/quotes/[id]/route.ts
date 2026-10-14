import { NextResponse } from "next/server";
import { requireSession, verifySameOrigin } from "@/lib/session";
import {
    updateQuoteRecord,
    convertQuoteToConfirmedOrder,
    logAudit
} from "@/lib/repo";
import { db, COLLECTIONS } from "@/lib/firebaseAdmin";
import { QUOTE_STATUSES, type QuoteStatus } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!(await verifySameOrigin(request))) {
            return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
        }
        const session = await requireSession();
        const { id } = await params;
        const body = (await request.json().catch(() => null)) as {
            status?: QuoteStatus;
            noteText?: string;
        } | null;

        if (!body || (!body.status && !body.noteText)) {
            return NextResponse.json({ error: "Durum veya yönetici notu gerekli" }, { status: 400 });
        }

        if (body.status && !(QUOTE_STATUSES as readonly string[]).includes(body.status)) {
            return NextResponse.json({ error: "Geçersiz teklif talebi durumu" }, { status: 400 });
        }

        const updated = await updateQuoteRecord(
            id,
            { status: body.status, noteText: body.noteText },
            session.email
        );

        return NextResponse.json({ ok: true, item: updated });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }
        if (msg === "NOT_FOUND") {
            return NextResponse.json({ error: "Teklif talebi bulunamadı" }, { status: 404 });
        }
        console.error("[quote-update] error:", err);
        return NextResponse.json({ error: "Teklif talebi güncellenemedi" }, { status: 500 });
    }
}

/**
 * POST /api/admin/quotes/[id] -> Explicitly convert Quote Request into a Confirmed Order
 * Only happens with explicit admin approval.
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!(await verifySameOrigin(request))) {
            return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
        }
        const session = await requireSession();
        const { id } = await params;
        const body = (await request.json().catch(() => ({}))) as { note?: string } | null;

        const { order, quote } = await convertQuoteToConfirmedOrder(
            id,
            session.email,
            body?.note
        );

        return NextResponse.json({
            ok: true,
            order,
            quote
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }
        if (msg === "QUOTE_NOT_FOUND") {
            return NextResponse.json({ error: "Teklif talebi bulunamadı" }, { status: 404 });
        }
        console.error("[quote-convert] error:", err);
        return NextResponse.json({ error: "Teklif talebi siparişe dönüştürülemedi" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!(await verifySameOrigin(request))) {
            return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
        }
        const session = await requireSession();
        const { id } = await params;

        await db().collection(COLLECTIONS.quoteRequests).doc(id).delete();
        await logAudit(session.email, "delete_quote", id);

        return NextResponse.json({ ok: true, id });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }
        console.error("[quote-delete] error:", err);
        return NextResponse.json({ error: "Teklif talebi silinemedi" }, { status: 500 });
    }
}
