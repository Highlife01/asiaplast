"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/seo";

type Props = {
    locale: Locale;
    whatsappNumber?: string;
    labels: {
        ctaQuote: string;
        ctaProducts: string;
        whatsappDesk: string;
    };
};

type SlideData = {
    image: string;
    tag: Partial<Record<Locale, string>>;
    title: Partial<Record<Locale, string>>;
    subtitle: Partial<Record<Locale, string>>;
    highlights: Partial<Record<Locale, string[]>>;
};

const SLIDES: SlideData[] = [
    {
        image: "/images/hero/hero-1.jpg",
        tag: {
            tr: "ENDÜSTRİYEL EKSTRÜZYON & POLİETİLEN ÜRETİMİ",
            en: "BLOWN FILM EXTRUSION & POLYETHYLENE MANUFACTURING",
            de: "BLASFOLIENEXTRUSION & POLYETHYLEN-HERSTELLUNG",
            fr: "EXTRUSION DE FILM SOUFFLÉ & FABRICATION",
            ar: "تصنيع وبثق أغشية البولي إيثيلين"
        },
        title: {
            tr: "Endüstriyel Çöp Torbasında İhracat Odaklı Üretim",
            en: "Engineered Polyethylene Refuse Sacks for Export Markets",
            de: "Industrie-Müllsäcke für Internationale Märkte",
            fr: "Sacs Poubelle Industriels pour les Marchés d'Exportation",
            ar: "أكياس النفايات الصناعية والبولي إيثيلين لأسواق التصدير"
        },
        subtitle: {
            tr: "Endüstriyel, evsel, konteyner astarı ve özel markalı (private label) çöp poşetlerinde siparişe özel ölçü, mikron ve ambalaj üretimi.",
            en: "Custom-specified heavy-duty refuse sacks, bin liners, drawstring rolls, and private-label packaging manufactured to buyer technical sheets.",
            de: "Kundenspezifische Schwerlast-Müllsäcke, Mülltonnenbeutel, Zugbandrollen und Handelsmarken-Verpackungen nach Maß.",
            fr: "Sacs poubelle haute résistance, sacs conteneurs, rouleaux à lien coulissant et emballages marque distributeur sur mesure.",
            ar: "إنتاج مخصص لأكياس النفايات الثقيلة وأكياس الحاويات ورباط السحب والعلامات الخاصة حسب المواصفات الفنية."
        },
        highlights: {
            tr: ["LDPE / HDPE / MDPE Reçine", "Çok Katmanlı Ko-Ekstrüzyon", "Siparişe Özel Mikron & Ölçü"],
            en: ["LDPE / HDPE / MDPE Blends", "Multi-Layer Co-Extrusion", "Custom Micron & Dimensions"],
            de: ["LDPE / HDPE / MDPE Mischungen", "Mehrschicht-Coextrusion", "Maßgeschneiderte Stärke"],
            fr: ["Mélanges LDPE / HDPE / MDPE", "Co-extrusion multicouche", "Épaisseur & Dimensions sur Mesure"],
            ar: ["خلطات LDPE / HDPE / MDPE", "بثق متعدد الطبقات", "مقاسات وسماكات مخصصة"]
        }
    },
    {
        image: "/images/hero/hero-2.jpg",
        tag: {
            tr: "AĞIR HİZMET & ENDÜSTRİYEL KULLANIM",
            en: "HEAVY-DUTY CONTRACTOR & MUNICIPAL GRADE",
            de: "SCHWERLAST & INDUSTRIE-STANDARDS",
            fr: "HAUTE RÉSISTANCE & USAGE INDUSTRIEL",
            ar: "أكياس الخدمة الشاقة للمواقع الصناعية والبلدية"
        },
        title: {
            tr: "Yırtılma ve Delinmeye Dayanıklı Ağır Hizmet Torbaları",
            en: "Tear-Resistant & Puncture-Resistant Waste Sacks",
            de: "Reißfeste Schwerlast-Müllsäcke für Baustellen",
            fr: "Sacs Renforcés Anti-Perforation pour Chantiers",
            ar: "أكياس متينة مقاومة للتمزق والثقب للنفايات الثقيلة"
        },
        subtitle: {
            tr: "İhtiyaca uygun LDPE/HDPE film kalınlığı ve yıldız dikişli veya düz taban yapısı ile inşaat, belediye ve sanayi atıkları için yüksek mukavemet.",
            en: "Configurable film thickness with leak-resistant star-seal or flat-seal bottoms built for construction sites, municipal fleets, and industrial scrap.",
            de: "Konfigurierbare Folienstärke mit auslaufsicherem Sternboden oder Flachboden für Bauschutt, Kommunalbetriebe und Industrieabfälle.",
            fr: "Épaisseur configurable avec fond étanche en étoile ou fond plat pour déchets de chantier et collectes municipales.",
            ar: "سماكة قابلة للتخصيص مع قاعدة مانعة للتسرب مخصصة لقطاع البناء والبلديات والمصانع."
        },
        highlights: {
            tr: ["Yüksek Delinme Direnci", "Yıldız veya Düz Dip Seçeneği", "Rulo veya Dökme Koli"],
            en: ["High Puncture Resistance", "Star-Seal or Flat-Seal", "Perforated Roll or Flat Pack"],
            de: ["Hohe Durchstoßfestigkeit", "Sternboden oder Flachboden", "Rolle oder Flachpackung"],
            fr: ["Haute résistance perforation", "Fond étoile ou fond plat", "En rouleau ou à plat"],
            ar: ["مقاومة عالية للثقب", "قاعدة نجمية أو مسطحة", "تعبئة رولات أو كرتون"]
        }
    },
    {
        image: "/images/hero/hero-3.jpg",
        tag: {
            tr: "PERAKENDE & MARKET ZİNCİRLERİ",
            en: "RETAIL-READY PRIVATE LABEL PACKAGING",
            de: "HANDELSMARKEN FÜR DEN SUPERMARKT",
            fr: "EMBALLAGE RETAIL & MARQUE DISTRIBUTEUR",
            ar: "عبوات مخصصة لسلاسل البيع بالتجزئة والسوبرماركت"
        },
        title: {
            tr: "Büzgülü & Hijyenik Rulo Çöp Torbaları",
            en: "Ergonomic Drawstring & Perforated Household Rolls",
            de: "Hygienische Zugband-Müllbeutel auf Rolle",
            fr: "Sacs Poubelle à Poignées Coulissantes & Rouleaux",
            ar: "أكياس نفايات برباط سحب ولفائف منزلية سهلة الاستخدام"
        },
        subtitle: {
            tr: "Pratik kapanan büzgülü kordon, perforeli rulo sarım ve markanıza özel baskılı rulo kuşağı veya kutu ambalaj seçenekleri.",
            en: "Easy-glide drawtapes, perforated roll winding, and custom-printed banderoles or retail cartons tailored to your private label.",
            de: "Leichtgängiges Zugband, perforierte Rollenwicklung und individuell bedruckte Banderolen oder Verkaufsverpackungen.",
            fr: "Cordons coulissants pratiques, rouleaux perforés et banderoles ou boîtes imprimées à votre marque distributeur.",
            ar: "أربطة سحب عملية ولفائف مثقبة وأغلفة مطبوعة مخصصة لعلامتك التجارية."
        },
        highlights: {
            tr: ["Büzgülü Pratik Kapanış", "Özel Baskılı Kuşak / Kutu", "Geri Dönüştürülmüş (PCR) Seçeneği"],
            en: ["Smooth Drawtape Handles", "Custom Printed Packaging", "Virgin or Recycled PCR Blends"],
            de: ["Praktisches Zugband", "Individueller Verpackungsdruck", "Neuware oder PCR-Rezyklat"],
            fr: ["Fermeture coulissante", "Emballage imprimé sur mesure", "Matière vierge ou recyclée PCR"],
            ar: ["مقبض رباط مريح", "تغليف مطبوع حسب الطلب", "خيارات خام أو معاد تدويرها"]
        }
    },
    {
        image: "/images/hero/hero-4.jpg",
        tag: {
            tr: "RENK KODLU ATIK AYRIŞTIRMA",
            en: "COLOR-CODED WASTE SEGREGATION",
            de: "FARBCODIERTE ABFALLTRENNUNG",
            fr: "TRI SÉLECTIF PAR CODE COULEUR",
            ar: "فرز النفايات المرمز بالألوان"
        },
        title: {
            tr: "Kurumsal & Klinik Atık Ayrıştırma Torbaları",
            en: "Color-Coded Institutional & Facility Waste Bags",
            de: "Farbcodierte Müllsäcke für Einrichtungen & Kliniken",
            fr: "Sacs de Tri Couleur pour Collectivités & Établissements",
            ar: "أكياس فرز النفايات الملونة للمؤسسات والمرافق"
        },
        subtitle: {
            tr: "Mavi, sarı, kırmızı, yeşil, şeffaf ve siyah renk seçenekleriyle tesis, hastane, otel ve belediye geri dönüşüm programlarına uygun üretim.",
            en: "Available in blue, yellow, red, green, clear, and black masterbatch formulations for hospitals, hotels, facilities, and recycling programs.",
            de: "Erhältlich in Blau, Gelb, Rot, Grün, Transparent und Schwarz für Krankenhäuser, Hotels, Facility-Management und Recyclingprogramme.",
            fr: "Disponibles en bleu, jaune, rouge, vert, transparent et noir pour hôpitaux, hôtels, gestion technique et programmes de recyclage.",
            ar: "متوفرة بالألوان الأزرق والأصفر والأحمر والأخضر والشفاف والأسود للمستشفيات والفنادق وبرامج إعادة التدوير."
        },
        highlights: {
            tr: ["6+ Standart & Özel Renk", "İsteğe Bağlı Uyarı Baskısı", "Sızdırmaz Kaynak Teknolojisi"],
            en: ["6+ Standard & Custom Colors", "Optional Warning / Logo Print", "Leak-Resistant Bottom Weld"],
            de: ["6+ Standard- & Sonderfarben", "Optionaler Warn-/Logodruck", "Auslaufsichere Bodenschweißung"],
            fr: ["6+ couleurs standards & sur mesure", "Impression logo / tri en option", "Soudure de fond étanche"],
            ar: ["أكثر من 6 ألوان قياسية ومخصصة", "طباعة الشعار أو التحذيرات", "لحام قاعدة مانع للتسرب"]
        }
    },
    {
        image: "/images/hero/hero-5.jpg",
        tag: {
            tr: "DOĞRUDAN FABRİKA İHRACAT OFİSİ",
            en: "DIRECT FACTORY EXPORT DESK",
            de: "DIREKTER WERKS-EXPORT",
            fr: "EXPORTATION DIRECTE USINE",
            ar: "مكتب التصدير المباشر من المصنع"
        },
        title: {
            tr: "Konteyner ve Palet Bazlı Doğrudan İhracat",
            en: "Container & Pallet-Scale Direct Export Logistics",
            de: "Container- & Paletten-Direktlieferung ab Werk",
            fr: "Logistique d'Exportation par Conteneur & Palette",
            ar: "شحن مباشر بالحاويات والطبليات من المصنع"
        },
        subtitle: {
            tr: "EXW, FOB, CIF ve DAP teslim şekilleriyle 20' FCL ve 40' HC konteyner yüklemeleri, ihracat evrakları ve hızlı teklif desteği.",
            en: "20ft FCL and 40ft HC container loadings under EXW, FOB, CIF, or DAP incoterms with export documentation and dedicated B2B support.",
            de: "20-Fuß- und 40-Fuß-HC-Containerbeladung unter EXW-, FOB-, CIF- oder DAP-Bedingungen mit vollständiger Exportabwicklung.",
            fr: "Chargements de conteneurs 20' et 40' HC aux conditions EXW, FOB, CIF et DAP avec accompagnement export dédié.",
            ar: "تحميل حاويات 20 و 40 قدم بشروط EXW و FOB و CIF و DAP مع دعم كامل لوثائق التصدير."
        },
        highlights: {
            tr: ["EXW / FOB / CIF / DAP", "20' FCL & 40' HC Konteyner", "Hızlı Teknik Teklif"],
            en: ["EXW / FOB / CIF / DAP", "20' FCL & 40' HC Loadings", "Fast Technical Quotation"],
            de: ["EXW / FOB / CIF / DAP", "20' FCL & 40' HC Beladung", "Schnelles Technik-Angebot"],
            fr: ["Incoterms EXW / FOB / CIF / DAP", "Conteneurs 20' FCL & 40' HC", "Devis technique rapide"],
            ar: ["شروط EXW / FOB / CIF / DAP", "حاويات 20 و 40 قدم", "عروض أسعار فنية سريعة"]
        }
    }
];

const MARQUEE_ITEMS = [
    "DIRECT MANUFACTURER",
    "TURKISH POLYETHYLENE EXPORTER",
    "HEAVY DUTY SACKS",
    "DRAWSTRING TRASH BAGS",
    "WHEELIE BIN LINERS 240L",
    "COLOR-CODED WASTE BAGS",
    "PRIVATE LABEL OEM",
    "STAR-SEAL TECHNOLOGY",
    "CONTAINER BULK EXPORT"
];

export default function HeroSlider({ locale, whatsappNumber = "+90 533 684 01 75", labels }: Props) {
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const isRtl = locale === "ar";
    const base = localePath(locale, "/").replace(/\/$/, "") || "";
    const cleanWa = whatsappNumber.replace(/\D/g, "") || "905336840175";

    const nextSlide = useCallback(() => {
        setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, []);

    const prevSlide = useCallback(() => {
        setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    }, []);

    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(nextSlide, 7000);
        return () => clearInterval(interval);
    }, [isPaused, nextSlide]);

    const activeSlide = SLIDES[current];
    const tag = activeSlide.tag[locale] || activeSlide.tag.en || "";
    const title = activeSlide.title[locale] || activeSlide.title.en || "";
    const subtitle = activeSlide.subtitle[locale] || activeSlide.subtitle.en || "";
    const highlights = activeSlide.highlights[locale] || activeSlide.highlights.en || [];

    const whatsappPrefill = encodeURIComponent(
        locale === "tr"
            ? `Merhaba ASIAPLAST, web sitenizden ulaşıyorum. "${title}" hakkında toptan teklif almak istiyorum.`
            : `Hello ASIAPLAST, I am contacting you via asiaplast.web.app regarding "${title}". I would like to request a wholesale export quotation.`
    );

    return (
        <section
            className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden bg-slate-50 text-slate-900 select-none border-b border-slate-200/80"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Background Visual Showcase */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {SLIDES.map((slide, idx) => {
                    const isCurrent = idx === current;
                    const slideTitle = slide.title[locale] || slide.title.en || "AsiaPlast";
                    return (
                        <div
                            key={slide.image}
                            aria-hidden={!isCurrent}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                                isCurrent ? "opacity-100" : "opacity-0"
                            }`}
                        >
                            <img
                                src={slide.image}
                                alt={slideTitle}
                                fetchPriority={idx === 0 ? "high" : "auto"}
                                loading={idx === 0 ? "eager" : "lazy"}
                                className={`absolute inset-0 w-full h-full object-cover object-center transform transition-transform duration-[8000ms] ${
                                    isCurrent ? "scale-105" : "scale-100"
                                }`}
                            />
                            <div
                                className={`absolute inset-0 bg-gradient-to-r ${
                                    isRtl
                                        ? "from-white/30 via-white/85 via-45% to-white/98"
                                        : "from-white/98 via-white/85 via-45% to-white/30"
                                }`}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent via-55% to-white/60" />
                        </div>
                    );
                })}
            </div>

            <div className="hero-grid absolute inset-0 z-0 opacity-40 pointer-events-none" />

            {/* Main Slide Content */}
            <div className="container-x relative z-10 pt-16 sm:pt-24 pb-12 flex-1 flex flex-col justify-center">
                <div className="max-w-3xl space-y-6">
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-black tracking-widest uppercase shadow-xs backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{tag}</span>
                    </div>

                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-slate-900">
                        {title}
                    </h1>

                    <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                        {subtitle}
                    </p>

                    <div className="flex flex-wrap gap-2.5 pt-2">
                        {highlights.map((h) => (
                            <span
                                key={h}
                                className="px-3.5 py-1.5 rounded-xl bg-white/95 hover:bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 shadow-xs backdrop-blur-md flex items-center gap-2 transition hover:border-emerald-300"
                            >
                                <span className="text-emerald-600 font-bold">✓</span>
                                {h}
                            </span>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-4">
                        <Link
                            href={`${base}/quote`}
                            className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/35 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
                        >
                            <span>📦</span>
                            <span>{labels.ctaQuote}</span>
                        </Link>

                        <a
                            href={`https://wa.me/${cleanWa}?text=${whatsappPrefill}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-4 rounded-xl bg-white hover:bg-emerald-50/80 border border-emerald-300 text-emerald-800 font-bold text-sm shadow-xs backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
                        >
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>WhatsApp: {whatsappNumber}</span>
                        </a>

                        <Link
                            href={`${base}/products`}
                            className="px-6 py-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm shadow-xs backdrop-blur-md hover:border-slate-300 transition"
                        >
                            {labels.ctaProducts} &rarr;
                        </Link>
                    </div>
                </div>

                {/* Left / Right Carousel Controls */}
                <div className={`hidden sm:flex items-center gap-3 absolute top-1/2 -translate-y-1/2 ${isRtl ? "left-6" : "right-6"}`}>
                    <button
                        onClick={prevSlide}
                        aria-label="Previous Slide"
                        className="w-12 h-12 rounded-full bg-white/90 hover:bg-white border border-slate-200 text-slate-800 grid place-items-center shadow-md backdrop-blur-md transition hover:scale-110 active:scale-90"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={nextSlide}
                        aria-label="Next Slide"
                        className="w-12 h-12 rounded-full bg-white/90 hover:bg-white border border-slate-200 text-slate-800 grid place-items-center shadow-md backdrop-blur-md transition hover:scale-110 active:scale-90"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Bottom Strip: 5 Slide Indicators */}
            <div className="relative z-10 border-t border-slate-200/80 bg-white/85 backdrop-blur-xl py-4">
                <div className="container-x">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {SLIDES.map((slide, i) => {
                            const slideTitle = slide.tag[locale] || slide.tag.en || "";
                            const isActive = i === current;
                            return (
                                <button
                                    key={slide.image}
                                    onClick={() => setCurrent(i)}
                                    className={`relative text-left p-3.5 rounded-2xl transition border ${
                                        isActive
                                            ? "bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                                            : "bg-white/60 border-slate-200/80 hover:bg-white hover:border-slate-300 shadow-xs"
                                    }`}
                                >
                                    <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                                        <span className={isActive ? "text-emerald-700 font-extrabold" : "text-slate-400"}>
                                            0{i + 1}
                                        </span>
                                        {isActive && (
                                            <span className="text-emerald-600 font-sans text-[9px] uppercase tracking-wider font-extrabold">
                                                Aktif
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-xs font-bold line-clamp-1 leading-snug ${isActive ? "text-slate-900" : "text-slate-600"}`}>
                                        {slideTitle}
                                    </p>

                                    {isActive && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-b-2xl animate-pulse" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Marquee Ticker */}
            <div className="relative z-10 border-t border-slate-200/80 bg-slate-100/90 py-2.5 overflow-hidden" aria-hidden>
                <div className="marquee flex w-max gap-8 font-mono text-[11px] uppercase tracking-[.25em] text-slate-500">
                    {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((kw, i) => (
                        <span key={`${kw}-${i}`} className="whitespace-nowrap flex items-center gap-4">
                            <span className="text-emerald-600 font-bold">&bull;</span>
                            {kw}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
