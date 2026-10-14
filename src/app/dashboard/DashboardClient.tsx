"use client";

import { useState, useMemo, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    MESSAGE_STATUSES,
    MESSAGE_STATUS_LABELS_TR,
    QUOTE_STATUSES,
    QUOTE_STATUS_LABELS_TR,
    ORDER_STATUSES,
    ORDER_STATUS_LABELS_TR,
    type MessageStatus,
    type QuoteStatus,
    type OrderStatus,
    type CompanySettings
} from "@/lib/config";
import type {
    ContactMessage,
    QuoteRequest,
    ConfirmedOrder,
    ProductDoc,
    VisitorSessionDoc,
    LoginLogDoc,
    AuditLogDoc
} from "@/lib/repo";
import { CATEGORIES } from "@/data/catalog";

type TabId = "overview" | "messages" | "quotes" | "products" | "analytics" | "settings";

type DashboardData = {
    serverTime: string;
    messages: ContactMessage[];
    quotes: QuoteRequest[];
    orders: ConfirmedOrder[];
    products: ProductDoc[];
    visits: VisitorSessionDoc[];
    loginLogs: LoginLogDoc[];
    auditLogs: AuditLogDoc[];
    settings: CompanySettings;
};

type ConfirmModalState = {
    title: string;
    message: string;
    confirmLabel: string;
    tone?: "danger" | "primary";
    onConfirm: () => Promise<void> | void;
} | null;

function formatTrDate(iso: string | null | undefined): string {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleString("tr-TR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    } catch {
        return iso;
    }
}

function formatDurationTr(sec: number): string {
    if (!sec || sec <= 0) return "0 sn (Tek sayfa / ilk etkinlik)";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m === 0) return `${s} sn`;
    return `${m} dk ${s} sn`;
}

function inDateRange(iso: string, from: string, to: string): boolean {
    if (!from && !to) return true;
    const t = Date.parse(iso);
    if (!Number.isFinite(t)) return true;
    if (from) {
        const f = Date.parse(from);
        if (Number.isFinite(f) && t < f) return false;
    }
    if (to) {
        const end = Date.parse(to) + 86400_000 - 1;
        if (Number.isFinite(end) && t > end) return false;
    }
    return true;
}

const MSG_BADGE_CLASSES: Record<MessageStatus, string> = {
    unread: "bg-emerald-100 text-emerald-900 border-emerald-300",
    read: "bg-slate-100 text-slate-700 border-slate-300",
    in_progress: "bg-amber-100 text-amber-900 border-amber-300",
    replied: "bg-sky-100 text-sky-900 border-sky-300",
    archived: "bg-slate-200 text-slate-600 border-slate-300"
};

const QUOTE_BADGE_CLASSES: Record<QuoteStatus, string> = {
    new: "bg-emerald-100 text-emerald-900 border-emerald-300",
    reviewing: "bg-amber-100 text-amber-900 border-amber-300",
    quote_sent: "bg-sky-100 text-sky-900 border-sky-300",
    waiting_customer: "bg-purple-100 text-purple-900 border-purple-300",
    approved: "bg-teal-100 text-teal-900 border-teal-300",
    completed: "bg-emerald-200 text-emerald-950 border-emerald-400",
    cancelled: "bg-rose-100 text-rose-900 border-rose-300"
};

const ORDER_BADGE_CLASSES: Record<OrderStatus, string> = {
    approved: "bg-teal-100 text-teal-900 border-teal-300",
    in_production: "bg-amber-100 text-amber-900 border-amber-300",
    shipped: "bg-sky-100 text-sky-900 border-sky-300",
    completed: "bg-emerald-100 text-emerald-900 border-emerald-300",
    cancelled: "bg-rose-100 text-rose-900 border-rose-300"
};

export default function DashboardClient({
    user,
    initialData,
    initialError
}: {
    user: { uid: string; email: string; displayName: string; roles: string[] };
    initialData: DashboardData;
    initialError: string | null;
}) {
    const router = useRouter();
    const [tab, setTab] = useState<TabId>("overview");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [data, setData] = useState<DashboardData>(initialData);
    const [connError, setConnError] = useState<string | null>(initialError);
    const [refreshing, setRefreshing] = useState(false);
    const [toast, setToast] = useState<{ text: string; tone: "ok" | "err" } | null>(null);
    const [confirmModal, setConfirmModal] = useState<ConfirmModalState>(null);

    // Messages state
    const [msgSearch, setMsgSearch] = useState("");
    const [msgStatusFilter, setMsgStatusFilter] = useState<string>("all");
    const [msgLocaleFilter, setMsgLocaleFilter] = useState<string>("all");
    const [msgDateFrom, setMsgDateFrom] = useState("");
    const [msgDateTo, setMsgDateTo] = useState("");
    const [msgPage, setMsgPage] = useState(1);
    const [selectedMsgId, setSelectedMsgId] = useState<string | null>(
        initialData.messages[0]?.id || null
    );
    const [msgNoteDraft, setMsgNoteDraft] = useState("");
    const [msgSaving, setMsgSaving] = useState(false);

    // Quotes & Orders state
    const [quoteSubTab, setQuoteSubTab] = useState<"rfq" | "orders">("rfq");
    const [quoteSearch, setQuoteSearch] = useState("");
    const [quoteStatusFilter, setQuoteStatusFilter] = useState<string>("all");
    const [quoteCountryFilter, setQuoteCountryFilter] = useState<string>("all");
    const [quoteDateFrom, setQuoteDateFrom] = useState("");
    const [quoteDateTo, setQuoteDateTo] = useState("");
    const [quotePage, setQuotePage] = useState(1);
    const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(
        initialData.quotes[0]?.id || null
    );
    const [quoteNoteDraft, setQuoteNoteDraft] = useState("");
    const [orderApprovalNote, setOrderApprovalNote] = useState("");
    const [quoteSaving, setQuoteSaving] = useState(false);

    // Products state
    const [editingProduct, setEditingProduct] = useState<{
        id: string | null;
        slug: string;
        active: boolean;
        sortOrder: number;
        categoryId: string;
        name: string;
        shortDescription: string;
        description: string;
        moq: string;
        imageUrl: string;
        specs: { label: string; value: string }[];
        translations: Record<string, { name?: string; shortDescription?: string; description?: string }>;
    } | null>(null);
    const [prodLocaleTab, setProdLocaleTab] = useState<"en" | "tr" | "de" | "fr" | "ar">("tr");
    const [prodSaving, setProdSaving] = useState(false);
    const [uploadingImg, setUploadingImg] = useState(false);

    // Analytics state
    const [analyticsSubTab, setAnalyticsSubTab] = useState<"visits" | "logins">("visits");
    const [visitCountry, setVisitCountry] = useState("all");
    const [visitDevice, setVisitDevice] = useState("all");
    const [visitBrowser, setVisitBrowser] = useState("all");
    const [visitPageFilter, setVisitPageFilter] = useState("");
    const [visitConversion, setVisitConversion] = useState<"all" | "converted" | "none">("all");
    const [visitBotFilter, setVisitBotFilter] = useState<"human" | "bot" | "all">("human");
    const [visitDateFrom, setVisitDateFrom] = useState("");
    const [visitDateTo, setVisitDateTo] = useState("");
    const [visitPage, setVisitPage] = useState(1);
    const [selectedSession, setSelectedSession] = useState<VisitorSessionDoc | null>(null);

    // Settings state
    const [settingsDraft, setSettingsDraft] = useState<CompanySettings>(initialData.settings);
    const [settingsSaving, setSettingsSaving] = useState(false);

    function showToast(text: string, tone: "ok" | "err" = "ok") {
        setToast({ text, tone });
        setTimeout(() => {
            setToast((curr) => (curr?.text === text ? null : curr));
        }, 4500);
    }

    async function refreshFromServer() {
        setRefreshing(true);
        try {
            const res = await fetch("/api/admin/overview", { cache: "no-store" });
            if (res.status === 401) {
                router.replace("/dashboard/login");
                return;
            }
            const json = (await res.json().catch(() => null)) as (DashboardData & { ok?: boolean; error?: string }) | null;
            if (!res.ok || !json?.ok) {
                setConnError(json?.error || "Sunucudan güncel veriler alınamadı.");
                showToast(json?.error || "Sunucu bağlantı hatası", "err");
                return;
            }
            setData({
                serverTime: json.serverTime,
                messages: json.messages,
                quotes: json.quotes,
                orders: json.orders,
                products: json.products,
                visits: json.visits,
                loginLogs: json.loginLogs,
                auditLogs: json.auditLogs,
                settings: json.settings
            });
            setSettingsDraft(json.settings);
            setConnError(null);
            showToast("Veriler sunucudan başarıyla güncellendi.");
        } catch {
            setConnError("Sunucu ile bağlantı kurulamadı. Lütfen internet bağlantınızı kontrol edin.");
            showToast("Sunucu bağlantısı başarısız oldu.", "err");
        } finally {
            setRefreshing(false);
        }
    }

    async function handleLogout() {
        await fetch("/api/admin/logout", { method: "POST" });
        router.replace("/dashboard/login");
        router.refresh();
    }

    // ========================================================================
    // DERIVED METRICS (100% REAL DATA)
    // ========================================================================
    const kpis = useMemo(() => {
        const totalMessages = data.messages.length;
        const unreadMessages = data.messages.filter((m) => m.status === "unread").length;
        const inProgressMessages = data.messages.filter((m) => m.status === "in_progress").length;

        const totalQuotes = data.quotes.length;
        const newQuotes = data.quotes.filter((q) => q.status === "new").length;
        const inProgressQuotes = data.quotes.filter((q) =>
            ["reviewing", "quote_sent", "waiting_customer"].includes(q.status)
        ).length;
        const finalizedQuotes = data.quotes.filter((q) =>
            ["approved", "completed", "cancelled"].includes(q.status)
        ).length;

        const confirmedOrdersCount = data.orders.length;
        const activeProductsCount = data.products.filter((p) => p.active).length;
        const inactiveProductsCount = data.products.filter((p) => !p.active).length;

        const humanVisits = data.visits.filter((v) => v.botStatus !== "bot");
        const totalPageViews = humanVisits.reduce((acc, v) => acc + (v.pageViews || 1), 0);
        const totalSessions = humanVisits.length;
        const uniqueVisitors = new Set(humanVisits.map((v) => v.visitorId)).size;

        const fiveMinAgo = Date.now() - 5 * 60_000;
        const activeVisitorsNow = humanVisits.filter(
            (v) => Date.parse(v.lastActivityAt) >= fiveMinAgo
        ).length;

        const convertedSessions = humanVisits.filter(
            (v) => v.convertedContact || v.convertedQuote
        ).length;
        const conversionRate =
            totalSessions > 0 ? ((convertedSessions / totalSessions) * 100).toFixed(1) : "0.0";

        return {
            totalMessages,
            unreadMessages,
            inProgressMessages,
            totalQuotes,
            newQuotes,
            inProgressQuotes,
            finalizedQuotes,
            confirmedOrdersCount,
            activeProductsCount,
            inactiveProductsCount,
            totalPageViews,
            totalSessions,
            uniqueVisitors,
            activeVisitorsNow,
            convertedSessions,
            conversionRate
        };
    }, [data]);

    // ========================================================================
    // FILTERED & PAGINATED LISTS
    // ========================================================================
    const PAGE_SIZE = 15;

    const filteredMessages = useMemo(() => {
        const q = msgSearch.trim().toLowerCase();
        return data.messages.filter((m) => {
            if (msgStatusFilter !== "all" && m.status !== msgStatusFilter) return false;
            if (msgLocaleFilter !== "all" && m.locale !== msgLocaleFilter) return false;
            if (!inDateRange(m.createdAt, msgDateFrom, msgDateTo)) return false;
            if (q) {
                const hay = `${m.name} ${m.company} ${m.email} ${m.phone} ${m.country} ${m.subject} ${m.message}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [data.messages, msgSearch, msgStatusFilter, msgLocaleFilter, msgDateFrom, msgDateTo]);

    const pagedMessages = useMemo(() => {
        const start = (msgPage - 1) * PAGE_SIZE;
        return filteredMessages.slice(start, start + PAGE_SIZE);
    }, [filteredMessages, msgPage]);

    const selectedMessage = useMemo(
        () => data.messages.find((m) => m.id === selectedMsgId) || filteredMessages[0] || null,
        [data.messages, filteredMessages, selectedMsgId]
    );

    const quoteCountries = useMemo(
        () => Array.from(new Set(data.quotes.map((q) => q.country).filter(Boolean))).sort(),
        [data.quotes]
    );

    const filteredQuotes = useMemo(() => {
        const q = quoteSearch.trim().toLowerCase();
        return data.quotes.filter((r) => {
            if (quoteStatusFilter !== "all" && r.status !== quoteStatusFilter) return false;
            if (quoteCountryFilter !== "all" && r.country !== quoteCountryFilter) return false;
            if (!inDateRange(r.createdAt, quoteDateFrom, quoteDateTo)) return false;
            if (q) {
                const hay = `${r.requestNo} ${r.name} ${r.company} ${r.email} ${r.country} ${r.productLabel} ${r.message} ${r.bagSpecs.dimensions} ${r.bagSpecs.color}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [data.quotes, quoteSearch, quoteStatusFilter, quoteCountryFilter, quoteDateFrom, quoteDateTo]);

    const pagedQuotes = useMemo(() => {
        const start = (quotePage - 1) * PAGE_SIZE;
        return filteredQuotes.slice(start, start + PAGE_SIZE);
    }, [filteredQuotes, quotePage]);

    const selectedQuote = useMemo(
        () => data.quotes.find((q) => q.id === selectedQuoteId) || filteredQuotes[0] || null,
        [data.quotes, filteredQuotes, selectedQuoteId]
    );

    // Filtered Visitor Sessions & Real Aggregations
    const filteredVisits = useMemo(() => {
        const pf = visitPageFilter.trim().toLowerCase();
        return data.visits.filter((v) => {
            if (visitBotFilter === "human" && v.botStatus === "bot") return false;
            if (visitBotFilter === "bot" && v.botStatus !== "bot") return false;
            if (visitCountry !== "all" && v.countryName !== visitCountry && v.countryCode !== visitCountry)
                return false;
            if (visitDevice !== "all" && v.deviceType !== visitDevice) return false;
            if (visitBrowser !== "all" && v.browserName !== visitBrowser) return false;
            if (pf && !v.pages.some((p) => p.toLowerCase().includes(pf))) return false;
            if (visitConversion === "converted" && !v.convertedContact && !v.convertedQuote) return false;
            if (visitConversion === "none" && (v.convertedContact || v.convertedQuote)) return false;
            if (!inDateRange(v.startedAt, visitDateFrom, visitDateTo)) return false;
            return true;
        });
    }, [
        data.visits,
        visitBotFilter,
        visitCountry,
        visitDevice,
        visitBrowser,
        visitPageFilter,
        visitConversion,
        visitDateFrom,
        visitDateTo
    ]);

    const pagedVisits = useMemo(() => {
        const start = (visitPage - 1) * PAGE_SIZE;
        return filteredVisits.slice(start, start + PAGE_SIZE);
    }, [filteredVisits, visitPage]);

    const visitCharts = useMemo(() => {
        function topCounts(items: string[], max = 6) {
            const map = new Map<string, number>();
            for (const item of items) {
                const k = item || "Bilinmiyor";
                map.set(k, (map.get(k) || 0) + 1);
            }
            const total = items.length || 1;
            return Array.from(map.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, max)
                .map(([label, count]) => ({
                    label,
                    count,
                    pct: Math.round((count / total) * 100)
                }));
        }

        const allPages: string[] = [];
        for (const v of filteredVisits) {
            for (const p of v.pages) allPages.push(p);
        }

        return {
            countries: topCounts(filteredVisits.map((v) => `${v.countryName} (${v.countryCode})`)),
            devices: topCounts(filteredVisits.map((v) => v.deviceType)),
            osList: topCounts(filteredVisits.map((v) => v.osName)),
            browsers: topCounts(filteredVisits.map((v) => v.browserName)),
            sources: topCounts(
                filteredVisits.map((v) =>
                    v.utmSource ? `UTM: ${v.utmSource}` : v.referrer || "Doğrudan Giriş"
                )
            ),
            topPages: topCounts(allPages, 8)
        };
    }, [filteredVisits]);

    const availableVisitCountries = useMemo(
        () => Array.from(new Set(data.visits.map((v) => v.countryName).filter(Boolean))).sort(),
        [data.visits]
    );

    const availableVisitBrowsers = useMemo(
        () => Array.from(new Set(data.visits.map((v) => v.browserName).filter(Boolean))).sort(),
        [data.visits]
    );

    // ========================================================================
    // ACTION HANDLERS (SERVER-CONFIRMED ONLY)
    // ========================================================================

    async function handleUpdateMessage(id: string, updates: { status?: MessageStatus; noteText?: string }) {
        setMsgSaving(true);
        try {
            const res = await fetch(`/api/admin/messages/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates)
            });
            const json = (await res.json().catch(() => null)) as {
                ok?: boolean;
                item?: ContactMessage;
                emailDispatchNote?: string | null;
                error?: string;
            } | null;
            if (!res.ok || !json?.ok || !json.item) {
                showToast(json?.error || "Mesaj güncellenemedi.", "err");
                return;
            }
            setData((prev) => ({
                ...prev,
                messages: prev.messages.map((m) => (m.id === id ? json.item! : m))
            }));
            if (updates.noteText) setMsgNoteDraft("");
            showToast(json.emailDispatchNote || "Mesaj kaydı sunucuda güncellendi.");
        } catch {
            showToast("Sunucu bağlantı hatası — mesaj güncellenemedi.", "err");
        } finally {
            setMsgSaving(false);
        }
    }

    function promptDeleteMessage(msg: ContactMessage) {
        setConfirmModal({
            title: "İletişim Mesajını Kalıcı Olarak Sil",
            message: `${msg.name} (${msg.email}) tarafından gönderilen mesajı kalıcı olarak silmek istediğinize emin misiniz? Silmek yerine 'Arşivlendi' durumuna da alabilirsiniz.`,
            confirmLabel: "Kalıcı Olarak Sil",
            tone: "danger",
            onConfirm: async () => {
                const res = await fetch(`/api/admin/messages/${msg.id}`, { method: "DELETE" });
                if (!res.ok) {
                    showToast("Mesaj silinemedi.", "err");
                    return;
                }
                setData((prev) => ({
                    ...prev,
                    messages: prev.messages.filter((m) => m.id !== msg.id)
                }));
                if (selectedMsgId === msg.id) setSelectedMsgId(null);
                showToast("Mesaj sunucudan silindi.");
            }
        });
    }

    async function handleUpdateQuote(id: string, updates: { status?: QuoteStatus; noteText?: string }) {
        setQuoteSaving(true);
        try {
            const res = await fetch(`/api/admin/quotes/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates)
            });
            const json = (await res.json().catch(() => null)) as {
                ok?: boolean;
                item?: QuoteRequest;
                error?: string;
            } | null;
            if (!res.ok || !json?.ok || !json.item) {
                showToast(json?.error || "Teklif talebi güncellenemedi.", "err");
                return;
            }
            setData((prev) => ({
                ...prev,
                quotes: prev.quotes.map((q) => (q.id === id ? json.item! : q))
            }));
            if (updates.noteText) setQuoteNoteDraft("");
            showToast("Teklif talebi sunucuda güncellendi.");
        } catch {
            showToast("Sunucu bağlantı hatası — teklif talebi güncellenemedi.", "err");
        } finally {
            setQuoteSaving(false);
        }
    }

    function promptConvertQuoteToOrder(quote: QuoteRequest) {
        setConfirmModal({
            title: "Yönetici Onayı: Kesin Siparişe Dönüştür",
            message: `${quote.requestNo} numaralı teklif talebini (${quote.company} — ${quote.productLabel}, ${quote.quantity} ${quote.unit}) yönetici onayıyla kesin siparişe dönüştürmek istediğinize emin misiniz? Bu işlem 'asiaplast_orders' tablosunda ayrı bir kesin sipariş kaydı oluşturur.`,
            confirmLabel: "Onayla ve Kesin Sipariş Oluştur",
            tone: "primary",
            onConfirm: async () => {
                setQuoteSaving(true);
                try {
                    const res = await fetch(`/api/admin/quotes/${quote.id}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ note: orderApprovalNote })
                    });
                    const json = (await res.json().catch(() => null)) as {
                        ok?: boolean;
                        order?: ConfirmedOrder;
                        quote?: QuoteRequest;
                        error?: string;
                    } | null;
                    if (!res.ok || !json?.ok || !json.order || !json.quote) {
                        showToast(json?.error || "Kesin sipariş oluşturulamadı.", "err");
                        return;
                    }
                    setData((prev) => ({
                        ...prev,
                        quotes: prev.quotes.map((q) => (q.id === quote.id ? json.quote! : q)),
                        orders: [
                            json.order!,
                            ...prev.orders.filter((o) => o.id !== json.order!.id)
                        ]
                    }));
                    setOrderApprovalNote("");
                    showToast(`Kesin sipariş oluşturuldu: ${json.order.orderNo}`);
                } finally {
                    setQuoteSaving(false);
                }
            }
        });
    }

    function promptDeleteQuote(quote: QuoteRequest) {
        setConfirmModal({
            title: "Teklif Talebini Sil",
            message: `${quote.requestNo} (${quote.company}) kaydını kalıcı olarak silmek istediğinize emin misiniz?`,
            confirmLabel: "Kalıcı Olarak Sil",
            tone: "danger",
            onConfirm: async () => {
                const res = await fetch(`/api/admin/quotes/${quote.id}`, { method: "DELETE" });
                if (!res.ok) {
                    showToast("Teklif talebi silinemedi.", "err");
                    return;
                }
                setData((prev) => ({
                    ...prev,
                    quotes: prev.quotes.filter((q) => q.id !== quote.id)
                }));
                if (selectedQuoteId === quote.id) setSelectedQuoteId(null);
                showToast("Teklif talebi silindi.");
            }
        });
    }

    async function handleUpdateOrderStatus(orderId: string, status: OrderStatus) {
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
            const json = (await res.json().catch(() => null)) as {
                ok?: boolean;
                item?: ConfirmedOrder;
                error?: string;
            } | null;
            if (!res.ok || !json?.ok || !json.item) {
                showToast(json?.error || "Sipariş durumu güncellenemedi.", "err");
                return;
            }
            setData((prev) => ({
                ...prev,
                orders: prev.orders.map((o) => (o.id === orderId ? json.item! : o))
            }));
            showToast(`Sipariş (${json.item.orderNo}) durumu güncellendi.`);
        } catch {
            showToast("Sunucu hatası — sipariş güncellenemedi.", "err");
        }
    }

    // Product actions
    function openNewProductModal() {
        setEditingProduct({
            id: null,
            slug: "",
            active: true,
            sortOrder: (data.products.length + 1) * 10,
            categoryId: CATEGORIES[0]?.id || "heavy-duty",
            name: "",
            shortDescription: "",
            description: "",
            moq: "Spesifikasyona göre belirlenir",
            imageUrl: "/images/products/heavy-duty.jpg",
            specs: [
                { label: "Polymer", value: "LDPE / HDPE" },
                { label: "Thickness", value: "Siparişe özel (µm)" }
            ],
            translations: {
                tr: { name: "", shortDescription: "", description: "" },
                en: { name: "", shortDescription: "", description: "" },
                de: { name: "", shortDescription: "", description: "" },
                fr: { name: "", shortDescription: "", description: "" },
                ar: { name: "", shortDescription: "", description: "" }
            }
        });
    }

    function openEditProductModal(p: ProductDoc) {
        setEditingProduct({
            id: p.id,
            slug: p.slug,
            active: p.active,
            sortOrder: p.sortOrder,
            categoryId: p.categoryId,
            name: p.name,
            shortDescription: p.shortDescription,
            description: p.description,
            moq: p.moq,
            imageUrl: p.imageUrl || "/images/products/heavy-duty.jpg",
            specs: p.specs.length > 0 ? [...p.specs] : [{ label: "Polymer", value: "LDPE / HDPE" }],
            translations: {
                tr: { ...(p.translations?.tr || {}) },
                en: { ...(p.translations?.en || {}) },
                de: { ...(p.translations?.de || {}) },
                fr: { ...(p.translations?.fr || {}) },
                ar: { ...(p.translations?.ar || {}) }
            }
        });
    }

    async function handleProductImageUpload(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || !editingProduct) return;
        setUploadingImg(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/admin/upload", {
                method: "POST",
                body: fd
            });
            const json = (await res.json().catch(() => null)) as {
                ok?: boolean;
                url?: string;
                error?: string;
            } | null;
            if (!res.ok || !json?.ok || !json.url) {
                showToast(json?.error || "Görsel yüklenemedi.", "err");
                return;
            }
            setEditingProduct((prev) => (prev ? { ...prev, imageUrl: json.url! } : prev));
            showToast("Görsel Firebase Storage'a yüklendi.");
        } catch {
            showToast("Görsel yükleme sırasında hata oluştu.", "err");
        } finally {
            setUploadingImg(false);
            e.target.value = "";
        }
    }

    async function handleSaveProduct(e: FormEvent) {
        e.preventDefault();
        if (!editingProduct) return;
        setProdSaving(true);
        try {
            const isNew = !editingProduct.id;
            const url = isNew ? "/api/admin/products" : `/api/admin/products/${editingProduct.id}`;
            const method = isNew ? "POST" : "PATCH";

            const cleanSpecs = editingProduct.specs.filter(
                (s) => s.label.trim().length > 0 && s.value.trim().length > 0
            );

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug: editingProduct.slug.trim().toLowerCase(),
                    active: editingProduct.active,
                    sortOrder: Number(editingProduct.sortOrder) || 10,
                    categoryId: editingProduct.categoryId,
                    name: editingProduct.name,
                    shortDescription: editingProduct.shortDescription,
                    description: editingProduct.description,
                    moq: editingProduct.moq,
                    imageUrl: editingProduct.imageUrl || null,
                    specs: cleanSpecs,
                    translations: editingProduct.translations
                })
            });

            const json = (await res.json().catch(() => null)) as {
                ok?: boolean;
                item?: ProductDoc;
                error?: string;
            } | null;

            if (!res.ok || !json?.ok || !json.item) {
                showToast(json?.error || "Ürün kaydedilemedi.", "err");
                return;
            }

            setData((prev) => {
                const next = isNew
                    ? [...prev.products, json.item!]
                    : prev.products.map((p) => (p.id === json.item!.id ? json.item! : p));
                next.sort((a, b) => a.sortOrder - b.sortOrder);
                return { ...prev, products: next };
            });
            setEditingProduct(null);
            showToast(
                isNew
                    ? "Yeni ürün oluşturuldu ve sitede yayına alındı."
                    : "Ürün değişiklikleri kaydedildi ve ürün sayfasına yansıtıldı."
            );
        } catch {
            showToast("Sunucu hatası — ürün kaydedilemedi.", "err");
        } finally {
            setProdSaving(false);
        }
    }

    async function handleToggleProductActive(p: ProductDoc) {
        try {
            const res = await fetch(`/api/admin/products/${p.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ active: !p.active })
            });
            const json = (await res.json().catch(() => null)) as {
                ok?: boolean;
                item?: ProductDoc;
                error?: string;
            } | null;
            if (!res.ok || !json?.ok || !json.item) {
                showToast(json?.error || "Ürün durumu değiştirilemedi.", "err");
                return;
            }
            setData((prev) => ({
                ...prev,
                products: prev.products.map((item) => (item.id === p.id ? json.item! : item))
            }));
            showToast(
                json.item.active
                    ? `"${json.item.name}" yayına alındı.`
                    : `"${json.item.name}" yayından kaldırıldı.`
            );
        } catch {
            showToast("Sunucu bağlantı hatası.", "err");
        }
    }

    function promptDeleteProduct(p: ProductDoc) {
        setConfirmModal({
            title: "Ürünü Sil",
            message: `"${p.name}" ürününü katalogdan silmek istediğinize emin misiniz? Ürünü silmek yerine 'Yayından Kaldır' seçeneğiyle pasif duruma da getirebilirsiniz.`,
            confirmLabel: "Ürünü Kalıcı Olarak Sil",
            tone: "danger",
            onConfirm: async () => {
                const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
                if (!res.ok) {
                    showToast("Ürün silinemedi.", "err");
                    return;
                }
                setData((prev) => ({
                    ...prev,
                    products: prev.products.filter((item) => item.id !== p.id)
                }));
                showToast(`"${p.name}" silindi.`);
            }
        });
    }

    async function handleSaveSettings(e: FormEvent) {
        e.preventDefault();
        setSettingsSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settingsDraft)
            });
            const json = (await res.json().catch(() => null)) as {
                ok?: boolean;
                settings?: CompanySettings;
                error?: string;
            } | null;
            if (!res.ok || !json?.ok || !json.settings) {
                showToast(json?.error || "Ayarlar kaydedilemedi.", "err");
                return;
            }
            setData((prev) => ({ ...prev, settings: json.settings! }));
            setSettingsDraft(json.settings);
            showToast("Firma iletişim ve sosyal medya ayarları kaydedildi ve siteye yansıtıldı.");
        } catch {
            showToast("Sunucu bağlantı hatası — ayarlar kaydedilemedi.", "err");
        } finally {
            setSettingsSaving(false);
        }
    }

    async function handleCleanupExpiredAnalytics() {
        try {
            const res = await fetch("/api/admin/overview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "cleanup_expired_analytics",
                    retentionDays: settingsDraft.analyticsRetentionDays
                })
            });
            const json = (await res.json().catch(() => null)) as {
                ok?: boolean;
                deletedCount?: number;
                error?: string;
            } | null;
            if (!res.ok || !json?.ok) {
                showToast(json?.error || "Temizlik işlemi yapılamadı.", "err");
                return;
            }
            showToast(
                `Saklama süresi (${settingsDraft.analyticsRetentionDays} gün) dolan ${json.deletedCount || 0} eski analitik oturumu temizlendi.`
            );
        } catch {
            showToast("Sunucu bağlantı hatası.", "err");
        }
    }

    const navItems: { id: TabId; label: string; badge?: number }[] = [
        { id: "overview", label: "Genel Bakış" },
        { id: "messages", label: "İletişim Mesajları", badge: kpis.unreadMessages || undefined },
        { id: "quotes", label: "Sipariş & Teklif Talepleri", badge: kpis.newQuotes || undefined },
        { id: "products", label: "Ürün Yönetimi" },
        { id: "analytics", label: "Ziyaretçi ve Giriş Analizi" },
        { id: "settings", label: "Ayarlar & İletişim" }
    ];

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col lg:flex-row">
            {/* Toast Notification (Server-verified only) */}
            {toast && (
                <div
                    role="status"
                    className={`fixed bottom-5 right-5 z-50 max-w-md rounded-2xl border px-4 py-3 text-xs font-bold shadow-2xl transition ${
                        toast.tone === "ok"
                            ? "border-emerald-300 bg-emerald-950 text-emerald-100"
                            : "border-rose-300 bg-rose-950 text-rose-100"
                    }`}
                >
                    <div className="flex items-center gap-2.5">
                        <span>{toast.tone === "ok" ? "✓" : "⚠"}</span>
                        <span>{toast.text}</span>
                    </div>
                </div>
            )}

            {/* Custom Confirmation Modal */}
            {confirmModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                        <h3 className="font-display text-lg font-bold text-slate-900">
                            {confirmModal.title}
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-slate-600">
                            {confirmModal.message}
                        </p>
                        <div className="mt-6 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setConfirmModal(null)}
                                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Vazgeç
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    const fn = confirmModal.onConfirm;
                                    setConfirmModal(null);
                                    await fn();
                                }}
                                className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm ${
                                    confirmModal.tone === "danger"
                                        ? "bg-rose-600 hover:bg-rose-700"
                                        : "bg-brand-green hover:bg-brand-green-dark"
                                }`}
                            >
                                {confirmModal.confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:shrink-0 bg-brand-navy text-white border-r border-slate-800">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-green font-display text-lg font-black text-white">
                            A
                        </span>
                        <div>
                            <p className="font-display text-lg font-black tracking-tight">
                                ASIA<span className="text-brand-green">PLAST</span>
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium">
                                Kurumsal Yönetim Paneli
                            </p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1.5" aria-label="Yönetim Menüsü">
                    {navItems.map((item) => {
                        const active = tab === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setTab(item.id)}
                                className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-bold transition ${
                                    active
                                        ? "bg-brand-green text-white shadow-md"
                                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                                <span>{item.label}</span>
                                {item.badge ? (
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                                            active
                                                ? "bg-white text-brand-navy"
                                                : "bg-emerald-500 text-slate-950"
                                        }`}
                                    >
                                        {item.badge}
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10 space-y-3 text-xs">
                    <div className="rounded-xl bg-white/5 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                            Yetkili Yönetici
                        </p>
                        <p className="mt-0.5 font-semibold text-white truncate">{user.email}</p>
                        <p className="mt-1 text-[10px] text-emerald-400 font-mono">
                            Son Sunucu Senk: {formatTrDate(data.serverTime)}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/"
                            target="_blank"
                            className="flex-1 rounded-xl border border-white/15 bg-white/5 py-2 text-center text-xs font-semibold text-slate-200 hover:bg-white/10"
                        >
                            Canlı Site ↗
                        </Link>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex-1 rounded-xl border border-rose-500/30 bg-rose-500/10 py-2 text-center text-xs font-bold text-rose-300 hover:bg-rose-500/20"
                        >
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Top Header & Drawer */}
            <div className="lg:hidden bg-brand-navy text-white border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-green font-display text-sm font-black">
                        A
                    </span>
                    <div>
                        <span className="font-display text-sm font-black">ASIAPLAST</span>
                        <span className="block text-[10px] text-slate-400">Yönetim Paneli</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={refreshFromServer}
                        disabled={refreshing}
                        className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold"
                    >
                        {refreshing ? "..." : "↻ Yenile"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen((v) => !v)}
                        aria-label="Mobil Menüyü Aç/Kapat"
                        className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold"
                    >
                        {mobileMenuOpen ? "✕ Kapat" : "☰ Menü"}
                    </button>
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="lg:hidden bg-brand-navy text-white border-b border-slate-800 px-4 py-4 space-y-1.5">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                                setTab(item.id);
                                setMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between rounded-xl px-4 py-2.5 text-left text-xs font-bold ${
                                tab === item.id
                                    ? "bg-brand-green text-white"
                                    : "text-slate-300 hover:bg-white/10"
                            }`}
                        >
                            <span>{item.label}</span>
                            {item.badge ? (
                                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-brand-navy">
                                    {item.badge}
                                </span>
                            ) : null}
                        </button>
                    ))}
                    <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between text-xs">
                        <span className="text-slate-300 truncate">{user.email}</span>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="text-rose-300 font-bold"
                        >
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Desktop Top Bar */}
                <header className="hidden lg:flex items-center justify-between bg-white border-b border-slate-200 px-8 py-4">
                    <div>
                        <h1 className="font-display text-xl font-bold text-brand-navy">
                            {navItems.find((n) => n.id === tab)?.label}
                        </h1>
                        <p className="text-xs text-slate-500">
                            Gerçek zamanlı Firestore veritabanı · Tarayıcı depolaması (localStorage) kullanılmaz
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 font-mono">
                            Son Güncelleme: {formatTrDate(data.serverTime)}
                        </span>
                        <button
                            type="button"
                            onClick={refreshFromServer}
                            disabled={refreshing}
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            {refreshing ? "Sunucudan Yükleniyor..." : "↻ Sunucudan Yenile"}
                        </button>
                    </div>
                </header>

                {/* Connection Error Banner (Separate from Empty State, Never Falls Back to Fake Data) */}
                {connError && (
                    <div
                        role="alert"
                        className="mx-4 mt-4 lg:mx-8 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-xs text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                        <div>
                            <p className="font-bold text-sm">Veritabanı / Sunucu Bağlantı Hatası</p>
                            <p className="mt-0.5 text-rose-700">{connError}</p>
                        </div>
                        <button
                            type="button"
                            onClick={refreshFromServer}
                            disabled={refreshing}
                            className="shrink-0 rounded-xl bg-rose-700 px-4 py-2 font-bold text-white hover:bg-rose-800"
                        >
                            Tekrar Dene
                        </button>
                    </div>
                )}

                <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
                    {/* ====================================================================
                        TAB 1: GENEL BAKIŞ (OVERVIEW)
                       ==================================================================== */}
                    {tab === "overview" && (
                        <div className="space-y-6">
                            {/* Primary KPI Cards */}
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        İletişim Mesajları
                                    </p>
                                    <p className="mt-2 font-display text-3xl font-black text-brand-navy">
                                        {kpis.totalMessages}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold">
                                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-800">
                                            Okunmamış: {kpis.unreadMessages}
                                        </span>
                                        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-amber-800">
                                            İşlemde: {kpis.inProgressMessages}
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Teklif Talepleri (RFQ)
                                    </p>
                                    <p className="mt-2 font-display text-3xl font-black text-brand-navy">
                                        {kpis.totalQuotes}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold">
                                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-800">
                                            Yeni: {kpis.newQuotes}
                                        </span>
                                        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-amber-800">
                                            İşlemde: {kpis.inProgressQuotes}
                                        </span>
                                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-700">
                                            Sonuçlanan: {kpis.finalizedQuotes}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-[10px] text-slate-400">
                                        * Teklif talepleri gerçekleşmiş satış veya gelir olarak sayılmaz.
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Kesinleşmiş Siparişler
                                    </p>
                                    <p className="mt-2 font-display text-3xl font-black text-teal-700">
                                        {kpis.confirmedOrdersCount}
                                    </p>
                                    <p className="mt-2 text-[11px] text-slate-500">
                                        Yalnızca yönetici onayıyla siparişe dönüştürülen kayıtlar
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Aktif Ürün Sayısı
                                    </p>
                                    <p className="mt-2 font-display text-3xl font-black text-brand-navy">
                                        {kpis.activeProductsCount}
                                    </p>
                                    <p className="mt-2 text-[11px] text-slate-500">
                                        Yayında olmayan: {kpis.inactiveProductsCount} ürün
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Ziyaret & Form Dönüşümü
                                    </p>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        <span className="font-display text-3xl font-black text-brand-navy">
                                            {kpis.totalSessions}
                                        </span>
                                        <span className="text-xs text-slate-500">oturum</span>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold">
                                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-800">
                                            Aktif (5dk): {kpis.activeVisitorsNow}
                                        </span>
                                        <span className="rounded-md bg-sky-50 px-2 py-0.5 text-sky-800">
                                            Dönüşüm: %{kpis.conversionRate} ({kpis.convertedSessions})
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Quotes & Recent Messages */}
                            <div className="grid gap-6 lg:grid-cols-2">
                                {/* Recent Quote Requests */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h2 className="font-display text-base font-bold text-brand-navy">
                                                Son Gelen Teklif Talepleri
                                            </h2>
                                            <p className="text-xs text-slate-500">
                                                Ürün sayfaları ve teklif formundan gelen gerçek talepler
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setTab("quotes")}
                                            className="text-xs font-bold text-brand-green hover:underline"
                                        >
                                            Tümünü Gör &rarr;
                                        </button>
                                    </div>

                                    {data.quotes.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
                                            Henüz sipariş veya teklif talebi bulunmuyor.
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-100">
                                            {data.quotes.slice(0, 5).map((q) => (
                                                <div
                                                    key={q.id}
                                                    className="py-3 flex items-center justify-between gap-3"
                                                >
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-[11px] font-bold text-brand-navy">
                                                                {q.requestNo}
                                                            </span>
                                                            <span className="font-semibold text-xs text-slate-900 truncate">
                                                                {q.company}
                                                            </span>
                                                            <span className="text-[11px] text-slate-400">
                                                                ({q.country})
                                                            </span>
                                                        </div>
                                                        <p className="mt-0.5 text-xs text-slate-600 truncate">
                                                            {q.productLabel} ·{" "}
                                                            <strong className="text-slate-800">
                                                                {q.quantity} {q.unit}
                                                            </strong>{" "}
                                                            · {q.deliveryTerm}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end shrink-0 gap-1">
                                                        <span
                                                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                                                                QUOTE_BADGE_CLASSES[q.status]
                                                            }`}
                                                        >
                                                            {QUOTE_STATUS_LABELS_TR[q.status]}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-mono">
                                                            {formatTrDate(q.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Recent Contact Messages */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h2 className="font-display text-base font-bold text-brand-navy">
                                                Son Gelen İletişim Mesajları
                                            </h2>
                                            <p className="text-xs text-slate-500">
                                                Tüm dil sürümlerindeki iletişim formlarından gelen kayıtlar
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setTab("messages")}
                                            className="text-xs font-bold text-brand-green hover:underline"
                                        >
                                            Tümünü Gör &rarr;
                                        </button>
                                    </div>

                                    {data.messages.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
                                            Henüz iletişim mesajı bulunmuyor.
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-100">
                                            {data.messages.slice(0, 5).map((m) => (
                                                <div
                                                    key={m.id}
                                                    className="py-3 flex items-center justify-between gap-3"
                                                >
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-xs text-slate-900 truncate">
                                                                {m.name}
                                                            </span>
                                                            {m.company && (
                                                                <span className="text-xs text-slate-500 truncate">
                                                                    · {m.company}
                                                                </span>
                                                            )}
                                                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono uppercase text-slate-600">
                                                                {m.locale}
                                                            </span>
                                                        </div>
                                                        <p className="mt-0.5 text-xs text-slate-600 truncate">
                                                            <strong className="text-slate-700">{m.subject}:</strong>{" "}
                                                            {m.message}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end shrink-0 gap-1">
                                                        <span
                                                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                                                                MSG_BADGE_CLASSES[m.status]
                                                            }`}
                                                        >
                                                            {MESSAGE_STATUS_LABELS_TR[m.status]}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-mono">
                                                            {formatTrDate(m.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ====================================================================
                        TAB 2: İLETİŞİM MESAJLARI (CONTACT MESSAGES)
                       ==================================================================== */}
                    {tab === "messages" && (
                        <div className="space-y-4">
                            {/* Filters & CSV Export Bar */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-wrap items-end gap-3">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="label text-xs" htmlFor="msg-q">
                                        Arama (Ad, Firma, E-posta, Konu, Mesaj)
                                    </label>
                                    <input
                                        id="msg-q"
                                        className="input"
                                        placeholder="Mesajlarda ara..."
                                        value={msgSearch}
                                        onChange={(e) => {
                                            setMsgSearch(e.target.value);
                                            setMsgPage(1);
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="label text-xs" htmlFor="msg-status">
                                        Durum
                                    </label>
                                    <select
                                        id="msg-status"
                                        className="input"
                                        value={msgStatusFilter}
                                        onChange={(e) => {
                                            setMsgStatusFilter(e.target.value);
                                            setMsgPage(1);
                                        }}
                                    >
                                        <option value="all">Tüm Durumlar</option>
                                        {MESSAGE_STATUSES.map((s) => (
                                            <option key={s} value={s}>
                                                {MESSAGE_STATUS_LABELS_TR[s]}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label text-xs" htmlFor="msg-loc">
                                        Form Dili
                                    </label>
                                    <select
                                        id="msg-loc"
                                        className="input"
                                        value={msgLocaleFilter}
                                        onChange={(e) => {
                                            setMsgLocaleFilter(e.target.value);
                                            setMsgPage(1);
                                        }}
                                    >
                                        <option value="all">Tümü</option>
                                        <option value="tr">TR</option>
                                        <option value="en">EN</option>
                                        <option value="de">DE</option>
                                        <option value="fr">FR</option>
                                        <option value="ar">AR</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label text-xs" htmlFor="msg-from">
                                        Başlangıç Tarihi
                                    </label>
                                    <input
                                        id="msg-from"
                                        type="date"
                                        className="input"
                                        value={msgDateFrom}
                                        onChange={(e) => {
                                            setMsgDateFrom(e.target.value);
                                            setMsgPage(1);
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="label text-xs" htmlFor="msg-to">
                                        Bitiş Tarihi
                                    </label>
                                    <input
                                        id="msg-to"
                                        type="date"
                                        className="input"
                                        value={msgDateTo}
                                        onChange={(e) => {
                                            setMsgDateTo(e.target.value);
                                            setMsgPage(1);
                                        }}
                                    />
                                </div>
                                <a
                                    href={`/api/admin/export?type=messages&q=${encodeURIComponent(
                                        msgSearch
                                    )}&status=${encodeURIComponent(
                                        msgStatusFilter === "all" ? "" : msgStatusFilter
                                    )}&dateFrom=${encodeURIComponent(msgDateFrom)}&dateTo=${encodeURIComponent(
                                        msgDateTo
                                    )}`}
                                    className="rounded-xl bg-brand-navy px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                                >
                                    ⬇ CSV Dışa Aktar ({filteredMessages.length})
                                </a>
                            </div>

                            {/* Split List + Detail View */}
                            <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
                                <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                                    {filteredMessages.length === 0 ? (
                                        <div className="p-12 text-center text-sm text-slate-500">
                                            {data.messages.length === 0
                                                ? "Henüz iletişim mesajı bulunmuyor."
                                                : "Seçilen filtrelere uygun iletişim mesajı bulunamadı."}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="divide-y divide-slate-100">
                                                {pagedMessages.map((m) => {
                                                    const isSelected = selectedMessage?.id === m.id;
                                                    return (
                                                        <button
                                                            key={m.id}
                                                            type="button"
                                                            onClick={() => setSelectedMsgId(m.id)}
                                                            className={`w-full text-left p-4 transition flex items-start justify-between gap-3 ${
                                                                isSelected
                                                                    ? "bg-emerald-50/70 border-l-4 border-l-brand-green"
                                                                    : "hover:bg-slate-50"
                                                            }`}
                                                        >
                                                            <div className="min-w-0">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className="font-bold text-sm text-slate-900">
                                                                        {m.name}
                                                                    </span>
                                                                    {m.company && (
                                                                        <span className="text-xs text-slate-500">
                                                                            · {m.company}
                                                                        </span>
                                                                    )}
                                                                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono uppercase text-slate-700">
                                                                        {m.locale}
                                                                    </span>
                                                                </div>
                                                                <p className="mt-1 text-xs font-semibold text-brand-navy truncate">
                                                                    {m.subject}
                                                                </p>
                                                                <p className="mt-0.5 text-xs text-slate-600 line-clamp-2">
                                                                    {m.message}
                                                                </p>
                                                                <p className="mt-1.5 text-[11px] text-slate-400">
                                                                    {m.country} · {m.email}
                                                                </p>
                                                            </div>
                                                            <div className="flex flex-col items-end shrink-0 gap-1.5">
                                                                <span
                                                                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                                                                        MSG_BADGE_CLASSES[m.status]
                                                                    }`}
                                                                >
                                                                    {MESSAGE_STATUS_LABELS_TR[m.status]}
                                                                </span>
                                                                <span className="text-[10px] font-mono text-slate-400">
                                                                    {formatTrDate(m.createdAt)}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Pagination */}
                                            {filteredMessages.length > PAGE_SIZE && (
                                                <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between text-xs">
                                                    <span className="text-slate-500">
                                                        Toplam {filteredMessages.length} kayıt · Sayfa {msgPage} /{" "}
                                                        {Math.ceil(filteredMessages.length / PAGE_SIZE)}
                                                    </span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            disabled={msgPage <= 1}
                                                            onClick={() => setMsgPage((p) => Math.max(1, p - 1))}
                                                            className="rounded-lg border border-slate-300 bg-white px-3 py-1 font-semibold disabled:opacity-40"
                                                        >
                                                            Önceki
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                msgPage >= Math.ceil(filteredMessages.length / PAGE_SIZE)
                                                            }
                                                            onClick={() => setMsgPage((p) => p + 1)}
                                                            className="rounded-lg border border-slate-300 bg-white px-3 py-1 font-semibold disabled:opacity-40"
                                                        >
                                                            Sonraki
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Message Detail Drawer */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs self-start">
                                    {!selectedMessage ? (
                                        <p className="text-sm text-slate-500 text-center py-8">
                                            Ayrıntılarını görmek için soldaki listeden bir iletişim mesajı seçin.
                                        </p>
                                    ) : (
                                        <div className="space-y-5">
                                            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                                                <div>
                                                    <span className="text-[11px] font-mono text-slate-400">
                                                        ID: {selectedMessage.id}
                                                    </span>
                                                    <h3 className="font-display text-lg font-bold text-brand-navy">
                                                        {selectedMessage.subject}
                                                    </h3>
                                                    <p className="text-xs text-slate-500">
                                                        Gönderim: {formatTrDate(selectedMessage.createdAt)} · Dil:{" "}
                                                        <strong>{selectedMessage.locale.toUpperCase()}</strong> · Kaynak:{" "}
                                                        <code>{selectedMessage.sourcePage}</code>
                                                    </p>
                                                </div>
                                                <span
                                                    className={`rounded-full border px-3 py-1 text-xs font-bold ${
                                                        MSG_BADGE_CLASSES[selectedMessage.status]
                                                    }`}
                                                >
                                                    {MESSAGE_STATUS_LABELS_TR[selectedMessage.status]}
                                                </span>
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-2 text-xs bg-slate-50 rounded-xl p-4 border border-slate-200/70">
                                                <div>
                                                    <span className="text-slate-400 block">Ad Soyad</span>
                                                    <strong className="text-slate-900">{selectedMessage.name}</strong>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 block">Firma</span>
                                                    <strong className="text-slate-900">
                                                        {selectedMessage.company || "Belirtilmedi"}
                                                    </strong>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 block">E-posta</span>
                                                    <a
                                                        href={`mailto:${selectedMessage.email}`}
                                                        className="font-bold text-brand-green hover:underline"
                                                    >
                                                        {selectedMessage.email}
                                                    </a>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 block">Telefon</span>
                                                    <strong className="text-slate-900">
                                                        {selectedMessage.phone || "Belirtilmedi"}
                                                    </strong>
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <span className="text-slate-400 block">Ülke</span>
                                                    <strong className="text-slate-900">{selectedMessage.country}</strong>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                                    Mesaj İçeriği
                                                </p>
                                                <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                                                    {selectedMessage.message}
                                                </div>
                                            </div>

                                            {/* Status Control & Explicit Email Warning */}
                                            <div className="space-y-2 border-t border-slate-100 pt-4">
                                                <label className="label text-xs" htmlFor="detail-msg-status">
                                                    Mesaj Durumunu Değiştir
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {MESSAGE_STATUSES.map((st) => (
                                                        <button
                                                            key={st}
                                                            type="button"
                                                            disabled={msgSaving}
                                                            onClick={() =>
                                                                handleUpdateMessage(selectedMessage.id, { status: st })
                                                            }
                                                            className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                                                                selectedMessage.status === st
                                                                    ? "border-brand-navy bg-brand-navy text-white"
                                                                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                                                            }`}
                                                        >
                                                            {MESSAGE_STATUS_LABELS_TR[st]}
                                                        </button>
                                                    ))}
                                                </div>
                                                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
                                                    <strong>Bilgi:</strong> &ldquo;Yanıtlandı&rdquo; durumunu seçmek otomatik
                                                    e-posta gönderildiği anlamına gelmez (Sunucu SMTP gönderim servisi bağlı
                                                    değildir). Müşteriye e-posta istemciniz üzerinden yanıt verdikten sonra bu
                                                    durumu işaretleyebilirsiniz.
                                                </p>
                                            </div>

                                            {/* Admin Notes */}
                                            <div className="space-y-3 border-t border-slate-100 pt-4">
                                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                    Yönetici Notları ({selectedMessage.notes.length})
                                                </p>
                                                {selectedMessage.notes.length > 0 && (
                                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                                        {selectedMessage.notes.map((n) => (
                                                            <div
                                                                key={n.id}
                                                                className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs"
                                                            >
                                                                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                                                    <span>{n.by}</span>
                                                                    <span>{formatTrDate(n.at)}</span>
                                                                </div>
                                                                <p className="mt-1 text-slate-800">{n.text}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        className="input text-xs"
                                                        placeholder="Yönetici notu ekle..."
                                                        value={msgNoteDraft}
                                                        onChange={(e) => setMsgNoteDraft(e.target.value)}
                                                    />
                                                    <button
                                                        type="button"
                                                        disabled={msgSaving || !msgNoteDraft.trim()}
                                                        onClick={() =>
                                                            handleUpdateMessage(selectedMessage.id, {
                                                                noteText: msgNoteDraft
                                                            })
                                                        }
                                                        className="shrink-0 rounded-xl bg-brand-green px-4 py-2 text-xs font-bold text-white hover:bg-brand-green-dark disabled:opacity-40"
                                                    >
                                                        Not Ekle
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Action History */}
                                            <div className="space-y-2 border-t border-slate-100 pt-4">
                                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                    İşlem Geçmişi
                                                </p>
                                                <div className="space-y-1.5 max-h-40 overflow-y-auto text-[11px]">
                                                    {selectedMessage.history.map((h, i) => (
                                                        <div
                                                            key={`${h.at}-${i}`}
                                                            className="flex items-start justify-between gap-2 rounded-lg bg-slate-50 px-3 py-1.5"
                                                        >
                                                            <div>
                                                                <span className="font-semibold text-slate-800">
                                                                    {h.note || h.action}
                                                                </span>
                                                                <span className="block text-[10px] text-slate-500">
                                                                    İşlemi yapan: {h.by}
                                                                </span>
                                                            </div>
                                                            <span className="font-mono text-[10px] text-slate-400 shrink-0">
                                                                {formatTrDate(h.at)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="border-t border-slate-100 pt-4 flex justify-between">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleUpdateMessage(selectedMessage.id, { status: "archived" })
                                                    }
                                                    className="rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                                >
                                                    Arşivle
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => promptDeleteMessage(selectedMessage)}
                                                    className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
                                                >
                                                    Mesajı Sil
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ====================================================================
                        TAB 3: SİPARİŞ VE TEKLİF TALEPLERİ (QUOTES & CONFIRMED ORDERS)
                       ==================================================================== */}
                    {tab === "quotes" && (
                        <div className="space-y-5">
                            {/* Sub-tab Switcher: Quote Requests vs Confirmed Orders */}
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="inline-flex rounded-2xl bg-white p-1.5 border border-slate-200 shadow-xs">
                                    <button
                                        type="button"
                                        onClick={() => setQuoteSubTab("rfq")}
                                        className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                                            quoteSubTab === "rfq"
                                                ? "bg-brand-navy text-white"
                                                : "text-slate-600 hover:text-slate-900"
                                        }`}
                                    >
                                        Teklif Talepleri ({data.quotes.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setQuoteSubTab("orders")}
                                        className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                                            quoteSubTab === "orders"
                                                ? "bg-teal-700 text-white"
                                                : "text-slate-600 hover:text-slate-900"
                                        }`}
                                    >
                                        Onaylanmış Kesin Siparişler ({data.orders.length})
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    <a
                                        href={`/api/admin/export?type=quotes&q=${encodeURIComponent(
                                            quoteSearch
                                        )}&status=${encodeURIComponent(
                                            quoteStatusFilter === "all" ? "" : quoteStatusFilter
                                        )}&country=${encodeURIComponent(
                                            quoteCountryFilter === "all" ? "" : quoteCountryFilter
                                        )}&dateFrom=${encodeURIComponent(quoteDateFrom)}&dateTo=${encodeURIComponent(
                                            quoteDateTo
                                        )}`}
                                        className="rounded-xl bg-brand-navy px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                                    >
                                        ⬇ Teklifleri CSV İndir ({filteredQuotes.length})
                                    </a>
                                    <a
                                        href="/api/admin/export?type=orders"
                                        className="rounded-xl border border-teal-700 bg-teal-50 px-4 py-2 text-xs font-bold text-teal-900 hover:bg-teal-100"
                                    >
                                        ⬇ Kesin Siparişleri CSV İndir ({data.orders.length})
                                    </a>
                                </div>
                            </div>

                            {quoteSubTab === "rfq" ? (
                                <>
                                    {/* Quote Filters */}
                                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-wrap items-end gap-3">
                                        <div className="flex-1 min-w-[200px]">
                                            <label className="label text-xs" htmlFor="q-search">
                                                Arama (Talep No, Firma, Müşteri, Ürün, Ölçü)
                                            </label>
                                            <input
                                                id="q-search"
                                                className="input"
                                                placeholder="AP-TLP-..., firma veya ürün ara"
                                                value={quoteSearch}
                                                onChange={(e) => {
                                                    setQuoteSearch(e.target.value);
                                                    setQuotePage(1);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="label text-xs" htmlFor="q-status">
                                                Durum
                                            </label>
                                            <select
                                                id="q-status"
                                                className="input"
                                                value={quoteStatusFilter}
                                                onChange={(e) => {
                                                    setQuoteStatusFilter(e.target.value);
                                                    setQuotePage(1);
                                                }}
                                            >
                                                <option value="all">Tüm Durumlar</option>
                                                {QUOTE_STATUSES.map((s) => (
                                                    <option key={s} value={s}>
                                                        {QUOTE_STATUS_LABELS_TR[s]}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label text-xs" htmlFor="q-country">
                                                Ülke
                                            </label>
                                            <select
                                                id="q-country"
                                                className="input"
                                                value={quoteCountryFilter}
                                                onChange={(e) => {
                                                    setQuoteCountryFilter(e.target.value);
                                                    setQuotePage(1);
                                                }}
                                            >
                                                <option value="all">Tüm Ülkeler</option>
                                                {quoteCountries.map((c) => (
                                                    <option key={c} value={c}>
                                                        {c}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label text-xs" htmlFor="q-from">
                                                Başlangıç
                                            </label>
                                            <input
                                                id="q-from"
                                                type="date"
                                                className="input"
                                                value={quoteDateFrom}
                                                onChange={(e) => {
                                                    setQuoteDateFrom(e.target.value);
                                                    setQuotePage(1);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="label text-xs" htmlFor="q-to">
                                                Bitiş
                                            </label>
                                            <input
                                                id="q-to"
                                                type="date"
                                                className="input"
                                                value={quoteDateTo}
                                                onChange={(e) => {
                                                    setQuoteDateTo(e.target.value);
                                                    setQuotePage(1);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Split Quote List + Detail Panel */}
                                    <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
                                        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                                            {filteredQuotes.length === 0 ? (
                                                <div className="p-12 text-center text-sm text-slate-500">
                                                    {data.quotes.length === 0
                                                        ? "Henüz teklif veya sipariş talebi bulunmuyor."
                                                        : "Seçilen filtrelere uygun teklif talebi bulunamadı."}
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="divide-y divide-slate-100">
                                                        {pagedQuotes.map((q) => {
                                                            const isSelected = selectedQuote?.id === q.id;
                                                            return (
                                                                <button
                                                                    key={q.id}
                                                                    type="button"
                                                                    onClick={() => setSelectedQuoteId(q.id)}
                                                                    className={`w-full text-left p-4 transition flex items-start justify-between gap-3 ${
                                                                        isSelected
                                                                            ? "bg-emerald-50/70 border-l-4 border-l-brand-green"
                                                                            : "hover:bg-slate-50"
                                                                    }`}
                                                                >
                                                                    <div className="min-w-0">
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            <span className="font-mono text-xs font-extrabold text-brand-navy">
                                                                                {q.requestNo}
                                                                            </span>
                                                                            <span className="font-bold text-sm text-slate-900">
                                                                                {q.company}
                                                                            </span>
                                                                            <span className="text-xs text-slate-500">
                                                                                ({q.country})
                                                                            </span>
                                                                        </div>
                                                                        <p className="mt-1 text-xs font-semibold text-slate-800">
                                                                            {q.productLabel} ·{" "}
                                                                            <span className="text-brand-green-dark font-bold">
                                                                                {q.quantity} {q.unit}
                                                                            </span>{" "}
                                                                            · {q.deliveryTerm}
                                                                        </p>
                                                                        {(q.bagSpecs.dimensions ||
                                                                            q.bagSpecs.thicknessMicron ||
                                                                            q.bagSpecs.color) && (
                                                                            <p className="mt-1 text-[11px] font-mono text-slate-500">
                                                                                {[
                                                                                    q.bagSpecs.dimensions &&
                                                                                        `Ölçü: ${q.bagSpecs.dimensions}`,
                                                                                    q.bagSpecs.color &&
                                                                                        `Renk: ${q.bagSpecs.color}`,
                                                                                    q.bagSpecs.thicknessMicron &&
                                                                                        `Kalınlık: ${q.bagSpecs.thicknessMicron}`
                                                                                ]
                                                                                    .filter(Boolean)
                                                                                    .join(" | ")}
                                                                            </p>
                                                                        )}
                                                                        {q.convertedOrderNo && (
                                                                            <span className="mt-1.5 inline-block rounded bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-900">
                                                                                ✓ Kesin Sipariş: {q.convertedOrderNo}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex flex-col items-end shrink-0 gap-1.5">
                                                                        <span
                                                                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                                                                                QUOTE_BADGE_CLASSES[q.status]
                                                                            }`}
                                                                        >
                                                                            {QUOTE_STATUS_LABELS_TR[q.status]}
                                                                        </span>
                                                                        <span className="text-[10px] font-mono text-slate-400">
                                                                            {formatTrDate(q.createdAt)}
                                                                        </span>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    {filteredQuotes.length > PAGE_SIZE && (
                                                        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between text-xs">
                                                            <span className="text-slate-500">
                                                                Toplam {filteredQuotes.length} talep · Sayfa {quotePage} /{" "}
                                                                {Math.ceil(filteredQuotes.length / PAGE_SIZE)}
                                                            </span>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    type="button"
                                                                    disabled={quotePage <= 1}
                                                                    onClick={() => setQuotePage((p) => Math.max(1, p - 1))}
                                                                    className="rounded-lg border border-slate-300 bg-white px-3 py-1 font-semibold disabled:opacity-40"
                                                                >
                                                                    Önceki
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        quotePage >=
                                                                        Math.ceil(filteredQuotes.length / PAGE_SIZE)
                                                                    }
                                                                    onClick={() => setQuotePage((p) => p + 1)}
                                                                    className="rounded-lg border border-slate-300 bg-white px-3 py-1 font-semibold disabled:opacity-40"
                                                                >
                                                                    Sonraki
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {/* Quote Detail Drawer */}
                                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs self-start">
                                            {!selectedQuote ? (
                                                <p className="text-sm text-slate-500 text-center py-8">
                                                    Ayrıntılarını görmek için soldaki listeden bir teklif talebi seçin.
                                                </p>
                                            ) : (
                                                <div className="space-y-5">
                                                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                                                        <div>
                                                            <span className="font-mono text-xs font-extrabold text-brand-green-dark">
                                                                Talep No: {selectedQuote.requestNo}
                                                            </span>
                                                            <h3 className="font-display text-lg font-bold text-brand-navy">
                                                                {selectedQuote.company} — {selectedQuote.name}
                                                            </h3>
                                                            <p className="text-xs text-slate-500">
                                                                Tarih: {formatTrDate(selectedQuote.createdAt)} · Dil:{" "}
                                                                <strong>{selectedQuote.locale.toUpperCase()}</strong> · Kaynak:{" "}
                                                                <code>{selectedQuote.sourcePage}</code>
                                                            </p>
                                                        </div>
                                                        <span
                                                            className={`rounded-full border px-3 py-1 text-xs font-bold ${
                                                                QUOTE_BADGE_CLASSES[selectedQuote.status]
                                                            }`}
                                                        >
                                                            {QUOTE_STATUS_LABELS_TR[selectedQuote.status]}
                                                        </span>
                                                    </div>

                                                    {/* Customer & Delivery Info */}
                                                    <div className="grid gap-3 sm:grid-cols-2 text-xs bg-slate-50 rounded-xl p-4 border border-slate-200/70">
                                                        <div>
                                                            <span className="text-slate-400 block">Müşteri / Yetkili</span>
                                                            <strong className="text-slate-900">{selectedQuote.name}</strong>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block">Firma</span>
                                                            <strong className="text-slate-900">{selectedQuote.company}</strong>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block">E-posta</span>
                                                            <a
                                                                href={`mailto:${selectedQuote.email}`}
                                                                className="font-bold text-brand-green hover:underline"
                                                            >
                                                                {selectedQuote.email}
                                                            </a>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block">Telefon</span>
                                                            <strong className="text-slate-900">
                                                                {selectedQuote.phone || "Belirtilmedi"}
                                                            </strong>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block">Ülke</span>
                                                            <strong className="text-slate-900">{selectedQuote.country}</strong>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block">Teslim Şekli & Yeri</span>
                                                            <strong className="text-slate-900">
                                                                {selectedQuote.deliveryTerm}{" "}
                                                                {selectedQuote.deliveryLocation
                                                                    ? `— ${selectedQuote.deliveryLocation}`
                                                                    : ""}
                                                            </strong>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block">Ürün / Kategori</span>
                                                            <strong className="text-slate-900">
                                                                {selectedQuote.productLabel}
                                                            </strong>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block">Miktar & Birim</span>
                                                            <strong className="text-brand-green-dark font-bold">
                                                                {selectedQuote.quantity} {selectedQuote.unit}
                                                            </strong>
                                                        </div>
                                                    </div>

                                                    {/* Garbage Bag Technical Specs */}
                                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs">
                                                        <p className="font-bold uppercase tracking-wider text-emerald-950 mb-2">
                                                            Çöp Poşeti Teknik Özellikleri (Ürün Yapısı)
                                                        </p>
                                                        <div className="grid gap-2 sm:grid-cols-2">
                                                            <div>
                                                                <span className="text-slate-500">Ölçü (En x Boy): </span>
                                                                <strong className="text-slate-900">
                                                                    {selectedQuote.bagSpecs.dimensions || "Belirtilmedi"}
                                                                </strong>
                                                            </div>
                                                            <div>
                                                                <span className="text-slate-500">Renk: </span>
                                                                <strong className="text-slate-900">
                                                                    {selectedQuote.bagSpecs.color || "Belirtilmedi"}
                                                                </strong>
                                                            </div>
                                                            <div>
                                                                <span className="text-slate-500">Kalınlık (Mikron): </span>
                                                                <strong className="text-slate-900">
                                                                    {selectedQuote.bagSpecs.thicknessMicron || "Belirtilmedi"}
                                                                </strong>
                                                            </div>
                                                            <div>
                                                                <span className="text-slate-500">Dip / Kesim Tipi: </span>
                                                                <strong className="text-slate-900">
                                                                    {selectedQuote.bagSpecs.sealType || "Belirtilmedi"}
                                                                </strong>
                                                            </div>
                                                            <div className="sm:col-span-2">
                                                                <span className="text-slate-500">Ambalaj Tercihi: </span>
                                                                <strong className="text-slate-900">
                                                                    {selectedQuote.bagSpecs.packagingPref || "Belirtilmedi"}
                                                                </strong>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {selectedQuote.message && (
                                                        <div>
                                                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                                                                Müşteri Açıklaması / Ek Notlar
                                                            </p>
                                                            <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
                                                                {selectedQuote.message}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Status Selector */}
                                                    <div className="space-y-2 border-t border-slate-100 pt-4">
                                                        <p className="label text-xs">Teklif Talebi Durumu</p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {QUOTE_STATUSES.map((st) => (
                                                                <button
                                                                    key={st}
                                                                    type="button"
                                                                    disabled={quoteSaving}
                                                                    onClick={() =>
                                                                        handleUpdateQuote(selectedQuote.id, { status: st })
                                                                    }
                                                                    className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                                                                        selectedQuote.status === st
                                                                            ? "border-brand-navy bg-brand-navy text-white"
                                                                            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                                                                    }`}
                                                                >
                                                                    {QUOTE_STATUS_LABELS_TR[st]}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Explicit Order Conversion Section */}
                                                    <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4 space-y-2.5">
                                                        <p className="text-xs font-bold text-teal-950">
                                                            Kesin Sipariş Dönüşümü (Yönetici Onayı Zorunlu)
                                                        </p>
                                                        {selectedQuote.convertedOrderNo ? (
                                                            <p className="text-xs text-teal-900">
                                                                Bu talep yönetici onayıyla{" "}
                                                                <strong className="font-mono">
                                                                    {selectedQuote.convertedOrderNo}
                                                                </strong>{" "}
                                                                numaralı kesin siparişe dönüştürülmüştür.
                                                            </p>
                                                        ) : (
                                                            <>
                                                                <p className="text-[11px] text-teal-800">
                                                                    Teklif talepleri kendiliğinden sipariş sayılmaz. Müşteri
                                                                    mutabakatı sağlandıysa yönetici onayıyla kesin sipariş
                                                                    kaydı oluşturabilirsiniz.
                                                                </p>
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        type="text"
                                                                        className="input text-xs bg-white"
                                                                        placeholder="Sipariş onay notu (isteğe bağlı)..."
                                                                        value={orderApprovalNote}
                                                                        onChange={(e) =>
                                                                            setOrderApprovalNote(e.target.value)
                                                                        }
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        disabled={quoteSaving}
                                                                        onClick={() =>
                                                                            promptConvertQuoteToOrder(selectedQuote)
                                                                        }
                                                                        className="shrink-0 rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-800"
                                                                    >
                                                                        ✓ Kesin Siparişe Dönüştür
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Admin Notes */}
                                                    <div className="space-y-2.5 border-t border-slate-100 pt-4">
                                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                            Yönetici Notları ({selectedQuote.notes.length})
                                                        </p>
                                                        {selectedQuote.notes.length > 0 && (
                                                            <div className="space-y-2 max-h-36 overflow-y-auto">
                                                                {selectedQuote.notes.map((n) => (
                                                                    <div
                                                                        key={n.id}
                                                                        className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs"
                                                                    >
                                                                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                                                            <span>{n.by}</span>
                                                                            <span>{formatTrDate(n.at)}</span>
                                                                        </div>
                                                                        <p className="mt-1 text-slate-800">{n.text}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                className="input text-xs"
                                                                placeholder="Bu talep için iç yönetici notu ekle..."
                                                                value={quoteNoteDraft}
                                                                onChange={(e) => setQuoteNoteDraft(e.target.value)}
                                                            />
                                                            <button
                                                                type="button"
                                                                disabled={quoteSaving || !quoteNoteDraft.trim()}
                                                                onClick={() =>
                                                                    handleUpdateQuote(selectedQuote.id, {
                                                                        noteText: quoteNoteDraft
                                                                    })
                                                                }
                                                                className="shrink-0 rounded-xl bg-brand-green px-4 py-2 text-xs font-bold text-white hover:bg-brand-green-dark disabled:opacity-40"
                                                            >
                                                                Not Ekle
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Timestamped Admin History */}
                                                    <div className="space-y-2 border-t border-slate-100 pt-4">
                                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                            Durum ve İşlem Geçmişi
                                                        </p>
                                                        <div className="space-y-1.5 max-h-40 overflow-y-auto text-[11px]">
                                                            {selectedQuote.history.map((h, i) => (
                                                                <div
                                                                    key={`${h.at}-${i}`}
                                                                    className="flex items-start justify-between gap-2 rounded-lg bg-slate-50 px-3 py-1.5"
                                                                >
                                                                    <div>
                                                                        <span className="font-semibold text-slate-800">
                                                                            {h.note || h.action}
                                                                        </span>
                                                                        <span className="block text-[10px] text-slate-500">
                                                                            Yönetici: {h.by}
                                                                        </span>
                                                                    </div>
                                                                    <span className="font-mono text-[10px] text-slate-400 shrink-0">
                                                                        {formatTrDate(h.at)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="border-t border-slate-100 pt-4 flex justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => promptDeleteQuote(selectedQuote)}
                                                            className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
                                                        >
                                                            Talebi Sil
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* Confirmed Orders Sub-tab */
                                <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                                    {data.orders.length === 0 ? (
                                        <div className="p-12 text-center text-sm text-slate-500">
                                            Henüz yönetici onayıyla kesinleşmiş sipariş bulunmuyor. Teklif taleplerinden
                                            onaylanan kayıtlar burada listelenir.
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse text-xs">
                                                <thead>
                                                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                                                        <th className="p-4">Sipariş No / Talep No</th>
                                                        <th className="p-4">Firma & Ülke</th>
                                                        <th className="p-4">Ürün & Miktar</th>
                                                        <th className="p-4">Poşet Özellikleri</th>
                                                        <th className="p-4">Teslimat</th>
                                                        <th className="p-4">Onaylayan & Tarih</th>
                                                        <th className="p-4">Durum Yönetimi</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {data.orders.map((o) => (
                                                        <tr key={o.id} className="hover:bg-slate-50/80">
                                                            <td className="p-4 font-mono">
                                                                <strong className="text-teal-800 block">
                                                                    {o.orderNo}
                                                                </strong>
                                                                <span className="text-[11px] text-slate-400">
                                                                    Talep: {o.requestNo}
                                                                </span>
                                                            </td>
                                                            <td className="p-4">
                                                                <strong className="text-slate-900 block">
                                                                    {o.company}
                                                                </strong>
                                                                <span className="text-slate-500">
                                                                    {o.customerName} · {o.country}
                                                                </span>
                                                            </td>
                                                            <td className="p-4">
                                                                <strong className="text-slate-900 block">
                                                                    {o.productLabel}
                                                                </strong>
                                                                <span className="font-bold text-brand-green-dark">
                                                                    {o.quantity} {o.unit}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 font-mono text-[11px] text-slate-600">
                                                                {[
                                                                    o.bagSpecs.dimensions,
                                                                    o.bagSpecs.color,
                                                                    o.bagSpecs.thicknessMicron,
                                                                    o.bagSpecs.packagingPref
                                                                ]
                                                                    .filter(Boolean)
                                                                    .join(" · ") || "Standart"}
                                                            </td>
                                                            <td className="p-4">
                                                                <strong className="text-slate-800">{o.deliveryTerm}</strong>
                                                                {o.deliveryLocation && (
                                                                    <span className="block text-slate-500">
                                                                        {o.deliveryLocation}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="p-4 text-[11px]">
                                                                <span className="font-semibold text-slate-700 block">
                                                                    {o.approvedBy}
                                                                </span>
                                                                <span className="font-mono text-slate-400">
                                                                    {formatTrDate(o.approvedAt)}
                                                                </span>
                                                            </td>
                                                            <td className="p-4">
                                                                <select
                                                                    aria-label={`Sipariş durumu ${o.orderNo}`}
                                                                    value={o.status}
                                                                    onChange={(e) =>
                                                                        handleUpdateOrderStatus(
                                                                            o.id,
                                                                            e.target.value as OrderStatus
                                                                        )
                                                                    }
                                                                    className={`rounded-xl border px-3 py-1.5 text-xs font-bold ${
                                                                        ORDER_BADGE_CLASSES[o.status]
                                                                    }`}
                                                                >
                                                                    {ORDER_STATUSES.map((st) => (
                                                                        <option key={st} value={st}>
                                                                            {ORDER_STATUS_LABELS_TR[st]}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ====================================================================
                        TAB 4: ÜRÜN YÖNETİMİ (PRODUCT MANAGEMENT)
                       ==================================================================== */}
                    {tab === "products" && (
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                                <div>
                                    <h2 className="font-display text-base font-bold text-brand-navy">
                                        Ürün Kataloğu Yönetimi ({data.products.length} Ürün)
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Yapılan değişiklikler canlı ürün sayfalarına anında yansır. URL (slug) değişirse eski
                                        URL&apos;den yeni URL&apos;ye otomatik 308 yönlendirmesi oluşturulur.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={openNewProductModal}
                                    className="rounded-xl bg-brand-green px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-green-dark"
                                >
                                    + Yeni Ürün Ekle
                                </button>
                            </div>

                            {/* Product Form Modal / Drawer */}
                            {editingProduct && (
                                <form
                                    onSubmit={handleSaveProduct}
                                    className="rounded-2xl border-2 border-brand-green bg-white p-6 shadow-xl space-y-5"
                                >
                                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                                        <div>
                                            <h3 className="font-display text-lg font-bold text-brand-navy">
                                                {editingProduct.id ? "Ürünü Düzenle" : "Yeni Ürün Oluştur"}
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                Fiyat, stok, sertifika veya üretim kapasitesi bilinmiyorsa uydurma veri
                                                girmeyiniz.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setEditingProduct(null)}
                                            className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100"
                                        >
                                            ✕ Kapat
                                        </button>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div>
                                            <label className="label text-xs" htmlFor="pr-name">
                                                Varsayılan Ürün Adı (İngilizce / Global) *
                                            </label>
                                            <input
                                                id="pr-name"
                                                className="input"
                                                required
                                                value={editingProduct.name}
                                                onChange={(e) =>
                                                    setEditingProduct({ ...editingProduct, name: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="label text-xs" htmlFor="pr-slug">
                                                URL Slug (küçük harf ve tire) *
                                            </label>
                                            <input
                                                id="pr-slug"
                                                className="input font-mono"
                                                required
                                                placeholder="heavy-duty-garbage-bags"
                                                value={editingProduct.slug}
                                                onChange={(e) =>
                                                    setEditingProduct({
                                                        ...editingProduct,
                                                        slug: e.target.value
                                                            .toLowerCase()
                                                            .replace(/[^a-z0-9-]+/g, "-")
                                                    })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="label text-xs" htmlFor="pr-cat">
                                                Kategori *
                                            </label>
                                            <select
                                                id="pr-cat"
                                                className="input"
                                                value={editingProduct.categoryId}
                                                onChange={(e) =>
                                                    setEditingProduct({
                                                        ...editingProduct,
                                                        categoryId: e.target.value
                                                    })
                                                }
                                            >
                                                {CATEGORIES.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.en.name} ({c.id})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="label text-xs" htmlFor="pr-sort">
                                                Sıralama (Küçük sayı önce görünür)
                                            </label>
                                            <input
                                                id="pr-sort"
                                                type="number"
                                                className="input"
                                                value={editingProduct.sortOrder}
                                                onChange={(e) =>
                                                    setEditingProduct({
                                                        ...editingProduct,
                                                        sortOrder: Number(e.target.value)
                                                    })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="label text-xs" htmlFor="pr-moq">
                                                MOQ (Minimum Sipariş)
                                            </label>
                                            <input
                                                id="pr-moq"
                                                className="input"
                                                value={editingProduct.moq}
                                                onChange={(e) =>
                                                    setEditingProduct({ ...editingProduct, moq: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="flex items-end pb-2">
                                            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={editingProduct.active}
                                                    onChange={(e) =>
                                                        setEditingProduct({
                                                            ...editingProduct,
                                                            active: e.target.checked
                                                        })
                                                    }
                                                    className="h-4 w-4 rounded border-slate-300 text-brand-green"
                                                />
                                                Ürün Sitede Yayında (Aktif)
                                            </label>
                                        </div>
                                    </div>

                                    {/* Image Upload (Firebase Storage) */}
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 grid gap-4 sm:grid-cols-[140px_1fr] items-center">
                                        <div className="aspect-[16/10] w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
                                            <img
                                                src={editingProduct.imageUrl || "/images/products/heavy-duty.jpg"}
                                                alt="Ürün görseli"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="label text-xs" htmlFor="pr-img-url">
                                                Ürün Görseli (Firebase Storage Yükleme veya Görsel Yolu)
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                <input
                                                    id="pr-img-url"
                                                    className="input flex-1 min-w-[220px] text-xs font-mono"
                                                    value={editingProduct.imageUrl}
                                                    onChange={(e) =>
                                                        setEditingProduct({
                                                            ...editingProduct,
                                                            imageUrl: e.target.value
                                                        })
                                                    }
                                                />
                                                <label className="cursor-pointer rounded-xl bg-brand-navy px-4 py-2 text-xs font-bold text-white hover:bg-slate-800">
                                                    {uploadingImg
                                                        ? "Storage'a Yükleniyor..."
                                                        : "⬆ Görsel Yükle (Max 5MB)"}
                                                    <input
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/webp"
                                                        className="hidden"
                                                        disabled={uploadingImg}
                                                        onChange={handleProductImageUpload}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Default Descriptions */}
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="label text-xs" htmlFor="pr-short">
                                                Kısa Açıklama (Varsayılan / EN) *
                                            </label>
                                            <textarea
                                                id="pr-short"
                                                rows={3}
                                                required
                                                className="input"
                                                value={editingProduct.shortDescription}
                                                onChange={(e) =>
                                                    setEditingProduct({
                                                        ...editingProduct,
                                                        shortDescription: e.target.value
                                                    })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="label text-xs" htmlFor="pr-desc">
                                                Detaylı Açıklama (Varsayılan / EN) *
                                            </label>
                                            <textarea
                                                id="pr-desc"
                                                rows={3}
                                                required
                                                className="input"
                                                value={editingProduct.description}
                                                onChange={(e) =>
                                                    setEditingProduct({
                                                        ...editingProduct,
                                                        description: e.target.value
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Multilingual Content Editor */}
                                    <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                                                Mevcut Dil İçerikleri (TR / EN / DE / FR / AR)
                                            </p>
                                            <div className="flex gap-1">
                                                {(["tr", "en", "de", "fr", "ar"] as const).map((loc) => (
                                                    <button
                                                        key={loc}
                                                        type="button"
                                                        onClick={() => setProdLocaleTab(loc)}
                                                        className={`rounded-lg px-3 py-1 text-xs font-bold uppercase ${
                                                            prodLocaleTab === loc
                                                                ? "bg-brand-green text-white"
                                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                        }`}
                                                    >
                                                        {loc}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-3">
                                            <div>
                                                <label className="label text-xs">
                                                    Ürün Adı ({prodLocaleTab.toUpperCase()})
                                                </label>
                                                <input
                                                    className="input text-xs"
                                                    value={
                                                        editingProduct.translations[prodLocaleTab]?.name || ""
                                                    }
                                                    onChange={(e) =>
                                                        setEditingProduct({
                                                            ...editingProduct,
                                                            translations: {
                                                                ...editingProduct.translations,
                                                                [prodLocaleTab]: {
                                                                    ...editingProduct.translations[prodLocaleTab],
                                                                    name: e.target.value
                                                                }
                                                            }
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <label className="label text-xs">
                                                    Kısa Açıklama ({prodLocaleTab.toUpperCase()})
                                                </label>
                                                <input
                                                    className="input text-xs"
                                                    value={
                                                        editingProduct.translations[prodLocaleTab]
                                                            ?.shortDescription || ""
                                                    }
                                                    onChange={(e) =>
                                                        setEditingProduct({
                                                            ...editingProduct,
                                                            translations: {
                                                                ...editingProduct.translations,
                                                                [prodLocaleTab]: {
                                                                    ...editingProduct.translations[prodLocaleTab],
                                                                    shortDescription: e.target.value
                                                                }
                                                            }
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <label className="label text-xs">
                                                    Detaylı Açıklama ({prodLocaleTab.toUpperCase()})
                                                </label>
                                                <input
                                                    className="input text-xs"
                                                    value={
                                                        editingProduct.translations[prodLocaleTab]?.description ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        setEditingProduct({
                                                            ...editingProduct,
                                                            translations: {
                                                                ...editingProduct.translations,
                                                                [prodLocaleTab]: {
                                                                    ...editingProduct.translations[prodLocaleTab],
                                                                    description: e.target.value
                                                                }
                                                            }
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Technical Specifications Editor */}
                                    <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                                                Teknik Özellikler Tablosu ({editingProduct.specs.length})
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setEditingProduct({
                                                        ...editingProduct,
                                                        specs: [
                                                            ...editingProduct.specs,
                                                            { label: "", value: "" }
                                                        ]
                                                    })
                                                }
                                                className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100"
                                            >
                                                + Özellik Satırı Ekle
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {editingProduct.specs.map((spec, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <input
                                                        className="input text-xs w-1/3"
                                                        placeholder="Parametre (Örn: Kalınlık)"
                                                        value={spec.label}
                                                        onChange={(e) => {
                                                            const next = [...editingProduct.specs];
                                                            next[idx] = { ...spec, label: e.target.value };
                                                            setEditingProduct({ ...editingProduct, specs: next });
                                                        }}
                                                    />
                                                    <input
                                                        className="input text-xs flex-1"
                                                        placeholder="Değer (Örn: 35 - 90 mikron)"
                                                        value={spec.value}
                                                        onChange={(e) => {
                                                            const next = [...editingProduct.specs];
                                                            next[idx] = { ...spec, value: e.target.value };
                                                            setEditingProduct({ ...editingProduct, specs: next });
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setEditingProduct({
                                                                ...editingProduct,
                                                                specs: editingProduct.specs.filter(
                                                                    (_, i) => i !== idx
                                                                )
                                                            })
                                                        }
                                                        className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs font-bold text-rose-700"
                                                    >
                                                        Sil
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setEditingProduct(null)}
                                            className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700"
                                        >
                                            İptal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={prodSaving}
                                            className="rounded-xl bg-brand-green px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-green-dark disabled:opacity-50"
                                        >
                                            {prodSaving ? "Kaydediliyor..." : "Ürünü Sunucuya Kaydet"}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Products Table */}
                            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                                                <th className="p-4">Sıra</th>
                                                <th className="p-4">Görsel & Ürün Adı</th>
                                                <th className="p-4">URL Slug & Kategori</th>
                                                <th className="p-4">Dil Çevirileri</th>
                                                <th className="p-4">Durum</th>
                                                <th className="p-4 text-right">İşlemler</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {data.products.map((p) => (
                                                <tr key={p.id} className="hover:bg-slate-50/80">
                                                    <td className="p-4 font-mono font-bold text-slate-500">
                                                        #{p.sortOrder}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={
                                                                    p.imageUrl ||
                                                                    "/images/products/heavy-duty.jpg"
                                                                }
                                                                alt={p.name}
                                                                className="h-11 w-16 rounded-lg object-cover border border-slate-200 shrink-0"
                                                            />
                                                            <div>
                                                                <strong className="text-slate-900 text-sm block">
                                                                    {p.translations?.tr?.name || p.name}
                                                                </strong>
                                                                <span className="text-slate-500 line-clamp-1 max-w-md">
                                                                    {p.translations?.tr?.shortDescription ||
                                                                        p.shortDescription}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 font-mono">
                                                        <Link
                                                            href={`/products/${p.slug}`}
                                                            target="_blank"
                                                            className="text-brand-green hover:underline font-bold block"
                                                        >
                                                            /products/{p.slug} ↗
                                                        </Link>
                                                        <span className="text-[11px] text-slate-400">
                                                            Kategori: {p.categoryId}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex gap-1">
                                                            {(["tr", "en", "de", "fr", "ar"] as const).map(
                                                                (loc) => {
                                                                    const hasLoc = Boolean(
                                                                        p.translations?.[loc]?.name
                                                                    );
                                                                    return (
                                                                        <span
                                                                            key={loc}
                                                                            className={`rounded px-1.5 py-0.5 text-[10px] font-mono uppercase ${
                                                                                hasLoc
                                                                                    ? "bg-emerald-100 text-emerald-900 font-bold"
                                                                                    : "bg-slate-100 text-slate-400"
                                                                            }`}
                                                                        >
                                                                            {loc}
                                                                        </span>
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleProductActive(p)}
                                                            className={`rounded-full border px-3 py-1 text-[11px] font-bold ${
                                                                p.active
                                                                    ? "border-emerald-300 bg-emerald-100 text-emerald-900"
                                                                    : "border-slate-300 bg-slate-100 text-slate-600"
                                                            }`}
                                                        >
                                                            {p.active ? "● Yayında" : "○ Yayından Kaldırıldı"}
                                                        </button>
                                                    </td>
                                                    <td className="p-4 text-right space-x-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditProductModal(p)}
                                                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50"
                                                        >
                                                            Düzenle
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => promptDeleteProduct(p)}
                                                            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 font-bold text-rose-700 hover:bg-rose-100"
                                                        >
                                                            Sil
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ====================================================================
                        TAB 5: ZİYARETÇİ VE GİRİŞ ANALİZİ (VISITOR & LOGIN ANALYTICS)
                       ==================================================================== */}
                    {tab === "analytics" && (
                        <div className="space-y-6">
                            {/* Accuracy & Privacy Methodology Notice */}
                            <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4 text-xs text-sky-950 space-y-1">
                                <p className="font-bold">
                                    Doğruluk, Ölçüm Yöntemi ve Gizlilik İlkeleri (Gerçek Birinci Taraf Analitik Kaynağı)
                                </p>
                                <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-sky-900">
                                    <li>
                                        <strong>IP ve Konum Doğruluğu:</strong> Ziyaretçilerin ham IP adresi veritabanında
                                        saklanmaz veya gösterilmez. Ülke ve yaklaşık bölge/şehir bilgisi sunucu tarafında
                                        doğrulanmış hosting başlıklarından (<code>x-appengine-country</code>,{" "}
                                        <code>cf-ipcountry</code>) alınır. VPN veya proxy kullanımı nedeniyle yaklaşık konum
                                        gerçek konumdan farklı çıkabilir.
                                    </li>
                                    <li>
                                        <strong>Telefon Modeli Kuralı:</strong> Tarayıcı kesin cihaz modeli bilgisi
                                        sağlamıyorsa (özellikle iPhone/iOS ve masaüstü tarayıcılar) ekran boyutundan tahmin
                                        yapılmaz ve açıkça <strong>&ldquo;Model belirlenemedi&rdquo;</strong> yazılır.
                                    </li>
                                    <li>
                                        <strong>Süre, Aktif ve Tekil Ziyaretçi Penceresi:</strong> Oturum süresi yalnızca
                                        ölçülen etkinlikler arasındaki farktan (<code>son etkinlik - başlangıç</code>)
                                        hesaplanır; son etkinlikten sonraki süre uydurulmaz. Aktif ziyaretçi sayısı{" "}
                                        <strong>son 5 dakika</strong> içinde etkileşim gösteren oturumları kapsar. Tekil
                                        ziyaretçi sayısı çerez izni veren tarayıcılardaki birinci taraf <code>vid</code>{" "}
                                        tanımlayıcısı ile ölçülür.
                                    </li>
                                </ul>
                            </div>

                            {/* Sub-tab Switcher */}
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="inline-flex rounded-2xl bg-white p-1.5 border border-slate-200 shadow-xs">
                                    <button
                                        type="button"
                                        onClick={() => setAnalyticsSubTab("visits")}
                                        className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                                            analyticsSubTab === "visits"
                                                ? "bg-brand-navy text-white"
                                                : "text-slate-600 hover:text-slate-900"
                                        }`}
                                    >
                                        Anonim Ziyaretçi Oturumları ({filteredVisits.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAnalyticsSubTab("logins")}
                                        className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                                            analyticsSubTab === "logins"
                                                ? "bg-brand-navy text-white"
                                                : "text-slate-600 hover:text-slate-900"
                                        }`}
                                    >
                                        Yönetici Hesabı Giriş Kayıtları ({data.loginLogs.length})
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    {analyticsSubTab === "visits" ? (
                                        <a
                                            href={`/api/admin/export?type=visits&country=${encodeURIComponent(
                                                visitCountry === "all" ? "" : visitCountry
                                            )}&deviceType=${encodeURIComponent(
                                                visitDevice === "all" ? "" : visitDevice
                                            )}&browser=${encodeURIComponent(
                                                visitBrowser === "all" ? "" : visitBrowser
                                            )}&page=${encodeURIComponent(visitPageFilter)}&conversion=${encodeURIComponent(
                                                visitConversion === "all" ? "" : visitConversion
                                            )}&dateFrom=${encodeURIComponent(visitDateFrom)}&dateTo=${encodeURIComponent(
                                                visitDateTo
                                            )}`}
                                            className="rounded-xl bg-brand-navy px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                                        >
                                            ⬇ Ziyaretçi Analizi CSV İndir ({filteredVisits.length})
                                        </a>
                                    ) : (
                                        <a
                                            href="/api/admin/export?type=logins"
                                            className="rounded-xl bg-brand-navy px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                                        >
                                            ⬇ Giriş Kayıtları CSV İndir ({data.loginLogs.length})
                                        </a>
                                    )}
                                </div>
                            </div>

                            {analyticsSubTab === "visits" ? (
                                <>
                                    {/* Analytics Summary KPI Cards */}
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                                            <span className="text-[11px] font-bold uppercase text-slate-400">
                                                Toplam Görüntüleme
                                            </span>
                                            <p className="mt-1 font-display text-2xl font-black text-brand-navy">
                                                {kpis.totalPageViews}
                                            </p>
                                            <span className="text-[10px] text-slate-500">
                                                İnsan oturumlarındaki sayfa geçişleri
                                            </span>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                                            <span className="text-[11px] font-bold uppercase text-slate-400">
                                                Toplam Oturum
                                            </span>
                                            <p className="mt-1 font-display text-2xl font-black text-brand-navy">
                                                {kpis.totalSessions}
                                            </p>
                                            <span className="text-[10px] text-slate-500">
                                                30 dk hareketsizlik pencereli
                                            </span>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                                            <span className="text-[11px] font-bold uppercase text-slate-400">
                                                Ölçülebilen Tekil Ziyaretçi
                                            </span>
                                            <p className="mt-1 font-display text-2xl font-black text-brand-navy">
                                                {kpis.uniqueVisitors}
                                            </p>
                                            <span className="text-[10px] text-slate-500">
                                                Birinci taraf çerez izni verenler
                                            </span>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                                            <span className="text-[11px] font-bold uppercase text-slate-400">
                                                Aktif Ziyaretçi (Son 5 dk)
                                            </span>
                                            <p className="mt-1 font-display text-2xl font-black text-emerald-700">
                                                {kpis.activeVisitorsNow}
                                            </p>
                                            <span className="text-[10px] text-slate-500">
                                                Son 5 dakikada sayfa etkinliği olan
                                            </span>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                                            <span className="text-[11px] font-bold uppercase text-slate-400">
                                                Form Dönüşümü
                                            </span>
                                            <p className="mt-1 font-display text-2xl font-black text-sky-700">
                                                {kpis.convertedSessions}{" "}
                                                <span className="text-sm font-bold text-slate-500">
                                                    (%{kpis.conversionRate})
                                                </span>
                                            </p>
                                            <span className="text-[10px] text-slate-500">
                                                İletişim veya teklif gönderen oturum
                                            </span>
                                        </div>
                                    </div>

                                    {/* Real Data Distribution Charts */}
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {[
                                            { title: "Ülke Dağılımı", items: visitCharts.countries },
                                            { title: "Cihaz Türü", items: visitCharts.devices },
                                            { title: "İşletim Sistemi", items: visitCharts.osList },
                                            { title: "Tarayıcı", items: visitCharts.browsers },
                                            { title: "Trafik Kaynağı / UTM", items: visitCharts.sources },
                                            { title: "En Çok Ziyaret Edilen Sayfalar", items: visitCharts.topPages }
                                        ].map((chart) => (
                                            <div
                                                key={chart.title}
                                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
                                            >
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-navy mb-3">
                                                    {chart.title}
                                                </h3>
                                                {chart.items.length === 0 ? (
                                                    <p className="text-xs text-slate-400 py-4 text-center">
                                                        Henüz veri bulunmuyor
                                                    </p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {chart.items.map((row) => (
                                                            <div key={row.label} className="text-xs">
                                                                <div className="flex justify-between mb-0.5">
                                                                    <span className="font-medium text-slate-700 truncate max-w-[75%]">
                                                                        {row.label}
                                                                    </span>
                                                                    <span className="font-mono text-[11px] text-slate-500">
                                                                        {row.count} (%{row.pct})
                                                                    </span>
                                                                </div>
                                                                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-brand-green rounded-full"
                                                                        style={{ width: `${Math.max(4, row.pct)}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Visitor Filters */}
                                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-wrap items-end gap-3">
                                        <div>
                                            <label className="label text-xs" htmlFor="v-country">
                                                Ülke
                                            </label>
                                            <select
                                                id="v-country"
                                                className="input"
                                                value={visitCountry}
                                                onChange={(e) => {
                                                    setVisitCountry(e.target.value);
                                                    setVisitPage(1);
                                                }}
                                            >
                                                <option value="all">Tüm Ülkeler</option>
                                                {availableVisitCountries.map((c) => (
                                                    <option key={c} value={c}>
                                                        {c}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label text-xs" htmlFor="v-device">
                                                Cihaz Türü
                                            </label>
                                            <select
                                                id="v-device"
                                                className="input"
                                                value={visitDevice}
                                                onChange={(e) => {
                                                    setVisitDevice(e.target.value);
                                                    setVisitPage(1);
                                                }}
                                            >
                                                <option value="all">Tümü</option>
                                                <option value="telefon">Telefon</option>
                                                <option value="tablet">Tablet</option>
                                                <option value="bilgisayar">Bilgisayar</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label text-xs" htmlFor="v-browser">
                                                Tarayıcı
                                            </label>
                                            <select
                                                id="v-browser"
                                                className="input"
                                                value={visitBrowser}
                                                onChange={(e) => {
                                                    setVisitBrowser(e.target.value);
                                                    setVisitPage(1);
                                                }}
                                            >
                                                <option value="all">Tüm Tarayıcılar</option>
                                                {availableVisitBrowsers.map((b) => (
                                                    <option key={b} value={b}>
                                                        {b}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label text-xs" htmlFor="v-page">
                                                Sayfa Filtresi
                                            </label>
                                            <input
                                                id="v-page"
                                                className="input"
                                                placeholder="/products, /tr/contact..."
                                                value={visitPageFilter}
                                                onChange={(e) => {
                                                    setVisitPageFilter(e.target.value);
                                                    setVisitPage(1);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="label text-xs" htmlFor="v-conv">
                                                Form Dönüşümü
                                            </label>
                                            <select
                                                id="v-conv"
                                                className="input"
                                                value={visitConversion}
                                                onChange={(e) => {
                                                    setVisitConversion(
                                                        e.target.value as "all" | "converted" | "none"
                                                    );
                                                    setVisitPage(1);
                                                }}
                                            >
                                                <option value="all">Tümü</option>
                                                <option value="converted">Form Gönderenler</option>
                                                <option value="none">Form Göndermeyenler</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label text-xs" htmlFor="v-bot">
                                                Sınıflandırma
                                            </label>
                                            <select
                                                id="v-bot"
                                                className="input"
                                                value={visitBotFilter}
                                                onChange={(e) => {
                                                    setVisitBotFilter(
                                                        e.target.value as "human" | "bot" | "all"
                                                    );
                                                    setVisitPage(1);
                                                }}
                                            >
                                                <option value="human">İnsan & Belirsiz (Bot Hariç)</option>
                                                <option value="bot">Yalnızca Bot / Tarayıcı</option>
                                                <option value="all">Tümü</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label text-xs" htmlFor="v-from">
                                                Başlangıç
                                            </label>
                                            <input
                                                id="v-from"
                                                type="date"
                                                className="input"
                                                value={visitDateFrom}
                                                onChange={(e) => {
                                                    setVisitDateFrom(e.target.value);
                                                    setVisitPage(1);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="label text-xs" htmlFor="v-to">
                                                Bitiş
                                            </label>
                                            <input
                                                id="v-to"
                                                type="date"
                                                className="input"
                                                value={visitDateTo}
                                                onChange={(e) => {
                                                    setVisitDateTo(e.target.value);
                                                    setVisitPage(1);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Sessions Table + Timeline Drawer */}
                                    <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
                                        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                                            {filteredVisits.length === 0 ? (
                                                <div className="p-12 text-center text-sm text-slate-500">
                                                    Seçilen filtrelerde henüz ziyaretçi oturumu bulunmuyor.
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-left border-collapse text-xs">
                                                            <thead>
                                                                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                                                                    <th className="p-3.5">Tarih / Saat Dilimi</th>
                                                                    <th className="p-3.5">Ülke & Bölge/Şehir</th>
                                                                    <th className="p-3.5">Cihaz / Marka / Model</th>
                                                                    <th className="p-3.5">İS & Tarayıcı</th>
                                                                    <th className="p-3.5">Sayfa & Süre</th>
                                                                    <th className="p-3.5">Dönüşüm</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100">
                                                                {pagedVisits.map((v) => {
                                                                    const isSel =
                                                                        selectedSession?.sessionId === v.sessionId;
                                                                    return (
                                                                        <tr
                                                                            key={v.sessionId}
                                                                            onClick={() => setSelectedSession(v)}
                                                                            className={`cursor-pointer transition ${
                                                                                isSel
                                                                                    ? "bg-emerald-50/80"
                                                                                    : "hover:bg-slate-50"
                                                                            }`}
                                                                        >
                                                                            <td className="p-3.5 font-mono text-[11px]">
                                                                                <strong className="text-slate-900 block">
                                                                                    {formatTrDate(v.startedAt)}
                                                                                </strong>
                                                                                <span className="text-slate-400">
                                                                                    {v.timezone}
                                                                                </span>
                                                                            </td>
                                                                            <td className="p-3.5">
                                                                                <strong className="text-slate-900 block">
                                                                                    {v.countryName} ({v.countryCode})
                                                                                </strong>
                                                                                <span className="text-[11px] text-slate-500">
                                                                                    {v.region} / {v.city}
                                                                                </span>
                                                                            </td>
                                                                            <td className="p-3.5">
                                                                                <span className="font-bold capitalize text-slate-900 block">
                                                                                    {v.deviceType} · {v.deviceBrand}
                                                                                </span>
                                                                                <span className="text-[11px] text-slate-500">
                                                                                    {v.deviceModel}
                                                                                </span>
                                                                            </td>
                                                                            <td className="p-3.5">
                                                                                <span className="text-slate-900 font-semibold block">
                                                                                    {v.osName}{" "}
                                                                                    {v.osVersion !== "Bilinmiyor"
                                                                                        ? v.osVersion
                                                                                        : ""}
                                                                                </span>
                                                                                <span className="text-[11px] text-slate-500">
                                                                                    {v.browserName}{" "}
                                                                                    {v.browserVersion !== "Bilinmiyor"
                                                                                        ? v.browserVersion
                                                                                        : ""}{" "}
                                                                                    · {v.screenSize}
                                                                                </span>
                                                                            </td>
                                                                            <td className="p-3.5">
                                                                                <strong className="text-brand-navy block">
                                                                                    {v.pageViews} sayfa ·{" "}
                                                                                    {formatDurationTr(
                                                                                        v.durationSeconds
                                                                                    )}
                                                                                </strong>
                                                                                <span className="text-[11px] font-mono text-slate-500 truncate block max-w-[180px]">
                                                                                    Giriş: {v.entryPage}
                                                                                </span>
                                                                            </td>
                                                                            <td className="p-3.5">
                                                                                {v.convertedQuote ? (
                                                                                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-900">
                                                                                        ✓ Teklif Talebi
                                                                                    </span>
                                                                                ) : v.convertedContact ? (
                                                                                    <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold text-sky-900">
                                                                                        ✓ İletişim Formu
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="text-[11px] text-slate-400">
                                                                                        —
                                                                                    </span>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    {filteredVisits.length > PAGE_SIZE && (
                                                        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between text-xs">
                                                            <span className="text-slate-500">
                                                                Toplam {filteredVisits.length} oturum · Sayfa{" "}
                                                                {visitPage} /{" "}
                                                                {Math.ceil(filteredVisits.length / PAGE_SIZE)}
                                                            </span>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    type="button"
                                                                    disabled={visitPage <= 1}
                                                                    onClick={() =>
                                                                        setVisitPage((p) => Math.max(1, p - 1))
                                                                    }
                                                                    className="rounded-lg border border-slate-300 bg-white px-3 py-1 font-semibold disabled:opacity-40"
                                                                >
                                                                    Önceki
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        visitPage >=
                                                                        Math.ceil(filteredVisits.length / PAGE_SIZE)
                                                                    }
                                                                    onClick={() => setVisitPage((p) => p + 1)}
                                                                    className="rounded-lg border border-slate-300 bg-white px-3 py-1 font-semibold disabled:opacity-40"
                                                                >
                                                                    Sonraki
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {/* Session Timeline & Detail Drawer */}
                                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs self-start">
                                            {!selectedSession ? (
                                                <p className="text-sm text-slate-500 text-center py-8">
                                                    Zaman sıralı sayfa ve etkinlik ayrıntılarını görmek için soldaki
                                                    listeden bir ziyaret kaydına tıklayın.
                                                </p>
                                            ) : (
                                                <div className="space-y-4 text-xs">
                                                    <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
                                                        <div>
                                                            <span className="font-mono text-[11px] text-slate-400">
                                                                Oturum: {selectedSession.sessionId}
                                                            </span>
                                                            <h3 className="font-display text-base font-bold text-brand-navy">
                                                                Ziyaretçi Oturum Ayrıntıları
                                                            </h3>
                                                            <p className="text-[11px] text-slate-500">
                                                                Saat Dilimi: {selectedSession.timezone}
                                                            </p>
                                                        </div>
                                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700">
                                                            {selectedSession.botStatus === "bot"
                                                                ? "Bot / Tarayıcı"
                                                                : selectedSession.botStatus === "uncertain"
                                                                ? "Belirsiz (Olası Bot)"
                                                                : "İnsan Ziyaretçi"}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-200/70">
                                                        <div>
                                                            <span className="text-slate-400 block">Ülke & Şehir</span>
                                                            <strong className="text-slate-900">
                                                                {selectedSession.countryName} (
                                                                {selectedSession.countryCode}) ·{" "}
                                                                {selectedSession.city}
                                                            </strong>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block">Konum Kaynağı</span>
                                                            <strong className="text-slate-700">
                                                                {selectedSession.geoSource}
                                                            </strong>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block">
                                                                Cihaz Türü & Marka
                                                            </span>
                                                            <strong className="text-slate-900 capitalize">
                                                                {selectedSession.deviceType} ·{" "}
                                                                {selectedSession.deviceBrand}
                                                            </strong>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block">Cihaz Modeli</span>
                                                            <strong className="text-slate-900">
                                                                {selectedSession.deviceModel}
                                                            </strong>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block">
                                                                İşletim Sistemi
                                                            </span>
                                                            <strong className="text-slate-900">
                                                                {selectedSession.osName} ({selectedSession.osVersion})
                                                            </strong>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block">Tarayıcı</span>
                                                            <strong className="text-slate-900">
                                                                {selectedSession.browserName} (
                                                                {selectedSession.browserVersion})
                                                            </strong>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block">
                                                                Dil & Ekran Boyutu
                                                            </span>
                                                            <strong className="text-slate-900">
                                                                {selectedSession.language} ·{" "}
                                                                {selectedSession.screenSize}
                                                            </strong>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block">
                                                                Ölçülen Oturum Süresi
                                                            </span>
                                                            <strong className="text-brand-green-dark">
                                                                {formatDurationTr(selectedSession.durationSeconds)}
                                                            </strong>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block">
                                                                İlk Giriş / Son Sayfa
                                                            </span>
                                                            <strong className="font-mono text-slate-900">
                                                                {selectedSession.entryPage} &rarr;{" "}
                                                                {selectedSession.exitPage}
                                                            </strong>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block">
                                                                Yönlendiren & UTM
                                                            </span>
                                                            <strong className="text-slate-900">
                                                                {selectedSession.referrer}
                                                                {selectedSession.utmSource
                                                                    ? ` (${selectedSession.utmSource}/${selectedSession.utmCampaign})`
                                                                    : ""}
                                                            </strong>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <p className="font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                            Zaman Sıralı Etkinlik Geçmişi (
                                                            {selectedSession.events.length})
                                                        </p>
                                                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                                            {selectedSession.events.map((ev, i) => (
                                                                <div
                                                                    key={`${ev.at}-${i}`}
                                                                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                                                                >
                                                                    <div>
                                                                        <span
                                                                            className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold mr-2 ${
                                                                                ev.type === "quote_submit"
                                                                                    ? "bg-emerald-100 text-emerald-900"
                                                                                    : ev.type === "contact_submit"
                                                                                    ? "bg-sky-100 text-sky-900"
                                                                                    : "bg-slate-200 text-slate-700"
                                                                            }`}
                                                                        >
                                                                            {ev.type === "quote_submit"
                                                                                ? "Teklif Formu Gönderildi"
                                                                                : ev.type === "contact_submit"
                                                                                ? "İletişim Formu Gönderildi"
                                                                                : "Sayfa Görüntüleme"}
                                                                        </span>
                                                                        <code className="font-mono font-bold text-slate-900">
                                                                            {ev.path}
                                                                        </code>
                                                                    </div>
                                                                    <span className="font-mono text-[10px] text-slate-400">
                                                                        {formatTrDate(ev.at)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* Login Logs Sub-tab */
                                <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                                    <div className="p-4 border-b border-slate-100 bg-slate-50 text-xs text-slate-600">
                                        Yönetici kimlik doğrulama işlemleri (başarılı ve başarısız giriş denemeleri)
                                        sunucu tarafında kaydedilir. Şifre, oturum anahtarı veya ham IP adresi
                                        kesinlikle kaydedilmez.
                                    </div>
                                    {data.loginLogs.length === 0 ? (
                                        <div className="p-12 text-center text-sm text-slate-500">
                                            Henüz giriş kaydı bulunmuyor.
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse text-xs">
                                                <thead>
                                                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                                                        <th className="p-4">Tarih</th>
                                                        <th className="p-4">İlgili Hesap</th>
                                                        <th className="p-4">Sonuç</th>
                                                        <th className="p-4">Açıklama</th>
                                                        <th className="p-4">Yaklaşık Ülke / Şehir</th>
                                                        <th className="p-4">Cihaz & Tarayıcı</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {data.loginLogs.map((l) => (
                                                        <tr key={l.id} className="hover:bg-slate-50/70">
                                                            <td className="p-4 font-mono text-[11px] text-slate-500">
                                                                {formatTrDate(l.createdAt)}
                                                            </td>
                                                            <td className="p-4 font-semibold text-slate-900">
                                                                {l.email}
                                                            </td>
                                                            <td className="p-4">
                                                                <span
                                                                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                                        l.success
                                                                            ? "bg-emerald-100 text-emerald-900"
                                                                            : "bg-rose-100 text-rose-900"
                                                                    }`}
                                                                >
                                                                    {l.success ? "✓ Başarılı" : "✕ Başarısız"}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-slate-600">{l.reason}</td>
                                                            <td className="p-4 text-slate-700">
                                                                {l.countryName} ({l.countryCode}) · {l.city}
                                                            </td>
                                                            <td className="p-4 text-slate-600 capitalize">
                                                                {l.deviceType} · {l.osName} · {l.browserName}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ====================================================================
                        TAB 6: AYARLAR VE KULLANIM (SETTINGS)
                       ==================================================================== */}
                    {tab === "settings" && (
                        <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
                            <form
                                onSubmit={handleSaveSettings}
                                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5"
                            >
                                <div>
                                    <h2 className="font-display text-lg font-bold text-brand-navy">
                                        Firma İletişim ve Sosyal Medya Ayarları
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Burada yapılan güncellemeler sitedeki İletişim sayfası, WhatsApp hattı ve alt
                                        bilgi (Footer) alanlarına doğrudan yansır.
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="label text-xs" htmlFor="st-name">
                                            Marka Adı *
                                        </label>
                                        <input
                                            id="st-name"
                                            className="input"
                                            required
                                            value={settingsDraft.name}
                                            onChange={(e) =>
                                                setSettingsDraft({ ...settingsDraft, name: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="label text-xs" htmlFor="st-legal">
                                            Resmi Ticari Ünvan
                                        </label>
                                        <input
                                            id="st-legal"
                                            className="input"
                                            value={settingsDraft.legalName}
                                            onChange={(e) =>
                                                setSettingsDraft({ ...settingsDraft, legalName: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="label text-xs" htmlFor="st-email">
                                            Kurumsal İhracat E-postası *
                                        </label>
                                        <input
                                            id="st-email"
                                            type="email"
                                            className="input"
                                            required
                                            value={settingsDraft.email}
                                            onChange={(e) =>
                                                setSettingsDraft({ ...settingsDraft, email: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="label text-xs" htmlFor="st-phone">
                                            Telefon Numarası
                                        </label>
                                        <input
                                            id="st-phone"
                                            className="input"
                                            value={settingsDraft.phone}
                                            onChange={(e) =>
                                                setSettingsDraft({ ...settingsDraft, phone: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="label text-xs" htmlFor="st-wa">
                                            WhatsApp İhracat Hattı
                                        </label>
                                        <input
                                            id="st-wa"
                                            className="input"
                                            value={settingsDraft.whatsapp}
                                            onChange={(e) =>
                                                setSettingsDraft({ ...settingsDraft, whatsapp: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="label text-xs" htmlFor="st-hours">
                                            Çalışma Saatleri
                                        </label>
                                        <input
                                            id="st-hours"
                                            className="input"
                                            value={settingsDraft.workingHours}
                                            onChange={(e) =>
                                                setSettingsDraft({
                                                    ...settingsDraft,
                                                    workingHours: e.target.value
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="label text-xs" htmlFor="st-city">
                                            Şehir
                                        </label>
                                        <input
                                            id="st-city"
                                            className="input"
                                            value={settingsDraft.city}
                                            onChange={(e) =>
                                                setSettingsDraft({ ...settingsDraft, city: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="label text-xs" htmlFor="st-country">
                                            Ülke *
                                        </label>
                                        <input
                                            id="st-country"
                                            className="input"
                                            required
                                            value={settingsDraft.country}
                                            onChange={(e) =>
                                                setSettingsDraft({ ...settingsDraft, country: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="label text-xs" htmlFor="st-addr">
                                            Fabrika / İhracat Ofisi Adresi
                                        </label>
                                        <input
                                            id="st-addr"
                                            className="input"
                                            value={settingsDraft.address}
                                            onChange={(e) =>
                                                setSettingsDraft({ ...settingsDraft, address: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-4 space-y-3">
                                    <p className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                                        Sosyal Medya Bağlantıları
                                    </p>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {(
                                            ["linkedin", "instagram", "facebook", "youtube", "x"] as const
                                        ).map((net) => (
                                            <div key={net}>
                                                <label className="label text-xs capitalize" htmlFor={`soc-${net}`}>
                                                    {net} URL
                                                </label>
                                                <input
                                                    id={`soc-${net}`}
                                                    className="input text-xs"
                                                    placeholder={`https://${net}.com/...`}
                                                    value={settingsDraft.socialLinks[net] || ""}
                                                    onChange={(e) =>
                                                        setSettingsDraft({
                                                            ...settingsDraft,
                                                            socialLinks: {
                                                                ...settingsDraft.socialLinks,
                                                                [net]: e.target.value
                                                            }
                                                        })
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                                    <span className="text-[11px] text-slate-400">
                                        {data.settings.updatedAt
                                            ? `Son güncelleme: ${formatTrDate(data.settings.updatedAt)} (${
                                                  data.settings.updatedBy || "yönetici"
                                              })`
                                            : "Varsayılan yapılandırma"}
                                    </span>
                                    <button
                                        type="submit"
                                        disabled={settingsSaving}
                                        className="rounded-xl bg-brand-green px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-green-dark disabled:opacity-50"
                                    >
                                        {settingsSaving ? "Kaydediliyor..." : "Ayarları Kaydet"}
                                    </button>
                                </div>
                            </form>

                            {/* Right Column: Analytics Retention & Audit Trail */}
                            <div className="space-y-6">
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                                    <h3 className="font-display text-base font-bold text-brand-navy">
                                        Analitik Veri Saklama Süresi
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Ziyaretçi oturum kayıtlarının Firestore veritabanında saklanacağı gün
                                        sayısını belirleyin.
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            min={7}
                                            max={730}
                                            className="input w-28"
                                            value={settingsDraft.analyticsRetentionDays}
                                            onChange={(e) =>
                                                setSettingsDraft({
                                                    ...settingsDraft,
                                                    analyticsRetentionDays: Number(e.target.value) || 90
                                                })
                                            }
                                        />
                                        <span className="text-xs font-semibold text-slate-600">Gün</span>
                                        <button
                                            type="button"
                                            onClick={handleCleanupExpiredAnalytics}
                                            className="ml-auto rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                                        >
                                            Süresi Dolanları Temizle
                                        </button>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
                                    <h3 className="font-display text-base font-bold text-brand-navy">
                                        Son Yönetici Denetim Kayıtları (Audit Log)
                                    </h3>
                                    {data.auditLogs.length === 0 ? (
                                        <p className="text-xs text-slate-400">Henüz denetim kaydı bulunmuyor.</p>
                                    ) : (
                                        <div className="space-y-2 max-h-80 overflow-y-auto text-xs">
                                            {data.auditLogs.slice(0, 25).map((a) => (
                                                <div
                                                    key={a.id}
                                                    className="rounded-xl bg-slate-50 border border-slate-200/80 px-3 py-2 flex items-start justify-between gap-2"
                                                >
                                                    <div>
                                                        <strong className="text-slate-900">{a.action}</strong>
                                                        <span className="text-slate-500"> · Hedef: {a.target}</span>
                                                        <span className="block text-[11px] text-slate-400">
                                                            Yönetici: {a.by}
                                                        </span>
                                                    </div>
                                                    <span className="font-mono text-[10px] text-slate-400 shrink-0">
                                                        {formatTrDate(a.at)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
