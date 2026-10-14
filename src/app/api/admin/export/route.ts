import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import {
    listContactMessages,
    listQuoteRequests,
    listConfirmedOrders,
    listVisitorSessions,
    listLoginLogs,
    logAudit
} from "@/lib/repo";
import {
    MESSAGE_STATUS_LABELS_TR,
    QUOTE_STATUS_LABELS_TR,
    ORDER_STATUS_LABELS_TR,
    type MessageStatus,
    type QuoteStatus,
    type OrderStatus
} from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escCsv(val: unknown): string {
    const str = String(val ?? "").replace(/\r?\n/g, " ");
    // Prevent CSV formula injection
    const safe = /^[=+\-@]/.test(str) ? `'${str}` : str;
    if (safe.includes(",") || safe.includes('"') || safe.includes(";")) {
        return `"${safe.replace(/"/g, '""')}"`;
    }
    return safe;
}

function inDateRange(iso: string, from: string | null, to: string | null): boolean {
    const t = Date.parse(iso);
    if (!Number.isFinite(t)) return true;
    if (from) {
        const f = Date.parse(from);
        if (Number.isFinite(f) && t < f) return false;
    }
    if (to) {
        const end = Date.parse(to) + 86400_000 - 1;
        if (Number.isFinite(end) && t > end) return false;
    }
    return true;
}

export async function GET(request: Request) {
    try {
        const session = await requireSession();
        const url = new URL(request.url);
        const type = url.searchParams.get("type") || "messages";
        const q = (url.searchParams.get("q") || "").trim().toLowerCase();
        const status = (url.searchParams.get("status") || "").trim();
        const country = (url.searchParams.get("country") || "").trim();
        const deviceType = (url.searchParams.get("deviceType") || "").trim();
        const browser = (url.searchParams.get("browser") || "").trim();
        const pageFilter = (url.searchParams.get("page") || "").trim();
        const conversion = (url.searchParams.get("conversion") || "").trim();
        const dateFrom = url.searchParams.get("dateFrom");
        const dateTo = url.searchParams.get("dateTo");

        const rows: string[] = [];
        let filename = `asiaplast-${type}-${new Date().toISOString().slice(0, 10)}.csv`;

        if (type === "messages") {
            const items = (await listContactMessages({ limit: 1000 })).filter((m) => {
                if (status && m.status !== status) return false;
                if (country && m.country !== country) return false;
                if (!inDateRange(m.createdAt, dateFrom, dateTo)) return false;
                if (q) {
                    const hay = `${m.name} ${m.company} ${m.email} ${m.country} ${m.subject} ${m.message}`.toLowerCase();
                    if (!hay.includes(q)) return false;
                }
                return true;
            });

            rows.push(
                [
                    "Kayıt ID",
                    "Tarih (UTC)",
                    "Durum",
                    "Ad Soyad",
                    "Firma",
                    "E-posta",
                    "Telefon",
                    "Ülke",
                    "Konu",
                    "Dil",
                    "Kaynak Sayfa",
                    "Mesaj",
                    "Yönetici Notu Sayısı"
                ].join(",")
            );

            for (const m of items) {
                rows.push(
                    [
                        m.id,
                        m.createdAt,
                        MESSAGE_STATUS_LABELS_TR[m.status as MessageStatus] || m.status,
                        m.name,
                        m.company,
                        m.email,
                        m.phone,
                        m.country,
                        m.subject,
                        m.locale.toUpperCase(),
                        m.sourcePage,
                        m.message,
                        m.notes.length
                    ]
                        .map(escCsv)
                        .join(",")
                );
            }
            filename = `asiaplast-iletisim-mesajlari-${new Date().toISOString().slice(0, 10)}.csv`;
        } else if (type === "quotes") {
            const items = (await listQuoteRequests({ limit: 1000 })).filter((r) => {
                if (status && r.status !== status) return false;
                if (country && r.country !== country) return false;
                if (!inDateRange(r.createdAt, dateFrom, dateTo)) return false;
                if (q) {
                    const hay = `${r.requestNo} ${r.name} ${r.company} ${r.email} ${r.country} ${r.productLabel} ${r.message}`.toLowerCase();
                    if (!hay.includes(q)) return false;
                }
                return true;
            });

            rows.push(
                [
                    "Talep No",
                    "Tarih (UTC)",
                    "Durum",
                    "Müşteri Adı",
                    "Firma",
                    "E-posta",
                    "Telefon",
                    "Ülke",
                    "Ürün / Kategori",
                    "Miktar",
                    "Birim",
                    "Ölçü (En x Boy)",
                    "Renk",
                    "Kalınlık (Mikron)",
                    "Ambalaj Tercihi",
                    "Kesim / Dip Tipi",
                    "Incoterms",
                    "Teslimat Yeri",
                    "Kesin Sipariş No",
                    "Açıklama"
                ].join(",")
            );

            for (const r of items) {
                rows.push(
                    [
                        r.requestNo,
                        r.createdAt,
                        QUOTE_STATUS_LABELS_TR[r.status as QuoteStatus] || r.status,
                        r.name,
                        r.company,
                        r.email,
                        r.phone,
                        r.country,
                        r.productLabel,
                        r.quantity,
                        r.unit,
                        r.bagSpecs.dimensions,
                        r.bagSpecs.color,
                        r.bagSpecs.thicknessMicron,
                        r.bagSpecs.packagingPref,
                        r.bagSpecs.sealType,
                        r.deliveryTerm,
                        r.deliveryLocation,
                        r.convertedOrderNo || "-",
                        r.message
                    ]
                        .map(escCsv)
                        .join(",")
                );
            }
            filename = `asiaplast-teklif-talepleri-${new Date().toISOString().slice(0, 10)}.csv`;
        } else if (type === "orders") {
            const items = (await listConfirmedOrders({ limit: 1000 })).filter((o) => {
                if (status && o.status !== status) return false;
                if (!inDateRange(o.createdAt, dateFrom, dateTo)) return false;
                return true;
            });

            rows.push(
                [
                    "Sipariş No",
                    "Talep No",
                    "Onay Tarihi",
                    "Durum",
                    "Firma",
                    "Müşteri",
                    "Ülke",
                    "Ürün",
                    "Miktar",
                    "Birim",
                    "Ölçü",
                    "Renk",
                    "Kalınlık",
                    "Ambalaj",
                    "Incoterms",
                    "Teslimat Yeri",
                    "Onaylayan Yönetici"
                ].join(",")
            );

            for (const o of items) {
                rows.push(
                    [
                        o.orderNo,
                        o.requestNo,
                        o.approvedAt,
                        ORDER_STATUS_LABELS_TR[o.status as OrderStatus] || o.status,
                        o.company,
                        o.customerName,
                        o.country,
                        o.productLabel,
                        o.quantity,
                        o.unit,
                        o.bagSpecs.dimensions,
                        o.bagSpecs.color,
                        o.bagSpecs.thicknessMicron,
                        o.bagSpecs.packagingPref,
                        o.deliveryTerm,
                        o.deliveryLocation,
                        o.approvedBy
                    ]
                        .map(escCsv)
                        .join(",")
                );
            }
            filename = `asiaplast-kesin-siparisler-${new Date().toISOString().slice(0, 10)}.csv`;
        } else if (type === "visits") {
            const items = (await listVisitorSessions({ limit: 1000 })).filter((v) => {
                if (country && v.countryCode !== country && v.countryName !== country) return false;
                if (deviceType && v.deviceType !== deviceType) return false;
                if (browser && v.browserName !== browser) return false;
                if (pageFilter && !v.pages.some((p) => p.includes(pageFilter))) return false;
                if (conversion === "converted" && !v.convertedContact && !v.convertedQuote) return false;
                if (conversion === "none" && (v.convertedContact || v.convertedQuote)) return false;
                if (!inDateRange(v.startedAt, dateFrom, dateTo)) return false;
                return true;
            });

            rows.push(
                [
                    "Oturum ID",
                    "Başlangıç Zamanı",
                    "Son Etkinlik Zamanı",
                    "Saat Dilimi",
                    "Süre (Sn)",
                    "Sayfa Görüntüleme",
                    "Ülke",
                    "Bölge / Şehir",
                    "Cihaz Türü",
                    "Marka",
                    "Model",
                    "İşletim Sistemi",
                    "Tarayıcı",
                    "Dil",
                    "Ekran Boyutu",
                    "İlk Giriş Sayfası",
                    "Son Görülen Sayfa",
                    "Yönlendiren (Referrer)",
                    "UTM Kaynak / Kampanya",
                    "İletişim Formu Gönderildi",
                    "Teklif Talebi Gönderildi",
                    "Sınıflandırma"
                ].join(",")
            );

            for (const v of items) {
                rows.push(
                    [
                        v.sessionId,
                        v.startedAt,
                        v.lastActivityAt,
                        v.timezone,
                        v.durationSeconds,
                        v.pageViews,
                        `${v.countryName} (${v.countryCode})`,
                        `${v.region} / ${v.city}`,
                        v.deviceType,
                        v.deviceBrand,
                        v.deviceModel,
                        `${v.osName} ${v.osVersion}`.trim(),
                        `${v.browserName} ${v.browserVersion}`.trim(),
                        v.language,
                        v.screenSize,
                        v.entryPage,
                        v.exitPage,
                        v.referrer,
                        [v.utmSource, v.utmMedium, v.utmCampaign].filter(Boolean).join(" / ") || "-",
                        v.convertedContact ? "Evet" : "Hayır",
                        v.convertedQuote ? "Evet" : "Hayır",
                        v.botStatus === "bot" ? "Bot" : v.botStatus === "uncertain" ? "Belirsiz" : "İnsan"
                    ]
                        .map(escCsv)
                        .join(",")
                );
            }
            filename = `asiaplast-ziyaretci-analizi-${new Date().toISOString().slice(0, 10)}.csv`;
        } else if (type === "logins") {
            const items = await listLoginLogs({ limit: 500 });
            rows.push(
                [
                    "Tarih",
                    "Hesap (E-posta)",
                    "Sonuç",
                    "Açıklama / Neden",
                    "Ülke",
                    "Şehir",
                    "Cihaz Türü",
                    "İşletim Sistemi",
                    "Tarayıcı"
                ].join(",")
            );

            for (const l of items) {
                rows.push(
                    [
                        l.createdAt,
                        l.email,
                        l.success ? "Başarılı" : "Başarısız",
                        l.reason,
                        `${l.countryName} (${l.countryCode})`,
                        l.city,
                        l.deviceType,
                        l.osName,
                        l.browserName
                    ]
                        .map(escCsv)
                        .join(",")
                );
            }
            filename = `asiaplast-giris-kayitlari-${new Date().toISOString().slice(0, 10)}.csv`;
        } else {
            return NextResponse.json({ error: "Geçersiz dışa aktarma türü" }, { status: 400 });
        }

        await logAudit(session.email, "export_csv", type, { rowCount: rows.length - 1 });

        const csvWithBom = `\uFEFF${rows.join("\r\n")}`;
        return new NextResponse(csvWithBom, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Cache-Control": "no-store"
            }
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }
        console.error("[admin-export] error:", err);
        return NextResponse.json({ error: "CSV dışa aktarma başarısız oldu" }, { status: 500 });
    }
}
