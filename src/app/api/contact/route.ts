import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { contactSchema, looksLikeSpam } from "@/lib/validation";
import { createContactMessage } from "@/lib/repo";
import { rateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/session";
import { RATE_LIMITS } from "@/lib/config";
import { markSessionConversion } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        const ip = await getClientIp();
        const burst = rateLimit(`contact:${ip}`, 3, RATE_LIMITS.contactMs);
        if (!burst.allowed) {
            return NextResponse.json(
                { error: "Çok fazla istek gönderildi. Lütfen bekleyin.", code: "RATE_LIMITED" },
                { status: 429, headers: { "Retry-After": String(burst.retryAfterSeconds) } }
            );
        }
        const hourly = rateLimit(`contact-hour:${ip}`, RATE_LIMITS.hourlyMax, 3600_000);
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

        const parsed = contactSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Doğrulama başarısız oldu. Lütfen tüm zorunlu alanları doldurun.", issues: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        if (looksLikeSpam(parsed.data.message) || looksLikeSpam(parsed.data.name)) {
            return NextResponse.json(
                { error: "Mesajınız güvenlik/spam filtresine takıldı. Lütfen içeriği kontrol edin." },
                { status: 400 }
            );
        }

        const id = await createContactMessage({ ...parsed.data, ip });

        // Connect with visitor session if present
        const cookieStore = await cookies();
        const visitorSessionId = cookieStore.get("ap_visitor_session")?.value;
        if (visitorSessionId) {
            await markSessionConversion(visitorSessionId, "contact", id);
        }

        return NextResponse.json({ ok: true, id }, { status: 201 });
    } catch (err) {
        console.error("[contact] submission failed:", err);
        return NextResponse.json({ error: "Sunucu veritabanı kayıt hatası. Lütfen daha sonra tekrar deneyin." }, { status: 500 });
    }
}
