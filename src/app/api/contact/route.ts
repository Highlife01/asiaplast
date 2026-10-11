import { NextResponse } from "next/server";
import { contactSchema, looksLikeSpam } from "@/lib/validation";
import { createContactMessage } from "@/lib/repo";
import { rateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/session";
import { RATE_LIMITS } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        const ip = await getClientIp();
        const burst = rateLimit(`contact:${ip}`, 3, RATE_LIMITS.contactMs);
        if (!burst.allowed) {
            return NextResponse.json(
                { error: "Too many requests", code: "RATE_LIMITED" },
                { status: 429, headers: { "Retry-After": String(burst.retryAfterSeconds) } }
            );
        }
        const hourly = rateLimit(`contact-hour:${ip}`, RATE_LIMITS.hourlyMax, 3600_000);
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

        const parsed = contactSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        if (looksLikeSpam(parsed.data.message) || looksLikeSpam(parsed.data.name)) {
            // Store nothing; respond generically so bots learn nothing.
            return NextResponse.json({ ok: true, id: "filtered" });
        }

        const id = await createContactMessage({ ...parsed.data, ip });
        return NextResponse.json({ ok: true, id }, { status: 201 });
    } catch (err) {
        console.error("[contact] submission failed:", err);
        return NextResponse.json({ error: "Internal error — please try again later." }, { status: 500 });
    }
}
