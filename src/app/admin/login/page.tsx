"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };

            if (!res.ok || !data.ok) {
                setError(data.error || "Invalid operator credentials");
                setLoading(false);
                return;
            }

            // Redirect to dashboard on successful login
            window.location.href = "/admin";
        } catch {
            setError("Connection failure. Please check network.");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950 text-white">
            {/* Ambient gradients */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-md w-full relative z-10">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 group mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                            <span className="font-display font-extrabold text-2xl">A</span>
                        </div>
                        <div className="text-left">
                            <span className="text-2xl font-black tracking-tight text-white flex items-center">
                                ASIA<span className="text-brand-green">PLAST</span>
                            </span>
                            <span className="block text-[10px] font-bold tracking-widest text-cyan-300 uppercase">
                                Central Command Portal
                            </span>
                        </div>
                    </Link>

                    <h1 className="text-xl font-black text-white mt-2">Operator Security Clearance</h1>
                    <p className="text-xs text-slate-400 mt-1">Authorized personnel only &bull; Project: ajansonline</p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
                    {/* Zero-storage policy notice */}
                    <div className="mb-6 p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 text-[11px] text-cyan-200 flex items-start gap-2.5">
                        <span className="text-emerald-400 text-sm">🛡️</span>
                        <div>
                            <span className="font-bold text-white block mb-0.5">Strict Zero-Storage Policy</span>
                            <span>Session is signed server-side via HttpOnly cookie. No localStorage or browser-level token storage is utilized.</span>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-5 p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-rose-300 text-xs font-semibold flex items-center gap-2">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                Operator Email
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@asiaplast.com"
                                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                Security Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Verifying Access…</span>
                                </>
                            ) : (
                                <span>Authenticate &amp; Open Desk</span>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-slate-800 text-center">
                        <Link href="/" className="text-xs text-slate-400 hover:text-cyan-300 transition-colors">
                            ← Return to AsiaPlast Public Website
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
