"use client";

import { useEffect } from "react";

export default function PwaRegister() {
    useEffect(() => {
        if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
            return;
        }

        const registerSw = () => {
            navigator.serviceWorker
                .register("/sw.js", { scope: "/", updateViaCache: "none" })
                .then((reg) => {
                    if (process.env.NODE_ENV !== "production") {
                        console.log("[PWA] Service worker registered:", reg.scope);
                    }
                })
                .catch((err) => {
                    console.warn("[PWA] Service worker registration failed:", err);
                });
        };

        if (document.readyState === "complete") {
            registerSw();
            return;
        }

        window.addEventListener("load", registerSw);
        return () => window.removeEventListener("load", registerSw);
    }, []);

    return null;
}

