import { NextResponse } from "next/server";
import { quoteSchema, looksLikeSpam } from "@/lib/validation";
import { createQuoteRequest, getProductBySlug } from "@/lib/repo";
import { rateLimitShared } from "@/lib/rateLimit";
import { getClientIp, getSessionBag, verifySameOrigin } from "@/lib/session";
import { RATE_LIMITS } from "@/lib/config";
import { productLabelFor } from "@/lib/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        if (!(await verifySameOrigin(request))) {
            return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
        }

        const ip = await getClientIp();
        const burst = await rateLimitShared(`quote:${ip}`, 3, RATE_LIMITS.quoteMs);
        if (!burst.allowed) {
            return NextResponse.json(
                { error: "Çok fazla istek gönderildi. Lütfen kısa süre sonra tekrar deneyin.", code: "RATE_LIMITED" },
                { status: 429, headers: { "Retry-After": String(burst.retryAfterSeconds) } }
            );
        }
        const hourly = await rateLimitShared(`quote-hour:${ip}`, RATE_LIMITS.hourlyMax, 3600_000);
        if (!hourly.allowed) {
            return NextResponse.json(
                { error: "Saatlik gönderim sınırına ulaşıldı. Lütfen daha sonra tekrar deneyin.", code: "RATE_LIMITED" },
                { status: 429, headers: { "Retry-After": String(hourly.retryAfterSeconds) } }
            );
        }

        const body = await request.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ error: "Geçersiz JSON verisi" }, { status: 400 });
        }

        const parsed = quoteSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Doğrulama hatası", issues: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        if (parsed.data.honeypot && parsed.data.honeypot.trim().length > 0) {
            return NextResponse.json({ ok: true, id: "filtered", requestNo: "FILTERED" });
        }

        const qty = (parsed.data.quantity || "").trim();
        const vol = (parsed.data.volume || "").trim();
        if (!qty && !vol) {
            return NextResponse.json(
                {
                    error: "Miktar / hacim bilgisi zorunludur.",
                    issues: { quantity: ["Lütfen talep edilen miktarı belirtin."] }
                },
                { status: 400 }
            );
        }

        const text = `${parsed.data.message || ""} ${vol} ${qty}`;
        if (looksLikeSpam(text) || looksLikeSpam(parsed.data.name)) {
            return NextResponse.json({ ok: true, id: "filtered", requestNo: "FILTERED" });
        }

        const productId = parsed.data.productId || null;
        let resolvedLabel = productLabelFor(productId) || productLabelFor(parsed.data.categoryId) || parsed.data.categoryId;
        if (productId) {
            const dbProd = await getProductBySlug(productId).catch(() => null);
            if (dbProd?.name) resolvedLabel = dbProd.name;
        }

        const bag = await getSessionBag();
        const sessionId = bag.consent === "all" && bag.sid ? bag.sid : null;
        const testHeader = request.headers.get("x-asiaplast-test") === "1";

        const result = await createQuoteRequest({
            name: parsed.data.name,
            company: parsed.data.company,
            email: parsed.data.email,
            phone: parsed.data.phone,
            country: parsed.data.country,
            categoryId: parsed.data.categoryId,
            productId,
            productLabel: resolvedLabel,
            quantity: qty || vol,
            unit: parsed.data.unit || "Belirtilmedi",
            volume: vol || `${qty} ${parsed.data.unit || ""}`.trim(),
            bagSpecs: parsed.data.bagSpecs,
            deliveryTerm: parsed.data.deliveryTerm,
            deliveryLocation: parsed.data.deliveryLocation,
            message: parsed.data.message,
            locale: parsed.data.locale,
            sourcePage: parsed.data.sourcePage,
            sessionId,
            idempotencyKey: parsed.data.idempotencyKey,
            isTest: Boolean(parsed.data.isTest || testHeader)
        });

        return NextResponse.json(
            {
                ok: true,
                id: result.id,
                requestNo: result.requestNo,
                deduplicated: result.deduplicated,
                confirmedAt: new Date().toISOString()
            },
            { status: 201 }
        );
    } catch (err) {
        console.error("[quotes] submission failed:", err);
        return NextResponse.json(
            { error: "Sunucu hatası — teklif talebiniz kaydedilemedi. Lütfen tekrar deneyin." },
            { status: 500 }
        );
    }
}
