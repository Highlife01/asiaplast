import type { Metadata } from "next";
import ContactForm from "@/components/site/ContactForm";
import JsonLd from "@/components/site/JsonLd";
import SectionHeading from "@/components/site/SectionHeading";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@/lib/i18n/locales";
import { COMPANY } from "@/lib/config";
import { buildMetadata, breadcrumbJsonLd, organizationJsonLd, localePath } from "@/lib/seo";

export const revalidate = 300;

export async function generateStaticParams() {
    return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

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

    return (
        <>
            <JsonLd data={organizationJsonLd()} />
            <JsonLd
                data={breadcrumbJsonLd([
                    { name: dict.nav.home, path: localePath(l, "/") },
                    { name: dict.nav.contact, path: localePath(l, "/contact") }
                ])}
            />
            <section className="hero-bg py-16 text-white sm:py-20">
                <div className="container-x">
                    <h1 className="font-display text-4xl font-extrabold sm:text-5xl">{dict.sections.contactTitle}</h1>
                    <p className="mt-4 max-w-2xl text-slate-300">{dict.sections.contactLead}</p>
                </div>
            </section>

            <section className="section">
                <div className="container-x grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
                    <div>
                        <SectionHeading title={dict.nav.contact} lead={dict.sections.contactLead} />
                        <div className="mt-8 space-y-4">
                            <div className="card p-5">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Export desk</h3>
                                <p className="mt-2 text-sm text-slate-700">
                                    <a href={`mailto:${COMPANY.email}`} className="font-semibold text-brand-green-dark hover:text-brand-green">{COMPANY.email}</a>
                                    {COMPANY.whatsapp ? (
                                        <>
                                            <br />
                                            <a href={`https://wa.me/${COMPANY.whatsapp.replace(/\D/g, "")}`} className="text-brand-green-dark hover:text-brand-green">WhatsApp</a>
                                        </>
                                    ) : null}
                                    <span className="mt-2 block text-slate-600">{COMPANY.country}</span>
                                </p>
                            </div>
                            <div className="card p-5">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Distributors</h3>
                                <p className="mt-2 text-sm text-slate-700">
                                    Interested in a long-term distribution partnership? Mention your market and current channels in the message.
                                </p>
                            </div>
                            <div className="card p-5">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Languages</h3>
                                <p className="mt-2 text-sm text-slate-700">English · Türkçe · Deutsch · Français · العربية</p>
                            </div>
                        </div>
                    </div>
                    <ContactForm locale={l} sourcePage="/contact" />
                </div>
            </section>
        </>
    );
}
