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
        { sub: "/faq", label: labels.nav.faq || labels.nav.knowledge },
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
        <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-navy/95 text-white backdrop-blur supports-[backdrop-filter]:bg-brand-navy/85">
            <div className="container-x flex h-16 items-center justify-between gap-4">
                <Link href={hrefFor(locale)} className="flex items-center gap-2.5" aria-label="ASIAPLAST home">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-green font-display text-lg font-extrabold text-white">
                        A
                    </span>
                    <span className="font-display text-xl font-extrabold tracking-wide">
                        ASIA<span className="text-brand-green">PLAST</span>
                    </span>
                </Link>

                <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
                    {nav.map((item) => (
                        <Link
                            key={item.sub || "home"}
                            href={hrefFor(locale, item.sub)}
                            className={`rounded-md px-3 py-2 text-sm font-medium transition ${isActive(item) ? "bg-white/10 text-white" : "text-slate-200 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setLangOpen((v) => !v)}
                            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 hover:text-white"
                            aria-haspopup="menu"
                            aria-expanded={langOpen}
                            aria-label={labels.language}
                        >
                            <span aria-hidden>🌐</span>
                            <span className="uppercase">{locale}</span>
                        </button>
                        {langOpen && (
                            <div
                                className="absolute end-0 top-full z-50 mt-2 max-h-96 w-56 overflow-auto rounded-xl border border-surface-border bg-white p-1.5 shadow-card"
                                role="menu"
                            >
                                {ACTIVE_LOCALES.map((l) => (
                                    <a
                                        key={l}
                                        href={hrefFor(l, cleanNeutral)}
                                        className={`block rounded-lg px-3 py-2 text-sm ${l === locale ? "bg-brand-green-light font-semibold text-brand-green-dark" : "text-slate-700 hover:bg-surface-soft"
                                            }`}
                                        role="menuitem"
                                        hrefLang={l}
                                    >
                                        {LOCALE_META[l].nativeName}
                                    </a>
                                ))}
                                <div className="mt-1 border-t border-surface-border px-3 py-2 text-[11px] leading-snug text-slate-400">
                                    + 25 more languages rolling out
                                </div>
                            </div>
                        )}
                    </div>

                    <Link href={hrefFor(locale, "/quote")} className="btn-primary hidden !py-2 sm:inline-flex">
                        {cta}
                    </Link>

                    <button
                        type="button"
                        className="grid h-10 w-10 place-items-center rounded-md text-slate-200 hover:bg-white/5 lg:hidden"
                        onClick={() => setOpen((v) => !v)}
                        aria-label="Toggle menu"
                        aria-expanded={open}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                        </svg>
                    </button>
                </div>
            </div>

            {open && (
                <nav className="border-t border-white/10 bg-brand-navy px-4 pb-4 pt-2 lg:hidden" aria-label="Mobile">
                    {nav.map((item) => (
                        <Link
                            key={item.sub || "home"}
                            href={hrefFor(locale, item.sub)}
                            onClick={() => setOpen(false)}
                            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/5 hover:text-white"
                        >
                            {item.label}
                        </Link>
                    ))}
                    <Link href={hrefFor(locale, "/quote")} onClick={() => setOpen(false)} className="btn-primary mt-3 w-full">
                        {cta}
                    </Link>
                </nav>
            )}
        </header>
    );
}
