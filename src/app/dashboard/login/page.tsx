"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function DashboardLoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<"login" | "bootstrap">("login");
    const [canBootstrap, setCanBootstrap] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [bootstrapToken, setBootstrapToken] = useState("");
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let active = true;
        fetch("/api/admin/bootstrap", { cache: "no-store" })
            .then((r) => r.json())
            .then((data: { canBootstrap?: boolean }) => {
                if (active && data.canBootstrap) {
                    setCanBootstrap(true);
                }
            })
            .catch(() => {
                // Ignore
            });
        return () => {
            active = false;
        };
    }, []);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        setLoading(true);
        try {
            if (mode === "bootstrap") {
                const res = await fetch("/api/admin/bootstrap", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email,
                        password,
                        displayName,
                        bootstrapToken
                    })
                });
                const data = (await res.json().catch(() => ({}))) as {
                    ok?: boolean;
                    error?: string;
                };
                if (!res.ok || !data.ok) {
                    setError(data.error || "Yönetici hesabı oluşturulamadı.");
                    return;
                }
                setSuccessMsg("İlk yönetici hesabı başarıyla oluşturuldu. Şimdi giriş yapabilirsiniz.");
                setCanBootstrap(false);
                setMode("login");
                setPassword("");
                return;
            }

            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = (await res.json().catch(() => ({}))) as {
                ok?: boolean;
                error?: string;
            };
            if (!res.ok || !data.ok) {
                setError(data.error || "Kimlik doğrulama başarısız oldu.");
                return;
            }
            router.replace("/dashboard");
            router.refresh();
        } catch {
            setError("Sunucu bağlantısı kurulamadı. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-12 text-slate-900">
            <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-white p-8 shadow-2xl">
                <div className="flex items-center justify-between">
                    <div>
                        <Image
                            src="/images/logo.png"
                            alt="ASIAPLAST"
                            width={160}
                            height={42}
                            priority
                            className="h-8 w-auto object-contain"
                        />
                        <span className="block mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Yönetim Paneli (/dashboard)
                        </span>
                    </div>
                    <Link
                        href="/"
                        className="text-xs font-semibold text-slate-500 hover:text-brand-green transition"
                    >
                        &larr; Siteye Dön
                    </Link>
                </div>

                <h1 className="mt-6 font-display text-2xl font-bold text-brand-navy">
                    {mode === "bootstrap" ? "İlk Yönetici Hesabı Kurulumu" : "Yönetici Girişi"}
                </h1>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {mode === "bootstrap"
                        ? "Sistemde tanımlı yönetici bulunmadığında sunucu kurulum anahtarı (ADMIN_BOOTSTRAP_TOKEN) ile ilk yönetici hesabını oluşturabilirsiniz."
                        : "Firebase Authentication ve sunucu tarafı yetki doğrulaması (RBAC) ile korunmaktadır. Tüm giriş denemeleri kayıt altına alınır."}
                </p>

                {canBootstrap && (
                    <div className="mt-4 flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => {
                                setMode("login");
                                setError("");
                            }}
                            className={`flex-1 rounded-lg py-2 transition ${
                                mode === "login"
                                    ? "bg-white text-brand-navy shadow-xs"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            Yönetici Girişi
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMode("bootstrap");
                                setError("");
                            }}
                            className={`flex-1 rounded-lg py-2 transition ${
                                mode === "bootstrap"
                                    ? "bg-white text-brand-navy shadow-xs"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            İlk Hesap Kurulumu
                        </button>
                    </div>
                )}

                {error && (
                    <div
                        className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div
                        className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800"
                        role="status"
                    >
                        {successMsg}
                    </div>
                )}

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                    {mode === "bootstrap" && (
                        <>
                            <div>
                                <label className="label" htmlFor="adm-name">
                                    Ad Soyad / Ünvan
                                </label>
                                <input
                                    id="adm-name"
                                    type="text"
                                    className="input"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="ASIAPLAST Yönetici"
                                    required
                                />
                            </div>
                            <div>
                                <label className="label" htmlFor="adm-token">
                                    Sunucu Kurulum Anahtarı (ADMIN_BOOTSTRAP_TOKEN)
                                </label>
                                <input
                                    id="adm-token"
                                    type="password"
                                    className="input font-mono"
                                    value={bootstrapToken}
                                    onChange={(e) => setBootstrapToken(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="label" htmlFor="adm-email">
                            Yönetici E-posta Adresi
                        </label>
                        <input
                            id="adm-email"
                            type="email"
                            autoComplete="username"
                            required
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="export@asiaplastik.com.tr"
                        />
                    </div>

                    <div>
                        <label className="label" htmlFor="adm-pass">
                            Şifre
                        </label>
                        <input
                            id="adm-pass"
                            type="password"
                            autoComplete={mode === "bootstrap" ? "new-password" : "current-password"}
                            required
                            minLength={8}
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary w-full justify-center py-3"
                        disabled={loading}
                    >
                        {loading
                            ? "Doğrulanıyor..."
                            : mode === "bootstrap"
                            ? "Yönetici Hesabını Oluştur"
                            : "Güvenli Giriş Yap"}
                    </button>
                </form>

                <div className="mt-6 border-t border-slate-100 pt-4 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Firebase Auth + Sunucu RBAC</span>
                    <span>Sıfır Tarayıcı Depolama (HttpOnly Cookie)</span>
                </div>
            </div>
        </div>
    );
}
