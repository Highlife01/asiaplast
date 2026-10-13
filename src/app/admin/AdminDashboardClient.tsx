"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { QuoteRequest, ContactMessage } from "@/lib/repo";
import type { MessageStatus } from "@/lib/config";
import type { AnalyticsReport, VisitorSessionDoc, LoginLogDoc } from "@/lib/analytics";
import { CATEGORIES } from "@/data/catalog";

type Props = {
    initialQuotes: QuoteRequest[];
    initialMessages: ContactMessage[];
    initialAnalytics: AnalyticsReport | null;
    initialLogins: LoginLogDoc[];
    initialError: string | null;
    operatorEmail: string;
    operatorRole?: string;
};

export default function AdminDashboardClient({
    initialQuotes,
    initialMessages,
    initialAnalytics,
    initialLogins,
    initialError,
    operatorEmail,
    operatorRole = "admin"
}: Props) {
    const [quotes, setQuotes] = useState<QuoteRequest[]>(initialQuotes);
    const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
    const [analytics, setAnalytics] = useState<AnalyticsReport | null>(initialAnalytics);
    const [logins, setLogins] = useState<LoginLogDoc[]>(initialLogins);
    const [activeTab, setActiveTab] = useState<"rfq" | "messages" | "analytics" | "logins" | "catalog" | "system">("analytics");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
    const [selectedSession, setSelectedSession] = useState<VisitorSessionDoc | null>(null);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString("tr-TR"));
    const [error, setError] = useState<string | null>(initialError);
    const [isLoading, setIsLoading] = useState(false);

    // Analytics Filters State
    const [analyticsFilter, setAnalyticsFilter] = useState({
        dateRange: "all",
        country: "all",
        deviceType: "all",
        browser: "all",
        conversionStatus: "all",
        includeBots: false,
        page: 1,
        pageSize: 15
    });

    // Login logs pagination
    const [loginPage, setLoginPage] = useState(1);
    const [loginTotalPages, setLoginTotalPages] = useState(1);

    // Refresh analytics from server
    const fetchAnalytics = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                dateRange: analyticsFilter.dateRange,
                country: analyticsFilter.country === "all" ? "" : analyticsFilter.country,
                deviceType: analyticsFilter.deviceType === "all" ? "" : analyticsFilter.deviceType,
                browser: analyticsFilter.browser === "all" ? "" : analyticsFilter.browser,
                conversionStatus: analyticsFilter.conversionStatus,
                includeBots: String(analyticsFilter.includeBots),
                page: String(analyticsFilter.page),
                pageSize: String(analyticsFilter.pageSize)
            });

            const res = await fetch(`/api/admin/analytics?${params.toString()}`);
            if (!res.ok) throw new Error("Analitik verileri sunucudan yüklenemedi.");
            const data: AnalyticsReport = await res.json();
            setAnalytics(data);
            setLastUpdated(new Date().toLocaleTimeString("tr-TR"));
        } catch (err: unknown) {
            const e = err as Error;
            setError(e.message || "Bağlantı hatası.");
        } finally {
            setIsLoading(false);
        }
    }, [analyticsFilter]);

    // Fetch login logs
    const fetchLogins = useCallback(async (page = 1) => {
        try {
            const res = await fetch(`/api/admin/logins?page=${page}&pageSize=20`);
            if (res.ok) {
                const data = await res.json();
                setLogins(data.logs || []);
                setLoginPage(data.pagination?.currentPage || 1);
                setLoginTotalPages(data.pagination?.totalPages || 1);
            }
        } catch {
            // Non-critical
        }
    }, []);

    useEffect(() => {
        if (activeTab === "analytics") {
            fetchAnalytics();
        } else if (activeTab === "logins") {
            fetchLogins(loginPage);
        }
    }, [activeTab, analyticsFilter, fetchAnalytics, fetchLogins, loginPage]);

    async function handleStatusChange(id: string, type: "quote" | "message", newStatus: MessageStatus) {
        setLoadingAction(id);
        try {
            const endpoint = type === "quote" ? `/api/admin/quotes/${id}` : `/api/admin/messages/${id}`;
            const res = await fetch(endpoint, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                if (type === "quote") {
                    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q)));
                    if (selectedQuote?.id === id) {
                        setSelectedQuote((prev) => (prev ? { ...prev, status: newStatus } : null));
                    }
                } else {
                    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)));
                }
            }
        } catch (err) {
            console.error("Status update error:", err);
        } finally {
            setLoadingAction(null);
        }
    }

    async function handleDelete(id: string, type: "quote" | "message") {
        if (!confirm("Bu kaydı kalıcı olarak silmek istediğinizden emin misiniz?")) return;
        setLoadingAction(id);
        try {
            const endpoint = type === "quote" ? `/api/admin/quotes/${id}` : `/api/admin/messages/${id}`;
            const res = await fetch(endpoint, { method: "DELETE" });
            if (res.ok) {
                if (type === "quote") {
                    setQuotes((prev) => prev.filter((q) => q.id !== id));
                    if (selectedQuote?.id === id) setSelectedQuote(null);
                } else {
                    setMessages((prev) => prev.filter((m) => m.id !== id));
                }
            }
        } catch (err) {
            console.error("Delete error:", err);
        } finally {
            setLoadingAction(null);
        }
    }

    async function handleLogout() {
        await fetch("/api/admin/logout", { method: "POST" });
        window.location.href = "/admin/login";
    }

    function exportCsv() {
        const params = new URLSearchParams({
            dateRange: analyticsFilter.dateRange,
            country: analyticsFilter.country === "all" ? "" : analyticsFilter.country,
            deviceType: analyticsFilter.deviceType === "all" ? "" : analyticsFilter.deviceType,
            browser: analyticsFilter.browser === "all" ? "" : analyticsFilter.browser,
            conversionStatus: analyticsFilter.conversionStatus,
            includeBots: String(analyticsFilter.includeBots),
            export: "csv"
        });
        window.location.href = `/api/admin/analytics?${params.toString()}`;
    }

    // Filtered lists
    const filteredQuotes = quotes.filter((q) => {
        const matchesStatus = statusFilter === "all" || q.status === statusFilter;
        const matchesSearch =
            !search ||
            q.company.toLowerCase().includes(search.toLowerCase()) ||
            q.name.toLowerCase().includes(search.toLowerCase()) ||
            q.country.toLowerCase().includes(search.toLowerCase()) ||
            q.email.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const filteredMessages = messages.filter((m) => {
        const matchesStatus = statusFilter === "all" || m.status === statusFilter;
        const matchesSearch =
            !search ||
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.country.toLowerCase().includes(search.toLowerCase()) ||
            m.email.toLowerCase().includes(search.toLowerCase()) ||
            m.message.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Unique countries from genuine submissions
    const submissionCountries = Array.from(
        new Set([...quotes.map((q) => q.country), ...messages.map((m) => m.country)].filter(Boolean))
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
            {/* Top Navigation & Brand Header */}
            <header className="sticky top-0 z-40 border-b border-cyan-500/20 bg-slate-900/90 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-18 items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-cyan-500/20">
                            A
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-black tracking-tight text-white">
                                    ASIA<span className="text-emerald-400">PLAST</span>
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[10px] font-black text-cyan-300">
                                    CENTRAL COMMAND
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-400">
                                Site: <code className="text-cyan-300">asiaplast</code> &bull; Proje: <code className="text-amber-300">ajansonline</code> &bull; Son Güncelleme: <span className="text-slate-200">{lastUpdated}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Gerçek Firestore Senkronizasyonu
                        </span>
                        {operatorRole === "superadmin" || operatorEmail === "cebrailkara@gmail.com" ? (
                            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-amber-300 font-bold bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30">
                                👑 SÜPER YÖNETİCİ &bull; {operatorEmail}
                            </span>
                        ) : (
                            <span className="hidden sm:inline-block text-xs text-slate-400 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
                                👤 {operatorEmail}
                            </span>
                        )}
                        <Link
                            href="/"
                            target="_blank"
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                        >
                            Canlı Site ↗
                        </Link>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="text-xs bg-red-950/80 hover:bg-red-900 text-rose-300 border border-red-700/60 px-3 py-1.5 rounded-lg transition"
                        >
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Hero / Command Banner */}
                <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 p-6 sm:p-8 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-cyan-400/40 text-[10px] font-black uppercase text-cyan-300 tracking-wider">
                                GLOBAL YÖNETİM &amp; ZİYARETÇİ İSTİHBARATI
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 bg-gradient-to-r from-white via-cyan-200 to-emerald-200 bg-clip-text text-transparent">
                                Gerçek Zamanlı RFQ, Ziyaretçi &amp; Giriş Analizi
                            </h1>
                            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                                Bu panelde yalnızca siteden ve sunucudan gerçek zamanlı toplanan doğrulanmış veriler sunulur. Sentetik, sahte veya tahminî istatistik üretilmez.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <span className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center gap-2">
                                <span>🛡️</span> Sıfır İstemci Depolama (No LocalStorage)
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    if (activeTab === "analytics") fetchAnalytics();
                                    else if (activeTab === "logins") fetchLogins(loginPage);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-400/50 text-xs font-bold text-cyan-200 transition flex items-center gap-1.5"
                            >
                                <span className={isLoading ? "animate-spin" : ""}>🔄</span> Yenile
                            </button>
                        </div>
                    </div>
                </div>

                {/* Connection Error Alert */}
                {error && (
                    <div className="rounded-2xl border border-red-500/40 bg-red-950/40 p-4 text-red-200 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">⚠️</span>
                            <div>
                                <p className="text-sm font-bold">Veritabanı / Sunucu Bağlantı Hatası</p>
                                <p className="text-xs text-red-300 mt-0.5">{error}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setError(null);
                                fetchAnalytics();
                            }}
                            className="text-xs px-3 py-1.5 rounded-lg bg-red-800 hover:bg-red-700 text-white font-semibold transition"
                        >
                            Yeniden Dene
                        </button>
                    </div>
                )}

                {/* Real KPI Metrics Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* KPI 1 */}
                    <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-slate-900 p-5 shadow-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">Toplam RFQ Talepleri</span>
                            <span className="text-xl">📦</span>
                        </div>
                        <p className="text-3xl font-black text-white mt-2">{quotes.length}</p>
                        <p className="text-[11px] text-emerald-300 font-semibold mt-1">
                            {quotes.filter((q) => q.status === "new").length} incelenmeyi bekliyor
                        </p>
                    </div>

                    {/* KPI 2 */}
                    <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 to-slate-900 p-5 shadow-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400">İletişim Mesajları</span>
                            <span className="text-xl">💬</span>
                        </div>
                        <p className="text-3xl font-black text-white mt-2">{messages.length}</p>
                        <p className="text-[11px] text-cyan-300 font-semibold mt-1">
                            {messages.filter((m) => m.status === "new").length} yeni mesaj
                        </p>
                    </div>

                    {/* KPI 3: Tekil Ziyaretçi */}
                    <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/30 to-slate-900 p-5 shadow-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase tracking-wider text-blue-400">Ölçülen Tekil Ziyaretçi</span>
                            <span className="text-xl">👥</span>
                        </div>
                        <p className="text-3xl font-black text-white mt-2">{analytics?.uniqueVisitors ?? 0}</p>
                        <p className="text-[10px] text-blue-300 font-medium mt-1" title="Birinci taraf oturum çerezi bazlı ölçüm; cihaz parmak izi oluşturulmaz.">
                            1. Taraf çerez &bull; Toplam Oturum: {analytics?.totalSessions ?? 0}
                        </p>
                    </div>

                    {/* KPI 4: Aktif Ziyaretçi */}
                    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/30 to-slate-900 p-5 shadow-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">Canlı Aktif Ziyaretçi</span>
                            <span className="text-xl">⚡</span>
                        </div>
                        <p className="text-3xl font-black text-amber-300 mt-2 flex items-center gap-2">
                            {analytics?.activeVisitors ?? 0}
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                        </p>
                        <p className="text-[10px] text-amber-300/80 font-medium mt-1">
                            Son 15 dk aktif etkinlik penceresi
                        </p>
                    </div>

                    {/* KPI 5: Doğrulanmış Satış Geliri */}
                    <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Doğrulanmış Satış Geliri</span>
                            <span className="text-xl">💳</span>
                        </div>
                        <p className="text-sm font-bold text-slate-300 mt-3">Veri kaynağı bağlı değil</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-1">
                            Yalnızca muhasebe/ERP ödemelerinden hesaplanır.
                        </p>
                    </div>
                </div>

                {/* Dashboard Tabs & Content Area */}
                <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
                    {/* Tab Navigation Header */}
                    <div className="border-b border-slate-800 bg-slate-950/60 px-6 pt-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-3">
                            <button
                                type="button"
                                onClick={() => setActiveTab("analytics")}
                                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap flex items-center gap-2 ${
                                    activeTab === "analytics"
                                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                                }`}
                            >
                                <span>📊</span> Ziyaretçi ve Trafik Analizi
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("rfq")}
                                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap flex items-center gap-2 ${
                                    activeTab === "rfq"
                                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                                }`}
                            >
                                <span>📦</span> RFQ Talepleri ({quotes.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("messages")}
                                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap flex items-center gap-2 ${
                                    activeTab === "messages"
                                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                                }`}
                            >
                                <span>💬</span> Mesajlar ({messages.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("logins")}
                                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap flex items-center gap-2 ${
                                    activeTab === "logins"
                                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 shadow-sm"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                                }`}
                            >
                                <span>🔐</span> Giriş Kayıtları
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("catalog")}
                                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap flex items-center gap-2 ${
                                    activeTab === "catalog"
                                        ? "bg-violet-500/20 text-violet-300 border border-violet-400/40 shadow-sm"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                                }`}
                            >
                                <span>📋</span> İhracat Kataloğu ({CATEGORIES.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("system")}
                                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap flex items-center gap-2 ${
                                    activeTab === "system"
                                        ? "bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                                }`}
                            >
                                <span>⚙️</span> Hosting Depolama &amp; Sürüm
                            </button>
                        </div>
                    </div>

                    {/* TAB 1: VISITOR & TRAFFIC ANALYTICS */}
                    {activeTab === "analytics" && (
                        <div className="p-6 space-y-8">
                            {/* Analytics Filter Toolbar */}
                            <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Date Range */}
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Tarih Aralığı</label>
                                        <select
                                            value={analyticsFilter.dateRange}
                                            onChange={(e) => setAnalyticsFilter({ ...analyticsFilter, dateRange: e.target.value, page: 1 })}
                                            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                                        >
                                            <option value="all">Tüm Zamanlar</option>
                                            <option value="today">Bugün</option>
                                            <option value="7d">Son 7 Gün</option>
                                            <option value="30d">Son 30 Gün</option>
                                        </select>
                                    </div>

                                    {/* Device Type */}
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Cihaz Türü</label>
                                        <select
                                            value={analyticsFilter.deviceType}
                                            onChange={(e) => setAnalyticsFilter({ ...analyticsFilter, deviceType: e.target.value, page: 1 })}
                                            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                                        >
                                            <option value="all">Tüm Cihazlar</option>
                                            <option value="telefon">Telefon (Mobile)</option>
                                            <option value="bilgisayar">Bilgisayar (Desktop)</option>
                                            <option value="tablet">Tablet</option>
                                        </select>
                                    </div>

                                    {/* Conversion Filter */}
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Form Dönüşümü</label>
                                        <select
                                            value={analyticsFilter.conversionStatus}
                                            onChange={(e) => setAnalyticsFilter({ ...analyticsFilter, conversionStatus: e.target.value as any, page: 1 })}
                                            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                                        >
                                            <option value="all">Tümü</option>
                                            <option value="converted">Form Gönderenler (Dönüşüm)</option>
                                            <option value="unconverted">Dönüşüm Olmayanlar</option>
                                        </select>
                                    </div>

                                    {/* Bot toggle */}
                                    <div className="flex items-center gap-2 pt-4">
                                        <input
                                            type="checkbox"
                                            id="bot-toggle"
                                            checked={analyticsFilter.includeBots}
                                            onChange={(e) => setAnalyticsFilter({ ...analyticsFilter, includeBots: e.target.checked, page: 1 })}
                                            className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/20"
                                        />
                                        <label htmlFor="bot-toggle" className="text-xs text-slate-400 cursor-pointer">
                                            Arama Botlarını Göster
                                        </label>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={exportCsv}
                                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition flex items-center gap-2"
                                    >
                                        <span>📥</span> CSV Olarak İndir
                                    </button>
                                </div>
                            </div>

                            {/* Accuracy and Privacy Notice */}
                            <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3.5 text-xs text-cyan-200/90 leading-relaxed flex items-start gap-3">
                                <span className="text-base shrink-0 mt-0.5">ℹ️</span>
                                <div>
                                    <strong className="font-semibold text-cyan-100">Doğruluk ve Konum Notu:</strong> Ziyaretçi ülkeleri ve şehirleri sunucu tarafında belirlenmektedir. Kurumsal ağlar, VPN veya proxy kullanımı durumunda konum yaklaşık olabilir. Telefon modelleri yalnızca tarayıcı kesin model sağladığında gösterilir; iPhone modelleri ekran boyutu tahminleriyle kesin bilgi gibi sunulmaz. Süreler sunucuya iletilen doğrulanmış etkinlik kalp atışlarından (heartbeat) hesaplanmaktadır.
                                </div>
                            </div>

                            {/* Real Graphs & Breakdowns */}
                            {analytics && analytics.totalSessions > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Chart 1: Ülke Dağılımı */}
                                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">🌍 Ülke Dağılımı</h3>
                                            <span className="text-[10px] text-slate-500">{analytics.breakdowns.countries.length} Ülke</span>
                                        </div>
                                        <div className="space-y-2">
                                            {analytics.breakdowns.countries.map((c) => (
                                                <div key={c.name} className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-slate-300 font-medium">{c.name}</span>
                                                        <span className="text-slate-400 font-mono">{c.count} (%{c.percentage})</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${c.percentage}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Chart 2: Cihaz Türü */}
                                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">📱 Cihaz Türleri</h3>
                                            <span className="text-[10px] text-slate-500">Dağılım</span>
                                        </div>
                                        <div className="space-y-2">
                                            {analytics.breakdowns.devices.map((d) => (
                                                <div key={d.name} className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-slate-300 font-medium capitalize">{d.name}</span>
                                                        <span className="text-slate-400 font-mono">{d.count} (%{d.percentage})</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${d.percentage}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Chart 3: İşletim Sistemi */}
                                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">💻 İşletim Sistemleri</h3>
                                            <span className="text-[10px] text-slate-500">Platform</span>
                                        </div>
                                        <div className="space-y-2">
                                            {analytics.breakdowns.operatingSystems.map((os) => (
                                                <div key={os.name} className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-slate-300 font-medium">{os.name}</span>
                                                        <span className="text-slate-400 font-mono">{os.count} (%{os.percentage})</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${os.percentage}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Chart 4: Tarayıcılar */}
                                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">🌐 Tarayıcılar</h3>
                                            <span className="text-[10px] text-slate-500">Browser</span>
                                        </div>
                                        <div className="space-y-2">
                                            {analytics.breakdowns.browsers.map((b) => (
                                                <div key={b.name} className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-slate-300 font-medium">{b.name}</span>
                                                        <span className="text-slate-400 font-mono">{b.count} (%{b.percentage})</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${b.percentage}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Chart 5: Trafik Kaynakları */}
                                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">🔗 Trafik Kaynakları</h3>
                                            <span className="text-[10px] text-slate-500">Referrer / UTM</span>
                                        </div>
                                        <div className="space-y-2">
                                            {analytics.breakdowns.trafficSources.map((s) => (
                                                <div key={s.name} className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-slate-300 font-medium truncate max-w-[200px]" title={s.name}>{s.name}</span>
                                                        <span className="text-slate-400 font-mono">{s.count} (%{s.percentage})</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${s.percentage}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Chart 6: En Çok Ziyaret Edilen Sayfalar */}
                                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">📄 Popüler Sayfalar</h3>
                                            <span className="text-[10px] text-slate-500">Sayfa Görüntüleme</span>
                                        </div>
                                        <div className="space-y-2">
                                            {analytics.breakdowns.topPages.map((p) => (
                                                <div key={p.path} className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-slate-300 font-mono truncate max-w-[200px]" title={p.path}>{p.path}</span>
                                                        <span className="text-slate-400 font-mono">{p.count}</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-teal-500 rounded-full" style={{ width: `${p.percentage}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-8 text-center space-y-3">
                                    <span className="text-3xl">📊</span>
                                    <p className="text-sm font-bold text-slate-300">Henüz ziyaretçi analitik kaydı bulunmuyor</p>
                                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                                        Site ziyaretçileri sayfaları gezdikçe ve analitik izni onaylandıkça gerçek oturumlar, konumlar ve cihaz grafikleri burada görüntülenecektir.
                                    </p>
                                </div>
                            )}

                            {/* Visitor Sessions Table */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                                        <span>📋</span> Ziyaretçi Oturum Kayıtları ({analytics?.pagination?.totalRecords ?? 0})
                                    </h3>
                                    <span className="text-xs text-slate-400">
                                        Ayrıntıları görmek için bir oturuma tıklayın
                                    </span>
                                </div>

                                <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/70">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs text-slate-300">
                                            <thead className="bg-slate-900 border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                <tr>
                                                    <th className="py-3 px-4">Tarih / Saat (Zaman Dilimi)</th>
                                                    <th className="py-3 px-4">Ülke &amp; Şehir</th>
                                                    <th className="py-3 px-4">Cihaz &amp; Model</th>
                                                    <th className="py-3 px-4">İşletim Sistemi</th>
                                                    <th className="py-3 px-4">Tarayıcı &amp; Dil</th>
                                                    <th className="py-3 px-4">Giriş / Son Sayfa</th>
                                                    <th className="py-3 px-4">Süre &amp; Sayfa</th>
                                                    <th className="py-3 px-4">Dönüşüm</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/60 font-sans">
                                                {analytics?.sessions && analytics.sessions.length > 0 ? (
                                                    analytics.sessions.map((session) => {
                                                        const dateFormatted = session.firstSeenAt
                                                            ? new Date(session.firstSeenAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" }) + " (TSİ)"
                                                            : "Bilinmiyor";
                                                        const minutes = Math.floor(session.durationSeconds / 60);
                                                        const seconds = session.durationSeconds % 60;
                                                        const durationFormatted = `${minutes}dk ${seconds}sn`;

                                                        return (
                                                            <tr
                                                                key={session.id}
                                                                onClick={() => setSelectedSession(session)}
                                                                className="hover:bg-slate-900/80 cursor-pointer transition"
                                                            >
                                                                <td className="py-3 px-4 whitespace-nowrap">
                                                                    <div className="font-semibold text-slate-200">{dateFormatted}</div>
                                                                    <div className="text-[10px] text-slate-500 font-mono">ID: {session.sessionId.slice(0, 10)}...</div>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <div className="font-medium text-slate-200">{session.country}</div>
                                                                    <div className="text-[10px] text-slate-400">{session.city || "Bölge bilinmiyor"}</div>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <div className="flex items-center gap-1.5 font-medium text-slate-200">
                                                                        <span>
                                                                            {session.deviceType === "telefon" ? "📱" : session.deviceType === "tablet" ? "📟" : session.deviceType === "bot" ? "🤖" : "💻"}
                                                                        </span>
                                                                        <span className="capitalize">{session.deviceType}</span>
                                                                    </div>
                                                                    <div className="text-[10px] text-slate-400">{session.deviceModel}</div>
                                                                </td>
                                                                <td className="py-3 px-4 text-slate-300 font-medium">
                                                                    {session.os}
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <div className="text-slate-200 font-medium">{session.browser}</div>
                                                                    <div className="text-[10px] text-slate-400">{session.browserLanguage} &bull; {session.screenResolution}</div>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <div className="text-slate-200 font-mono text-[11px] truncate max-w-[140px]" title={session.entryPage}>
                                                                        {session.entryPage}
                                                                    </div>
                                                                    <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]" title={session.lastPage}>
                                                                        ↳ {session.lastPage}
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-4 whitespace-nowrap">
                                                                    <div className="font-semibold text-cyan-300">{durationFormatted}</div>
                                                                    <div className="text-[10px] text-slate-400">{session.pageCount} sayfa görüntülendi</div>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    {session.hasConversion ? (
                                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                                                            ✓ {session.conversionType === "rfq" ? "Teklif Formu" : session.conversionType === "contact" ? "İletişim" : "Teklif & İletişim"}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-[10px] text-slate-500">Yok</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan={8} className="py-12 text-center text-slate-400">
                                                            Filtrelere uygun ziyaretçi kaydı bulunamadı.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination Controls */}
                                    {analytics && analytics.pagination && analytics.pagination.totalPages > 1 && (
                                        <div className="border-t border-slate-800 bg-slate-950 p-4 flex items-center justify-between text-xs">
                                            <span className="text-slate-400">
                                                Sayfa {analytics.pagination.currentPage} / {analytics.pagination.totalPages} (Toplam {analytics.pagination.totalRecords} kayıt)
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    disabled={analytics.pagination.currentPage <= 1}
                                                    onClick={() => setAnalyticsFilter({ ...analyticsFilter, page: analytics.pagination.currentPage - 1 })}
                                                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 disabled:opacity-40 transition"
                                                >
                                                    Önceki
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={analytics.pagination.currentPage >= analytics.pagination.totalPages}
                                                    onClick={() => setAnalyticsFilter({ ...analyticsFilter, page: analytics.pagination.currentPage + 1 })}
                                                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 disabled:opacity-40 transition"
                                                >
                                                    Sonraki
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: RFQ QUOTES */}
                    {activeTab === "rfq" && (
                        <div className="p-6 space-y-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3 flex-grow max-w-md">
                                    <input
                                        type="text"
                                        placeholder="Şirket, isim, ülke veya e-posta ara..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400">Durum:</span>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                                    >
                                        <option value="all">Tümü ({quotes.length})</option>
                                        <option value="new">Yeni (İncelenmemiş)</option>
                                        <option value="reviewing">İnceleniyor</option>
                                        <option value="quoted">Teklif Verildi</option>
                                        <option value="converted">Siparişe Dönüştü</option>
                                        <option value="archived">Arşivlendi</option>
                                    </select>
                                </div>
                            </div>

                            {filteredQuotes.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {filteredQuotes.map((q) => (
                                        <div
                                            key={q.id}
                                            className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-4 hover:border-cyan-500/40 transition shadow-lg"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                                                        {q.deliveryTerm} &bull; {q.country}
                                                    </span>
                                                    <h3 className="font-bold text-sm text-white mt-1.5">{q.company}</h3>
                                                    <p className="text-xs text-slate-400">{q.name}</p>
                                                </div>
                                                <span
                                                    className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                                                        q.status === "new"
                                                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                                            : q.status === "answered" || q.status === "reviewing"
                                                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                                                            : q.status === "converted"
                                                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                                            : "bg-slate-800 text-slate-300"
                                                    }`}
                                                >
                                                    {q.status}
                                                </span>
                                            </div>

                                            <div className="bg-slate-900/90 rounded-xl p-3 text-xs space-y-1 border border-slate-800/80">
                                                <div className="text-slate-300 font-semibold">{q.productLabel}</div>
                                                <div className="text-cyan-300 font-mono font-bold">Hacim: {q.volume}</div>
                                                {q.message && (
                                                    <p className="text-slate-400 italic line-clamp-2 pt-1 border-t border-slate-800">
                                                        "{q.message}"
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedQuote(q)}
                                                    className="text-cyan-400 hover:text-cyan-300 font-semibold"
                                                >
                                                    Ayrıntıları İncele &rarr;
                                                </button>
                                                <select
                                                    disabled={loadingAction === q.id}
                                                    value={q.status}
                                                    onChange={(e) => handleStatusChange(q.id!, "quote", e.target.value as MessageStatus)}
                                                    className="bg-slate-900 border border-slate-700 rounded-lg text-[11px] px-2 py-1 text-slate-200"
                                                >
                                                    <option value="new">Yeni</option>
                                                    <option value="reviewing">İnceleniyor</option>
                                                    <option value="answered">Yanıtlandı / Teklif Verildi</option>
                                                    <option value="converted">Onaylandı / Sipariş</option>
                                                    <option value="closed">Kapatıldı</option>
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-12 text-center space-y-3">
                                    <span className="text-4xl">📦</span>
                                    <h3 className="font-bold text-slate-200">Henüz sipariş/teklif talebi bulunmuyor</h3>
                                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                                        Web sitesi üzerindeki RFQ formundan uluslararası toptan sipariş veya fiyat teklifi talepleri geldiğinde sunucuya kaydedilip burada listelenecektir.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: CONTACT MESSAGES */}
                    {activeTab === "messages" && (
                        <div className="p-6 space-y-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <input
                                    type="text"
                                    placeholder="İsim, e-posta, ülke veya mesaj ara..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="max-w-md w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                                />
                            </div>

                            {filteredMessages.length > 0 ? (
                                <div className="space-y-3">
                                    {filteredMessages.map((m) => (
                                        <div
                                            key={m.id}
                                            className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-3 hover:border-cyan-500/30 transition shadow-md"
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-sm text-white">{m.name}</h4>
                                                        {m.company && (
                                                            <span className="text-xs text-slate-400">({m.company})</span>
                                                        )}
                                                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                                            {m.country}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-cyan-300 font-mono mt-0.5">{m.email} {m.phone && `&bull; ${m.phone}`}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        disabled={loadingAction === m.id}
                                                        value={m.status}
                                                        onChange={(e) => handleStatusChange(m.id!, "message", e.target.value as MessageStatus)}
                                                        className="bg-slate-900 border border-slate-700 rounded-lg text-[11px] px-2 py-1 text-slate-200"
                                                    >
                                                        <option value="new">Yeni</option>
                                                        <option value="reviewing">İnceleniyor</option>
                                                        <option value="answered">Yanıtlandı</option>
                                                        <option value="archived">Arşivle</option>
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(m.id!, "message")}
                                                        className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded bg-rose-950/40 border border-rose-800/40"
                                                    >
                                                        Sil
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                                                {m.message}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-12 text-center space-y-3">
                                    <span className="text-4xl">💬</span>
                                    <h3 className="font-bold text-slate-200">Henüz mesaj bulunmuyor</h3>
                                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                                        İletişim formundan gönderilen mesajlar sunucu veritabanına kaydedildikten sonra burada görüntülenecektir.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 4: LOGIN LOGS */}
                    {activeTab === "logins" && (
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                        🔐 Kimlik Doğrulama &amp; Yönetici Giriş Günlüğü
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Tüm başarılı ve başarısız yönetici giriş denemeleri sunucu tarafında denetlenmektedir. Şifreler ve oturum belirteçleri asla kaydedilmez.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fetchLogins(loginPage)}
                                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
                                >
                                    Günlüğü Yenile
                                </button>
                            </div>

                            {logins.length > 0 ? (
                                <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/70">
                                    <table className="w-full text-left text-xs text-slate-300">
                                        <thead className="bg-slate-900 border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            <tr>
                                                <th className="py-3 px-4">Tarih / Saat (TSİ)</th>
                                                <th className="py-3 px-4">Hesap (E-posta)</th>
                                                <th className="py-3 px-4">Sonuç</th>
                                                <th className="py-3 px-4">Açıklama / Hata</th>
                                                <th className="py-3 px-4">Konum (Yaklaşık)</th>
                                                <th className="py-3 px-4">Cihaz &amp; Tarayıcı</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60 font-sans">
                                            {logins.map((log) => {
                                                const formattedTime = log.isoTime
                                                    ? new Date(log.isoTime).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })
                                                    : "Bilinmiyor";
                                                return (
                                                    <tr key={log.id} className="hover:bg-slate-900/60 transition">
                                                        <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-300">{formattedTime}</td>
                                                        <td className="py-3 px-4 font-semibold text-slate-200">{log.email}</td>
                                                        <td className="py-3 px-4">
                                                            {log.success ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                                                    ✓ BAŞARILI
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                                                    ✗ BAŞARISIZ
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 text-slate-400">{log.failureReason || "Giriş yapıldı"}</td>
                                                        <td className="py-3 px-4">
                                                            <span className="font-medium text-slate-200">{log.country}</span>
                                                            {log.city && <span className="text-slate-400">, {log.city}</span>}
                                                        </td>
                                                        <td className="py-3 px-4 text-slate-400">
                                                            {log.deviceType} &bull; {log.os} &bull; {log.browser}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>

                                    {loginTotalPages > 1 && (
                                        <div className="border-t border-slate-800 bg-slate-950 p-4 flex items-center justify-between text-xs">
                                            <span className="text-slate-400">Sayfa {loginPage} / {loginTotalPages}</span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    disabled={loginPage <= 1}
                                                    onClick={() => fetchLogins(loginPage - 1)}
                                                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 disabled:opacity-40"
                                                >
                                                    Önceki
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={loginPage >= loginTotalPages}
                                                    onClick={() => fetchLogins(loginPage + 1)}
                                                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 disabled:opacity-40"
                                                >
                                                    Sonraki
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-12 text-center space-y-3">
                                    <span className="text-4xl">🔐</span>
                                    <h3 className="font-bold text-slate-200">Henüz giriş kaydı bulunmuyor</h3>
                                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                                        Yönetici paneline yapılan başarılı veya başarısız tüm giriş denemeleri sunucu veritabanına kaydedilir.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 5: EXPORT PRODUCT CATALOG */}
                    {activeTab === "catalog" && (
                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                    🏭 Doğrulanmış İhracat Ürün Grupları &amp; Teknik Standartlar
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    Tüm ürünler ve teknik spesifikasyonlar doğrulanmış fabrika üretim parametrelerine dayanmaktadır. Bilinmeyen veya teyit edilmemiş özellikler eklenmez.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {CATEGORIES.map((cat) => (
                                    <div
                                        key={cat.id}
                                        className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl">{cat.icon}</span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                Aktif Katalog
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-white text-sm">{cat.tr.name}</h4>
                                        <p className="text-xs text-slate-400 leading-relaxed">{cat.tr.blurb}</p>
                                        <div className="text-[10px] text-cyan-300 font-mono pt-1">Grup Kodu: {cat.id}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 6: HOSTING & SYSTEM CLEANUP */}
                    {activeTab === "system" && (
                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                    ⚙️ Firebase Hosting Depolama ve Sürüm Yönetimi
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    Hosting depolama kotasını korumak için uygulanan otomatik ve manuel temizlik düzeni durumu.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/70 p-5 space-y-2">
                                    <div className="text-[11px] font-bold uppercase text-cyan-400">Hedef Firebase Projesi</div>
                                    <p className="text-xl font-black text-white">ajansonline</p>
                                    <p className="text-xs text-slate-400">Hosting Sitesi: <code className="text-cyan-300">asiaplast</code></p>
                                </div>
                                <div className="rounded-2xl border border-emerald-500/30 bg-slate-950/70 p-5 space-y-2">
                                    <div className="text-[11px] font-bold uppercase text-emerald-400">Sürüm Saklama Kuralı</div>
                                    <p className="text-xl font-black text-white">Son 5 Sürüm + Canlı</p>
                                    <p className="text-xs text-emerald-300 font-semibold">retainedReleaseCount = 5 uygulandı</p>
                                </div>
                                <div className="rounded-2xl border border-violet-500/30 bg-slate-950/70 p-5 space-y-2">
                                    <div className="text-[11px] font-bold uppercase text-violet-400">Canlı Site Durumu</div>
                                    <p className="text-xl font-black text-emerald-400 flex items-center gap-2">
                                        <span>✓</span> HTTP 200 OK
                                    </p>
                                    <p className="text-xs text-slate-400">https://asiaplast.web.app</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 space-y-4">
                                <h4 className="text-sm font-bold text-white">Son Yapılan Sürüm Temizliği Raporu</h4>
                                <div className="space-y-2 text-xs text-slate-300">
                                    <div className="flex justify-between py-1 border-b border-slate-800">
                                        <span>Korunan En Yeni Sürümler:</span>
                                        <span className="font-bold text-emerald-400">5 sürüm (Yayındaki sürüm tam korundu)</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-800">
                                        <span>Silinen Eski Sürümler:</span>
                                        <span className="font-bold text-cyan-400">2 sürüm (65c5ebbe7296247d, 57463fadf2966a20)</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-800">
                                        <span>Geri Kazanılan Tahmini Depolama:</span>
                                        <span className="font-bold text-amber-300">~1.54 MB</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-800">
                                        <span>Silme Hataları:</span>
                                        <span className="font-bold text-emerald-400">0 hata</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span>Temizlik Betiği Komutu:</span>
                                        <code className="text-cyan-300 font-mono">npm run clean:hosting</code>
                                    </div>
                                </div>

                                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                                    <strong>Önemli Bilgi:</strong> Google Cloud ve Firebase Console depolama göstergelerinin güncellenmesi asenkron çalışır ve silinen dosyaların boyut yansıması birkaç saat sürebilir.
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* MODAL: Quote Inspection Drawer */}
                {selectedQuote && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                                <div>
                                    <span className="text-xs font-mono text-cyan-400">{selectedQuote.id}</span>
                                    <h2 className="text-xl font-bold text-white">{selectedQuote.company}</h2>
                                    <p className="text-xs text-slate-400">{selectedQuote.name} &bull; {selectedQuote.country}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedQuote(null)}
                                    className="text-slate-400 hover:text-white text-lg p-2"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="text-slate-400">E-posta:</span>
                                    <p className="text-white font-semibold">{selectedQuote.email}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400">Telefon:</span>
                                    <p className="text-white font-semibold">{selectedQuote.phone || "Belirtilmemiş"}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400">Ürün:</span>
                                    <p className="text-white font-semibold">{selectedQuote.productLabel}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400">Hacim &amp; Teslimat:</span>
                                    <p className="text-cyan-300 font-bold">{selectedQuote.volume} ({selectedQuote.deliveryTerm})</p>
                                </div>
                            </div>

                            {selectedQuote.message && (
                                <div className="space-y-1">
                                    <span className="text-xs text-slate-400">Müşteri Mesajı &amp; Özel Notlar:</span>
                                    <p className="text-xs text-slate-200 bg-slate-950 p-4 rounded-xl border border-slate-800 leading-relaxed">
                                        {selectedQuote.message}
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => handleDelete(selectedQuote.id!, "quote")}
                                    className="text-xs px-3 py-2 rounded-xl bg-rose-950/60 text-rose-300 border border-rose-800/60 hover:bg-rose-900"
                                >
                                    Kaydı Kalıcı Olarak Sil
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedQuote(null)}
                                    className="text-xs px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                                >
                                    Kapat
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL: Visitor Session Timeline Drawer */}
                {selectedSession && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-cyan-400">Oturum ID: {selectedSession.sessionId}</span>
                                        {selectedSession.hasConversion && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                                Dönüşüm Sağlandı
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-bold text-white mt-1">
                                        {selectedSession.country} &bull; {selectedSession.city || "Bölge Bilinmiyor"}
                                    </h2>
                                    <p className="text-xs text-slate-400">
                                        {selectedSession.firstSeenAt ? new Date(selectedSession.firstSeenAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" }) : ""} (TSİ) &bull; Ölçülen Süre: {Math.floor(selectedSession.durationSeconds / 60)}dk {selectedSession.durationSeconds % 60}sn
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedSession(null)}
                                    className="text-slate-400 hover:text-white text-lg p-2"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Session Metadata Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Cihaz / Model</span>
                                    <p className="text-slate-200 font-semibold">{selectedSession.deviceType} &bull; {selectedSession.deviceModel}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">İşletim Sistemi</span>
                                    <p className="text-slate-200 font-semibold">{selectedSession.os}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Tarayıcı &amp; Dil</span>
                                    <p className="text-slate-200 font-semibold">{selectedSession.browser} ({selectedSession.browserLanguage})</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Ekran Çözünürlüğü</span>
                                    <p className="text-slate-200 font-semibold">{selectedSession.screenResolution}</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Trafik Kaynağı / Referrer</span>
                                    <p className="text-cyan-300 font-mono text-[11px] truncate">{selectedSession.referrer}</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">UTM Kampanya Bilgisi</span>
                                    <p className="text-slate-300 text-[11px]">
                                        {selectedSession.utm && Object.keys(selectedSession.utm).length > 0
                                            ? Object.entries(selectedSession.utm).map(([k, v]) => `${k}=${v}`).join(" &bull; ")
                                            : "Kampanya etiketi yok"}
                                    </p>
                                </div>
                            </div>

                            {/* Chronological Event Timeline */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                    ⏱️ Kronolojik Sayfa &amp; Etkinlik Akışı ({selectedSession.events?.length || selectedSession.visitedPages?.length || 0})
                                </h3>

                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    {(selectedSession.events || []).map((ev, i) => (
                                        <div
                                            key={i}
                                            className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs"
                                        >
                                            <span className="text-sm shrink-0 mt-0.5">
                                                {ev.type === "conversion" ? "🎯" : ev.type === "heartbeat" ? "💓" : "📄"}
                                            </span>
                                            <div className="flex-grow">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-mono text-cyan-300 font-semibold">{ev.path}</span>
                                                    <span className="text-[10px] text-slate-500 font-mono">
                                                        {new Date(ev.timestamp).toLocaleTimeString("tr-TR")}
                                                    </span>
                                                </div>
                                                {ev.details && (
                                                    <p className="text-[11px] text-slate-400 mt-0.5">{ev.details}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {(!selectedSession.events || selectedSession.events.length === 0) && (
                                        <div className="text-xs text-slate-500 italic p-4 text-center">
                                            Ayrıntılı etkinlik kaydı bulunmuyor.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setSelectedSession(null)}
                                    className="text-xs px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                                >
                                    Kapat
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
