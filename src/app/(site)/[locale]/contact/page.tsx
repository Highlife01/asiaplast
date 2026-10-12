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

interface ContactCopy {
    badge: string;
    factoryTitle: string;
    officeTitle: string;
    regTitle: string;
    hoursTitle: string;
    hoursText: string;
    partnerTitle: string;
    partnerText: string;
    languagesTitle: string;
}

const CONTACT_COPY: Partial<Record<Locale, ContactCopy>> = {
    tr: {
        badge: "İletişime Geçin",
        factoryTitle: "Fabrika & Üretim Tesisi",
        officeTitle: "Küresel İhracat & Satış Ofisi",
        regTitle: "Resmi Şirket & Sicil Bilgileri",
        hoursTitle: "Teklif & Yanıt Süresi",
        hoursText: "B2B teklif ve TDS teknik föy talepleri 24 iş saati içinde resmi proforma olarak yanıtlanır.",
        partnerTitle: "Distribütörlük & Toptan Alım",
        partnerText: "Uzun vadeli bayilik ve ülke distribütörlüğü için lütfen hedef pazarınızı ve dağıtım ağınızı belirtiniz.",
        languagesTitle: "Desteklenen Diller"
    },
    en: {
        badge: "Get in Touch",
        factoryTitle: "Extrusion Plant & Factory",
        officeTitle: "Global Export & Sales Office",
        regTitle: "Corporate & Legal Credentials",
        hoursTitle: "Quotation & Response SLA",
        hoursText: "All B2B inquiries and TDS datasheet requests are responded to within 24 business hours with formal proforma.",
        partnerTitle: "Distributor & Wholesale Inquiries",
        partnerText: "For long-term distributorship or national tenders, please specify your target market and distribution channels.",
        languagesTitle: "Supported Languages"
    },
    de: {
        badge: "Kontakt aufnehmen",
        factoryTitle: "Produktionswerk & Fabrik",
        officeTitle: "Globales Export- & Vertriebsbüro",
        regTitle: "Unternehmens- & Handelsdaten",
        hoursTitle: "Angebotsbearbeitung",
        hoursText: "B2B-Anfragen und TDS-Datenblattabrufe werden innerhalb von 24 Arbeitsstunden mit offiziellem Angebot beantwortet.",
        partnerTitle: "Vertriebs- & Großhandelspartner",
        partnerText: "Für langfristige Vertriebspartnerschaften geben Sie bitte Ihren Zielmarkt und bestehende Kanäle an.",
        languagesTitle: "Unterstützte Sprachen"
    },
    fr: {
        badge: "Contactez-nous",
        factoryTitle: "Usine d'extrusion & Production",
        officeTitle: "Bureau Export & Ventes Internationales",
        regTitle: "Identité Légale & Enregistrement",
        hoursTitle: "Délai de Réponse & Devis",
        hoursText: "Les demandes B2B et fiches TDS reçoivent une réponse sous 24 heures ouvrées avec proforma officiel.",
        partnerTitle: "Distribution & Grands Comptes",
        partnerText: "Pour les partenariats de distribution ou appels d'offres, veuillez préciser vos canaux de diffusion.",
        languagesTitle: "Langues Supportées"
    },
    ar: {
        badge: "تواصل معنا",
        factoryTitle: "مصنع الإنتاج والبثق",
        officeTitle: "مكتب التصدير والمبيعات الدولية",
        regTitle: "البيانات الرسمية والسجل التجاري",
        hoursTitle: "مدة الاستجابة والعروض",
        hoursText: "يتم الرد على استفسارات الجملة وبطاقات TDS الفنية خلال 24 ساعة عمل بعرض أسعار رسمي.",
        partnerTitle: "التوزيع وتوريد الجملة",
        partnerText: "للشراكات طويلة الأجل والوكالات، يرجى توضيح السوق المستهدف وقنوات التوزيع الحالية.",
        languagesTitle: "اللغات المدعومة"
    }
};

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const l = (isLocale(locale) ? locale : ("en" as Locale));
    const dict = getDictionary(l);
    const copy = CONTACT_COPY[l] || CONTACT_COPY.en!;

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
                    <p className="chip mb-3">{copy.badge}</p>
                    <h1 className="font-display text-4xl font-black text-slate-900 sm:text-5xl">{dict.sections.contactTitle}</h1>
                    <p className="mt-4 max-w-2xl text-slate-600 text-base sm:text-lg leading-relaxed">{dict.sections.contactLead}</p>
                </div>
            </section>

            <section className="section">
                <div className="container-x grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
                    <div>
                        <SectionHeading title={dict.nav.contact} lead={dict.sections.contactLead} />
                        <div className="mt-8 space-y-4">
                            <div className="card p-6 border-slate-200 hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all">
                                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-700">{copy.factoryTitle}</h3>
                                <p className="mt-2 text-sm text-slate-700 font-semibold">{COMPANY.legalTitle}</p>
                                <p className="mt-1 text-sm text-slate-600 leading-relaxed">{COMPANY.factoryAddress}</p>
                                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                                    <span>Tel: <a href={`tel:${COMPANY.phone.replace(/\s+/g, "")}`} className="text-slate-800 hover:text-emerald-700 font-semibold">{COMPANY.phone}</a></span>
                                    <span>WhatsApp: <a href={`https://wa.me/${COMPANY.whatsapp.replace(/\D/g, "")}?text=Hello%20AsiaPlast`} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline font-semibold">{COMPANY.whatsapp}</a></span>
                                </div>
                            </div>

                            <div className="card p-6 border-slate-200 hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all">
                                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-700">{copy.officeTitle}</h3>
                                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{COMPANY.exportOffice}</p>
                                <p className="mt-2 text-sm text-slate-700 font-medium">
                                    E-mail: <a href={`mailto:${COMPANY.email}`} className="font-bold text-emerald-700 hover:underline">{COMPANY.email}</a>
                                </p>
                            </div>

                            <div className="card p-6 border-slate-200 hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">{copy.regTitle}</h3>
                                <p className="mt-2 text-xs text-slate-600 space-y-1">
                                    <span className="block font-medium text-slate-700">{COMPANY.legalTitle}</span>
                                    <span className="block">{COMPANY.taxOffice} — {COMPANY.taxNumber}</span>
                                    <span className="block font-mono text-[11px] text-slate-500">Mersis: {COMPANY.mersis} · Sicil No: {COMPANY.ticaretSicilNo}</span>
                                </p>
                            </div>

                            <div className="card p-6 border-slate-200 hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all">
                                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-700">{copy.hoursTitle}</h3>
                                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{copy.hoursText}</p>
                            </div>

                            <div className="card p-6 border-slate-200 hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">{copy.partnerTitle}</h3>
                                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{copy.partnerText}</p>
                            </div>

                            <div className="card p-6 border-slate-200 hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">{copy.languagesTitle}</h3>
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
