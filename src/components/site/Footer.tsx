import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import { ACTIVE_LOCALES } from "@/lib/i18n/locales";
import { getCategoryCopy } from "@/lib/i18n/content";
import { localePath, localizedSlug } from "@/lib/seo";

export default function Footer({ locale, labels }: { locale: Locale; labels: Record<string, string> }) {
    const year = new Date().getFullYear();
    const productLinks = [
        { slug: "heavy-duty-garbage-bags", categoryId: "heavy-duty" },
        { slug: "household-garbage-bags", categoryId: "household" },
        { slug: "industrial-bin-liners", categoryId: "industrial-liners" },
        { slug: "private-label-garbage-bags", categoryId: "private-label" }
    ];

    return (
        <footer className="border-t border-white/10 bg-brand-navy text-slate-300">
            <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-green font-display text-lg font-extrabold text-white">
                            A
                        </span>
                        <span className="font-display text-xl font-extrabold tracking-wide text-white">
                            ASIA<span className="text-brand-green">PLAST</span>
                        </span>
                    </div>
                    <p className="mt-4 max-w-xs text-sm leading-relaxed">{labels.company}</p>
                </div>

                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">{labels.products}</h3>
                    <ul className="mt-4 space-y-2.5 text-sm">
                        {productLinks.map((p) => (
                            <li key={p.slug}>
                                <Link href={localePath(locale, `/products/${localizedSlug(p.slug, locale)}`)} className="hover:text-brand-green">
                                    {getCategoryCopy(locale, p.categoryId).name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">{labels.links}</h3>
                    <ul className="mt-4 space-y-2.5 text-sm">
                        <li><Link href={localePath(locale, "/about")} className="hover:text-brand-green">{labels.about}</Link></li>
                        <li><Link href={localePath(locale, "/export")} className="hover:text-brand-green">{labels.export}</Link></li>
                        <li><Link href={localePath(locale, "/private-label")} className="hover:text-brand-green">{labels.privateLabel}</Link></li>
                        <li><Link href={localePath(locale, "/contact")} className="hover:text-brand-green">{labels.contactUs}</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">{labels.language}</h3>
                    <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                        {ACTIVE_LOCALES.map((l) => (
                            <li key={l}>
                                <a
                                    href={localePath(l, "/")}
                                    className={l === locale ? "font-semibold text-brand-green" : "hover:text-brand-green"}
                                    hrefLang={l}
                                >
                                    {l.toUpperCase()}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="border-t border-white/10">
                <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-xs sm:flex-row">
                    <p>© {year} ASIAPLAST. {labels.rights}</p>
                    <div className="flex items-center gap-5">
                        <Link href={localePath(locale, "/privacy")} className="hover:text-brand-green">{labels.privacy}</Link>
                        <Link href={localePath(locale, "/terms")} className="hover:text-brand-green">{labels.terms}</Link>
                        <Link href="/admin" className="text-slate-500 hover:text-brand-green">{labels.admin}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
