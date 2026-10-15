"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/locales";

export type QuoteProductOption = { id: string; name: string; category: string; categoryId?: string };

const DELIVERY_TERMS = ["EXW", "FOB", "CIF", "DAP"] as const;

const SPEC_LABELS: Partial<
    Record<
        Locale,
        {
            quantity: string;
            unit: string;
            units: { value: string; label: string }[];
            bagSpecsTitle: string;
            dimensions: string;
            dimensionsPh: string;
            color: string;
            colorPh: string;
            thickness: string;
            thicknessPh: string;
            packaging: string;
            packagingPh: string;
            sealType: string;
            sealTypes: string[];
            deliveryLocation: string;
            deliveryLocationPh: string;
        }
    >
> = {
    tr: {
        quantity: "Miktar / Sipariş Hacmi",
        unit: "Birim",
        units: [
            { value: "Ton", label: "Ton" },
            { value: "Koli", label: "Koli" },
            { value: "Rulo", label: "Rulo" },
            { value: "Konteyner (20ft FCL)", label: "Konteyner (20ft FCL)" },
            { value: "Konteyner (40ft HC)", label: "Konteyner (40ft HC)" },
            { value: "Adet", label: "Adet" }
        ],
        bagSpecsTitle: "Çöp Poşeti Teknik Özellikleri (Ürün Yapısına Göre)",
        dimensions: "Ölçü (En x Boy cm)",
        dimensionsPh: "Örn: 80 x 110 cm veya 65 x 80 cm",
        color: "Renk Tercihi",
        colorPh: "Örn: Siyah, Mavi, Sarı, Şeffaf",
        thickness: "Kalınlık (Mikron / µm)",
        thicknessPh: "Örn: 45 µm LDPE veya 18 µm HDPE",
        packaging: "Ambalaj / Rulo Tercihi",
        packagingPh: "Örn: 10 yaprak x 20 rulo / Koli, Baskılı etiket",
        sealType: "Dip Kesim / Bağlama Tipi",
        sealTypes: ["Yıldız Dip (Star-Seal)", "Düz Dip (Flat-Seal)", "Büzgülü (Drawstring)", "C-Katlama", "Standart"],
        deliveryLocation: "Teslimat Yeri (Liman / Şehir)",
        deliveryLocationPh: "Örn: Hamburg Limanı, Almanya veya İstanbul"
    },
    en: {
        quantity: "Quantity / Order Volume",
        unit: "Unit",
        units: [
            { value: "Ton", label: "Metric Tons (MT)" },
            { value: "Koli", label: "Cartons / Cases" },
            { value: "Rulo", label: "Rolls" },
            { value: "Konteyner (20ft FCL)", label: "20ft FCL Container" },
            { value: "Konteyner (40ft HC)", label: "40ft HC Container" },
            { value: "Adet", label: "Pieces" }
        ],
        bagSpecsTitle: "Garbage Bag Specifications (Dimensions, Color, Thickness & Packaging)",
        dimensions: "Bag Dimensions (Width x Length cm)",
        dimensionsPh: "e.g., 80 x 110 cm or 65 x 80 cm",
        color: "Bag Color",
        colorPh: "e.g., Black, Blue, Yellow, Clear",
        thickness: "Thickness (Microns / µm)",
        thicknessPh: "e.g., 45 µm LDPE or 18 µm HDPE",
        packaging: "Packaging / Roll Configuration",
        packagingPh: "e.g., 10 bags/roll, 20 rolls/carton, private label",
        sealType: "Bottom Seal / Closure Type",
        sealTypes: ["Star-Seal", "Flat-Seal", "Drawstring", "C-Fold", "Standard"],
        deliveryLocation: "Delivery Port / City",
        deliveryLocationPh: "e.g., Hamburg Port, Germany"
    },
    de: {
        quantity: "Menge / Bestellvolumen",
        unit: "Einheit",
        units: [
            { value: "Ton", label: "Tonnen (MT)" },
            { value: "Koli", label: "Kartons" },
            { value: "Rulo", label: "Rollen" },
            { value: "Konteyner (20ft FCL)", label: "20ft FCL Container" },
            { value: "Konteyner (40ft HC)", label: "40ft HC Container" }
        ],
        bagSpecsTitle: "Müllbeutel-Spezifikationen (Maße, Farbe, Stärke & Verpackung)",
        dimensions: "Abmessungen (Breite x Länge cm)",
        dimensionsPh: "z.B. 80 x 110 cm",
        color: "Farbe",
        colorPh: "z.B. Schwarz, Blau, Gelb, Transparent",
        thickness: "Materialstärke (Mikron / µm)",
        thicknessPh: "z.B. 45 µm LDPE oder 18 µm HDPE",
        packaging: "Verpackung / Rollenkonfiguration",
        packagingPh: "z.B. 10 Beutel/Rolle, 20 Rollen/Karton",
        sealType: "Bodenschweißung / Verschluss",
        sealTypes: ["Sternboden (Star-Seal)", "Flachboden (Flat-Seal)", "Zugband (Drawstring)", "Standard"],
        deliveryLocation: "Lieferort (Hafen / Stadt)",
        deliveryLocationPh: "z.B. Hafen Hamburg, Deutschland"
    },
    fr: {
        quantity: "Quantité / Volume",
        unit: "Unité",
        units: [
            { value: "Ton", label: "Tonnes (MT)" },
            { value: "Koli", label: "Cartons" },
            { value: "Rulo", label: "Rouleaux" },
            { value: "Konteyner (20ft FCL)", label: "Conteneur 20ft FCL" },
            { value: "Konteyner (40ft HC)", label: "Conteneur 40ft HC" }
        ],
        bagSpecsTitle: "Spécifications des Sacs Poubelle (Dimensions, Couleur, Épaisseur & Emballage)",
        dimensions: "Dimensions (Largeur x Longueur cm)",
        dimensionsPh: "ex. 80 x 110 cm",
        color: "Couleur",
        colorPh: "ex. Noir, Bleu, Jaune, Transparent",
        thickness: "Épaisseur (Microns / µm)",
        thicknessPh: "ex. 45 µm LDPE ou 18 µm HDPE",
        packaging: "Conditionnement / Rouleaux",
        packagingPh: "ex. 10 sacs/rouleau, 20 rouleaux/carton",
        sealType: "Type de Soudure / Fermeture",
        sealTypes: ["Soudure Étoile (Star-Seal)", "Soudure Plate", "Lien Coulissant", "Standard"],
        deliveryLocation: "Lieu de Livraison (Port / Ville)",
        deliveryLocationPh: "ex. Port de Marseille, France"
    },
    ar: {
        quantity: "الكمية المطلوبة",
        unit: "الوحدة",
        units: [
            { value: "Ton", label: "طن متري" },
            { value: "Koli", label: "كرتون" },
            { value: "Rulo", label: "رول" },
            { value: "Konteyner (20ft FCL)", label: "حاوية 20 قدم" },
            { value: "Konteyner (40ft HC)", label: "حاوية 40 قدم" }
        ],
        bagSpecsTitle: "مواصفات أكياس القمامة (المقاس، اللون، السماكة والتعبئة)",
        dimensions: "المقاس (العرض × الطول سم)",
        dimensionsPh: "مثال: 80 × 110 سم",
        color: "اللون",
        colorPh: "مثال: أسود، أزرق، أصفر، شفاف",
        thickness: "السماكة (ميكرون / µm)",
        thicknessPh: "مثال: 45 ميكرون LDPE",
        packaging: "تفضيل التعبئة والتغليف",
        packagingPh: "مثال: 10 أكياس × 20 رول في الكرتون",
        sealType: "نوع القاعدة / الإغلاق",
        sealTypes: ["قاعدة نجمية (Star-Seal)", "قاعدة مسطحة", "رباط سحب", "قياسي"],
        deliveryLocation: "مكان التسليم (الميناء / المدينة)",
        deliveryLocationPh: "مثال: ميناء جدة أو الدار البيضاء"
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
    const sp = SPEC_LABELS[locale] || SPEC_LABELS.en!;
    const presetProd = products.find((p) => p.id === presetProductId);
    const defaultCategoryId = presetProd?.categoryId || (presetProductId && categories.some((c) => c.id === presetProductId) ? presetProductId : "");

    const [state, setState] = useState<"idle" | "sending" | "done" | "error" | "rate">("idle");
    const [ref, setRef] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [idempotencyKey] = useState(() => `rfq_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (state === "sending") return;
        const form = e.currentTarget;
        const fd = new FormData(form);
        setState("sending");
        setErrorMsg("");

        const quantity = String(fd.get("quantity") || "").trim();
        const unit = String(fd.get("unit") || "Ton").trim();

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
                    quantity,
                    unit,
                    volume: `${quantity} ${unit}`.trim(),
                    bagSpecs: {
                        dimensions: String(fd.get("dimensions") || ""),
                        color: String(fd.get("color") || ""),
                        thicknessMicron: String(fd.get("thicknessMicron") || ""),
                        packagingPref: String(fd.get("packagingPref") || ""),
                        sealType: String(fd.get("sealType") || "")
                    },
                    deliveryTerm: String(fd.get("deliveryTerm") || "FOB"),
                    deliveryLocation: String(fd.get("deliveryLocation") || ""),
                    message: String(fd.get("message") || ""),
                    honeypot: String(fd.get("website_url") || ""),
                    idempotencyKey,
                    locale,
                    sourcePage
                })
            });
            const data = (await res.json().catch(() => ({}))) as {
                ok?: boolean;
                id?: string;
                requestNo?: string;
                error?: string;
            };
            if (res.status === 429) {
                setState("rate");
                return;
            }
            if (!res.ok || !data.ok || !data.id) {
                setErrorMsg(data.error || t.forms.error);
                setState("error");
                return;
            }
            setRef(data.requestNo || data.id.slice(0, 8).toUpperCase());
            setState("done");
            form.reset();
        } catch {
            setErrorMsg(
                locale === "tr"
                    ? "Sunucu bağlantısı kurulamadı. Lütfen bağlantınızı kontrol edip tekrar deneyin."
                    : t.forms.error
            );
            setState("error");
        }
    }

    if (state === "done") {
        return (
            <div className="card p-6 sm:p-8" role="status">
                <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-green-light text-lg text-brand-green-dark">
                        ✓
                    </span>
                    <div>
                        <h3 className="font-display text-lg font-bold text-brand-navy">
                            {t.forms.successQuote}{" "}
                            <span className="font-mono text-brand-green-dark">{ref}</span>
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">{t.quote.lead}</p>
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

            {/* Honeypot anti-spam field */}
            <div className="hidden" aria-hidden="true">
                <label htmlFor="q-website">Website</label>
                <input id="q-website" name="website_url" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="label" htmlFor="q-name">
                        {t.forms.name} *
                    </label>
                    <input id="q-name" name="name" className="input" required autoComplete="name" />
                </div>
                <div>
                    <label className="label" htmlFor="q-company">
                        {t.forms.company} *
                    </label>
                    <input id="q-company" name="company" className="input" required autoComplete="organization" />
                </div>
                <div>
                    <label className="label" htmlFor="q-email">
                        {t.forms.email} *
                    </label>
                    <input id="q-email" name="email" type="email" className="input" required autoComplete="email" />
                </div>
                <div>
                    <label className="label" htmlFor="q-phone">
                        {t.forms.phone}
                    </label>
                    <input id="q-phone" name="phone" className="input" autoComplete="tel" />
                </div>
                <div>
                    <label className="label" htmlFor="q-country">
                        {t.forms.country} *
                    </label>
                    <input id="q-country" name="country" className="input" required autoComplete="country-name" />
                </div>
                <div>
                    <label className="label" htmlFor="q-category">
                        {t.forms.productCategory} *
                    </label>
                    <select id="q-category" name="categoryId" className="input" required defaultValue={defaultCategoryId}>
                        <option value="" disabled>
                            {t.forms.selectPlaceholder}
                        </option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="sm:col-span-2">
                    <label className="label" htmlFor="q-product">
                        {t.forms.productInterest}
                    </label>
                    <select id="q-product" name="productId" className="input" defaultValue={presetProductId || ""}>
                        <option value="">{t.forms.selectPlaceholder}</option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name} — {p.category}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="label" htmlFor="q-quantity">
                        {sp.quantity} *
                    </label>
                    <input
                        id="q-quantity"
                        name="quantity"
                        className="input"
                        required
                        placeholder={t.quote.volumePlaceholder || "Örn: 15"}
                    />
                </div>
                <div>
                    <label className="label" htmlFor="q-unit">
                        {sp.unit} *
                    </label>
                    <select id="q-unit" name="unit" className="input" required defaultValue="Ton">
                        {sp.units.map((u) => (
                            <option key={u.value} value={u.value}>
                                {u.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Garbage bag technical specification block */}
                <div className="sm:col-span-2 rounded-xl border border-surface-border bg-surface-muted/60 p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-brand-navy">
                        {sp.bagSpecsTitle}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <label className="label" htmlFor="q-dimensions">
                                {sp.dimensions}
                            </label>
                            <input
                                id="q-dimensions"
                                name="dimensions"
                                className="input"
                                placeholder={sp.dimensionsPh}
                            />
                        </div>
                        <div>
                            <label className="label" htmlFor="q-color">
                                {sp.color}
                            </label>
                            <input id="q-color" name="color" className="input" placeholder={sp.colorPh} />
                        </div>
                        <div>
                            <label className="label" htmlFor="q-thickness">
                                {sp.thickness}
                            </label>
                            <input
                                id="q-thickness"
                                name="thicknessMicron"
                                className="input"
                                placeholder={sp.thicknessPh}
                            />
                        </div>
                        <div>
                            <label className="label" htmlFor="q-seal">
                                {sp.sealType}
                            </label>
                            <select id="q-seal" name="sealType" className="input" defaultValue="">
                                <option value="">{t.forms.selectPlaceholder}</option>
                                {sp.sealTypes.map((st) => (
                                    <option key={st} value={st}>
                                        {st}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="label" htmlFor="q-packaging">
                                {sp.packaging}
                            </label>
                            <input
                                id="q-packaging"
                                name="packagingPref"
                                className="input"
                                placeholder={sp.packagingPh}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="label" htmlFor="q-term">
                        {t.forms.deliveryTerm} *
                    </label>
                    <select id="q-term" name="deliveryTerm" className="input" required defaultValue="FOB">
                        {DELIVERY_TERMS.map((term) => (
                            <option key={term} value={term}>
                                {term}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="label" htmlFor="q-location">
                        {sp.deliveryLocation}
                    </label>
                    <input
                        id="q-location"
                        name="deliveryLocation"
                        className="input"
                        placeholder={sp.deliveryLocationPh}
                    />
                </div>

                <div className="sm:col-span-2">
                    <label className="label" htmlFor="q-message">
                        {t.forms.message}
                    </label>
                    <textarea id="q-message" name="message" rows={4} className="input" />
                </div>
            </div>

            <label className="mt-4 flex items-start gap-2.5 text-xs text-slate-500">
                <input
                    type="checkbox"
                    name="consent"
                    required
                    className="mt-0.5 h-4 w-4 rounded border-surface-border text-brand-green focus:ring-brand-green/30"
                />
                {t.forms.consent}
            </label>

            <button type="submit" className="btn-primary mt-5 w-full sm:w-auto" disabled={state === "sending"}>
                {state === "sending" ? t.forms.sending : t.forms.quoteSend}
            </button>
        </form>
    );
}
