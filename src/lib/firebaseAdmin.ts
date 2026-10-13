import "server-only";
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";

/**
 * Server-side Firebase Admin SDK.
 * Credentials never reach the browser bundle ("server-only" import guard).
 * Preference: FIREBASE_SERVICE_ACCOUNT_JSON env var, else
 * GOOGLE_APPLICATION_CREDENTIALS file path, else Application Default Credentials.
 */

let cachedApp: App | null = null;

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
                projectId: json.project_id,
                clientEmail: json.client_email,
                privateKey: json.private_key?.replace(/\\n/g, "\n")
            })
        });
    } else {
        cachedApp = initializeApp(); // uses GOOGLE_APPLICATION_CREDENTIALS or ADC
    }
    return cachedApp;
}

export function db(): Firestore {
    return getFirestore(getApp());
}

export function adminAuth(): Auth {
    return getAuth(getApp());
}

export const COLLECTIONS = {
    settings: "settings",
    products: "products",
    productVariants: "productVariants",
    categories: "categories",
    contactMessages: "contactMessages",
    quoteRequests: "quoteRequests",
    quotes: "quotes",
    orders: "orders",
    orderEvents: "orderEvents",
    customers: "customers",
    distributors: "distributors",
    users: "users",
    notifications: "notifications",
    blogPosts: "blogPosts",
    pages: "pages",
    translations: "translations",
    seoSettings: "seoSettings",
    mediaAssets: "mediaAssets",
    auditLogs: "auditLogs",
    visitorSessions: "visitorSessions",
    loginLogs: "loginLogs"
} as const;
