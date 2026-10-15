import { createHash, randomUUID } from "crypto";
import { db, COLLECTIONS } from "./firebaseAdmin";
import {
    DEFAULT_COMPANY_SETTINGS,
    MESSAGE_STATUSES,
    QUOTE_STATUSES,
    ORDER_STATUSES,
    type CompanySettings,
    type MessageStatus,
    type QuoteStatus,
    type OrderStatus
} from "./config";
import { SEED_PRODUCTS, CATEGORIES } from "@/data/catalog";
import { getCategoryCopy } from "@/lib/i18n/content";

if (typeof window !== "undefined") {
    throw new Error("repo module can only be imported on the server.");
}

function toIso(val: unknown): string {
    if (!val) return new Date().toISOString();
    if (typeof val === "string") return val;
    if (val instanceof Date) return val.toISOString();
    if (typeof val === "object" && val !== null && "toDate" in val && typeof (val as { toDate: () => Date }).toDate === "function") {
        return (val as { toDate: () => Date }).toDate().toISOString();
    }
    return new Date().toISOString();
}

function normalizeMessageStatus(raw: unknown): MessageStatus {
    const s = String(raw || "unread");
    if ((MESSAGE_STATUSES as readonly string[]).includes(s)) return s as MessageStatus;
    if (s === "new") return "unread";
    if (s === "reviewing") return "in_progress";
    if (s === "answered" || s === "converted") return "replied";
    if (s === "closed") return "archived";
    return "unread";
}

function normalizeQuoteStatus(raw: unknown): QuoteStatus {
    const s = String(raw || "new");
    if ((QUOTE_STATUSES as readonly string[]).includes(s)) return s as QuoteStatus;
    if (s === "answered" || s === "quoted") return "quote_sent";
    if (s === "converted") return "approved";
    if (s === "closed") return "cancelled";
    return "new";
}

export type NoteItem = {
    id: string;
    by: string;
    text: string;
    at: string;
};

export type HistoryItem = {
    action: string;
    status?: string;
    by: string;
    note?: string;
    at: string;
};

export type ContactMessage = {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    country: string;
    subject: string;
    message: string;
    locale: string;
    sourcePage: string;
    status: MessageStatus;
    notes: NoteItem[];
    history: HistoryItem[];
    sessionId?: string | null;
    isTest?: boolean;
    createdAt: string;
    updatedAt: string;
};

export type BagSpecs = {
    dimensions: string;
    color: string;
    thicknessMicron: string;
    packagingPref: string;
    sealType: string;
};

export type QuoteRequest = {
    id: string;
    requestNo: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    country: string;
    categoryId: string;
    productId: string | null;
    productLabel: string;
    quantity: string;
    unit: string;
    volume: string;
    bagSpecs: BagSpecs;
    deliveryTerm: "EXW" | "FOB" | "CIF" | "DAP";
    deliveryLocation: string;
    message: string;
    locale: string;
    sourcePage: string;
    status: QuoteStatus;
    convertedOrderId?: string | null;
    convertedOrderNo?: string | null;
    notes: NoteItem[];
    history: HistoryItem[];
    sessionId?: string | null;
    isTest?: boolean;
    createdAt: string;
    updatedAt: string;
};

export type ConfirmedOrder = {
    id: string;
    orderNo: string;
    quoteId: string;
    requestNo: string;
    customerName: string;
    company: string;
    email: string;
    phone: string;
    country: string;
    categoryId: string;
    productId: string | null;
    productLabel: string;
    quantity: string;
    unit: string;
    volume: string;
    bagSpecs: BagSpecs;
    deliveryTerm: string;
    deliveryLocation: string;
    status: OrderStatus;
    approvedBy: string;
    approvedAt: string;
    notes: string;
    history: HistoryItem[];
    isTest?: boolean;
    createdAt: string;
    updatedAt: string;
};

export type ProductDoc = {
    id: string;
    slug: string;
    active: boolean;
    sortOrder: number;
    categoryId: string;
    name: string;
    shortDescription: string;
    description: string;
    imageUrl: string | null;
    moq: string;
    specs: { label: string; value: string }[];
    translations: Record<string, { name?: string; shortDescription?: string; description?: string }>;
    createdAt: string;
    updatedAt: string;
};

export type VisitorEventItem = {
    type: "pageview" | "contact_submit" | "quote_submit";
    path: string;
    locale?: string;
    refId?: string;
    at: string;
};

export type VisitorSessionDoc = {
    id: string;
    sessionId: string;
    visitorId: string;
    consentGranted: boolean;
    isTest: boolean;
    startedAt: string;
    lastActivityAt: string;
    durationSeconds: number;
    timezone: string;
    entryPage: string;
    exitPage: string;
    pages: string[];
    pageViews: number;
    referrer: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    utmTerm: string;
    utmContent: string;
    countryCode: string;
    countryName: string;
    region: string;
    city: string;
    geoSource: string;
    deviceType: "telefon" | "tablet" | "bilgisayar" | "Bilinmiyor";
    deviceBrand: string;
    deviceModel: string;
    osName: string;
    osVersion: string;
    browserName: string;
    browserVersion: string;
    language: string;
    screenSize: string;
    botStatus: "human" | "bot" | "uncertain";
    botReason: string;
    convertedContact: boolean;
    convertedQuote: boolean;
    events: VisitorEventItem[];
};

export type LoginLogDoc = {
    id: string;
    email: string;
    uid?: string | null;
    success: boolean;
    reason: string;
    method: string;
    countryCode: string;
    countryName: string;
    city: string;
    deviceType: string;
    osName: string;
    browserName: string;
    isTest?: boolean;
    createdAt: string;
};

export type AuditLogDoc = {
    id: string;
    by: string;
    action: string;
    target: string;
    meta: Record<string, unknown>;
    at: string;
};

function makeIdempotencyHash(prefix: string, parts: string[]): string {
    return `${prefix}_${createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 24)}`;
}

function genCode(prefix: string): string {
    const now = new Date();
    const y = now.getUTCFullYear().toString().slice(-2);
    const m = String(now.getUTCMonth() + 1).padStart(2, "0");
    const d = String(now.getUTCDate()).padStart(2, "0");
    const rand = randomUUID().replace(/-/g, "").slice(0, 5).toUpperCase();
    return `${prefix}-${y}${m}${d}-${rand}`;
}

export async function createContactMessage(input: {
    name: string;
    company?: string;
    email: string;
    phone?: string;
    country: string;
    subject?: string;
    message: string;
    locale: string;
    sourcePage: string;
    sessionId?: string | null;
    idempotencyKey?: string;
    isTest?: boolean;
}): Promise<{ id: string; deduplicated: boolean }> {
    const now = new Date().toISOString();
    const fingerprint = makeIdempotencyHash("msg", [
        input.idempotencyKey || "",
        input.email.toLowerCase(),
        input.subject || "",
        input.message.trim().slice(0, 300)
    ]);

    // Check recent duplicate within 2 minutes
    const recentSnap = await db()
        .collection(COLLECTIONS.contactMessages)
        .where("fingerprint", "==", fingerprint)
        .limit(1)
        .get();

    if (!recentSnap.empty) {
        const existingDoc = recentSnap.docs[0];
        const existingAt = Date.parse(toIso(existingDoc.data().createdAt));
        if (Date.now() - existingAt < 120_000) {
            return { id: existingDoc.id, deduplicated: true };
        }
    }

    const payload = {
        name: input.name.trim(),
        company: (input.company || "").trim(),
        email: input.email.trim().toLowerCase(),
        phone: (input.phone || "").trim(),
        country: input.country.trim(),
        subject: (input.subject || "Genel İletişim").trim(),
        message: input.message.trim(),
        locale: input.locale || "en",
        sourcePage: input.sourcePage || "/contact",
        status: "unread" as MessageStatus,
        notes: [] as NoteItem[],
        history: [
            {
                action: "created",
                status: "unread",
                by: "system (iletisim-formu)",
                note: `İletişim formu gönderildi (${input.locale.toUpperCase()})`,
                at: now
            }
        ] as HistoryItem[],
        sessionId: input.sessionId || null,
        fingerprint,
        isTest: Boolean(input.isTest),
        createdAt: now,
        updatedAt: now
    };

    const ref = await db().collection(COLLECTIONS.contactMessages).add(payload);

    if (input.sessionId) {
        await recordVisitorConversion(input.sessionId, "contact", ref.id, input.sourcePage || "/contact").catch(() => undefined);
    }

    return { id: ref.id, deduplicated: false };
}

export async function createQuoteRequest(input: {
    name: string;
    company: string;
    email: string;
    phone?: string;
    country: string;
    categoryId: string;
    productId?: string | null;
    productLabel: string;
    quantity?: string;
    unit?: string;
    volume?: string;
    bagSpecs?: Partial<BagSpecs>;
    deliveryTerm: "EXW" | "FOB" | "CIF" | "DAP";
    deliveryLocation?: string;
    message?: string;
    locale: string;
    sourcePage: string;
    sessionId?: string | null;
    idempotencyKey?: string;
    isTest?: boolean;
}): Promise<{ id: string; requestNo: string; deduplicated: boolean }> {
    const now = new Date().toISOString();
    const quantity = (input.quantity || "").trim();
    const unit = (input.unit || "").trim();
    const computedVolume = (input.volume || `${quantity} ${unit}`.trim() || "Belirtilmedi").trim();

    const fingerprint = makeIdempotencyHash("rfq", [
        input.idempotencyKey || "",
        input.email.toLowerCase(),
        input.categoryId,
        input.productId || "",
        computedVolume,
        (input.message || "").trim().slice(0, 200)
    ]);

    const recentSnap = await db()
        .collection(COLLECTIONS.quoteRequests)
        .where("fingerprint", "==", fingerprint)
        .limit(1)
        .get();

    if (!recentSnap.empty) {
        const existingDoc = recentSnap.docs[0];
        const existingData = existingDoc.data();
        const existingAt = Date.parse(toIso(existingData.createdAt));
        if (Date.now() - existingAt < 120_000) {
            return {
                id: existingDoc.id,
                requestNo: String(existingData.requestNo || existingDoc.id.slice(0, 8).toUpperCase()),
                deduplicated: true
            };
        }
    }

    const requestNo = genCode("AP-TLP");
    const bagSpecs: BagSpecs = {
        dimensions: (input.bagSpecs?.dimensions || "").trim(),
        color: (input.bagSpecs?.color || "").trim(),
        thicknessMicron: (input.bagSpecs?.thicknessMicron || "").trim(),
        packagingPref: (input.bagSpecs?.packagingPref || "").trim(),
        sealType: (input.bagSpecs?.sealType || "").trim()
    };

    const payload = {
        requestNo,
        name: input.name.trim(),
        company: input.company.trim(),
        email: input.email.trim().toLowerCase(),
        phone: (input.phone || "").trim(),
        country: input.country.trim(),
        categoryId: input.categoryId.trim(),
        productId: input.productId || null,
        productLabel: input.productLabel.trim(),
        quantity: quantity || computedVolume,
        unit: unit || "Belirtilmedi",
        volume: computedVolume,
        bagSpecs,
        deliveryTerm: input.deliveryTerm,
        deliveryLocation: (input.deliveryLocation || "").trim(),
        message: (input.message || "").trim(),
        locale: input.locale || "en",
        sourcePage: input.sourcePage || "/quote",
        status: "new" as QuoteStatus,
        convertedOrderId: null,
        convertedOrderNo: null,
        notes: [] as NoteItem[],
        history: [
            {
                action: "created",
                status: "new",
                by: "system (teklif-formu)",
                note: `Teklif talebi oluşturuldu (${requestNo})`,
                at: now
            }
        ] as HistoryItem[],
        sessionId: input.sessionId || null,
        fingerprint,
        isTest: Boolean(input.isTest),
        createdAt: now,
        updatedAt: now
    };

    const ref = await db().collection(COLLECTIONS.quoteRequests).add(payload);

    if (input.sessionId) {
        await recordVisitorConversion(input.sessionId, "quote", ref.id, input.sourcePage || "/quote").catch(() => undefined);
    }

    return { id: ref.id, requestNo, deduplicated: false };
}

export function mapMessageDoc(id: string, raw: Record<string, unknown>): ContactMessage {
    return {
        id,
        name: String(raw.name || ""),
        company: String(raw.company || ""),
        email: String(raw.email || ""),
        phone: String(raw.phone || ""),
        country: String(raw.country || ""),
        subject: String(raw.subject || "Genel İletişim"),
        message: String(raw.message || ""),
        locale: String(raw.locale || "en"),
        sourcePage: String(raw.sourcePage || "/contact"),
        status: normalizeMessageStatus(raw.status),
        notes: Array.isArray(raw.notes)
            ? raw.notes.map((n: Record<string, unknown>) => ({
                  id: String(n.id || randomUUID()),
                  by: String(n.by || "admin"),
                  text: String(n.text || ""),
                  at: toIso(n.at)
              }))
            : [],
        history: Array.isArray(raw.history)
            ? raw.history.map((h: Record<string, unknown>) => ({
                  action: String(h.action || "update"),
                  status: h.status ? String(h.status) : undefined,
                  by: String(h.by || "admin"),
                  note: h.note ? String(h.note) : undefined,
                  at: toIso(h.at)
              }))
            : [],
        sessionId: raw.sessionId ? String(raw.sessionId) : null,
        isTest: Boolean(raw.isTest),
        createdAt: toIso(raw.createdAt),
        updatedAt: toIso(raw.updatedAt || raw.createdAt)
    };
}

export function mapQuoteDoc(id: string, raw: Record<string, unknown>): QuoteRequest {
    const specsRaw = (raw.bagSpecs && typeof raw.bagSpecs === "object" ? raw.bagSpecs : {}) as Record<string, unknown>;
    const volume = String(raw.volume || "");
    return {
        id,
        requestNo: String(raw.requestNo || `AP-TLP-${id.slice(0, 6).toUpperCase()}`),
        name: String(raw.name || ""),
        company: String(raw.company || ""),
        email: String(raw.email || ""),
        phone: String(raw.phone || ""),
        country: String(raw.country || ""),
        categoryId: String(raw.categoryId || ""),
        productId: raw.productId ? String(raw.productId) : null,
        productLabel: String(raw.productLabel || raw.categoryId || ""),
        quantity: String(raw.quantity || volume || ""),
        unit: String(raw.unit || ""),
        volume,
        bagSpecs: {
            dimensions: String(specsRaw.dimensions || ""),
            color: String(specsRaw.color || ""),
            thicknessMicron: String(specsRaw.thicknessMicron || ""),
            packagingPref: String(specsRaw.packagingPref || ""),
            sealType: String(specsRaw.sealType || "")
        },
        deliveryTerm: (["EXW", "FOB", "CIF", "DAP"].includes(String(raw.deliveryTerm))
            ? String(raw.deliveryTerm)
            : "FOB") as "EXW" | "FOB" | "CIF" | "DAP",
        deliveryLocation: String(raw.deliveryLocation || ""),
        message: String(raw.message || ""),
        locale: String(raw.locale || "en"),
        sourcePage: String(raw.sourcePage || "/quote"),
        status: normalizeQuoteStatus(raw.status),
        convertedOrderId: raw.convertedOrderId ? String(raw.convertedOrderId) : null,
        convertedOrderNo: raw.convertedOrderNo ? String(raw.convertedOrderNo) : null,
        notes: Array.isArray(raw.notes)
            ? raw.notes.map((n: Record<string, unknown>) => ({
                  id: String(n.id || randomUUID()),
                  by: String(n.by || "admin"),
                  text: String(n.text || ""),
                  at: toIso(n.at)
              }))
            : [],
        history: Array.isArray(raw.history)
            ? raw.history.map((h: Record<string, unknown>) => ({
                  action: String(h.action || "update"),
                  status: h.status ? String(h.status) : undefined,
                  by: String(h.by || "admin"),
                  note: h.note ? String(h.note) : undefined,
                  at: toIso(h.at)
              }))
            : [],
        sessionId: raw.sessionId ? String(raw.sessionId) : null,
        isTest: Boolean(raw.isTest),
        createdAt: toIso(raw.createdAt),
        updatedAt: toIso(raw.updatedAt || raw.createdAt)
    };
}

export function mapOrderDoc(id: string, raw: Record<string, unknown>): ConfirmedOrder {
    const specsRaw = (raw.bagSpecs && typeof raw.bagSpecs === "object" ? raw.bagSpecs : {}) as Record<string, unknown>;
    return {
        id,
        orderNo: String(raw.orderNo || `AP-SIP-${id.slice(0, 6).toUpperCase()}`),
        quoteId: String(raw.quoteId || ""),
        requestNo: String(raw.requestNo || ""),
        customerName: String(raw.customerName || ""),
        company: String(raw.company || ""),
        email: String(raw.email || ""),
        phone: String(raw.phone || ""),
        country: String(raw.country || ""),
        categoryId: String(raw.categoryId || ""),
        productId: raw.productId ? String(raw.productId) : null,
        productLabel: String(raw.productLabel || ""),
        quantity: String(raw.quantity || ""),
        unit: String(raw.unit || ""),
        volume: String(raw.volume || ""),
        bagSpecs: {
            dimensions: String(specsRaw.dimensions || ""),
            color: String(specsRaw.color || ""),
            thicknessMicron: String(specsRaw.thicknessMicron || ""),
            packagingPref: String(specsRaw.packagingPref || ""),
            sealType: String(specsRaw.sealType || "")
        },
        deliveryTerm: String(raw.deliveryTerm || "FOB"),
        deliveryLocation: String(raw.deliveryLocation || ""),
        status: ((ORDER_STATUSES as readonly string[]).includes(String(raw.status))
            ? String(raw.status)
            : "approved") as OrderStatus,
        approvedBy: String(raw.approvedBy || ""),
        approvedAt: toIso(raw.approvedAt || raw.createdAt),
        notes: String(raw.notes || ""),
        history: Array.isArray(raw.history)
            ? raw.history.map((h: Record<string, unknown>) => ({
                  action: String(h.action || "update"),
                  status: h.status ? String(h.status) : undefined,
                  by: String(h.by || "admin"),
                  note: h.note ? String(h.note) : undefined,
                  at: toIso(h.at)
              }))
            : [],
        isTest: Boolean(raw.isTest),
        createdAt: toIso(raw.createdAt),
        updatedAt: toIso(raw.updatedAt || raw.createdAt)
    };
}

export async function listContactMessages(opts?: { includeTest?: boolean; limit?: number }): Promise<ContactMessage[]> {
    const snap = await db()
        .collection(COLLECTIONS.contactMessages)
        .orderBy("createdAt", "desc")
        .limit(opts?.limit || 300)
        .get();
    const items = snap.docs.map((d) => mapMessageDoc(d.id, d.data() as Record<string, unknown>));
    return opts?.includeTest ? items : items.filter((m) => !m.isTest);
}

export async function listQuoteRequests(opts?: { includeTest?: boolean; limit?: number }): Promise<QuoteRequest[]> {
    const snap = await db()
        .collection(COLLECTIONS.quoteRequests)
        .orderBy("createdAt", "desc")
        .limit(opts?.limit || 300)
        .get();
    const items = snap.docs.map((d) => mapQuoteDoc(d.id, d.data() as Record<string, unknown>));
    return opts?.includeTest ? items : items.filter((q) => !q.isTest);
}

export async function listConfirmedOrders(opts?: { includeTest?: boolean; limit?: number }): Promise<ConfirmedOrder[]> {
    const snap = await db()
        .collection(COLLECTIONS.orders)
        .orderBy("createdAt", "desc")
        .limit(opts?.limit || 300)
        .get();
    const items = snap.docs.map((d) => mapOrderDoc(d.id, d.data() as Record<string, unknown>));
    return opts?.includeTest ? items : items.filter((o) => !o.isTest);
}

export async function updateMessageRecord(
    id: string,
    updates: { status?: MessageStatus; noteText?: string },
    by: string
): Promise<ContactMessage> {
    const ref = db().collection(COLLECTIONS.contactMessages).doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw new Error("NOT_FOUND");

    const current = mapMessageDoc(snap.id, snap.data() as Record<string, unknown>);
    const now = new Date().toISOString();
    const nextStatus = updates.status ? normalizeMessageStatus(updates.status) : current.status;
    const notes = [...current.notes];
    const history = [...current.history];

    if (updates.status && updates.status !== current.status) {
        history.push({
            action: "status_change",
            status: nextStatus,
            by,
            note: `Durum değiştirildi: ${current.status} -> ${nextStatus}`,
            at: now
        });
    }

    if (updates.noteText && updates.noteText.trim()) {
        const cleanNote = updates.noteText.trim().slice(0, 2000);
        notes.push({
            id: randomUUID(),
            by,
            text: cleanNote,
            at: now
        });
        history.push({
            action: "note_added",
            status: nextStatus,
            by,
            note: cleanNote,
            at: now
        });
    }

    await ref.update({
        status: nextStatus,
        notes,
        history,
        updatedAt: now
    });

    await logAudit(by, "update_message", id, { status: nextStatus, noteAdded: Boolean(updates.noteText) });
    return {
        ...current,
        status: nextStatus,
        notes,
        history,
        updatedAt: now
    };
}

export async function updateQuoteRecord(
    id: string,
    updates: { status?: QuoteStatus; noteText?: string },
    by: string
): Promise<QuoteRequest> {
    const ref = db().collection(COLLECTIONS.quoteRequests).doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw new Error("NOT_FOUND");

    const current = mapQuoteDoc(snap.id, snap.data() as Record<string, unknown>);
    const now = new Date().toISOString();
    const nextStatus = updates.status ? normalizeQuoteStatus(updates.status) : current.status;
    const notes = [...current.notes];
    const history = [...current.history];

    if (updates.status && updates.status !== current.status) {
        history.push({
            action: "status_change",
            status: nextStatus,
            by,
            note: `Durum değiştirildi: ${current.status} -> ${nextStatus}`,
            at: now
        });
    }

    if (updates.noteText && updates.noteText.trim()) {
        const cleanNote = updates.noteText.trim().slice(0, 2000);
        notes.push({
            id: randomUUID(),
            by,
            text: cleanNote,
            at: now
        });
        history.push({
            action: "note_added",
            status: nextStatus,
            by,
            note: cleanNote,
            at: now
        });
    }

    await ref.update({
        status: nextStatus,
        notes,
        history,
        updatedAt: now
    });

    await logAudit(by, "update_quote", id, { status: nextStatus, noteAdded: Boolean(updates.noteText) });
    return {
        ...current,
        status: nextStatus,
        notes,
        history,
        updatedAt: now
    };
}

export async function convertQuoteToConfirmedOrder(
    quoteId: string,
    by: string,
    adminNote?: string
): Promise<{ order: ConfirmedOrder; quote: QuoteRequest }> {
    const quoteRef = db().collection(COLLECTIONS.quoteRequests).doc(quoteId);
    const quoteSnap = await quoteRef.get();
    if (!quoteSnap.exists) throw new Error("QUOTE_NOT_FOUND");

    const quote = mapQuoteDoc(quoteSnap.id, quoteSnap.data() as Record<string, unknown>);
    if (quote.convertedOrderId) {
        const existingOrderSnap = await db().collection(COLLECTIONS.orders).doc(quote.convertedOrderId).get();
        if (existingOrderSnap.exists) {
            return {
                order: mapOrderDoc(existingOrderSnap.id, existingOrderSnap.data() as Record<string, unknown>),
                quote
            };
        }
    }

    const now = new Date().toISOString();
    const orderNo = genCode("AP-SIP");
    const orderPayload = {
        orderNo,
        quoteId: quote.id,
        requestNo: quote.requestNo,
        customerName: quote.name,
        company: quote.company,
        email: quote.email,
        phone: quote.phone,
        country: quote.country,
        categoryId: quote.categoryId,
        productId: quote.productId,
        productLabel: quote.productLabel,
        quantity: quote.quantity,
        unit: quote.unit,
        volume: quote.volume,
        bagSpecs: quote.bagSpecs,
        deliveryTerm: quote.deliveryTerm,
        deliveryLocation: quote.deliveryLocation,
        status: "approved" as OrderStatus,
        approvedBy: by,
        approvedAt: now,
        notes: (adminNote || "").trim(),
        history: [
            {
                action: "order_approved_from_quote",
                status: "approved",
                by,
                note: adminNote?.trim() || `Teklif talebi (${quote.requestNo}) yönetici onayıyla kesin siparişe dönüştürüldü.`,
                at: now
            }
        ] as HistoryItem[],
        isTest: Boolean(quote.isTest),
        createdAt: now,
        updatedAt: now
    };

    const orderRef = await db().collection(COLLECTIONS.orders).add(orderPayload);

    const nextHistory: HistoryItem[] = [
        ...quote.history,
        {
            action: "converted_to_order",
            status: "approved",
            by,
            note: `Kesin siparişe dönüştürüldü: ${orderNo}`,
            at: now
        }
    ];

    await quoteRef.update({
        status: "approved",
        convertedOrderId: orderRef.id,
        convertedOrderNo: orderNo,
        history: nextHistory,
        updatedAt: now
    });

    await logAudit(by, "convert_quote_to_order", quoteId, { orderId: orderRef.id, orderNo });

    return {
        order: mapOrderDoc(orderRef.id, orderPayload),
        quote: {
            ...quote,
            status: "approved",
            convertedOrderId: orderRef.id,
            convertedOrderNo: orderNo,
            history: nextHistory,
            updatedAt: now
        }
    };
}

export async function updateConfirmedOrderStatus(
    orderId: string,
    status: OrderStatus,
    by: string,
    note?: string
): Promise<ConfirmedOrder> {
    if (!ORDER_STATUSES.includes(status)) throw new Error("INVALID_STATUS");
    const ref = db().collection(COLLECTIONS.orders).doc(orderId);
    const snap = await ref.get();
    if (!snap.exists) throw new Error("ORDER_NOT_FOUND");

    const current = mapOrderDoc(snap.id, snap.data() as Record<string, unknown>);
    const now = new Date().toISOString();
    const history: HistoryItem[] = [
        ...current.history,
        {
            action: "status_change",
            status,
            by,
            note: note?.trim() || `Sipariş durumu güncellendi: ${status}`,
            at: now
        }
    ];

    await ref.update({
        status,
        history,
        updatedAt: now
    });

    await logAudit(by, "update_order_status", orderId, { status, note });
    return {
        ...current,
        status,
        history,
        updatedAt: now
    };
}

// ============================================================================
// PRODUCT MANAGEMENT & SLUG REDIRECTS
// ============================================================================

const DEFAULT_PRODUCT_IMAGES: Record<string, string> = {
    "heavy-duty": "/images/products/heavy-duty.jpg",
    household: "/images/products/household.jpg",
    "industrial-liners": "/images/products/industrial-liners.jpg",
    drawstring: "/images/products/drawstring.jpg",
    "star-seal": "/images/products/star-seal.jpg",
    colored: "/images/products/colored.jpg",
    "custom-size": "/images/products/custom-size.jpg",
    "private-label": "/images/products/private-label.jpg"
};

export function mapProductDoc(id: string, raw: Record<string, unknown>): ProductDoc {
    const categoryId = String(raw.categoryId || "heavy-duty");
    return {
        id,
        slug: String(raw.slug || id),
        active: raw.active !== false,
        sortOrder: typeof raw.sortOrder === "number" ? raw.sortOrder : Number(raw.sortOrder || 10),
        categoryId,
        name: String(raw.name || ""),
        shortDescription: String(raw.shortDescription || ""),
        description: String(raw.description || ""),
        imageUrl: raw.imageUrl ? String(raw.imageUrl) : DEFAULT_PRODUCT_IMAGES[categoryId] || "/images/products/heavy-duty.jpg",
        moq: String(raw.moq || "Spesifikasyona göre belirlenir"),
        specs: Array.isArray(raw.specs)
            ? raw.specs.map((s: Record<string, unknown>) => ({
                  label: String(s.label || ""),
                  value: String(s.value || "")
              }))
            : [],
        translations:
            raw.translations && typeof raw.translations === "object"
                ? (raw.translations as Record<string, { name?: string; shortDescription?: string; description?: string }>)
                : {},
        createdAt: toIso(raw.createdAt),
        updatedAt: toIso(raw.updatedAt || raw.createdAt)
    };
}

const SERVER_CACHE_TTL_MS = 60_000;
let productsCache: { docs: ProductDoc[]; expiresAt: number } | null = null;
let companySettingsCache: { data: CompanySettings; expiresAt: number } | null = null;

export function invalidateCatalogAndSettingsCache(): void {
    productsCache = null;
    companySettingsCache = null;
}

export async function ensureSeedProductsInFirestore(): Promise<ProductDoc[]> {
    if (productsCache && productsCache.expiresAt > Date.now()) {
        return productsCache.docs;
    }
    const col = db().collection(COLLECTIONS.products);
    const snap = await col.get();
    if (!snap.empty) {
        const docs = snap.docs.map((d) => mapProductDoc(d.id, d.data() as Record<string, unknown>));
        docs.sort((a, b) => a.sortOrder - b.sortOrder);
        productsCache = { docs, expiresAt: Date.now() + SERVER_CACHE_TTL_MS };
        return docs;
    }

    const now = new Date().toISOString();
    const created: ProductDoc[] = [];

    for (const seed of SEED_PRODUCTS) {
        const trCopy = getCategoryCopy("tr", seed.categoryId);
        const deCopy = getCategoryCopy("de", seed.categoryId);
        const frCopy = getCategoryCopy("fr", seed.categoryId);
        const arCopy = getCategoryCopy("ar", seed.categoryId);

        const translations = {
            en: {
                name: seed.name,
                shortDescription: seed.shortDescription,
                description: seed.description
            },
            tr: {
                name: trCopy.name,
                shortDescription: trCopy.blurb,
                description: `${trCopy.name} — ${trCopy.blurb} Her sipariş teknik föydeki kalınlık (mikron), en, boy, renk ve kolileme standartlarına göre üretilir.`
            },
            de: {
                name: deCopy.name,
                shortDescription: deCopy.blurb,
                description: `${deCopy.name} — ${deCopy.blurb}`
            },
            fr: {
                name: frCopy.name,
                shortDescription: frCopy.blurb,
                description: `${frCopy.name} — ${frCopy.blurb}`
            },
            ar: {
                name: arCopy.name,
                shortDescription: arCopy.blurb,
                description: `${arCopy.name} — ${arCopy.blurb}`
            }
        };

        const payload = {
            slug: seed.slug,
            active: true,
            sortOrder: seed.sortOrder,
            categoryId: seed.categoryId,
            name: seed.name,
            shortDescription: seed.shortDescription,
            description: seed.description,
            imageUrl: DEFAULT_PRODUCT_IMAGES[seed.categoryId] || "/images/products/heavy-duty.jpg",
            moq: seed.moq,
            specs: seed.specs,
            translations,
            createdAt: now,
            updatedAt: now
        };

        const docRef = col.doc(seed.slug);
        await docRef.set(payload, { merge: true });
        created.push(mapProductDoc(docRef.id, payload));
    }

    created.sort((a, b) => a.sortOrder - b.sortOrder);
    productsCache = { docs: created, expiresAt: Date.now() + SERVER_CACHE_TTL_MS };
    return created;
}

export async function getProducts(opts?: { includeInactive?: boolean }): Promise<ProductDoc[]> {
    const docs = await ensureSeedProductsInFirestore();
    if (opts?.includeInactive) return docs;
    return docs.filter((d) => d.active);
}

export async function getProductBySlug(slug: string): Promise<ProductDoc | null> {
    if (productsCache && productsCache.expiresAt > Date.now()) {
        const cached = productsCache.docs.find((p) => p.slug === slug);
        if (cached) return cached.active ? cached : null;
    }
    const all = await ensureSeedProductsInFirestore();
    return all.find((p) => p.slug === slug && p.active) || null;
}

export async function resolveProductSlugRedirect(slug: string): Promise<string | null> {
    try {
        const snap = await db().collection(COLLECTIONS.slugRedirects).doc(slug).get();
        if (!snap.exists) return null;
        const toSlug = snap.data()?.toSlug as string | undefined;
        return toSlug && toSlug !== slug ? toSlug : null;
    } catch {
        return null;
    }
}

export async function saveProduct(
    id: string | null,
    data: Omit<ProductDoc, "id" | "createdAt" | "updatedAt">,
    by: string
): Promise<ProductDoc> {
    const col = db().collection(COLLECTIONS.products);
    const now = new Date().toISOString();

    // Check slug uniqueness
    const existingSlugSnap = await col.where("slug", "==", data.slug).limit(2).get();
    for (const doc of existingSlugSnap.docs) {
        if (doc.id !== id) {
            throw new Error("SLUG_ALREADY_EXISTS");
        }
    }

    if (id) {
        const docRef = col.doc(id);
        const prevSnap = await docRef.get();
        if (!prevSnap.exists) throw new Error("PRODUCT_NOT_FOUND");
        const prevData = prevSnap.data() as Record<string, unknown>;
        const prevSlug = String(prevData.slug || "");

        const updatedPayload = {
            ...data,
            updatedAt: now
        };
        await docRef.set(updatedPayload, { merge: true });

        // If slug changed, create automatic redirect from old slug to new slug
        if (prevSlug && prevSlug !== data.slug) {
            await db()
                .collection(COLLECTIONS.slugRedirects)
                .doc(prevSlug)
                .set({
                    fromSlug: prevSlug,
                    toSlug: data.slug,
                    productId: id,
                    updatedBy: by,
                    updatedAt: now
                });
        }

        productsCache = null;
        await logAudit(by, "update_product", id, { slug: data.slug, prevSlug, active: data.active });
        return mapProductDoc(id, { ...prevData, ...updatedPayload });
    } else {
        const payload = {
            ...data,
            createdAt: now,
            updatedAt: now
        };
        const docRef = await col.add(payload);
        productsCache = null;
        await logAudit(by, "create_product", docRef.id, { slug: data.slug, name: data.name });
        return mapProductDoc(docRef.id, payload);
    }
}

export async function deleteProduct(id: string, by: string): Promise<void> {
    await db().collection(COLLECTIONS.products).doc(id).delete();
    productsCache = null;
    await logAudit(by, "delete_product", id);
}

// ============================================================================
// COMPANY SETTINGS
// ============================================================================

export async function getCompanySettings(): Promise<CompanySettings> {
    if (companySettingsCache && companySettingsCache.expiresAt > Date.now()) {
        return companySettingsCache.data;
    }
    try {
        const ref = db().collection(COLLECTIONS.settings).doc("company");
        const snap = await ref.get();
        if (!snap.exists) {
            const init = {
                ...DEFAULT_COMPANY_SETTINGS,
                updatedAt: new Date().toISOString(),
                updatedBy: "system"
            };
            await ref.set(init, { merge: true });
            companySettingsCache = { data: init, expiresAt: Date.now() + SERVER_CACHE_TTL_MS };
            return init;
        }
        const d = snap.data() as Record<string, unknown>;
        const social = (d.socialLinks && typeof d.socialLinks === "object" ? d.socialLinks : {}) as Record<string, unknown>;
        const result: CompanySettings = {
            name: String(d.name || DEFAULT_COMPANY_SETTINGS.name),
            legalName: String(d.legalName || DEFAULT_COMPANY_SETTINGS.legalName),
            email: String(d.email || DEFAULT_COMPANY_SETTINGS.email),
            phone: String(d.phone || DEFAULT_COMPANY_SETTINGS.phone),
            whatsapp: String(d.whatsapp || DEFAULT_COMPANY_SETTINGS.whatsapp),
            country: String(d.country || DEFAULT_COMPANY_SETTINGS.country),
            city: String(d.city || DEFAULT_COMPANY_SETTINGS.city),
            address: String(d.address || DEFAULT_COMPANY_SETTINGS.address),
            workingHours: String(d.workingHours || DEFAULT_COMPANY_SETTINGS.workingHours),
            socialLinks: {
                linkedin: String(social.linkedin || ""),
                instagram: String(social.instagram || ""),
                facebook: String(social.facebook || ""),
                youtube: String(social.youtube || ""),
                x: String(social.x || "")
            },
            analyticsRetentionDays:
                typeof d.analyticsRetentionDays === "number"
                    ? d.analyticsRetentionDays
                    : DEFAULT_COMPANY_SETTINGS.analyticsRetentionDays,
            updatedAt: d.updatedAt ? toIso(d.updatedAt) : null,
            updatedBy: d.updatedBy ? String(d.updatedBy) : null
        };
        companySettingsCache = { data: result, expiresAt: Date.now() + SERVER_CACHE_TTL_MS };
        return result;
    } catch {
        return {
            ...DEFAULT_COMPANY_SETTINGS,
            updatedAt: null,
            updatedBy: null
        };
    }
}

export async function saveCompanySettings(
    settings: Omit<CompanySettings, "updatedAt" | "updatedBy">,
    by: string
): Promise<CompanySettings> {
    const now = new Date().toISOString();
    const payload: CompanySettings = {
        ...settings,
        updatedAt: now,
        updatedBy: by
    };
    await db().collection(COLLECTIONS.settings).doc("company").set(payload, { merge: true });
    companySettingsCache = { data: payload, expiresAt: Date.now() + SERVER_CACHE_TTL_MS };
    await logAudit(by, "update_company_settings", "company", { email: settings.email, whatsapp: settings.whatsapp });
    return payload;
}

// ============================================================================
// VISITOR ANALYTICS & LOGIN LOGS
// ============================================================================

export async function recordVisitorSessionEvent(input: {
    sessionId: string;
    visitorId: string;
    consentGranted: boolean;
    isTest: boolean;
    at: string;
    timezone: string;
    path: string;
    locale: string;
    referrer: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    utmTerm: string;
    utmContent: string;
    countryCode: string;
    countryName: string;
    region: string;
    city: string;
    geoSource: string;
    deviceType: "telefon" | "tablet" | "bilgisayar" | "Bilinmiyor";
    deviceBrand: string;
    deviceModel: string;
    osName: string;
    osVersion: string;
    browserName: string;
    browserVersion: string;
    language: string;
    screenSize: string;
    botStatus: "human" | "bot" | "uncertain";
    botReason: string;
}): Promise<{ deduplicated: boolean }> {
    const docRef = db().collection(COLLECTIONS.visits).doc(input.sessionId);
    const snap = await docRef.get();

    if (!snap.exists) {
        const newSession: Omit<VisitorSessionDoc, "id"> = {
            sessionId: input.sessionId,
            visitorId: input.visitorId || input.sessionId,
            consentGranted: input.consentGranted,
            isTest: input.isTest,
            startedAt: input.at,
            lastActivityAt: input.at,
            durationSeconds: 0,
            timezone: input.timezone,
            entryPage: input.path,
            exitPage: input.path,
            pages: [input.path],
            pageViews: 1,
            referrer: input.referrer,
            utmSource: input.utmSource,
            utmMedium: input.utmMedium,
            utmCampaign: input.utmCampaign,
            utmTerm: input.utmTerm,
            utmContent: input.utmContent,
            countryCode: input.countryCode,
            countryName: input.countryName,
            region: input.region,
            city: input.city,
            geoSource: input.geoSource,
            deviceType: input.deviceType,
            deviceBrand: input.deviceBrand,
            deviceModel: input.deviceModel,
            osName: input.osName,
            osVersion: input.osVersion,
            browserName: input.browserName,
            browserVersion: input.browserVersion,
            language: input.language,
            screenSize: input.screenSize,
            botStatus: input.botStatus,
            botReason: input.botReason,
            convertedContact: false,
            convertedQuote: false,
            events: [
                {
                    type: "pageview",
                    path: input.path,
                    locale: input.locale,
                    at: input.at
                }
            ]
        };
        await docRef.set(newSession);
        return { deduplicated: false };
    }

    const existing = snap.data() as VisitorSessionDoc;
    const events = Array.isArray(existing.events) ? [...existing.events] : [];
    const lastPageEvent = [...events].reverse().find((e) => e.type === "pageview");

    // Deduplicate reload/re-submission within 5 seconds on the exact same path
    if (lastPageEvent && lastPageEvent.path === input.path) {
        const diffMs = Math.abs(Date.parse(input.at) - Date.parse(lastPageEvent.at));
        if (diffMs < 5000) {
            return { deduplicated: true };
        }
    }

    events.push({
        type: "pageview",
        path: input.path,
        locale: input.locale,
        at: input.at
    });

    const pages = Array.isArray(existing.pages) ? [...existing.pages] : [];
    if (!pages.includes(input.path)) pages.push(input.path);

    const startedMs = Date.parse(existing.startedAt || input.at);
    const nowMs = Date.parse(input.at);
    const durationSeconds = Number.isFinite(startedMs) && nowMs > startedMs ? Math.round((nowMs - startedMs) / 1000) : 0;

    await docRef.update({
        lastActivityAt: input.at,
        exitPage: input.path,
        pages,
        pageViews: (existing.pageViews || 1) + 1,
        durationSeconds,
        deviceModel:
            existing.deviceModel === "Model belirlenemedi" && input.deviceModel !== "Model belirlenemedi"
                ? input.deviceModel
                : existing.deviceModel,
        deviceBrand:
            existing.deviceBrand === "Bilinmiyor" && input.deviceBrand !== "Bilinmiyor"
                ? input.deviceBrand
                : existing.deviceBrand,
        events: events.slice(-100)
    });

    return { deduplicated: false };
}

export async function recordVisitorConversion(
    sessionId: string,
    type: "contact" | "quote",
    refId: string,
    sourcePath: string
): Promise<void> {
    if (!sessionId) return;
    const docRef = db().collection(COLLECTIONS.visits).doc(sessionId);
    const snap = await docRef.get();
    if (!snap.exists) return;

    const existing = snap.data() as VisitorSessionDoc;
    const now = new Date().toISOString();
    const events = Array.isArray(existing.events) ? [...existing.events] : [];
    events.push({
        type: type === "contact" ? "contact_submit" : "quote_submit",
        path: sourcePath,
        refId,
        at: now
    });

    const startedMs = Date.parse(existing.startedAt || now);
    const durationSeconds = Math.max(
        existing.durationSeconds || 0,
        Number.isFinite(startedMs) ? Math.round((Date.now() - startedMs) / 1000) : 0
    );

    await docRef.update({
        lastActivityAt: now,
        durationSeconds,
        ...(type === "contact" ? { convertedContact: true } : { convertedQuote: true }),
        events: events.slice(-100)
    });
}

export async function listVisitorSessions(opts?: {
    includeTest?: boolean;
    limit?: number;
}): Promise<VisitorSessionDoc[]> {
    const snap = await db()
        .collection(COLLECTIONS.visits)
        .orderBy("lastActivityAt", "desc")
        .limit(opts?.limit || 400)
        .get();

    const items = snap.docs.map((d) => {
        const raw = d.data() as Record<string, unknown>;
        return {
            id: d.id,
            sessionId: String(raw.sessionId || d.id),
            visitorId: String(raw.visitorId || d.id),
            consentGranted: Boolean(raw.consentGranted),
            isTest: Boolean(raw.isTest),
            startedAt: toIso(raw.startedAt),
            lastActivityAt: toIso(raw.lastActivityAt || raw.startedAt),
            durationSeconds: Number(raw.durationSeconds || 0),
            timezone: String(raw.timezone || "Europe/Istanbul (UTC+3)"),
            entryPage: String(raw.entryPage || "/"),
            exitPage: String(raw.exitPage || raw.entryPage || "/"),
            pages: Array.isArray(raw.pages) ? raw.pages.map(String) : ["/"],
            pageViews: Number(raw.pageViews || 1),
            referrer: String(raw.referrer || "Doğrudan Giriş"),
            utmSource: String(raw.utmSource || ""),
            utmMedium: String(raw.utmMedium || ""),
            utmCampaign: String(raw.utmCampaign || ""),
            utmTerm: String(raw.utmTerm || ""),
            utmContent: String(raw.utmContent || ""),
            countryCode: String(raw.countryCode || "Bilinmiyor"),
            countryName: String(raw.countryName || "Bilinmiyor"),
            region: String(raw.region || "Bilinmiyor"),
            city: String(raw.city || "Bilinmiyor"),
            geoSource: String(raw.geoSource || "Bilinmiyor"),
            deviceType: (["telefon", "tablet", "bilgisayar"].includes(String(raw.deviceType))
                ? String(raw.deviceType)
                : "Bilinmiyor") as "telefon" | "tablet" | "bilgisayar" | "Bilinmiyor",
            deviceBrand: String(raw.deviceBrand || "Bilinmiyor"),
            deviceModel: String(raw.deviceModel || "Model belirlenemedi"),
            osName: String(raw.osName || "Bilinmiyor"),
            osVersion: String(raw.osVersion || "Bilinmiyor"),
            browserName: String(raw.browserName || "Bilinmiyor"),
            browserVersion: String(raw.browserVersion || "Bilinmiyor"),
            language: String(raw.language || "Bilinmiyor"),
            screenSize: String(raw.screenSize || "Veri alınamadı"),
            botStatus: (["human", "bot", "uncertain"].includes(String(raw.botStatus))
                ? String(raw.botStatus)
                : "human") as "human" | "bot" | "uncertain",
            botReason: String(raw.botReason || ""),
            convertedContact: Boolean(raw.convertedContact),
            convertedQuote: Boolean(raw.convertedQuote),
            events: Array.isArray(raw.events)
                ? raw.events.map((e: Record<string, unknown>) => ({
                      type: (["pageview", "contact_submit", "quote_submit"].includes(String(e.type))
                          ? String(e.type)
                          : "pageview") as "pageview" | "contact_submit" | "quote_submit",
                      path: String(e.path || "/"),
                      locale: e.locale ? String(e.locale) : undefined,
                      refId: e.refId ? String(e.refId) : undefined,
                      at: toIso(e.at)
                  }))
                : []
        } satisfies VisitorSessionDoc;
    });

    return opts?.includeTest ? items : items.filter((v) => !v.isTest);
}

export async function cleanupExpiredAnalyticsSessions(retentionDays: number): Promise<number> {
    const safeDays = Math.max(7, Math.min(730, retentionDays || 90));
    const cutoffIso = new Date(Date.now() - safeDays * 86400_000).toISOString();
    const expiredSnap = await db()
        .collection(COLLECTIONS.visits)
        .where("lastActivityAt", "<", cutoffIso)
        .limit(100)
        .get();

    if (expiredSnap.empty) return 0;
    const batch = db().batch();
    expiredSnap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    return expiredSnap.size;
}

export async function recordLoginAttempt(input: {
    email: string;
    uid?: string | null;
    success: boolean;
    reason: string;
    method: string;
    countryCode: string;
    countryName: string;
    city: string;
    deviceType: string;
    osName: string;
    browserName: string;
    isTest?: boolean;
}): Promise<string> {
    const now = new Date().toISOString();
    const ref = await db()
        .collection(COLLECTIONS.loginLogs)
        .add({
            email: input.email.trim().toLowerCase(),
            uid: input.uid || null,
            success: input.success,
            reason: input.reason,
            method: input.method,
            countryCode: input.countryCode,
            countryName: input.countryName,
            city: input.city,
            deviceType: input.deviceType,
            osName: input.osName,
            browserName: input.browserName,
            isTest: Boolean(input.isTest),
            createdAt: now
        });
    return ref.id;
}

export async function listLoginLogs(opts?: { includeTest?: boolean; limit?: number }): Promise<LoginLogDoc[]> {
    const snap = await db()
        .collection(COLLECTIONS.loginLogs)
        .orderBy("createdAt", "desc")
        .limit(opts?.limit || 200)
        .get();

    const items = snap.docs.map((d) => {
        const raw = d.data() as Record<string, unknown>;
        return {
            id: d.id,
            email: String(raw.email || ""),
            uid: raw.uid ? String(raw.uid) : null,
            success: Boolean(raw.success),
            reason: String(raw.reason || ""),
            method: String(raw.method || "firebase_auth"),
            countryCode: String(raw.countryCode || "Bilinmiyor"),
            countryName: String(raw.countryName || "Bilinmiyor"),
            city: String(raw.city || "Bilinmiyor"),
            deviceType: String(raw.deviceType || "Bilinmiyor"),
            osName: String(raw.osName || "Bilinmiyor"),
            browserName: String(raw.browserName || "Bilinmiyor"),
            isTest: Boolean(raw.isTest),
            createdAt: toIso(raw.createdAt)
        };
    });

    return opts?.includeTest ? items : items.filter((l) => !l.isTest);
}

export async function logAudit(by: string, action: string, target: string, meta?: Record<string, unknown>): Promise<void> {
    await db()
        .collection(COLLECTIONS.auditLogs)
        .add({
            by,
            action,
            target,
            meta: meta || {},
            at: new Date().toISOString()
        });
}

export async function listAuditLogs(limit = 100): Promise<AuditLogDoc[]> {
    const snap = await db().collection(COLLECTIONS.auditLogs).orderBy("at", "desc").limit(limit).get();
    return snap.docs.map((d) => {
        const raw = d.data() as Record<string, unknown>;
        return {
            id: d.id,
            by: String(raw.by || ""),
            action: String(raw.action || ""),
            target: String(raw.target || ""),
            meta: (raw.meta && typeof raw.meta === "object" ? raw.meta : {}) as Record<string, unknown>,
            at: toIso(raw.at)
        };
    });
}

export function productLabelFor(id: string | null | undefined): string {
    if (!id) return "";
    return (
        SEED_PRODUCTS.find((p) => p.slug === id)?.name ||
        CATEGORIES.find((c) => c.id === id)?.en.name ||
        id
    );
}
