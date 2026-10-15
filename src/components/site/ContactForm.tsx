"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/locales";

const SUBJECT_LABELS: Partial<Record<Locale, { label: string; placeholder: string }>> = {
    tr: { label: "Konu", placeholder: "İhracat talebi, bayilik, numune veya genel bilgi" },
    en: { label: "Subject", placeholder: "Export inquiry, distribution, samples, or general question" },
    de: { label: "Betreff", placeholder: "Exportanfrage, Vertrieb, Muster oder allgemeine Frage" },
    fr: { label: "Objet", placeholder: "Demande d'exportation, distribution, échantillons ou question générale" },
    ar: { label: "الموضوع", placeholder: "استفسار تصدير، توزيع، عينات أو سؤال عام" }
};

export default function ContactForm({ locale, sourcePage }: { locale: Locale; sourcePage: string }) {
    const t = useI18n(locale);
    const subj = SUBJECT_LABELS[locale] || SUBJECT_LABELS.en!;
    const [state, setState] = useState<"idle" | "sending" | "done" | "error" | "rate">("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const [confirmedId, setConfirmedId] = useState("");
    const [idempotencyKey] = useState(() => `cf_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (state === "sending") return;
        const form = e.currentTarget;
        const fd = new FormData(form);
        setState("sending");
        setErrorMsg("");
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: String(fd.get("name") || ""),
                    company: String(fd.get("company") || ""),
                    email: String(fd.get("email") || ""),
                    phone: String(fd.get("phone") || ""),
                    country: String(fd.get("country") || ""),
                    subject: String(fd.get("subject") || ""),
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
                error?: string;
                code?: string;
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
            setConfirmedId(data.id);
            setState("done");
            form.reset();
        } catch {
            setErrorMsg(
                locale === "tr"
                    ? "Sunucu bağlantısı kurulamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyin."
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
                        <h3 className="font-display text-lg font-bold text-brand-navy">{t.forms.successContact}</h3>
                        <p className="mt-1 text-sm text-slate-500">{t.sections.contactLead}</p>
                        {confirmedId && confirmedId !== "filtered" && (
                            <p className="mt-2 font-mono text-xs text-slate-500">
                                Ref: <span className="font-semibold text-brand-navy">{confirmedId.slice(0, 10).toUpperCase()}</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="card p-6 sm:p-8" noValidate={false}>
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
                <label htmlFor="cf-website">Website</label>
                <input id="cf-website" name="website_url" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="label" htmlFor="cf-name">
                        {t.forms.name} *
                    </label>
                    <input id="cf-name" name="name" className="input" required autoComplete="name" />
                </div>
                <div>
                    <label className="label" htmlFor="cf-company">
                        {t.forms.company}
                    </label>
                    <input id="cf-company" name="company" className="input" autoComplete="organization" />
                </div>
                <div>
                    <label className="label" htmlFor="cf-email">
                        {t.forms.email} *
                    </label>
                    <input id="cf-email" name="email" type="email" className="input" required autoComplete="email" />
                </div>
                <div>
                    <label className="label" htmlFor="cf-phone">
                        {t.forms.phone}
                    </label>
                    <input id="cf-phone" name="phone" className="input" autoComplete="tel" />
                </div>
                <div>
                    <label className="label" htmlFor="cf-country">
                        {t.forms.country} *
                    </label>
                    <input id="cf-country" name="country" className="input" required autoComplete="country-name" />
                </div>
                <div>
                    <label className="label" htmlFor="cf-subject">
                        {subj.label} *
                    </label>
                    <input
                        id="cf-subject"
                        name="subject"
                        className="input"
                        required
                        placeholder={subj.placeholder}
                    />
                </div>
                <div className="sm:col-span-2">
                    <label className="label" htmlFor="cf-message">
                        {t.forms.message} *
                    </label>
                    <textarea id="cf-message" name="message" rows={5} className="input" required minLength={10} />
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
                {state === "sending" ? t.forms.sending : t.forms.send}
            </button>
        </form>
    );
}
