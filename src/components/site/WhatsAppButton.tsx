"use client";

import { useMemo } from "react";
import type { Locale } from "@/lib/i18n/locales";

type Props = {
    locale: Locale;
    phoneNumber?: string;
};

const MESSAGES: Partial<Record<Locale, string>> = {
    tr: "Merhaba ASIAPLAST, asiaplast.web.app web siteniz üzerinden ulaşıyorum. Toptan çöp poşeti ve ihracat ürünleriniz hakkında detaylı bilgi ve fiyat teklifi almak istiyorum.",
    en: "Hello ASIAPLAST, I am reaching out via your website asiaplast.web.app. I would like to inquire about your wholesale garbage bags and request an export quotation.",
    de: "Hallo ASIAPLAST, ich kontaktiere Sie über Ihre Website asiaplast.web.app. Ich interessiere mich für Ihre Müllbeutel im Großhandel und möchte ein Exportangebot anfordern.",
    fr: "Bonjour ASIAPLAST, je vous contacte depuis votre site web asiaplast.web.app. Je souhaiterais obtenir des informations et un devis export pour vos sacs poubelle en gros.",
    ar: "مرحباً آسيا بلاست (ASIAPLAST)، أتواصل معكم عبر موقعكم الإلكتروني asiaplast.web.app. أود الاستفسار عن أكياس النفايات بالجملة وطلب عرض أسعار للتصدير."
};

const BADGES: Partial<Record<Locale, { desk: string; status: string }>> = {
    tr: { desk: "WhatsApp İhracat Hattı", status: "Çevrimiçi" },
    en: { desk: "WhatsApp Export Desk", status: "Online" },
    de: { desk: "WhatsApp Export-Desk", status: "Online" },
    fr: { desk: "Bureau Export WhatsApp", status: "En ligne" },
    ar: { desk: "مكتب التصدير عبر واتساب", status: "متصل الآن" }
};

export default function WhatsAppButton({ locale, phoneNumber = "905336840175" }: Props) {
    const isRtl = locale === "ar";
    const cleanNumber = phoneNumber.replace(/\D/g, "");

    const whatsappUrl = useMemo(() => {
        const text = MESSAGES[locale] || MESSAGES.en || "Hello ASIAPLAST, I am reaching out via your website asiaplast.web.app.";
        return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
    }, [cleanNumber, locale]);

    const badge = BADGES[locale] || BADGES.en || { desk: "WhatsApp Export Desk", status: "Online" };

    return (
        <aside
            aria-label={badge.desk}
            className={`fixed bottom-6 ${
                isRtl ? "left-6" : "right-6"
            } z-50 flex items-center group pointer-events-auto select-none print:hidden`}
        >
            {/* Hover Tooltip / Desk info pill */}
            <div
                className={`hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-950/95 border border-emerald-500/40 text-slate-100 shadow-2xl backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 transform ${
                    isRtl
                        ? "order-2 translate-x-2 group-hover:translate-x-0 ml-3"
                        : "order-1 translate-x-2 group-hover:translate-x-0 mr-3"
                }`}
            >
                <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <div className="flex flex-col text-left">
                    <span className="text-[11px] font-black text-white tracking-wide">
                        {badge.desk}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold font-mono">
                        +90 533 684 01 75 &bull; {badge.status}
                    </span>
                </div>
            </div>

            {/* Pulsing Floating Action Button */}
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${badge.desk} (+90 533 684 01 75)`}
                className={`relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl shadow-emerald-900/30 hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-400/50 ${
                    isRtl ? "order-1" : "order-2"
                }`}
            >
                {/* Glowing Radar Pulse Ring */}
                <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-35 animate-ping -z-10 pointer-events-none" />

                {/* Official WhatsApp Vector Icon */}
                <svg
                    className="w-8 h-8 fill-current"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.477-.15-.678.15-.201.3-.778.978-.954 1.179-.176.2-.352.226-.653.076-.301-.15-1.272-.469-2.424-1.496-.895-.798-1.5-1.784-1.676-2.085-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.201-.301.301-.502.1-.2.05-.376-.025-.526-.075-.15-.678-1.634-.929-2.238-.245-.589-.494-.509-.678-.519-.176-.01-.377-.01-.578-.01-.201 0-.527.075-.803.376s-1.054 1.029-1.054 2.509 1.08 2.91 1.23 3.111c.15.201 2.124 3.243 5.146 4.549.719.311 1.28.497 1.718.636.722.23 1.378.197 1.897.12.578-.087 1.78-.727 2.031-1.43.251-.703.251-1.305.176-1.43-.075-.125-.276-.201-.577-.351z" />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.434 5.178L2.05 21.95l4.914-1.288A9.956 9.956 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.603 0-3.1-.458-4.373-1.25l-.313-.195-2.916.765.779-2.842-.214-.34A8.175 8.175 0 0 1 3.8 12c0-4.521 3.679-8.2 8.2-8.2s8.2 3.679 8.2 8.2-3.679 8.2-8.2 8.2z"
                    />
                </svg>
            </a>
        </aside>
    );
}
