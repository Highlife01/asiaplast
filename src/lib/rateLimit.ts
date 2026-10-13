/**
 * In-memory fixed-window rate limiter (per server instance).
 * For multi-instance scale, swap the Map for Firestore-backed counters.
 * `rateLimitShared` below does exactly that and falls back to this limiter if Firestore fails.
 */

import { createHash } from "crypto";
import { db } from "./firebaseAdmin";

type Window = { count: number; resetAt: number };

const globalStore = globalThis as unknown as { __apRateLimit?: Map<string, Window> };
const store: Map<string, Window> = globalStore.__apRateLimit ?? new Map();
globalStore.__apRateLimit = store;

export type RateResult = { allowed: boolean; retryAfterSeconds: number; remaining: number };

export function rateLimit(key: string, max: number, windowMs: number): RateResult {
    const now = Date.now();
    const current = store.get(key);

    if (!current || current.resetAt <= now) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        // Opportunistic cleanup to bound memory.
        if (store.size > 5000) {
            store.forEach((v, k) => {
                if (v.resetAt <= now) store.delete(k);
            });
        }
        return { allowed: true, retryAfterSeconds: 0, remaining: max - 1 };
    }

    if (current.count >= max) {
        return {
            allowed: false,
            retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
            remaining: 0
        };
    }

    current.count += 1;
    return { allowed: true, retryAfterSeconds: 0, remaining: max - current.count };
}

/**
 * Firestore-backed fixed-window limiter shared across all server instances.
 * Documents live in the `rateLimits` collection (Admin SDK only; client rules deny everything).
 * `expiresAt` allows an optional Firestore TTL policy to purge old counters.
 * If Firestore is unreachable the request falls back to the in-memory limiter (fail-soft).
 */
export async function rateLimitShared(key: string, max: number, windowMs: number): Promise<RateResult> {
    try {
        const id = createHash("sha256").update(key).digest("hex").slice(0, 40);
        const ref = db().collection("rateLimits").doc(id);
        return await db().runTransaction(async (tx) => {
            const now = Date.now();
            const snap = await tx.get(ref);
            const data = snap.exists ? (snap.data() as { count: number; resetAt: number }) : null;

            if (!data || data.resetAt <= now) {
                tx.set(ref, { count: 1, resetAt: now + windowMs, expiresAt: new Date(now + windowMs * 2) });
                return { allowed: true, retryAfterSeconds: 0, remaining: max - 1 };
            }
            if (data.count >= max) {
                return {
                    allowed: false,
                    retryAfterSeconds: Math.max(1, Math.ceil((data.resetAt - now) / 1000)),
                    remaining: 0
                };
            }
            tx.update(ref, { count: data.count + 1 });
            return { allowed: true, retryAfterSeconds: 0, remaining: max - data.count - 1 };
        });
    } catch (err) {
        console.error("[rateLimitShared] falling back to in-memory limiter:", err);
        return rateLimit(key, max, windowMs);
    }
}
