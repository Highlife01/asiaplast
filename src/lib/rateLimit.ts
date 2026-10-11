/**
 * In-memory fixed-window rate limiter (per server instance).
 * For multi-instance scale, swap the Map for Firestore-backed counters.
 */

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
