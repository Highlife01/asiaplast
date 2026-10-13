"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LOCALE_META, ACTIVE_LOCALES, isLocale, type Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/seo";

type NavItem = { sub: string; label: string; exact?: boolean };

export default function Header({
    locale,
    labels,
    cta
}: {
    locale: Locale;
    labels: { nav: Record<string, string>; language: string };
    cta: string;
}) {
    const pathname = usePathname() || "/";
    const [open, setOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);

    const nav: NavItem[] = [
        { sub: "", label: labels.nav.home, exact: true },
        { sub: "/products", label: labels.nav.products },
        { sub: "/about", label: labels.nav.about },
        { sub: "/export", label: labels.nav.export },
        { sub: "/private-label", label: labels.nav.privateLabel },
        { sub: "/knowledge", label: labels.nav.knowledge },
        { sub: "/contact", label: labels.nav.contact }
    ];

    const hrefFor = (target: Locale, sub = "") => localePath(target, sub || "/");

    // Strip the current locale prefix to get the neutral subpath.
    const segments = pathname.split("/").filter(Boolean);
    const hasLocale = segments.length > 0 && isLocale(segments[0]);
    const neutral = hasLocale ? `/${segments.slice(1).join("/")}` : pathname;
    const cleanNeutral = neutral === "/" ? "" : neutral;

    const isActive = (item: NavItem) => {
        const full = hrefFor(locale, item.sub);
        return item.exact ? pathname === full : pathname === full || pathname.startsWith(`${full}/`);
    };

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 text-slate-800 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 shadow-xs transition-all duration-300">
            <div className="container-x flex h-16 sm:h-20 items-center justify-between gap-4">
                <Link href={hrefFor(locale)} className="flex items-center gap-3 group" aria-label="ASIAPLAST home">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-green to-brand-teal font-display text-lg font-black text-white shadow-md shadow-brand-green/20 group-hover:scale-105 transition-transform duration-200">
                        A
                    </span>
                    <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                        ASIA<span className="text-brand-green">PLAST</span>
                    </span>
                </Link>

                <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
                    {nav.map((item) => (
                        <Link
                            key={item.sub || "home"}
                            href={hrefFor(locale, item.sub)}
                            className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-150 ${
                                isActive(item)
                                    ? "bg-brand-green-light text-brand-green-dark font-bold shadow-xs"
                                    : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-2.5">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setLangOpen((v) => !v)}
                            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition-all"
                            aria-haspopup="menu"
                            aria-expanded={langOpen}
                            aria-label={labels.language}
                        >
                            <span aria-hidden className="text-sm">🌐</span>
                            <span className="uppercase tracking-wider">{locale}</span>
                            <span className="text-[10px] text-slate-400">▼</span>
                        </button>
                        {langOpen && (
                            <div
                                className="absolute end-0 top-full z-50 mt-2 max-h-96 w-60 overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-card-hover animate-in fade-in zoom-in-95 duration-150"
                                role="menu"
                            >
                                {ACTIVE_LOCALES.map((l) => (
                                    <a
                                        key={l}
                                        href={hrefFor(l, cleanNeutral)}
                                        className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                                            l === locale
                                                ? "bg-brand-green-light font-bold text-brand-green-dark"
                                                : "text-slate-700 hover:bg-surface-soft hover:text-slate-900"
                                        }`}
                                        role="menuitem"
                                        hrefLang={l}
                                    >
                                        <span>{LOCALE_META[l].nativeName}</span>
                                        <span className="font-mono text-[10px] uppercase text-slate-400">{l}</span>
                                    </a>
                                ))}
                                <div className="mt-1 border-t border-slate-100 px-3 py-2 text-[11px] font-medium leading-snug text-slate-400">
                                    + 25 more languages rolling out
                                </div>
                            </div>
                        )}
                    </div>

                    <Link href={hrefFor(locale, "/quote")} className="btn-primary hidden !py-2.5 !px-5 text-xs sm:inline-flex">
                        <span>📋</span>
                        <span>{cta}</span>
                    </Link>

                    <button
                        type="button"
                        className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 lg:hidden transition"
                        onClick={() => setOpen((v) => !v)}
                        aria-label="Toggle menu"
                        aria-expanded={open}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                        </svg>
                    </button>
                </div>
            </div>

            {open && (
                <nav className="border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-4 pb-5 pt-3 lg:hidden animate-in slide-in-from-top-2 duration-150" aria-label="Mobile">
                    <div className="space-y-1">
                        {nav.map((item) => (
                            <Link
                                key={item.sub || "home"}
                                href={hrefFor(locale, item.sub)}
                                onClick={() => setOpen(false)}
                                className={`block rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                                    isActive(item)
                                        ? "bg-brand-green-light text-brand-green-dark font-bold"
                                        : "text-slate-700 hover:bg-slate-100"
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                    <Link href={hrefFor(locale, "/quote")} onClick={() => setOpen(false)} className="btn-primary mt-4 w-full justify-center">
                        <span>📋</span>
                        <span>{cta}</span>
                    </Link>
                </nav>
            )}
        </header>
    );
}
