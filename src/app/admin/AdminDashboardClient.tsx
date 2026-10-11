"use client";

import { useState } from "react";
import Link from "next/link";
import type { QuoteRequest, ContactMessage } from "@/lib/repo";
import type { MessageStatus } from "@/lib/config";
import { CATEGORIES } from "@/data/catalog";

type Props = {
    quotes: QuoteRequest[];
    messages: ContactMessage[];
    operatorEmail: string;
    operatorRole?: string;
};

export default function AdminDashboardClient({
    quotes: initialQuotes,
    messages: initialMessages,
    operatorEmail,
    operatorRole = "admin"
}: Props) {
    const [quotes, setQuotes] = useState<QuoteRequest[]>(initialQuotes);
    const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
    const [activeTab, setActiveTab] = useState<"rfq" | "messages" | "catalog" | "security">("rfq");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    // KPI Calculations
    const totalRfqs = quotes.length;
    const newRfqs = quotes.filter((q) => q.status === "new").length;
    const totalMsgs = messages.length;
    const newMsgs = messages.filter((m) => m.status === "new").length;

    const countries = Array.from(
        new Set([...quotes.map((q) => q.country), ...messages.map((m) => m.country)].filter(Boolean))
    );

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
        if (!confirm("Are you sure you want to permanently delete this record?")) return;
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

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
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
                                    ASIA<span className="text-brand-green">PLAST</span>
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[10px] font-black text-cyan-300">
                                    CENTRAL COMMAND
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-400">
                                Target: <code className="text-cyan-300">asiaplast</code> &bull; Project: <code className="text-amber-300">ajansonline</code>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Live Firestore Sync
                        </span>
                        {operatorRole === "superadmin" || operatorEmail === "cebrailkara@gmail.com" ? (
                            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-amber-300 font-bold bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30">
                                👑 SUPERADMIN &bull; {operatorEmail}
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
                            Open Public Site ↗
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="text-xs bg-red-950/80 hover:bg-red-900 text-rose-300 border border-red-700/60 px-3 py-1.5 rounded-lg transition"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Hero / Command Banner */}
                <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-brand-navy to-indigo-950 p-6 sm:p-8 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-cyan-400/40 text-[10px] font-black uppercase text-cyan-300 tracking-wider">
                                GLOBAL COMMERCE DESK
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 bg-gradient-to-r from-white via-cyan-200 to-emerald-200 bg-clip-text text-transparent">
                                Real-Time Wholesale RFQ &amp; Message Center
                            </h1>
                            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                                Process container-scale inquiries, update pricing statuses, and track inbound international distributor transmissions.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center gap-2">
                                <span>🛡️</span> Zero LocalStorage Enforced
                            </span>
                        </div>
                    </div>
                </div>

                {/* KPI Metrics Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* KPI 1 */}
                    <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-slate-900 p-5 shadow-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">Total RFQ Orders</span>
                            <span className="text-xl">📦</span>
                        </div>
                        <p className="text-3xl font-black text-white mt-2">{totalRfqs}</p>
                        <p className="text-[11px] text-emerald-300 font-semibold mt-1">
                            {newRfqs} pending review
                        </p>
                    </div>

                    {/* KPI 2 */}
                    <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 to-slate-900 p-5 shadow-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400">Inbound Messages</span>
                            <span className="text-xl">💬</span>
                        </div>
                        <p className="text-3xl font-black text-white mt-2">{totalMsgs}</p>
                        <p className="text-[11px] text-cyan-300 font-semibold mt-1">
                            {newMsgs} unread inquiries
                        </p>
                    </div>

                    {/* KPI 3 */}
                    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 to-slate-900 p-5 shadow-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">Target Jurisdictions</span>
                            <span className="text-xl">🌐</span>
                        </div>
                        <p className="text-3xl font-black text-white mt-2">{countries.length || 1}</p>
                        <p className="text-[11px] text-amber-300 font-semibold mt-1">
                            Active buying markets
                        </p>
                    </div>

                    {/* KPI 4 */}
                    <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 to-slate-900 p-5 shadow-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase tracking-wider text-violet-400">Storage Protocol</span>
                            <span className="text-xl">🔒</span>
                        </div>
                        <p className="text-lg font-black text-white mt-2">Zero-Storage</p>
                        <p className="text-[11px] text-violet-300 font-semibold mt-1">
                            Pure in-memory / Cookie auth
                        </p>
                    </div>
                </div>

                {/* Dashboard Tabs & Filter Toolbar */}
                <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
                    {/* Tab Navigation Header */}
                    <div className="border-b border-slate-800 bg-slate-950/60 px-6 pt-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex gap-2 sm:gap-6">
                            <button
                                onClick={() => setActiveTab("rfq")}
                                className={`pb-4 px-2 text-sm font-black border-b-2 transition flex items-center gap-2 ${
                                    activeTab === "rfq"
                                        ? "border-cyan-400 text-cyan-300"
                                        : "border-transparent text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                <span>📄</span> Wholesale RFQs ({quotes.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("messages")}
                                className={`pb-4 px-2 text-sm font-black border-b-2 transition flex items-center gap-2 ${
                                    activeTab === "messages"
                                        ? "border-cyan-400 text-cyan-300"
                                        : "border-transparent text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                <span>📬</span> Direct Inquiries ({messages.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("catalog")}
                                className={`pb-4 px-2 text-sm font-black border-b-2 transition flex items-center gap-2 ${
                                    activeTab === "catalog"
                                        ? "border-cyan-400 text-cyan-300"
                                        : "border-transparent text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                <span>🏷️</span> Product Catalog
                            </button>
                            <button
                                onClick={() => setActiveTab("security")}
                                className={`pb-4 px-2 text-sm font-black border-b-2 transition flex items-center gap-2 ${
                                    activeTab === "security"
                                        ? "border-cyan-400 text-cyan-300"
                                        : "border-transparent text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                <span>⚙️</span> Security &amp; Deployment
                            </button>
                        </div>

                        {/* Search & Filter Controls */}
                        {(activeTab === "rfq" || activeTab === "messages") && (
                            <div className="pb-3 flex items-center gap-3">
                                <input
                                    type="text"
                                    placeholder="Search country, company, name…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none"
                                />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 focus:border-cyan-400 focus:outline-none cursor-pointer"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="new">New</option>
                                    <option value="reviewing">Reviewing</option>
                                    <option value="answered">Answered / Quoted</option>
                                    <option value="converted">Converted</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* TAB 1: RFQ Pipeline */}
                    {activeTab === "rfq" && (
                        <div className="p-6">
                            {filteredQuotes.length === 0 ? (
                                <div className="text-center py-12 text-slate-500 text-xs">
                                    <p className="text-3xl mb-2">📋</p>
                                    <p>No RFQ submissions found matching current criteria.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                                    <table className="w-full text-left text-xs text-slate-300">
                                        <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                                            <tr>
                                                <th className="py-3.5 px-4">Customer &amp; Company</th>
                                                <th className="py-3.5 px-4">Destination</th>
                                                <th className="py-3.5 px-4">Product Category</th>
                                                <th className="py-3.5 px-4">Volume &amp; Term</th>
                                                <th className="py-3.5 px-4">Status</th>
                                                <th className="py-3.5 px-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800 font-medium">
                                            {filteredQuotes.map((q) => (
                                                <tr key={q.id || Math.random()} className="hover:bg-slate-800/40 transition">
                                                    <td className="py-3.5 px-4">
                                                        <div className="font-bold text-white">{q.name}</div>
                                                        <div className="text-slate-400 text-[11px]">{q.company} &bull; {q.email}</div>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <span className="px-2.5 py-1 rounded-md bg-slate-800 text-cyan-300 font-semibold text-[11px]">
                                                            {q.country}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <span className="text-white font-semibold">
                                                            {q.productLabel || q.categoryId}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <span className="font-mono text-emerald-300 font-bold">{q.volume}</span>
                                                        <span className="ml-2 text-slate-400 font-mono text-[11px]">({q.deliveryTerm})</span>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <select
                                                            disabled={loadingAction === q.id}
                                                            value={q.status}
                                                            onChange={(e) => handleStatusChange(q.id!, "quote", e.target.value as MessageStatus)}
                                                            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border transition cursor-pointer ${
                                                                q.status === "new"
                                                                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                                                                    : q.status === "reviewing"
                                                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                                                    : q.status === "converted"
                                                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                                                    : "bg-slate-800 text-slate-300 border-slate-700"
                                                            }`}
                                                        >
                                                            <option value="new">New</option>
                                                            <option value="reviewing">Reviewing</option>
                                                            <option value="answered">Answered</option>
                                                            <option value="converted">Converted</option>
                                                            <option value="closed">Closed</option>
                                                        </select>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right space-x-2">
                                                        <button
                                                            onClick={() => setSelectedQuote(q)}
                                                            className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-[11px] font-bold transition"
                                                        >
                                                            View Details
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(q.id!, "quote")}
                                                            disabled={loadingAction === q.id}
                                                            className="px-2 py-1 rounded-lg bg-red-950/70 text-rose-400 hover:bg-red-900/80 text-[11px] transition"
                                                        >
                                                            ✕
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: Inbound Messages */}
                    {activeTab === "messages" && (
                        <div className="p-6">
                            {filteredMessages.length === 0 ? (
                                <div className="text-center py-12 text-slate-500 text-xs">
                                    <p className="text-3xl mb-2">📬</p>
                                    <p>No direct messages recorded.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                                    <table className="w-full text-left text-xs text-slate-300">
                                        <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                                            <tr>
                                                <th className="py-3.5 px-4">Sender &amp; Country</th>
                                                <th className="py-3.5 px-4">Contact</th>
                                                <th className="py-3.5 px-4">Message Preview</th>
                                                <th className="py-3.5 px-4">Status</th>
                                                <th className="py-3.5 px-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800 font-medium">
                                            {filteredMessages.map((m) => (
                                                <tr key={m.id || Math.random()} className="hover:bg-slate-800/40 transition">
                                                    <td className="py-3.5 px-4">
                                                        <div className="font-bold text-white">{m.name}</div>
                                                        <div className="text-cyan-300 text-[11px]">{m.country}</div>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <div className="text-slate-300">{m.email}</div>
                                                        <div className="text-slate-500 text-[11px]">{m.phone || "No phone"}</div>
                                                    </td>
                                                    <td className="py-3.5 px-4 max-w-md">
                                                        <p className="line-clamp-2 text-slate-300 text-xs">{m.message}</p>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <select
                                                            disabled={loadingAction === m.id}
                                                            value={m.status}
                                                            onChange={(e) => handleStatusChange(m.id!, "message", e.target.value as MessageStatus)}
                                                            className="rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1 text-[11px] font-bold text-slate-200 cursor-pointer"
                                                        >
                                                            <option value="new">New</option>
                                                            <option value="reviewing">Reviewing</option>
                                                            <option value="answered">Answered</option>
                                                            <option value="converted">Converted</option>
                                                            <option value="closed">Closed</option>
                                                        </select>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right">
                                                        <button
                                                            onClick={() => handleDelete(m.id!, "message")}
                                                            disabled={loadingAction === m.id}
                                                            className="px-2.5 py-1 rounded-lg bg-red-950/70 text-rose-400 hover:bg-red-900/80 text-[11px] transition"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: Product Catalog */}
                    {activeTab === "catalog" && (
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white">Active Product Categories &amp; Extrusion Specifications</h3>
                                <span className="text-xs text-emerald-400">8 Master Categories Defined</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {CATEGORIES.map((cat) => (
                                    <div key={cat.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950/80 flex flex-col justify-between">
                                        <div>
                                            <span className="text-2xl">{cat.icon}</span>
                                            <h4 className="font-bold text-white text-sm mt-2">{cat.en.name}</h4>
                                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{cat.en.blurb}</p>
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                                            <span className="text-emerald-400 font-mono font-bold">Active in Catalog</span>
                                            <span className="text-slate-500 font-mono">{cat.id}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 4: Security & Deployment */}
                    {activeTab === "security" && (
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/80 space-y-3 font-mono text-xs">
                                    <h4 className="font-sans font-bold text-cyan-300 text-sm">Firebase Architecture Verification</h4>
                                    <div className="space-y-1.5 text-slate-300">
                                        <p>Project ID: <span className="text-emerald-400">ajansonline</span></p>
                                        <p>Hosting Site: <span className="text-emerald-400">asiaplast</span></p>
                                        <p>Hosting Domain: <span className="text-cyan-300">asiaplast.web.app</span></p>
                                        <p>Region: <span className="text-slate-400">europe-west1</span></p>
                                        <p>Firestore Rules: <span className="text-emerald-400">Admin SDK RBAC</span></p>
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl border border-emerald-500/30 bg-slate-950/80 space-y-3 font-mono text-xs">
                                    <h4 className="font-sans font-bold text-emerald-400 text-sm">Zero-Storage Policy Compliance</h4>
                                    <div className="space-y-1.5 text-slate-300">
                                        <p>localStorage: <span className="text-rose-400 font-black">DISABLED (Strict Rule)</span></p>
                                        <p>sessionStorage: <span className="text-rose-400 font-black">DISABLED</span></p>
                                        <p>IndexedDB: <span className="text-rose-400 font-black">DISABLED</span></p>
                                        <p>Session Cookie: <span className="text-emerald-300 font-bold">__session (Firebase Compatible, HttpOnly, Secure)</span></p>
                                        <p>Signature Alg: <span className="text-slate-400">HMAC-SHA256</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Quote Details Modal */}
            {selectedQuote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="rounded-3xl border border-cyan-500/40 bg-slate-900 p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                            <div>
                                <span className="chip !bg-emerald-500/20 !text-emerald-300 !border-emerald-500/40">
                                    Wholesale Inquiry
                                </span>
                                <h3 className="text-lg font-bold text-white mt-1">
                                    {selectedQuote.company || selectedQuote.name}
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedQuote(null)}
                                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 grid place-items-center text-slate-300"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="py-4 space-y-3 text-xs text-slate-300">
                            <div className="grid grid-cols-2 gap-2">
                                <div><span className="text-slate-500">Contact:</span> <p className="font-bold text-white">{selectedQuote.name}</p></div>
                                <div><span className="text-slate-500">Email:</span> <p className="font-bold text-cyan-300">{selectedQuote.email}</p></div>
                                <div><span className="text-slate-500">Country:</span> <p className="font-bold text-white">{selectedQuote.country}</p></div>
                                <div><span className="text-slate-500">Phone:</span> <p className="font-bold text-white">{selectedQuote.phone || "N/A"}</p></div>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                                <span className="text-slate-500 block mb-1">Product &amp; Container Specification:</span>
                                <p className="font-semibold text-white">{selectedQuote.productLabel || selectedQuote.categoryId}</p>
                                <p className="text-emerald-400 font-mono mt-1">Volume: {selectedQuote.volume} &bull; Term: {selectedQuote.deliveryTerm}</p>
                            </div>

                            {selectedQuote.message && (
                                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                                    <span className="text-slate-500 block mb-1">Custom Notes / Specs:</span>
                                    <p className="text-slate-200">{selectedQuote.message}</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedQuote(null)}
                                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
                            >
                                Close
                            </button>
                            <a
                                href={`mailto:${selectedQuote.email}?subject=AsiaPlast Quotation — ${selectedQuote.productLabel || selectedQuote.categoryId}`}
                                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-xs font-black text-white shadow-md hover:scale-105 transition"
                            >
                                Reply via Email ✉️
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
