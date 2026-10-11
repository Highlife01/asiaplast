"use client";

/**
 * Client Firebase SDK — ONLY used for optional GA-free anonymous analytics hooks.
 * IMPORTANT: persistence is disabled; no localStorage/sessionStorage/IndexedDB is used.
 * All business data flows through server APIs. Auth for admins is cookie-based (server).
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { initializeFirestore, type Firestore } from "firebase/firestore";
import { getAuth, initializeAuth, inMemoryPersistence, type Auth } from "firebase/auth";

let app: FirebaseApp | null = null;

export function clientApp(): FirebaseApp | null {
    if (app) return app;
    if (getApps().length) {
        app = getApps()[0];
        return app;
    }
    const cfg = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };
    if (!cfg.apiKey || !cfg.projectId) return null;
    app = initializeApp(cfg);
    return app;
}

/** Returns a Firestore instance with offline persistence explicitly NOT enabled. */
export function clientDb(): Firestore | null {
    const a = clientApp();
    if (!a) return null;
    return initializeFirestore(a, {});
}

/** Admin login only. Persistence is in-memory — the HttpOnly session cookie is the real session. */
export function clientAuth(): Auth | null {
    const a = clientApp();
    if (!a) return null;
    try {
        return initializeAuth(a, { persistence: inMemoryPersistence });
    } catch {
        return getAuth(a);
    }
}
