import { NextResponse } from "next/server";
import { requireSession, verifySameOrigin } from "@/lib/session";
import {
    listContactMessages,
    listQuoteRequests,
    listConfirmedOrders,
    getProducts,
    listVisitorSessions,
    listLoginLogs,
    listAuditLogs,
    getCompanySettings,
    cleanupExpiredAnalyticsSessions,
    logAudit
} from "@/lib/repo";
import { db, COLLECTIONS } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        await requireSession();
        const url = new URL(request.url);
        const includeTest = url.searchParams.get("includeTest") === "1";

        const [
            messages,
            quotes,
            orders,
            products,
            visits,
            loginLogs,
            auditLogs,
            settings
        ] = await Promise.all([
            listContactMessages({ includeTest, limit: 400 }),
            listQuoteRequests({ includeTest, limit: 400 }),
            listConfirmedOrders({ includeTest, limit: 300 }),
            getProducts({ includeInactive: true }),
            listVisitorSessions({ includeTest, limit: 500 }),
            listLoginLogs({ includeTest, limit: 250 }),
            listAuditLogs(100),
            getCompanySettings()
        ]);

        return NextResponse.json({
            ok: true,
            serverTime: new Date().toISOString(),
            messages,
            quotes,
            orders,
            products,
            visits,
            loginLogs,
            auditLogs,
            settings
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }
        console.error("[admin-overview] error:", err);
        return NextResponse.json(
            { error: "Veritabanı bağlantısı kurulamadı veya veriler okunamadı." },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        if (!(await verifySameOrigin(request))) {
            return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
        }
        const session = await requireSession();
        const body = (await request.json().catch(() => null)) as {
            action?: string;
            retentionDays?: number;
        } | null;

        if (body?.action === "cleanup_expired_analytics") {
            const settings = await getCompanySettings();
            const days = body.retentionDays || settings.analyticsRetentionDays || 90;
            const deletedCount = await cleanupExpiredAnalyticsSessions(days);
            await logAudit(session.email, "cleanup_expired_analytics", "visits", {
                retentionDays: days,
                deletedCount
            });
            return NextResponse.json({ ok: true, deletedCount });
        }

        if (body?.action === "cleanup_test_records") {
            const cols = [
                COLLECTIONS.contactMessages,
                COLLECTIONS.quoteRequests,
                COLLECTIONS.orders,
                COLLECTIONS.visits,
                COLLECTIONS.loginLogs
            ];
            let deletedCount = 0;
            for (const c of cols) {
                const snap = await db().collection(c).where("isTest", "==", true).limit(200).get();
                if (!snap.empty) {
                    const batch = db().batch();
                    snap.docs.forEach((d) => batch.delete(d.ref));
                    await batch.commit();
                    deletedCount += snap.size;
                }
            }
            await logAudit(session.email, "cleanup_test_records", "all", { deletedCount });
            return NextResponse.json({ ok: true, deletedCount });
        }

        return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }
        console.error("[admin-overview-post] error:", err);
        return NextResponse.json({ error: "İşlem tamamlanamadı" }, { status: 500 });
    }
}
