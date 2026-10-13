import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { queryLoginLogs } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        await requireSession();

        const { searchParams } = new URL(request.url);
        const page = Math.min(10_000, Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1));
        const pageSize = Math.min(200, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10) || 20));

        const data = await queryLoginLogs(page, pageSize);
        return NextResponse.json(data);
    } catch (err: unknown) {
        const error = err as { message?: string };
        if (error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
        }
        console.error("[admin/logins] error:", err);
        return NextResponse.json({ error: "Giriş kayıtları alınamadı." }, { status: 500 });
    }
}
