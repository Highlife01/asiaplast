import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { queryAnalyticsReport, type AnalyticsFilter } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clampInt(raw: string | null, fallback: number, min: number, max: number): number {
    const n = parseInt(raw || "", 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
}

export async function GET(request: Request) {
    try {
        await requireSession();

        const { searchParams } = new URL(request.url);
        const filter: AnalyticsFilter = {
            dateRange: (searchParams.get("dateRange") as AnalyticsFilter["dateRange"]) || "all",
            country: searchParams.get("country") || undefined,
            deviceType: searchParams.get("deviceType") || undefined,
            browser: searchParams.get("browser") || undefined,
            conversionStatus: (searchParams.get("conversionStatus") as AnalyticsFilter["conversionStatus"]) || "all",
            includeBots: searchParams.get("includeBots") === "true",
            page: clampInt(searchParams.get("page"), 1, 1, 10_000),
            pageSize: clampInt(searchParams.get("pageSize"), 20, 1, 200)
        };

        const isCsvExport = searchParams.get("export") === "csv";
        // If CSV export, fetch without pagination limits
        if (isCsvExport) {
            filter.pageSize = 1000;
            filter.page = 1;
        }

        const report = await queryAnalyticsReport(filter);

        if (isCsvExport) {
            const headers = [
                "Session ID",
                "Ilk Ziyaret",
                "Son Gorulme",
                "Sure (Saniye)",
                "Sayfa Sayisi",
                "Giris Sayfasi",
                "Son Sayfa",
                "Ulke",
                "Sehir",
                "Cihaz Turu",
                "Cihaz Modeli",
                "Isletim Sistemi",
                "Tarayici",
                "Referrer / Kaynak",
                "Donusum (Form)"
            ];

            const rows = report.sessions.map((s) => [
                `"${s.sessionId}"`,
                `"${s.firstSeenAt}"`,
                `"${s.lastSeenAt}"`,
                s.durationSeconds,
                s.pageCount,
                `"${s.entryPage}"`,
                `"${s.lastPage}"`,
                `"${s.country}"`,
                `"${s.city}"`,
                `"${s.deviceType}"`,
                `"${s.deviceModel}"`,
                `"${s.os}"`,
                `"${s.browser}"`,
                `"${s.referrer}"`,
                `"${s.hasConversion ? s.conversionType : "Yok"}"`
            ]);

            const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

            return new NextResponse(csvContent, {
                status: 200,
                headers: {
                    "Content-Type": "text/csv; charset=utf-8",
                    "Content-Disposition": `attachment; filename="asiaplast_ziyaretci_analizi_${Date.now()}.csv"`
                }
            });
        }

        return NextResponse.json(report);
    } catch (err: unknown) {
        const error = err as { message?: string };
        if (error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
        }
        console.error("[admin/analytics] error:", err);
        return NextResponse.json({ error: "Analiz verileri alınamadı." }, { status: 500 });
    }
}
