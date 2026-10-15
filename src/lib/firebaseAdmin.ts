import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getStorage, type Storage } from "firebase-admin/storage";

if (typeof window !== "undefined") {
    throw new Error("firebaseAdmin can only be imported on the server.");
}

/**
 * Server-side Firebase Admin SDK for project `ajansonline`.
 * Credentials never reach the browser bundle.
 * Preference: FIREBASE_SERVICE_ACCOUNT_JSON env var, else
 * GOOGLE_APPLICATION_CREDENTIALS file path, else Application Default Credentials.
 */

let cachedApp: App | null = null;

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "ajansonline";
const STORAGE_BUCKET =
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    process.env.FIREBASE_STORAGE_BUCKET ||
    "ajansonline.firebasestorage.app";

function getApp(): App {
    if (cachedApp) return cachedApp;
    const existing = getApps();
    if (existing.length) {
        cachedApp = existing[0];
        return cachedApp;
    }

    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (raw) {
        const json = JSON.parse(raw) as Record<string, string>;
        cachedApp = initializeApp({
            credential: cert({
                projectId: json.project_id || PROJECT_ID,
                clientEmail: json.client_email,
                privateKey: json.private_key?.replace(/\\n/g, "\n")
            }),
            projectId: json.project_id || PROJECT_ID,
            storageBucket: STORAGE_BUCKET
        });
    } else {
        cachedApp = initializeApp({
            projectId: PROJECT_ID,
            storageBucket: STORAGE_BUCKET
        });
    }
    return cachedApp;
}

export function db(): Firestore {
    return getFirestore(getApp());
}

export function adminAuth(): Auth {
    return getAuth(getApp());
}

export function adminStorage(): Storage {
    return getStorage(getApp());
}

/**
 * Isolated Firestore collections for ASIAPLAST within the shared `ajansonline` project.
 */
export const COLLECTIONS = {
    settings: "asiaplast_settings",
    products: "asiaplast_products",
    slugRedirects: "asiaplast_slug_redirects",
    contactMessages: "asiaplast_messages",
    quoteRequests: "asiaplast_quotes",
    orders: "asiaplast_orders",
    visits: "asiaplast_visits",
    loginLogs: "asiaplast_login_logs",
    auditLogs: "asiaplast_audit_logs",
    admins: "asiaplast_admins",
    rateLimits: "asiaplast_rate_limits"
} as const;
