"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/locales";

export type QuoteProductOption = { id: string; name: string; category: string };

const DELIVERY_TERMS = ["EXW", "FOB", "CIF", "DAP"] as const;

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
    const [state, setState] = useState<"idle" | "sending" | "done" | "error" | "rate">("idle");
    const [ref, setRef] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        setState("sending");
        setErrorMsg("");
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
                    deliveryTerm: String(fd.get("deliveryTerm") || ""),
                    message: String(fd.get("message") || ""),
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
            setRef(data.id.slice(0, 8).toUpperCase());
            setState("done");
            form.reset();
        } catch {
            setState("error");
        }
    }

    if (state === "done") {
        return (
            <div className="card p-6 sm:p-8" role="status">
                <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-green-light text-lg text-brand-green-dark">✓</span>
                    <div>
                        <h3 className="font-display text-lg font-bold text-brand-navy">
                            {t.forms.successQuote} <span className="font-mono text-brand-green-dark">{ref}</span>
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
                    <textarea id="q-message" name="message" rows={4} className="input" placeholder={t.quote.volumePlaceholder === "" ? "" : undefined} />
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
