import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/site/JsonLd";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getAboutCopy } from "@/lib/i18n/content";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@/lib/i18n/locales";
import { buildMetadata, breadcrumbJsonLd, localePath, organizationJsonLd } from "@/lib/seo";
import { COMPANY } from "@/lib/config";

export const revalidate = 3600;

export function generateStaticParams() {
    return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const l = (isLocale(locale) ? locale : ("en" as Locale));
    const copy = getAboutCopy(l);
    return buildMetadata({
        title: `${copy.title} | ${COMPANY.legalTitle}`,
        description: copy.lead,
        path: "/about",
        locale: l
    });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const l = (isLocale(locale) ? locale : ("en" as Locale));
    const dict = getDictionary(l);
    const copy = getAboutCopy(l);

    return (
        <>
            <JsonLd data={organizationJsonLd()} />
            <JsonLd
                data={breadcrumbJsonLd([
                    { name: dict.nav.home, path: localePath(l, "/") },
                    { name: copy.title, path: localePath(l, "/about") }
                ])}
            />

            <section className="hero-bg border-b border-slate-200/80 py-16 text-slate-900 sm:py-20">
                <div className="container-x">
                    <p className="chip mb-3">Corporate &amp; Production Profile</p>
                    <h1 className="font-display text-4xl font-black text-slate-900 sm:text-5xl">{copy.title}</h1>
                    <p className="mt-4 max-w-2xl text-slate-600 text-base sm:text-lg leading-relaxed">{copy.lead}</p>
                </div>
            </section>

            <section className="section bg-white">
                <div className="container-x grid gap-10 lg:grid-cols-[1.2fr_.8fr]">
                    <div className="space-y-6 text-slate-600 leading-relaxed text-base">
                        {copy.paragraphs.map((p) => (
                            <p key={p}>{p}</p>
                        ))}

                        {/* Verified Corporate Identity Box */}
                        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50/80 p-6 sm:p-8 shadow-sm">
                            <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                                <span className="text-emerald-600">🏢</span>
                                <span>Kurumsal &amp; Yasal Şirket Künyesi</span>
                            </h2>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <dt className="font-bold text-slate-500 uppercase tracking-wider">Resmi Ticari Unvan</dt>
                                    <dd className="mt-1 font-semibold text-slate-900">{COMPANY.legalTitle}</dd>
                                </div>
                                <div>
                                    <dt className="font-bold text-slate-500 uppercase tracking-wider">Üretim &amp; Ekstrüzyon Tesisi</dt>
                                    <dd className="mt-1 text-slate-700">{COMPANY.factoryAddress}</dd>
                                </div>
                                <div>
                                    <dt className="font-bold text-slate-500 uppercase tracking-wider">Küresel İhracat Masası</dt>
                                    <dd className="mt-1 text-slate-700">{COMPANY.exportOffice}</dd>
                                </div>
                                <div>
                                    <dt className="font-bold text-slate-500 uppercase tracking-wider">Vergi &amp; Sicil Bilgileri</dt>
                                    <dd className="mt-1 text-slate-700">
                                        {COMPANY.taxOffice} — V.N: {COMPANY.taxNumber}<br />
                                        Mersis: {COMPANY.mersis} &bull; Sicil: {COMPANY.ticaretSicilNo}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Certified Standards Grid */}
                        <div className="mt-8">
                            <h2 className="font-display text-xl font-bold text-slate-900 mb-4">
                                Akredite Kalite &amp; Test Uygunluk Standartları
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {COMPANY.certifications.map((c) => (
                                    <div key={c.code} className="p-4 rounded-2xl border border-emerald-200/90 bg-emerald-50/50 flex items-start gap-3">
                                        <span className="text-xl">✅</span>
                                        <div>
                                            <span className="font-display font-bold text-slate-900 text-sm block">
                                                {c.code} — {c.title}
                                            </span>
                                            <span className="text-xs text-emerald-800 font-medium">
                                                Kapsam: {c.scope}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {copy.items.map((item) => (
                            <div key={item.title} className="card p-6 hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200">
                                <h3 className="font-display font-bold text-slate-900">{item.title}</h3>
                                <p className="mt-2 text-sm text-slate-600">{item.text}</p>
                            </div>
                        ))}

                        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 p-8 text-white shadow-lg text-center">
                            <h3 className="font-display text-2xl font-black">25.000 MT Kapasite</h3>
                            <p className="mt-2 text-xs text-emerald-100 leading-relaxed">
                                Yıllık yüksek kapasiteli çok katmanlı ko-ekstrüzyon hattımızla dünya standartlarında ihracat üretim ortağınızız.
                            </p>
                            <Link href={localePath(l, "/quote")} className="inline-block mt-6 px-6 py-3 rounded-xl bg-white text-slate-950 font-black text-xs hover:bg-emerald-50 transition shadow-md">
                                {dict.site.ctaQuote} &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
