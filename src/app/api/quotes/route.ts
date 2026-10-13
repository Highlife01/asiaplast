import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { quoteSchema, looksLikeSpam } from "@/lib/validation";
import { createQuoteRequest } from "@/lib/repo";
import { rateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/session";
import { RATE_LIMITS } from "@/lib/config";
import { productLabelFor } from "@/lib/catalog";
import { markSessionConversion } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        const ip = await getClientIp();
        const burst = rateLimit(`quote:${ip}`, 3, RATE_LIMITS.quoteMs);
        if (!burst.allowed) {
            return NextResponse.json(
                { error: "Çok fazla istek gönderildi. Lütfen bekleyin.", code: "RATE_LIMITED" },
                { status: 429, headers: { "Retry-After": String(burst.retryAfterSeconds) } }
            );
        }
        const hourly = rateLimit(`quote-hour:${ip}`, RATE_LIMITS.hourlyMax, 3600_000);
        if (!hourly.allowed) {
            return NextResponse.json(
                { error: "Saatlik istek sınırı aşıldı. Lütfen daha sonra deneyin.", code: "RATE_LIMITED" },
                { status: 429, headers: { "Retry-After": String(hourly.retryAfterSeconds) } }
            );
        }

        const body = await request.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ error: "Geçersiz istek gövdesi (Invalid JSON)" }, { status: 400 });
        }

        const parsed = quoteSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Doğrulama başarısız oldu. Lütfen zorunlu alanları kontrol edin.", issues: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const text = `${parsed.data.message || ""} ${parsed.data.volume}`;
        if (looksLikeSpam(text) || looksLikeSpam(parsed.data.name)) {
            return NextResponse.json(
                { error: "Talebiniz güvenlik/spam filtresine takıldı. Lütfen içeriği kontrol edin." },
                { status: 400 }
            );
        }

        const productId = parsed.data.productId || null;
        const id = await createQuoteRequest({
            ...parsed.data,
            productId,
            productLabel: productLabelFor(productId) || parsed.data.categoryId,
            ip
        });

        // Connect with visitor session if present
        const cookieStore = await cookies();
        const visitorSessionId = cookieStore.get("ap_visitor_session")?.value;
        if (visitorSessionId) {
            await markSessionConversion(visitorSessionId, "rfq", id);
        }

        return NextResponse.json({ ok: true, id }, { status: 201 });
    } catch (err) {
        console.error("[quotes] submission failed:", err);
        return NextResponse.json({ error: "Sunucu veritabanı kayıt hatası. Lütfen daha sonra tekrar deneyin." }, { status: 500 });
    }
}
