/** Shared configuration constants and status definitions (no secrets). */

const rawSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "");
export const SITE_URL =
    !rawSiteUrl || rawSiteUrl.includes("asiaplast.web.app") || rawSiteUrl.includes("firebaseapp.com")
        ? "https://www.asiaplastik.com.tr"
        : rawSiteUrl;

const rawContactEmail = (process.env.NEXT_PUBLIC_CONTACT_EMAIL || "").trim();
const resolvedContactEmail =
    !rawContactEmail || rawContactEmail === "export@asiaplast.com" || rawContactEmail === "export@asiaplast.com.tr"
        ? "export@asiaplastik.com.tr"
        : rawContactEmail;

export const DEFAULT_COMPANY_SETTINGS = {
    name: "ASIAPLAST",
    legalName: "ASIAPLAST Plastik ve Ambalaj Sanayi",
    email: resolvedContactEmail,
    phone: "+90 533 684 01 75",
    whatsapp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || "+905336840175",
    country: process.env.NEXT_PUBLIC_CONTACT_COUNTRY || "Turkey",
    city: "Adana",
    address: "Adana, Türkiye",
    workingHours: "Pazartesi – Cumartesi, 08:30 – 18:00 (UTC+3)",
    socialLinks: {
        linkedin: "",
        instagram: "",
        facebook: "",
        youtube: "",
        x: ""
    },
    analyticsRetentionDays: 90
};

export type CompanySettings = typeof DEFAULT_COMPANY_SETTINGS & {
    updatedAt?: string | null;
    updatedBy?: string | null;
};

export const COMPANY = {
    name: DEFAULT_COMPANY_SETTINGS.name,
    email: DEFAULT_COMPANY_SETTINGS.email,
    whatsapp: DEFAULT_COMPANY_SETTINGS.whatsapp,
    country: DEFAULT_COMPANY_SETTINGS.country
} as const;

export const CONTACT_SOURCES = {
    contactForm: "contact-form",
    quoteForm: "quote-form"
} as const;

export const RATE_LIMITS = {
    /** Milliseconds between accepted submissions per IP+form. */
    contactMs: 15_000,
    quoteMs: 15_000,
    /** Max submissions per IP per hour across forms. */
    hourlyMax: 20
} as const;

export const ADMIN_SESSION_TTL_HOURS = process.env.ADMIN_SESSION_TTL_HOURS || "12";

/** Contact message statuses (Requirement 4: Okunmadı, Okundu, İşlemde, Yanıtlandı, Arşivlendi) */
export const MESSAGE_STATUSES = [
    "unread",
    "read",
    "in_progress",
    "replied",
    "archived"
] as const;

export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

export const MESSAGE_STATUS_LABELS: Record<MessageStatus, string> = {
    unread: "Okunmadı",
    read: "Okundu",
    in_progress: "İşlemde",
    replied: "Yanıtlandı",
    archived: "Arşivlendi"
};

/** Quote request statuses (Requirement 5: Yeni, İnceleniyor, Teklif Gönderildi, Müşteri Dönüşü Bekleniyor, Onaylandı, Tamamlandı, İptal) */
export const QUOTE_STATUSES = [
    "new",
    "reviewing",
    "quote_sent",
    "waiting_customer",
    "approved",
    "completed",
    "cancelled"
] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
    new: "Yeni",
    reviewing: "İnceleniyor",
    quote_sent: "Teklif Gönderildi",
    waiting_customer: "Müşteri Dönüşü Bekleniyor",
    approved: "Onaylandı",
    completed: "Tamamlandı",
    cancelled: "İptal"
};

/** Confirmed Order statuses (only created after explicit admin approval) */
export const ORDER_STATUSES = [
    "approved",
    "in_production",
    "shipped",
    "completed",
    "cancelled"
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    approved: "Onaylandı (Kesin Sipariş)",
    in_production: "Üretimde",
    shipped: "Sevk Edildi",
    completed: "Tamamlandı",
    cancelled: "İptal Edildi"
};

export const MESSAGE_STATUS_LABELS_TR = MESSAGE_STATUS_LABELS;
export const QUOTE_STATUS_LABELS_TR = QUOTE_STATUS_LABELS;
export const ORDER_STATUS_LABELS_TR = ORDER_STATUS_LABELS;

export const QUANTITY_UNITS = [
    "40' HQ Konteyner",
    "20' DC Konteyner",
    "Palet",
    "Ton (MT)",
    "Koli",
    "Rulo",
    "Adet"
] as const;
