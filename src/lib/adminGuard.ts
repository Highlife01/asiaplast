import "server-only";
import { NextResponse } from "next/server";

/**
 * Shared helpers for admin API route handlers.
 */

/** Returns a 401 response when the error came from requireSession(), otherwise null. */
export function unauthorizedResponse(err: unknown): NextResponse | null {
    const message = (err as { message?: string } | null)?.message;
    if (message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return null;
}

/** Returns a 400 response when a repo-layer status validation failed, otherwise null. */
export function invalidStatusResponse(err: unknown): NextResponse | null {
    const message = (err as { message?: string } | null)?.message;
    if (message === "INVALID_STATUS") {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }
    return null;
}

/**
 * CSRF defence-in-depth for state-changing admin requests: the Origin (or Referer)
 * header, when present, must match the Host the request was sent to.
 * Returns a 403 response on mismatch, otherwise null.
 */
export function rejectCrossOrigin(request: Request): NextResponse | null {
    const origin = request.headers.get("origin") || request.headers.get("referer");
    if (!origin) return null; // non-browser clients / same-origin GETs
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    try {
        if (host && new URL(origin).host !== host) {
            return NextResponse.json({ error: "Cross-origin request blocked" }, { status: 403 });
        }
    } catch {
        return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }
    return null;
}
