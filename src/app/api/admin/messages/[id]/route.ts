import { NextResponse } from "next/server";
import { requireSession, verifySameOrigin } from "@/lib/session";
import { updateMessageRecord, logAudit } from "@/lib/repo";
import { db, COLLECTIONS } from "@/lib/firebaseAdmin";
import { MESSAGE_STATUSES, type MessageStatus } from "@/lib/config";

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
            status?: MessageStatus;
            noteText?: string;
        } | null;

        if (!body || (!body.status && !body.noteText)) {
            return NextResponse.json({ error: "Durum veya yönetici notu gerekli" }, { status: 400 });
        }

        if (body.status && !(MESSAGE_STATUSES as readonly string[]).includes(body.status)) {
            return NextResponse.json({ error: "Geçersiz mesaj durumu" }, { status: 400 });
        }

        const updated = await updateMessageRecord(
            id,
            { status: body.status, noteText: body.noteText },
            session.email
        );

        return NextResponse.json({
            ok: true,
            item: updated,
            emailDispatchNote:
                updated.status === "replied"
                    ? "Durum 'Yanıtlandı' olarak kaydedildi. Bu işlem otomatik e-posta göndermez."
                    : null
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }
        if (msg === "NOT_FOUND") {
            return NextResponse.json({ error: "Mesaj bulunamadı" }, { status: 404 });
        }
        console.error("[message-update] error:", err);
        return NextResponse.json({ error: "İletişim mesajı güncellenemedi" }, { status: 500 });
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

        await db().collection(COLLECTIONS.contactMessages).doc(id).delete();
        await logAudit(session.email, "delete_message", id);

        return NextResponse.json({ ok: true, id });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }
        console.error("[message-delete] error:", err);
        return NextResponse.json({ error: "Mesaj silinemedi" }, { status: 500 });
    }
}
