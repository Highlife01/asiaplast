"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n/locales";
import VisitBeacon from "./VisitBeacon";

const COPY: Partial<
    Record<
        Locale,
        {
            title: string;
            desc: string;
            acceptAll: string;
            necessaryOnly: string;
        }
    >
> = {
    tr: {
        title: "Çerez ve Ziyaretçi Analizi İzni",
        desc: "Sitemizi geliştirmek, ziyaret edilen sayfaları ve form dönüşümlerini anonim olarak ölçmek için birinci taraf analitik çerezleri kullanıyoruz. Kişisel IP adresiniz kaydedilmez.",
        acceptAll: "Analitik Çerezleri Kabul Et",
        necessaryOnly: "Yalnızca Zorunlu Çerezler"
    },
    en: {
        title: "First-Party Analytics & Cookie Consent",
        desc: "We use first-party analytics cookies to measure page visits and inquiry conversions anonymously. Raw IP addresses are never stored.",
        acceptAll: "Accept Analytics",
        necessaryOnly: "Necessary Only"
    },
    de: {
        title: "Cookie- & Analyse-Einstellungen",
        desc: "Wir verwenden First-Party-Analyse-Cookies, um Seitenbesuche und Anfragen anonym auszuwerten. IP-Adressen werden nicht gespeichert.",
        acceptAll: "Analyse akzeptieren",
        necessaryOnly: "Nur notwendige"
    },
    fr: {
        title: "Consentement aux Cookies d'Analyse",
        desc: "Nous utilisons des cookies analytiques propriétaires pour mesurer anonymement les visites et demandes de devis. Aucune adresse IP brute n'est stockée.",
        acceptAll: "Accepter l'analyse",
        necessaryOnly: "Essentiels uniquement"
    },
    ar: {
        title: "موافقة ملفات تعريف الارتباط والتحليلات",
        desc: "نستخدم ملفات تعريف ارتباط تحليلية للطرف الأول لقياس زيارات الصفحات وطلبات الأسعار بشكل مجهول دون تخزين عناوين IP.",
        acceptAll: "قبول التحليلات",
        necessaryOnly: "الضرورية فقط"
    }
};

export default function CookieConsentBanner({
    locale,
    initialConsent
}: {
    locale: Locale;
    initialConsent?: "all" | "necessary" | null;
}) {
    const [consent, setConsent] = useState<"all" | "necessary" | null | "loading">(
        initialConsent !== undefined ? initialConsent : "loading"
    );
    const [saving, setSaving] = useState(false);
    const copy = COPY[locale] || COPY.en!;

    useEffect(() => {
        if (initialConsent !== undefined) return;
        let active = true;
        fetch("/api/consent", { cache: "no-store" })
            .then((r) => r.json())
            .then((data: { consent?: "all" | "necessary" | null }) => {
                if (active) setConsent(data.consent || null);
            })
            .catch(() => {
                if (active) setConsent(null);
            });
        return () => {
            active = false;
        };
    }, [initialConsent]);

    async function handleChoice(choice: "all" | "necessary") {
        setSaving(true);
        try {
            const res = await fetch("/api/consent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ consent: choice })
            });
            if (res.ok) {
                setConsent(choice);
            }
        } catch {
            // Ignore network error
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            {consent === "all" && <VisitBeacon locale={locale} enabled={true} />}
            {consent === null && (
                <div
                    role="region"
                    aria-label={copy.title}
                    className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-3.5 shadow-2xl backdrop-blur-md sm:px-6"
                >
                    <div className="container-xl flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                        <div className="max-w-3xl">
                            <p className="text-xs font-bold text-brand-navy">{copy.title}</p>
                            <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{copy.desc}</p>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => handleChoice("necessary")}
                                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                            >
                                {copy.necessaryOnly}
                            </button>
                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => handleChoice("all")}
                                className="rounded-lg bg-brand-green px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-green-dark disabled:opacity-50"
                            >
                                {copy.acceptAll}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
