import "server-only";
import { FieldValue, type Timestamp } from "firebase-admin/firestore";
import { db, COLLECTIONS } from "./firebaseAdmin";
import { ORDER_STATUSES, MESSAGE_STATUSES, type OrderStatus, type MessageStatus } from "./config";

/**
 * Server-side data access layer. All writes go through here (Admin SDK),
 * validated with zod at the API boundary. Never called from the browser.
 */

export type ContactMessage = {
    id?: string;
    name: string;
    company: string;
    email: string;
    phone?: string;
    country: string;
    message: string;
    locale: string;
    sourcePage: string;
    productInterest?: string;
    status: MessageStatus;
    assignedTo?: string | null;
    notes?: { by: string; text: string; at: Timestamp }[];
    ipHash?: string;
    userAgent?: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
};

export type QuoteRequest = {
    id?: string;
    name: string;
    company: string;
    email: string;
    phone?: string;
    country: string;
    categoryId: string;
    productId?: string | null;
    productLabel?: string;
    volume: string;
    deliveryTerm: "EXW" | "FOB" | "CIF" | "DAP";
    message?: string;
    locale: string;
    sourcePage: string;
    status: MessageStatus;
    assignedTo?: string | null;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
};

export type Order = {
    id?: string;
    orderNo: string;
    quoteId?: string | null;
    customerName: string;
    company: string;
    email: string;
    country: string;
    items: { productId?: string; label: string; qty: number; unit: string; unitPrice?: number; currency?: string }[];
    totalAmount?: number | null;
    currency?: string;
    incoterm?: string;
    status: OrderStatus;
    assignedTo?: string | null;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
};

export type ProductDoc = {
    id?: string;
    slug: string;
    active: boolean;
    sortOrder: number;
    categoryId: string;
    name: string;
    shortDescription: string;
    description: string;
    imageUrl?: string | null;
    moq?: string | null;
    specs: { label: string; value: string }[];
    translations?: Record<string, { name?: string; shortDescription?: string; description?: string }>;
    seo?: Record<string, { title?: string; description?: string }>;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
};

function ipHash(ip: string): string {
    // Lightweight non-reversible hash for abuse tracking; not personal data storage.
    let h = 5381;
    for (let i = 0; i < ip.length; i++) h = ((h << 5) + h + ip.charCodeAt(i)) >>> 0;
    return h.toString(36);
}

export async function createContactMessage(
    data: Omit<ContactMessage, "status" | "createdAt" | "updatedAt" | "id"> & { ip: string }
): Promise<string> {
    const { ip, ...rest } = data;
    const ref = await db()
        .collection(COLLECTIONS.contactMessages)
        .add({
            ...rest,
            ipHash: ipHash(ip),
            status: "new" as MessageStatus,
            assignedTo: null,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        });

    await db()
        .collection(COLLECTIONS.notifications)
        .add({
            type: "contact_message",
            title: `New message from ${rest.country || rest.email}`,
            body: rest.message.slice(0, 160),
            refId: ref.id,
            read: false,
            createdAt: FieldValue.serverTimestamp()
        });

    return ref.id;
}

export async function createQuoteRequest(
    data: Omit<QuoteRequest, "status" | "createdAt" | "updatedAt" | "id"> & { ip: string }
): Promise<string> {
    const { ip, ...rest } = data;
    const ref = await db()
        .collection(COLLECTIONS.quoteRequests)
        .add({
            ...rest,
            ipHash: ipHash(ip),
            status: "new" as MessageStatus,
            assignedTo: null,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        });

    await db()
        .collection(COLLECTIONS.notifications)
        .add({
            type: "quote_request",
            title: `RFQ from ${rest.country || rest.email} — ${rest.productLabel || rest.categoryId}`,
            body: rest.message?.slice(0, 160) || `Volume: ${rest.volume}`,
            refId: ref.id,
            read: false,
            createdAt: FieldValue.serverTimestamp()
        });

    return ref.id;
}

function genOrderNo(): string {
    const now = new Date();
    const y = now.getUTCFullYear().toString().slice(-2);
    const m = String(now.getUTCMonth() + 1).padStart(2, "0");
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `AP-${y}${m}-${rand}`;
}

export async function createOrder(
    data: Omit<Order, "orderNo" | "createdAt" | "updatedAt" | "id">
): Promise<string> {
    const orderNo = genOrderNo();
    const ref = await db().collection(COLLECTIONS.orders).add({
        ...data,
        orderNo,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    });
    await db()
        .collection(COLLECTIONS.orderEvents)
        .add({
            orderId: ref.id,
            status: data.status,
            by: data.assignedTo || "system",
            note: "Order created",
            at: FieldValue.serverTimestamp()
        });
    return ref.id;
}

export async function listCollection<T>(name: string, opts?: { orderBy?: string; desc?: boolean; limit?: number; where?: [string, "<" | "<=" | "==" | ">=" | ">", unknown] }): Promise<T[]> {
    let q: FirebaseFirestore.Query = db().collection(name);
    if (opts?.where) q = q.where(opts.where[0], opts.where[1], opts.where[2]);
    if (opts?.orderBy) q = q.orderBy(opts.orderBy, opts.desc ? "desc" : "asc");
    if (opts?.limit) q = q.limit(opts.limit);
    const snap = await q.get();
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as T[];
}

export async function getProducts(): Promise<ProductDoc[]> {
    const snap = await db()
        .collection(COLLECTIONS.products)
        .where("active", "==", true)
        .orderBy("sortOrder", "asc")
        .get();
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as ProductDoc[];
}

export async function getProductBySlug(slug: string): Promise<ProductDoc | null> {
    const snap = await db().collection(COLLECTIONS.products).where("slug", "==", slug).limit(1).get();
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...(snap.docs[0].data() as object) } as ProductDoc;
}

export async function updateMessageStatus(id: string, status: MessageStatus, by: string): Promise<void> {
    if (!MESSAGE_STATUSES.includes(status)) throw new Error("INVALID_STATUS");
    await db()
        .collection(COLLECTIONS.contactMessages)
        .doc(id)
        .update({ status, updatedAt: FieldValue.serverTimestamp(), statusBy: by });
}

export async function updateQuoteStatus(id: string, status: MessageStatus, by: string): Promise<void> {
    if (!MESSAGE_STATUSES.includes(status)) throw new Error("INVALID_STATUS");
    await db()
        .collection(COLLECTIONS.quoteRequests)
        .doc(id)
        .update({ status, updatedAt: FieldValue.serverTimestamp(), statusBy: by });
}

export async function updateOrderStatus(id: string, status: OrderStatus, by: string, note?: string): Promise<void> {
    if (!ORDER_STATUSES.includes(status)) throw new Error("INVALID_STATUS");
    await db()
        .collection(COLLECTIONS.orders)
        .doc(id)
        .update({ status, updatedAt: FieldValue.serverTimestamp() });
    await db()
        .collection(COLLECTIONS.orderEvents)
        .add({ orderId: id, status, by, note: note || "", at: FieldValue.serverTimestamp() });
}

export async function logAudit(by: string, action: string, target: string, meta?: Record<string, unknown>): Promise<void> {
    await db()
        .collection(COLLECTIONS.auditLogs)
        .add({ by, action, target, meta: meta || {}, at: FieldValue.serverTimestamp() });
}
