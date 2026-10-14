import { NextResponse } from "next/server";
import { requireSession, verifySameOrigin } from "@/lib/session";
import { updateConfirmedOrderStatus } from "@/lib/repo";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/config";

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
            status?: OrderStatus;
            note?: string;
        } | null;

        if (!body?.status || !(ORDER_STATUSES as readonly string[]).includes(body.status)) {
            return NextResponse.json({ error: "Geçerli bir sipariş durumu seçin" }, { status: 400 });
        }

        const updated = await updateConfirmedOrderStatus(
            id,
            body.status,
            session.email,
            body.note
        );

        return NextResponse.json({ ok: true, item: updated });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }
        if (msg === "ORDER_NOT_FOUND") {
            return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
        }
        console.error("[order-update] error:", err);
        return NextResponse.json({ error: "Sipariş güncellenemedi" }, { status: 500 });
    }
}
