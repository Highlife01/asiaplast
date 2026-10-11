import { NextResponse } from "next/server";
import { quoteSchema, looksLikeSpam } from "@/lib/validation";
import { createQuoteRequest } from "@/lib/repo";
import { rateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/session";
import { RATE_LIMITS } from "@/lib/config";
import { productLabelFor } from "@/lib/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        const ip = await getClientIp();
        const burst = rateLimit(`quote:${ip}`, 3, RATE_LIMITS.quoteMs);
        if (!burst.allowed) {
            return NextResponse.json(
                { error: "Too many requests", code: "RATE_LIMITED" },
                { status: 429, headers: { "Retry-After": String(burst.retryAfterSeconds) } }
            );
        }
        const hourly = rateLimit(`quote-hour:${ip}`, RATE_LIMITS.hourlyMax, 3600_000);
        if (!hourly.allowed) {
            return NextResponse.json(
                { error: "Too many requests", code: "RATE_LIMITED" },
                { status: 429, headers: { "Retry-After": String(hourly.retryAfterSeconds) } }
            );
        }

        const body = await request.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const parsed = quoteSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const text = `${parsed.data.message} ${parsed.data.volume}`;
        if (looksLikeSpam(text) || looksLikeSpam(parsed.data.name)) {
            return NextResponse.json({ ok: true, id: "filtered" });
        }

        const productId = parsed.data.productId || null;
        const id = await createQuoteRequest({
            ...parsed.data,
            productId,
            productLabel: productLabelFor(productId) || parsed.data.categoryId,
            ip
        });
        return NextResponse.json({ ok: true, id }, { status: 201 });
    } catch (err) {
        console.error("[quotes] submission failed:", err);
        return NextResponse.json({ error: "Internal error — please try again later." }, { status: 500 });
    }
}
