"use client";

import { useState, useEffect } from "react";
import { type Locale } from "@/lib/i18n/locales";

type Props = {
    locale?: Locale;
};

const CONSENT_TEXTS: Record<string, { title: string; text: string; accept: string; decline: string; privacy: string }> = {
    tr: {
        title: "Gizlilik ve Analitik Tercihleri",
        text: "Sitemizde ziyaretçi deneyimini analiz etmek için birinci taraf analitik çerezleri kullanılmaktadır. Cihaz parmak izi veya kişisel veri toplanmaz.",
        accept: "Kabul Et",
        decline: "Reddet",
        privacy: "Gizlilik Politikası"
    },
    en: {
        title: "Privacy & Analytics Preferences",
        text: "We use first-party analytics cookies to measure site engagement and export inquiries. We do not perform device fingerprinting or store personal data without consent.",
        accept: "Accept",
        decline: "Decline",
        privacy: "Privacy Policy"
    },
    de: {
        title: "Datenschutz- und Analyseeinstellungen",
        text: "Wir verwenden First-Party-Analyse-Cookies, um die Nutzung unserer Website zu verstehen. Es werden keine Fingerabdrücke erstellt.",
        accept: "Akzeptieren",
        decline: "Ablehnen",
        privacy: "Datenschutzerklärung"
    },
    fr: {
        title: "Préférences de Confidentialité & Analytique",
        text: "Nous utilisons des cookies analytiques de première partie pour analyser la fréquentation. Aucune empreinte d'appareil n'est collectée.",
        accept: "Accepter",
        decline: "Refuser",
        privacy: "Politique de Confidentialité"
    },
    ar: {
        title: "تفضيلات الخصوصية والتحليلات",
        text: "نستخدم ملفات تعريف الارتباط للطرف الأول لتحليل تجربة التصفح. لا نجمع أي بيانات تعريف شخصية أو بصمة للجهاز.",
        accept: "موافق",
        decline: "رفض",
        privacy: "سياسة الخصوصية"
    }
};

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days = 365) {
    if (typeof document === "undefined") return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Lax`;
}

export default function AnalyticsConsent({ locale = "en" }: Props) {
    const [visible, setVisible] = useState(false);
    const content = CONSENT_TEXTS[locale] || CONSENT_TEXTS.en;

    useEffect(() => {
        // Read strictly from first-party cookie (no localStorage / sessionStorage)
        const consent = getCookie("ap_analytics_consent");
        if (!consent) {
            setVisible(true);
        }
    }, []);

    function handleChoice(granted: boolean) {
        setCookie("ap_analytics_consent", granted ? "granted" : "denied", 365);
        setVisible(false);
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("analytics_consent_changed", { detail: { granted } }));
        }
    }

    if (!visible) return null;

    return (
        <aside
            aria-label="Cookie and Analytics Consent"
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 rounded-2xl bg-slate-900/95 border border-cyan-500/30 p-5 shadow-2xl backdrop-blur-md text-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
            <div className="flex items-start gap-3">
                <span className="text-xl shrink-0 mt-0.5" role="img" aria-label="shield">🛡️</span>
                <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white tracking-wide">
                        {content.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        {content.text}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                        <button
                            type="button"
                            onClick={() => handleChoice(true)}
                            className="text-xs font-semibold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
                        >
                            {content.accept}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleChoice(false)}
                            className="text-xs font-medium px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                        >
                            {content.decline}
                        </button>
                        <a
                            href={`/${locale}/privacy`}
                            className="text-[11px] text-cyan-400 hover:underline ml-auto"
                        >
                            {content.privacy}
                        </a>
                    </div>
                </div>
            </div>
        </aside>
    );
}
