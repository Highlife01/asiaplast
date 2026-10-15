import { NextResponse } from "next/server";
import { contactSchema, looksLikeSpam } from "@/lib/validation";
import { createContactMessage } from "@/lib/repo";
import { rateLimitShared } from "@/lib/rateLimit";
import { getClientIp, getSessionBag, verifySameOrigin } from "@/lib/session";
import { RATE_LIMITS } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        if (!(await verifySameOrigin(request))) {
            return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
        }

        const ip = await getClientIp();
        const burst = await rateLimitShared(`contact:${ip}`, 3, RATE_LIMITS.contactMs);
        if (!burst.allowed) {
            return NextResponse.json(
                { error: "Çok fazla istek gönderildi. Lütfen kısa süre sonra tekrar deneyin.", code: "RATE_LIMITED" },
                { status: 429, headers: { "Retry-After": String(burst.retryAfterSeconds) } }
            );
        }
        const hourly = await rateLimitShared(`contact-hour:${ip}`, RATE_LIMITS.hourlyMax, 3600_000);
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

        const parsed = contactSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Doğrulama hatası", issues: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        // Honeypot spam filter
        if (parsed.data.honeypot && parsed.data.honeypot.trim().length > 0) {
            return NextResponse.json({ ok: true, id: "filtered" });
        }

        if (
            looksLikeSpam(parsed.data.message) ||
            looksLikeSpam(parsed.data.name) ||
            looksLikeSpam(parsed.data.subject || "")
        ) {
            return NextResponse.json({ ok: true, id: "filtered" });
        }

        const bag = await getSessionBag();
        const sessionId = bag.consent === "all" && bag.sid ? bag.sid : null;
        const testHeader = request.headers.get("x-asiaplast-test") === "1";

        const result = await createContactMessage({
            name: parsed.data.name,
            company: parsed.data.company,
            email: parsed.data.email,
            phone: parsed.data.phone,
            country: parsed.data.country,
            subject: parsed.data.subject,
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
                deduplicated: result.deduplicated,
                confirmedAt: new Date().toISOString()
            },
            { status: 201 }
        );
    } catch (err) {
        console.error("[contact] submission failed:", err);
        return NextResponse.json(
            { error: "Sunucu hatası — mesajınız kaydedilemedi. Lütfen tekrar deneyin." },
            { status: 500 }
        );
    }
}
