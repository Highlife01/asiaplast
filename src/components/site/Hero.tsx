import Link from "next/link";
import type { Dict } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/seo";

const MARQUEE_ITEMS = [
    "garbage bags manufacturer",
    "wholesale trash bags",
    "bulk bin liners",
    "private label garbage bags",
    "heavy duty garbage bags",
    "star seal sacks",
    "industrial waste bags",
    "OEM trash bags",
    "garbage bags exporter Turkey"
];

export default function Hero({ dict, locale }: { dict: Dict; locale: Locale }) {
    const base = localePath(locale, "/").replace(/\/$/, "") || "";
    const stats = [
        { value: "8+", label: dict.hero.stat1 },
        { value: "40+", label: dict.hero.stat2 },
        { value: "1000s", label: dict.hero.stat3 },
        { value: "100%", label: dict.hero.stat4 }
    ];

    return (
        <section className="hero-bg relative overflow-hidden text-white">
            <div className="hero-grid absolute inset-0" aria-hidden />
            <div className="container-x relative pb-20 pt-16 sm:pb-28 sm:pt-24 lg:min-h-[86vh] lg:pb-32 lg:pt-28">
                <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_.85fr]">
                    <div>
                        <p className="chip !border-brand-green/40 !bg-white/10 !text-brand-green">
                            {dict.hero.badge}
                        </p>
                        <h1 className="mt-5 max-w-2xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                            {dict.hero.title}
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
                            {dict.hero.subtitle}
                        </p>
                        <div className="mt-9 flex flex-wrap items-center gap-4">
                            <Link href={`${base}/quote`} className="btn-primary !px-8 !py-3.5 !text-base">
                                {dict.site.ctaQuote}
                            </Link>
                            <Link href={`${base}/products`} className="btn-outline-light !px-8 !py-3.5 !text-base">
                                {dict.site.ctaProducts}
                            </Link>
                        </div>

                        <dl className="mt-14 grid max-w-xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
                            {stats.map((s) => (
                                <div key={s.label}>
                                    <dd className="font-display text-3xl font-extrabold text-brand-green">{s.value}</dd>
                                    <dt className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                                        {s.label}
                                    </dt>
                                </div>
                            ))}
                        </dl>
                    </div>

                    {/* Stylized product visual — not a fake photo */}
                    <div className="relative mx-auto hidden w-full max-w-md lg:block" aria-hidden>
                        <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-brand-green/25 via-transparent to-cyan-400/20 blur-2xl" />
                        <div className="card relative overflow-hidden !border-white/15 !bg-white/5 p-8 !shadow-2xl backdrop-blur">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xs uppercase tracking-widest text-slate-400">Spec sheet</span>
                                <span className="chip !bg-brand-green/15 !text-brand-green">B2B</span>
                            </div>
                            <div className="mt-6 space-y-4">
                                {[
                                    ["Heavy Duty Sack", "LDPE · 120 µm · star seal"],
                                    ["Bin Liner 240 L", "HDPE · 40 µm · gusseted"],
                                    ["Draw Roll 35 L", "Retail · 6-color print"]
                                ].map(([name, meta], i) => (
                                    <div key={name} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                                        <div
                                            className="grid h-12 w-10 shrink-0 place-items-end rounded-b-lg rounded-t-sm border border-brand-green/50 bg-gradient-to-b from-slate-700/60 to-slate-900/60"
                                            style={{ borderBottomLeftRadius: i === 1 ? "50% 40%" : undefined, borderBottomRightRadius: i === 1 ? "50% 40%" : undefined }}
                                        >
                                            <div className="mb-1 h-1.5 w-full bg-brand-green/40" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">{name}</p>
                                            <p className="text-xs text-slate-400">{meta}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 rounded-xl border border-dashed border-white/15 p-4 text-center text-xs text-slate-400">
                                Custom gauges · widths · prints — built to your specification
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative border-t border-white/10 bg-black/20 py-3.5" aria-hidden>
                <div className="marquee flex w-max gap-10 px-6 font-mono text-xs uppercase tracking-[.2em] text-slate-400">
                    {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((kw, i) => (
                        <span key={`${kw}-${i}`} className="whitespace-nowrap">· {kw}</span>
                    ))}
                </div>
            </div>
        </section>
    );
}
