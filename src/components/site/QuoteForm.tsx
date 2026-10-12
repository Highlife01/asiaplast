"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/locales";

export type QuoteProductOption = { id: string; name: string; category: string };

const DELIVERY_TERMS = ["FOB", "CIF", "DAP", "EXW"] as const;

interface FormLocalText {
    gaugeLabel: string;
    gaugePlaceholder: string;
    gaugeOptions: { value: string; label: string }[];
    materialLabel: string;
    materialPlaceholder: string;
    materialOptions: { value: string; label: string }[];
    refHelp: string;
    copyBtn: string;
    copiedText: string;
}

const FORM_EXTRA_TEXT: Record<string, FormLocalText> = {
    tr: {
        gaugeLabel: "Hedef Kalınlık / Mikron",
        gaugePlaceholder: "Seçiniz (veya mesajda belirtiniz)",
        gaugeOptions: [
            { value: "30-60 µm", label: "Standart / Ticari (30 - 60 µm)" },
            { value: "70-100 µm", label: "Ağır Hizmet / Endüstriyel (70 - 100 µm)" },
            { value: "110-150 µm", label: "Ekstra Güçlü / Şantiye & Konteyner (110 - 150 µm)" },
            { value: "Custom", label: "Özel Mikron Talebi (Mesajda belirtilecek)" }
        ],
        materialLabel: "Hammadde / Polimer Tipi",
        materialPlaceholder: "Hammadde tercihi seçiniz",
        materialOptions: [
            { value: "100% Virgin LDPE/HDPE", label: "100% Orijinal Polimer (Virgin LDPE/HDPE)" },
            { value: "PCR Recycled Blend (30-50%)", label: "PCR Geri Dönüştürülmüş Karışım (%30 - %50)" },
            { value: "100% Recycled Industrial", label: "100% Yüksek Mukavemetli Geri Dönüşümlü" }
        ],
        refHelp: "Talebiniz üretim ve ihracat birimimize ulaştı. 24 iş saati içinde resmi proforma teklif ve TDS teknik föy iletilecektir.",
        copyBtn: "Referans Kodunu Kopyala",
        copiedText: "Kopyalandı!"
    },
    en: {
        gaugeLabel: "Target Thickness / Gauge",
        gaugePlaceholder: "Select gauge (or detail in message)",
        gaugeOptions: [
            { value: "30-60 µm", label: "Standard Commercial (30 - 60 µm / 1.2 - 2.4 mil)" },
            { value: "70-100 µm", label: "Heavy Duty Industrial (70 - 100 µm / 2.8 - 4.0 mil)" },
            { value: "110-150 µm", label: "Extra Heavy Duty / Construction (110 - 150 µm)" },
            { value: "Custom", label: "Custom Specification (Details in notes)" }
        ],
        materialLabel: "Raw Material & Polymer Blend",
        materialPlaceholder: "Select polymer blend preference",
        materialOptions: [
            { value: "100% Virgin LDPE/HDPE", label: "100% Virgin LDPE / HDPE (High Tensile)" },
            { value: "PCR Recycled Blend (30-50%)", label: "PCR Recycled Blend (30% - 50% Post-Consumer)" },
            { value: "100% Recycled Industrial", label: "100% High-Grade Recycled Polymer" }
        ],
        refHelp: "Your request is registered with our export division. A formal commercial offer and TDS datasheet will be returned within 24 business hours.",
        copyBtn: "Copy Reference Code",
        copiedText: "Copied!"
    },
    de: {
        gaugeLabel: "Zielstärke / Folienstärke",
        gaugePlaceholder: "Stärke wählen (oder Nachricht angeben)",
        gaugeOptions: [
            { value: "30-60 µm", label: "Standard Gewerblich (30 - 60 µm)" },
            { value: "70-100 µm", label: "Schwerlast Industrie (70 - 100 µm)" },
            { value: "110-150 µm", label: "Extra Schwer / Bau & Container (110 - 150 µm)" },
            { value: "Custom", label: "Sonderanfertigung (Details im Freitext)" }
        ],
        materialLabel: "Rohstoff / Polymermischung",
        materialPlaceholder: "Rohstoff wählen",
        materialOptions: [
            { value: "100% Virgin LDPE/HDPE", label: "100% Neuware LDPE / HDPE (Virgin)" },
            { value: "PCR Recycled Blend (30-50%)", label: "PCR-Rezyklatanteil (30% - 50%)" },
            { value: "100% Recycled Industrial", label: "100% Recyceltes Industriepolymer" }
        ],
        refHelp: "Ihre Anfrage ist eingegangen. Sie erhalten innerhalb von 24 Arbeitsstunden ein proforma Angebot und das technische Datenblatt (TDS).",
        copyBtn: "Referenzcode kopieren",
        copiedText: "Kopiert!"
    },
    fr: {
        gaugeLabel: "Épaisseur / Micronnage Cible",
        gaugePlaceholder: "Sélectionnez l'épaisseur souhaitée",
        gaugeOptions: [
            { value: "30-60 µm", label: "Standard Commercial (30 - 60 µm)" },
            { value: "70-100 µm", label: "Haute Résistance Industriel (70 - 100 µm)" },
            { value: "110-150 µm", label: "Extra Renforcé / Chantier (110 - 150 µm)" },
            { value: "Custom", label: "Spécification Sur-Mesure" }
        ],
        materialLabel: "Matière Première & Polymère",
        materialPlaceholder: "Sélectionnez la matière",
        materialOptions: [
            { value: "100% Virgin LDPE/HDPE", label: "100% Polymère Vierge (LDPE / HDPE)" },
            { value: "PCR Recycled Blend (30-50%)", label: "Mélange Recyclé PCR (30% - 50%)" },
            { value: "100% Recycled Industrial", label: "100% Recyclé Haute Résistance" }
        ],
        refHelp: "Votre demande est prise en charge par notre bureau export. Une offre formelle et la fiche TDS vous seront remises sous 24 heures ouvrées.",
        copyBtn: "Copier la Référence",
        copiedText: "Copié !"
    },
    ar: {
        gaugeLabel: "السماكة المستهدفة / الميكرون",
        gaugePlaceholder: "اختر السماكة المطلوبة",
        gaugeOptions: [
            { value: "30-60 µm", label: "تجاري قياسي (30 - 60 ميكرون)" },
            { value: "70-100 µm", label: "خدمة شاقة صناعية (70 - 100 ميكرون)" },
            { value: "110-150 µm", label: "فائق المتانة للبناء والحاويات (110 - 150 ميكرون)" },
            { value: "Custom", label: "مواصفات خاصة حسب الطلب" }
        ],
        materialLabel: "المادة الخام ونوع البوليمر",
        materialPlaceholder: "اختر نوع الخامة",
        materialOptions: [
            { value: "100% Virgin LDPE/HDPE", label: "100% بوليمر بكر (LDPE / HDPE)" },
            { value: "PCR Recycled Blend (30-50%)", label: "مزيج معاد تدويره بعد الاستهلاك PCR (30% - 50%)" },
            { value: "100% Recycled Industrial", label: "100% بوليمر صناعي معاد تدويره عالي القوة" }
        ],
        refHelp: "تم تسجيل طلبكم لدى قسم التصدير. سيتم إرسال عرض الأسعار الرسمي وبطاقة المواصفات TDS خلال 24 ساعة عمل.",
        copyBtn: "نسخ رمز الطلب",
        copiedText: "تم النسخ!"
    }
};

export default function QuoteForm({
    locale,
    sourcePage,
    categories,
    products,
    presetProductId
}: {
    locale: Locale;
    sourcePage: string;
    categories: { id: string; name: string }[];
    products: QuoteProductOption[];
    presetProductId?: string;
}) {
    const t = useI18n(locale);
    const extra = FORM_EXTRA_TEXT[locale] || FORM_EXTRA_TEXT.en;
    const [state, setState] = useState<"idle" | "sending" | "done" | "error" | "rate">("idle");
    const [refCode, setRefCode] = useState("");
    const [copied, setCopied] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        setState("sending");
        setErrorMsg("");

        const gauge = String(fd.get("gauge") || "");
        const material = String(fd.get("material") || "");
        const rawMessage = String(fd.get("message") || "");

        // Append structured technical specs to message for back-office review
        const techSpecs = [
            gauge ? `[Target Gauge: ${gauge}]` : "",
            material ? `[Polymer Blend: ${material}]` : ""
        ].filter(Boolean).join(" ");

        const combinedMessage = techSpecs ? `${techSpecs}\n${rawMessage}`.trim() : rawMessage;

        try {
            const res = await fetch("/api/quotes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: String(fd.get("name") || ""),
                    company: String(fd.get("company") || ""),
                    email: String(fd.get("email") || ""),
                    phone: String(fd.get("phone") || ""),
                    country: String(fd.get("country") || ""),
                    categoryId: String(fd.get("categoryId") || ""),
                    productId: String(fd.get("productId") || "") || null,
                    volume: String(fd.get("volume") || ""),
                    deliveryTerm: String(fd.get("deliveryTerm") || "FOB"),
                    message: combinedMessage,
                    locale,
                    sourcePage
                })
            });
            const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
            if (res.status === 429) {
                setState("rate");
                return;
            }
            if (!res.ok || !data.id) {
                setErrorMsg(data.error || t.forms.error);
                setState("error");
                return;
            }
            const cleanId = (data.id || "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase() || "OK";
            const generatedRef = `APL-2026-${locale.toUpperCase()}-${cleanId}`;
            setRefCode(generatedRef);
            setState("done");
            form.reset();
        } catch {
            setState("error");
        }
    }

    function copyRef() {
        if (!refCode) return;
        if (typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard.writeText(refCode).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
            });
        }
    }

    if (state === "done") {
        return (
            <div className="card p-6 sm:p-8 border-emerald-500/40 bg-gradient-to-b from-emerald-50/50 to-white" role="status">
                <div className="flex items-start gap-4">
                    <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-600 text-xl font-bold text-white shadow-sm">✓</span>
                    <div className="space-y-3">
                        <div>
                            <span className="inline-block text-xs font-black uppercase tracking-widest text-emerald-700">ASIAPLAST B2B RFQ</span>
                            <h3 className="font-display text-xl font-black text-slate-900">
                                {t.forms.successQuote}
                            </h3>
                        </div>

                        <div className="inline-flex flex-wrap items-center gap-3 rounded-lg border border-emerald-200 bg-white px-4 py-2.5 shadow-sm">
                            <span className="text-xs font-semibold text-slate-500">RFQ Reference:</span>
                            <span className="font-mono text-base font-black text-emerald-800 tracking-wider">{refCode}</span>
                            <button
                                type="button"
                                onClick={copyRef}
                                className="ml-auto text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
                            >
                                {copied ? extra.copiedText : extra.copyBtn}
                            </button>
                        </div>

                        <p className="text-sm text-slate-600 leading-relaxed">
                            {extra.refHelp}
                        </p>

                        <div className="pt-2 text-xs text-slate-500 border-t border-emerald-100 flex flex-wrap gap-4">
                            <span>Direct Email: <a href="mailto:export@asiaplast.com.tr" className="font-bold text-emerald-700">export@asiaplast.com.tr</a></span>
                            <span>WhatsApp: <a href="https://wa.me/905336840175" target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-700">+90 533 684 01 75</a></span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="card p-6 sm:p-8">
            {state === "rate" && (
                <p className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="alert">
                    {t.forms.rateLimited}
                </p>
            )}
            {state === "error" && (
                <p className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                    {errorMsg || t.forms.error}
                </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="label" htmlFor="q-name">{t.forms.name} *</label>
                    <input id="q-name" name="name" className="input" required autoComplete="name" />
                </div>
                <div>
                    <label className="label" htmlFor="q-company">{t.forms.company} *</label>
                    <input id="q-company" name="company" className="input" required autoComplete="organization" />
                </div>
                <div>
                    <label className="label" htmlFor="q-email">{t.forms.email} *</label>
                    <input id="q-email" name="email" type="email" className="input" required autoComplete="email" />
                </div>
                <div>
                    <label className="label" htmlFor="q-phone">{t.forms.phone}</label>
                    <input id="q-phone" name="phone" className="input" autoComplete="tel" />
                </div>
                <div>
                    <label className="label" htmlFor="q-country">{t.forms.country} *</label>
                    <input id="q-country" name="country" className="input" required autoComplete="country-name" />
                </div>
                <div>
                    <label className="label" htmlFor="q-category">{t.forms.productCategory} *</label>
                    <select id="q-category" name="categoryId" className="input" required defaultValue="">
                        <option value="" disabled>{t.forms.selectPlaceholder}</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="sm:col-span-2">
                    <label className="label" htmlFor="q-product">{t.forms.productInterest}</label>
                    <select id="q-product" name="productId" className="input" defaultValue={presetProductId || ""}>
                        <option value="">{t.forms.selectPlaceholder}</option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name} — {p.category}</option>
                        ))}
                    </select>
                </div>

                {/* Technical Parameters */}
                <div>
                    <label className="label" htmlFor="q-gauge">{extra.gaugeLabel}</label>
                    <select id="q-gauge" name="gauge" className="input" defaultValue="">
                        <option value="">{extra.gaugePlaceholder}</option>
                        {extra.gaugeOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="label" htmlFor="q-material">{extra.materialLabel}</label>
                    <select id="q-material" name="material" className="input" defaultValue="">
                        <option value="">{extra.materialPlaceholder}</option>
                        {extra.materialOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="label" htmlFor="q-volume">{t.forms.volume} *</label>
                    <input id="q-volume" name="volume" className="input" required placeholder={t.quote.volumePlaceholder} />
                </div>
                <div>
                    <label className="label" htmlFor="q-term">{t.forms.deliveryTerm} *</label>
                    <select id="q-term" name="deliveryTerm" className="input" required defaultValue="FOB">
                        {DELIVERY_TERMS.map((term) => (
                            <option key={term} value={term}>{term}</option>
                        ))}
                    </select>
                </div>
                <div className="sm:col-span-2">
                    <label className="label" htmlFor="q-message">{t.forms.message}</label>
                    <textarea id="q-message" name="message" rows={3} className="input" placeholder={t.quote.volumePlaceholder === "" ? "" : undefined} />
                </div>
            </div>

            <label className="mt-4 flex items-start gap-2.5 text-xs text-slate-500">
                <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 rounded border-surface-border text-brand-green focus:ring-brand-green/30" />
                {t.forms.consent}
            </label>

            <button type="submit" className="btn-primary mt-5 w-full sm:w-auto" disabled={state === "sending"}>
                {state === "sending" ? t.forms.sending : t.forms.quoteSend}
            </button>
        </form>
    );
}
