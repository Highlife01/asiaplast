import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/i18n/locales";
import { ACTIVE_LOCALES } from "@/lib/i18n/locales";
import { getCategoryCopy } from "@/lib/i18n/content";
import { localePath, localizedSlug } from "@/lib/seo";
import type { CompanySettings } from "@/lib/config";

export default function Footer({
    locale,
    labels,
    companySettings
}: {
    locale: Locale;
    labels: Record<string, string>;
    companySettings?: CompanySettings;
}) {
    const year = new Date().getFullYear();
    const productLinks = [
        { slug: "heavy-duty-garbage-bags", categoryId: "heavy-duty" },
        { slug: "household-garbage-bags", categoryId: "household" },
        { slug: "industrial-bin-liners", categoryId: "industrial-liners" },
        { slug: "private-label-garbage-bags", categoryId: "private-label" }
    ];

    const socialEntries = companySettings?.socialLinks
        ? Object.entries(companySettings.socialLinks).filter(([, url]) => Boolean(url && url.trim()))
        : [];

    return (
        <footer className="border-t border-slate-200/80 bg-slate-50 text-slate-600">
            <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <Link href={localePath(locale, "/")} className="inline-block py-1" aria-label="ASIAPLAST home">
                        <Image
                            src="/images/logo.png"
                            alt="ASIAPLAST"
                            width={190}
                            height={49}
                            className="h-9 sm:h-10 w-auto object-contain"
                        />
                    </Link>
                    <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">{labels.company}</p>
                    {companySettings && (
                        <div className="mt-4 space-y-1 text-xs text-slate-500">
                            <p className="font-semibold text-slate-700">{companySettings.email}</p>
                            <p className="font-mono">{companySettings.phone}</p>
                            <p>
                                {[companySettings.address, companySettings.city, companySettings.country]
                                    .filter(Boolean)
                                    .join(" · ")}
                            </p>
                        </div>
                    )}
                    {socialEntries.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {socialEntries.map(([network, url]) => (
                                <a
                                    key={network}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-600 hover:border-brand-green hover:text-brand-green"
                                >
                                    {network}
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">{labels.products}</h3>
                    <ul className="mt-4 space-y-2.5 text-sm">
                        {productLinks.map((p) => (
                            <li key={p.slug}>
                                <Link
                                    href={localePath(locale, `/products/${localizedSlug(p.slug, locale)}`)}
                                    className="text-slate-600 hover:text-brand-green font-medium transition-colors"
                                >
                                    {getCategoryCopy(locale, p.categoryId).name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">{labels.links}</h3>
                    <ul className="mt-4 space-y-2.5 text-sm font-medium">
                        <li>
                            <Link href={localePath(locale, "/about")} className="text-slate-600 hover:text-brand-green transition-colors">
                                {labels.about}
                            </Link>
                        </li>
                        <li>
                            <Link href={localePath(locale, "/export")} className="text-slate-600 hover:text-brand-green transition-colors">
                                {labels.export}
                            </Link>
                        </li>
                        <li>
                            <Link href={localePath(locale, "/private-label")} className="text-slate-600 hover:text-brand-green transition-colors">
                                {labels.privateLabel}
                            </Link>
                        </li>
                        <li>
                            <Link href={localePath(locale, "/knowledge")} className="text-slate-600 hover:text-brand-green transition-colors">
                                {labels.knowledge}
                            </Link>
                        </li>
                        <li>
                            <Link href={localePath(locale, "/faq")} className="text-slate-600 hover:text-brand-green transition-colors">
                                {labels.faq}
                            </Link>
                        </li>
                        <li>
                            <Link href={localePath(locale, "/contact")} className="text-slate-600 hover:text-brand-green transition-colors">
                                {labels.contactUs}
                            </Link>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">{labels.language}</h3>
                    <ul className="mt-4 flex flex-wrap gap-2 text-xs">
                        {ACTIVE_LOCALES.map((l) => (
                            <li key={l}>
                                <a
                                    href={localePath(l, "/")}
                                    className={`inline-block px-2.5 py-1.5 rounded-lg border transition ${
                                        l === locale
                                            ? "bg-brand-green-light border-brand-green/30 font-bold text-brand-green-dark"
                                            : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300"
                                    }`}
                                    hrefLang={l}
                                >
                                    {l.toUpperCase()}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="border-t border-slate-200/80">
                <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-slate-500 sm:flex-row font-medium">
                    <p>© {year} {companySettings?.name || "ASIAPLAST"}. {labels.rights}</p>
                    <div className="flex items-center gap-6">
                        <Link href={localePath(locale, "/privacy")} className="hover:text-brand-green transition-colors">
                            {labels.privacy}
                        </Link>
                        <Link href={localePath(locale, "/terms")} className="hover:text-brand-green transition-colors">
                            {labels.terms}
                        </Link>
                        <Link href="/dashboard" className="text-slate-400 hover:text-brand-green transition-colors">
                            {labels.admin}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
