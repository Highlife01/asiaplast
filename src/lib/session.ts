import { cookies, headers } from "next/headers";
import { createHmac, timingSafeEqual, randomUUID, randomBytes } from "crypto";
import { existsSync, readFileSync } from "fs";
import { ADMIN_SESSION_TTL_HOURS, SITE_URL } from "./config";
import { db, COLLECTIONS } from "./firebaseAdmin";

if (typeof window !== "undefined") {
    throw new Error("session module can only be imported on the server.");
}

/**
 * Server-only session & first-party cookie bag management.
 *
 * HARD RULE: no localStorage / sessionStorage / IndexedDB anywhere in this app.
 * Firebase Hosting CDN only forwards the `__session` cookie to the backend.
 * Therefore, admin auth token, analytics consent state, and first-party session/visitor IDs
 * are packed into the single HttpOnly, Secure, SameSite=Lax `__session` cookie.
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

export type SessionBag = {
    admin?: string;
    consent?: "all" | "necessary";
    vid?: string;
    sid?: string;
    sidExp?: number;
};

let cachedSecret: string | null = null;

function getSyncFallbackSecret(): string {
    if (process.env.ADMIN_SESSION_SECRET) return process.env.ADMIN_SESSION_SECRET;
    if (existsSync("./jwt_secret.txt")) return readFileSync("./jwt_secret.txt", "utf-8").trim();
    if (!cachedSecret) {
        console.warn("Generating ephemeral secret. Instance-isolated!");
        cachedSecret = randomBytes(32).toString("hex");
    }
    return cachedSecret;
}

async function getServerSecret(): Promise<string> {
    if (process.env.ADMIN_SESSION_SECRET) return process.env.ADMIN_SESSION_SECRET;
    if (existsSync("./jwt_secret.txt")) return readFileSync("./jwt_secret.txt", "utf-8").trim();
    if (cachedSecret) return cachedSecret;

    try {
        const ref = db().collection(COLLECTIONS.settings).doc("_internal_auth");
        const snap = await ref.get();
        const existing = snap.data()?.hmacSecret as string | undefined;
        if (existing && existing.length >= 32) {
            cachedSecret = existing;
            return cachedSecret;
        }
        const generated = randomBytes(48).toString("base64url");
        await ref.set({ hmacSecret: generated, createdAt: new Date().toISOString() }, { merge: true });
        cachedSecret = generated;
        return cachedSecret;
    } catch {
        return getSyncFallbackSecret();
    }
}

function b64url(input: Buffer | string): string {
    return Buffer.from(input).toString("base64url");
}

function signWithSecret(data: string, secret: string): string {
    return createHmac("sha256", secret).update(data).digest("base64url");
}

export function parseSessionBag(rawCookie?: string | null): SessionBag {
    const bag: SessionBag = {};
    const raw = (rawCookie || "").trim();
    if (!raw) return bag;

    if (raw.includes("=")) {
        const params = new URLSearchParams(raw);
        const admin = params.get("admin")?.trim();
        const consent = params.get("consent")?.trim();
        const vid = params.get("vid")?.trim();
        const sid = params.get("sid")?.trim();
        const sidExp = Number(params.get("sidExp") || 0);
        if (admin) bag.admin = admin;
        if (consent === "all" || consent === "necessary") bag.consent = consent;
        if (vid && /^[\w-]{8,64}$/.test(vid)) bag.vid = vid;
        if (sid && /^[\w-]{8,64}$/.test(sid)) bag.sid = sid;
        if (Number.isFinite(sidExp) && sidExp > 0) bag.sidExp = sidExp;
    } else if (raw.includes(".")) {
        bag.admin = raw;
    }
    return bag;
}

export function serializeSessionBag(bag: SessionBag): string {
    const params = new URLSearchParams();
    if (bag.admin) params.set("admin", bag.admin);
    if (bag.consent) params.set("consent", bag.consent);
    if (bag.vid) params.set("vid", bag.vid);
    if (bag.sid) params.set("sid", bag.sid);
    if (bag.sidExp) params.set("sidExp", String(bag.sidExp));
    return params.toString();
}

export async function getSessionBag(): Promise<SessionBag> {
    const store = await cookies();
    return parseSessionBag(store.get(SESSION_COOKIE)?.value);
}

export async function createSessionToken(payload: Omit<SessionPayload, "iat" | "exp" | "jti">): Promise<string> {
    const secret = await getServerSecret();
    const now = Math.floor(Date.now() / 1000);
    const ttlHours = Number(ADMIN_SESSION_TTL_HOURS || 12);
    const jti = randomUUID();
    const full: SessionPayload = {
        ...payload,
        iat: now,
        exp: now + ttlHours * 3600,
        jti
    };
    const body = b64url(JSON.stringify(full));
    const token = `${body}.${signWithSecret(body, secret)}`;

    // Record active session jti in Firestore so logout invalidates server-side session
    try {
        await db()
            .collection(COLLECTIONS.admins)
            .doc(payload.uid)
            .set(
                {
                    uid: payload.uid,
                    email: payload.email,
                    activeJti: jti,
                    lastSessionAt: new Date().toISOString()
                },
                { merge: true }
            );
    } catch {
        // Non-fatal if Firestore write fails during session creation
    }

    return token;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
    if (!token) return null;
    const idx = token.lastIndexOf(".");
    if (idx <= 0) return null;
    const body = token.slice(0, idx);
    const mac = token.slice(idx + 1);
    const secret = await getServerSecret();
    const expected = signWithSecret(body, secret);
    const a = Buffer.from(mac);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    try {
        const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
        if (!payload || typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) return null;
        if (payload.admin !== true) return null;

        // Check if session was explicitly revoked on server
        try {
            const adminDoc = await db().collection(COLLECTIONS.admins).doc(payload.uid).get();
            if (adminDoc.exists) {
                const data = adminDoc.data();
                if (data?.disabled === true) return null;
                if (data?.revokedJti && data.revokedJti === payload.jti) return null;
            }
        } catch {
            // Allow valid signed token if Firestore check is transiently unavailable
        }

        return payload;
    } catch {
        return null;
    }
}

export async function revokeSession(payload: SessionPayload | null): Promise<void> {
    if (!payload) return;
    try {
        await db()
            .collection(COLLECTIONS.admins)
            .doc(payload.uid)
            .set(
                {
                    activeJti: null,
                    revokedJti: payload.jti,
                    revokedAt: new Date().toISOString()
                },
                { merge: true }
            );
    } catch {
        // Ignore
    }
}

/** Read the current admin session from cookies (server components / route handlers). */
export async function getSession(): Promise<SessionPayload | null> {
    const bag = await getSessionBag();
    return verifySessionToken(bag.admin);
}

/** Convenience guard for route handlers and server components. */
export async function requireSession(): Promise<SessionPayload> {
    const session = await getSession();
    if (!session) throw new Error("UNAUTHORIZED");
    return session;
}

/** Verify same-origin for state-changing requests (CSRF protection). */
export async function verifySameOrigin(request: Request): Promise<boolean> {
    const h = await headers();
    const origin = request.headers.get("origin") || h.get("origin");
    const host = h.get("x-forwarded-host") || h.get("host") || "";
    if (!origin) {
        // Same-origin fetch from modern browsers sends Sec-Fetch-Site
        const secSite = request.headers.get("sec-fetch-site") || h.get("sec-fetch-site");
        if (secSite && secSite !== "same-origin" && secSite !== "none") return false;
        return true;
    }
    try {
        const originUrl = new URL(origin);
        const siteUrl = new URL(SITE_URL);
        if (originUrl.host === host) return true;
        if (originUrl.host === siteUrl.host) return true;
        if (originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1") return true;
        if (originUrl.hostname.endsWith(".web.app") || originUrl.hostname.endsWith(".firebaseapp.com")) {
            if (originUrl.hostname.startsWith("asiaplast")) return true;
        }
        return false;
    } catch {
        return false;
    }
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

/**
 * Client IP for rate limiting — derived from proxy headers, server-side only. Never stored in DB.
 * Firebase Hosting's CDN sets `fastly-client-ip` itself, so it cannot be spoofed by the client
 * (unlike the left-most x-forwarded-for entry, which the client may prepend).
 */
export async function getClientIp(): Promise<string> {
    const h = await headers();
    const trusted = h.get("fastly-client-ip");
    if (trusted) return trusted.trim();
    const fwd = h.get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0].trim();
    return h.get("x-real-ip") || "unknown";
}
