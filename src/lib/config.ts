/** Shared server configuration constants (no secrets). */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://asiaplast.web.app").replace(/\/$/, "");

export const COMPANY = {
    name: "ASIAPLAST",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "export@asiaplast.com",
    whatsapp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || "+905336840175",
    country: process.env.NEXT_PUBLIC_CONTACT_COUNTRY || "Turkey"
} as const;

export const CONTACT_SOURCES = {
    contactForm: "contact-form",
    quoteForm: "quote-form"
} as const;

export const RATE_LIMITS = {
    /** Milliseconds between accepted submissions per IP+form. */
    contactMs: 30_000,
    quoteMs: 30_000,
    /** Max submissions per IP per hour across forms. */
    hourlyMax: 12
} as const;

export const ADMIN_SESSION_TTL_HOURS = process.env.ADMIN_SESSION_TTL_HOURS || "12";

export const ORDER_STATUSES = [
    "new",
    "reviewing",
    "quoted",
    "quote_sent",
    "approved",
    "confirmed",
    "in_production",
    "shipped",
    "completed",
    "cancelled"
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const MESSAGE_STATUSES = ["new", "reviewing", "answered", "converted", "closed"] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];
