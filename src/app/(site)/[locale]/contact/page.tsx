import type { Metadata } from "next";
import ContactForm from "@/components/site/ContactForm";
import JsonLd from "@/components/site/JsonLd";
import SectionHeading from "@/components/site/SectionHeading";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { getCompanySettings } from "@/lib/repo";
import { buildMetadata, breadcrumbJsonLd, organizationJsonLd, localePath } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const l = (isLocale(locale) ? locale : ("en" as Locale));
    const dict = getDictionary(l);
    return buildMetadata({ title: dict.nav.contact, description: dict.sections.contactLead, path: "/contact", locale: l });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const l = (isLocale(locale) ? locale : ("en" as Locale));
    const dict = getDictionary(l);
    const company = await getCompanySettings();

    return (
        <>
            <JsonLd data={organizationJsonLd()} />
            <JsonLd
                data={breadcrumbJsonLd([
                    { name: dict.nav.home, path: localePath(l, "/") },
                    { name: dict.nav.contact, path: localePath(l, "/contact") }
                ])}
            />
            <section className="hero-bg border-b border-slate-200/80 py-16 text-slate-900 sm:py-20">
                <div className="container-x">
                    <p className="chip mb-3">Get in Touch</p>
                    <h1 className="font-display text-4xl font-black text-slate-900 sm:text-5xl">{dict.sections.contactTitle}</h1>
                    <p className="mt-4 max-w-2xl text-slate-600 text-base sm:text-lg leading-relaxed">{dict.sections.contactLead}</p>
                </div>
            </section>

            <section className="section">
                <div className="container-x grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
                    <div>
                        <SectionHeading title={dict.nav.contact} lead={dict.sections.contactLead} />
                        <div className="mt-8 space-y-4">
                            <div className="card p-6 hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                                    {company.legalName || company.name}
                                </h3>
                                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                                    <a href={`mailto:${company.email}`} className="font-bold text-brand-green hover:text-brand-green-dark">
                                        {company.email}
                                    </a>
                                    {company.phone ? (
                                        <>
                                            <br />
                                            <a href={`tel:${company.phone.replace(/\s+/g, "")}`} className="font-mono text-slate-700 hover:text-brand-green">
                                                Tel: {company.phone}
                                            </a>
                                        </>
                                    ) : null}
                                    {company.whatsapp ? (
                                        <>
                                            <br />
                                            <a href={`https://wa.me/${company.whatsapp.replace(/\D/g, "")}`} className="font-semibold text-brand-green hover:text-brand-green-dark">
                                                WhatsApp: {company.whatsapp}
                                            </a>
                                        </>
                                    ) : null}
                                    <span className="mt-2 block text-slate-500">
                                        {[company.address, company.city, company.country].filter(Boolean).join(" · ")}
                                    </span>
                                    {company.workingHours ? (
                                        <span className="mt-1 block text-xs text-slate-400">{company.workingHours}</span>
                                    ) : null}
                                </p>
                            </div>
                            <div className="card p-6 hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Distributors</h3>
                                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                                    Interested in a long-term distribution partnership? Mention your market and current channels in the message.
                                </p>
                            </div>
                            <div className="card p-6 hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Languages</h3>
                                <p className="mt-2 text-sm font-medium text-slate-700">English · Türkçe · Deutsch · Français · العربية</p>
                            </div>
                        </div>
                    </div>
                    <ContactForm locale={l} sourcePage="/contact" />
                </div>
            </section>
        </>
    );
}
