import "server-only";
import { cookies, headers } from "next/headers";
import { createHmac, timingSafeEqual, randomUUID } from "crypto";
import { ADMIN_SESSION_TTL_HOURS } from "./config";

/**
 * Server-only session management for the admin dashboard.
 *
 * HARD RULE: no localStorage / sessionStorage / IndexedDB anywhere in this app.
 * Admin identity lives in a signed, HttpOnly, Secure, SameSite=Lax cookie.
 * Nothing about the session is persisted in the browser beyond that cookie.
 */

export const SESSION_COOKIE = "__session";

export type SessionPayload = {
    uid: string;
    email: string;
    displayName: string;
    roles: string[];
    admin: boolean;
    iat: number;
    exp: number;
    jti: string;
};

function getSecret(): string {
    const secret =
        process.env.ADMIN_SESSION_SECRET ||
        "asiaplast_production_superadmin_session_hmac_secret_2026_x89a1bc";
    return secret;
}

function b64url(input: Buffer | string): string {
    return Buffer.from(input).toString("base64url");
}

function sign(data: string): string {
    return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

export function createSessionToken(payload: Omit<SessionPayload, "iat" | "exp" | "jti">): string {
    const now = Math.floor(Date.now() / 1000);
    const ttlHours = Number(ADMIN_SESSION_TTL_HOURS || 12);
    const full: SessionPayload = {
        ...payload,
        iat: now,
        exp: now + ttlHours * 3600,
        jti: randomUUID()
    };
    const body = b64url(JSON.stringify(full));
    return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
    if (!token) return null;
    const idx = token.lastIndexOf(".");
    if (idx <= 0) return null;
    const body = token.slice(0, idx);
    const mac = token.slice(idx + 1);
    const expected = sign(body);
    const a = Buffer.from(mac);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    try {
        const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
        if (!payload || typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) return null;
        if (payload.admin !== true) return null;
        return payload;
    } catch {
        return null;
    }
}

/** Read the current admin session from cookies (server components / route handlers). */
export async function getSession(): Promise<SessionPayload | null> {
    const store = await cookies();
    return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Convenience guard for route handlers and server components. */
export async function requireSession(): Promise<SessionPayload> {
    const session = await getSession();
    if (!session) throw new Error("UNAUTHORIZED");
    return session;
}

export function sessionCookieOptions(maxAgeSeconds: number) {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge: maxAgeSeconds
    };
}

/** Client IP for rate limiting — derived from proxy headers, server-side only. */
export async function getClientIp(): Promise<string> {
    const h = await headers();
    const fwd = h.get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0].trim();
    return h.get("x-real-ip") || "unknown";
}
