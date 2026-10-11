"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/seo";

type Props = {
    locale: Locale;
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
            tr: "YÜKSEK TEKNOLOJİ EKSTRÜZYON & ÜRETİM",
            en: "HIGH-TECH BLOWN FILM EXTRUSION PLANT",
            de: "HOCHMODERNE BLASFOLIENTRUDER-ANLAGE",
            fr: "USINE D'EXTRUSION ET DE SOUFFLAGE DE POINTE",
            ar: "مصنع بثق أغشية البولي إيثيلين المتطور"
        },
        title: {
            tr: "Endüstriyel Çöp Torbasında Global Üretim Gücü",
            en: "Engineered Polyethylene Excellence for Global Markets",
            de: "Präzisions-Müllsäcke für Internationale Märkte",
            fr: "Excellence Industrielle en Sacs Poubelle Export",
            ar: "ريادة عالمية في تصنيع أكياس النفايات والبولي إيثيلين"
        },
        subtitle: {
            tr: "Yıllık 25.000 ton ekstrüzyon kapasitesi ile endüstriyel, medikal ve özel markalı (private label) çöp poşetlerinde dünya standartlarında üretim.",
            en: "25,000 MT annual extrusion capacity producing heavy-duty liners, drawstrings, and private-label packaging for distributors worldwide.",
            de: "25.000 Tonnen jährliche Extrusionskapazität für Industrieabfallsäcke, Zugbandbeutel und Handelsmarken-Verpackungen.",
            fr: "Capacité d'extrusion de 25 000 tonnes/an pour sacs industriels, cordons coulissants et emballages sous marque distributeur.",
            ar: "طاقة إنتاجية سنوية تبلغ 25,000 طن متري لأكياس النفايات الصناعية والطبية ورباط السحب والعلامات الخاصة."
        },
        highlights: {
            tr: ["25.000 Ton Yıllık Kapasite", "Çok Katmanlı Ko-Ekstrüzyon", "ISO 9001 & CE Belgeli"],
            en: ["25,000 MT Annual Capacity", "Multi-Layer Co-Extrusion", "ISO 9001 & CE Certified"],
            de: ["25.000 t Jahreskapazität", "Mehrschicht-Coextrusion", "ISO 9001 & CE Zertifiziert"],
            fr: ["Capacité de 25 000 T/an", "Co-extrusion multicouche", "Certifié ISO 9001 & CE"],
            ar: ["طاقة 25,000 طن سنوياً", "بثق متعدد الطبقات", "مطابق لمعايير ISO 9001"]
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
            tr: "Yırtılmaz & Delinmeye Dayanıklı Ağır Hizmet Torbaları",
            en: "Tear-Resistant & Puncture-Proof Waste Sacks",
            de: "Reißfeste Schwerlast-Müllsäcke für Baustellen",
            fr: "Sacs Renforcés Anti-Perforation pour Chantiers",
            ar: "أكياس متينة مقاومة للتمزق والثقب للنفايات الثقيلة"
        },
        subtitle: {
            tr: "150 mikrona kadar LDPE/HDPE film kalınlığı ve yıldız dikişli taban yapısı ile inşaat ve ağır atıklar için sızdırmaz mukavemet.",
            en: "Gauges up to 150 microns with leak-resistant star-seal bottoms built for construction sites, municipal fleets, and industrial scrap.",
            de: "Stärken bis 150 µm mit auslaufsicherem Sternboden für Bauschutt, Kommunalbetriebe und Industrieabfälle.",
            fr: "Épaisseurs jusqu'à 150 microns avec fond étanche en étoile pour déchets de chantier et collectes municipales.",
            ar: "سماكة تصل إلى 150 ميكرون مع قاعدة مانعة للتسرب مخصصة لقطاع البناء والبلديات."
        },
        highlights: {
            tr: ["120-150 µm Ekstra Kalın", "Yıldız Taban Sızdırmaz", "ASTM D1709 Düşme Testli"],
            en: ["120–150 µm Heavy Gauge", "Star-Seal Leak-Proof", "ASTM D1709 Impact Tested"],
            de: ["120–150 µm Extra Stark", "Auslaufsicherer Sternboden", "ASTM D1709 Geprüft"],
            fr: ["Épaisseur 120-150 µm", "Fond hermétique en étoile", "Test d'impact ASTM D1709"],
            ar: ["سماكة 120-150 ميكرون", "قاعدة نجمية مانعة للتسرب", "اختبار السقوط ASTM D1709"]
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
            tr: "Hızlı kapanan büzgülü kordon, koku bariyerli formulasyon ve 6 renkli flekso baskılı özel ambalaj kutusu seçenekleri.",
            en: "Easy-glide drawtapes, odor-barrier formulations, and retail carton packaging printed to your brand's international specifications.",
            de: "Leichtgängiges Zugband, Geruchsbarriere und Verkaufsverpackungen nach Ihren Markenvorgaben.",
            fr: "Cordons coulissants faciles, barrière anti-odeurs et boîtes de distribution personnalisées à votre marque.",
            ar: "أربطة سحب سهلة الإغلاق وحواجز للروائح وكرتون بيع بالتجزئة مطبوع بشعارك التجاري."
        },
        highlights: {
            tr: ["Büzgülü Pratik Kapanış", "6 Renk Flekso Baskı", "Geri Dönüştürülebilir PCR"],
            en: ["Smooth Drawtape Handles", "6-Color Flexo Printing", "Eco-Friendly Recycled PCR"],
            de: ["Praktisches Zugband", "6-Farben-Flexodruck", "Recycelter PCR-Kunststoff"],
            fr: ["Fermeture coulissante", "Impression flexo 6 couleurs", "Options recyclées PCR"],
            ar: ["مقبض رباط مريح", "طباعة فليكسو 6 ألوان", "بلاستيك مدور صديق للبيئة"]
        }
    },
    {
        image: "/images/hero/hero-4.jpg",
        tag: {
            tr: "SAĞLIK & HASTANE ATIK STANDARTLARI",
            en: "CLINICAL SANITATION & BIOHAZARD STANDARDS",
            de: "MEDIZINISCHE & KLINISCHE ENTSORGUNG",
            fr: "NORMES MÉDICALES & DÉCHETS HOSPITALIERS",
            ar: "معايير النفايات الطبية والمخاطر البيولوجية للمستشفيات"
        },
        title: {
            tr: "Sertifikalı Tıbbi & Biyotehlike Atık Torbaları",
            en: "Certified UN 3291 Biohazard Hospital Sacks",
            de: "Zertifizierte UN 3291 Biohazard-Kliniksäcke",
            fr: "Sacs Déchets Médicaux Certifiés UN 3291 & EN 13592",
            ar: "أكياس نفايات طبية معتمدة وفقاً لمعايير UN 3291 العالمية"
        },
        subtitle: {
            tr: "Sarı ve kırmızı uluslararası biyotehlike baskılı, EN 13592 ve UN 3291 sertifikalı klinik enfeksiyöz atık koruması.",
            en: "Yellow and red medical waste bags certified to UN 3291 and EN 13592 standards with dart-puncture resistance.",
            de: "Gelbe und rote Müllsäcke mit Biohazard-Warndruck gemäß UN 3291 und EN 13592 für infektiöse Abfälle.",
            fr: "Sacs de déchets infectieux jaunes et rouges certifiés UN 3291 et EN 13592 avec haute résistance à l'impact.",
            ar: "أكياس صفراء وحمراء للنفايات الطبية المعدية معتمدة دولياً ومقاومة للثقب والتسريب."
        },
        highlights: {
            tr: ["UN 3291 & EN 13592 Sertifikalı", "Enfeksiyöz Atık Güvenliği", "Sarı / Kırmızı Renk Kodlu"],
            en: ["UN 3291 & EN 13592 Certified", "Infectious Waste Security", "Yellow & Red Color Coding"],
            de: ["UN 3291 & EN 13592 Zertifiziert", "Hohe Durchstoßfestigkeit", "Gelb/Rot Farbcodiert"],
            fr: ["Normes UN 3291 & EN 13592", "Sécurité déchets infectieux", "Code couleur jaune et rouge"],
            ar: ["شهادات UN 3291 و EN 13592", "أمان تام للنفايات الخطرة", "ترميز لوني أصفر وأحمر"]
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
            tr: "40'tan Fazla Ülkeye Konteyner Bazlı İhracat",
            en: "Container-Scale Logistics to 40+ Countries",
            de: "Container-Direktlieferung in über 40 Länder",
            fr: "Logistique Conteneurs Vers Plus de 40 Pays",
            ar: "شحن حاويات متكامل ومباشر إلى أكثر من 40 دولة"
        },
        subtitle: {
            tr: "FOB, CIF ve DAP teslim şekilleriyle 20' ve 40' HQ konteyner yüklemeleri, eksiksiz ihracat evrakları ve hızlı teklif güvencesi.",
            en: "20ft and 40ft HQ container loading with FOB, CIF, or DAP incoterms, complete export documentation, and competitive volume pricing.",
            de: "20-Fuß- und 40-Fuß-HQ-Containerbeladung mit FOB-, CIF- oder DAP-Bedingungen und lückenloser Zolldokumentation.",
            fr: "Chargements de conteneurs 20' et 40' HQ aux conditions FOB, CIF et DAP avec dossier douanier complet.",
            ar: "تحميل حاويات 20 و 40 قدم عالية السعة بشروط FOB و CIF و DAP وتوثيق جمركي كامل."
        },
        highlights: {
            tr: ["FOB / CIF / DAP Seçenekleri", "20' & 40' HQ Konteyner", "24 Saatte Hızlı Teklif"],
            en: ["FOB / CIF / DAP Incoterms", "20' & 40' HQ Loadings", "24-Hour Quotation SLA"],
            de: ["FOB / CIF / DAP Lieferbedingungen", "Optimierte Palettenpackung", "Angebot in 24 Std."],
            fr: ["Incoterms FOB, CIF et DAP", "Optimisation palettes 40' HQ", "Devis sous 24h ouvrées"],
            ar: ["خيارات تسليم FOB و CIF و DAP", "حاويات 20 و 40 قدم", "عرض أسعار خلال 24 ساعة"]
        }
    }
];

const MARQUEE_ITEMS = [
    "DIRECT MANUFACTURER",
    "TURKISH POLYETHYLENE EXPORTER",
    "HEAVY DUTY SACKS",
    "DRAWSTRING TRASH BAGS",
    "WHEELIE BIN LINERS 240L",
    "UN 3291 BIOHAZARD SACKS",
    "PRIVATE LABEL OEM",
    "STAR-SEAL TECHNOLOGY",
    "CONTAINER BULK EXPORT"
];

export default function HeroSlider({ locale, labels }: Props) {
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const isRtl = locale === "ar";
    const base = localePath(locale, "/").replace(/\/$/, "") || "";

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
            className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden bg-slate-950 text-white select-none"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* 4K Background Visual Showcase */}
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
                            {/* Professional industrial gradient: dark on left for typography readability, clear on right for 4K visuals */}
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 via-45% to-slate-950/15" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent via-60% to-slate-950/40" />
                        </div>
                    );
                })}
            </div>

            {/* Subtle Tech Grid Texture */}
            <div className="hero-grid absolute inset-0 z-0 opacity-20 pointer-events-none" />

            {/* Main Slide Content */}
            <div className="container-x relative z-10 pt-20 sm:pt-28 pb-12 flex-1 flex flex-col justify-center">
                <div className="max-w-3xl space-y-6">
                    {/* Badge / Pill */}
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-black tracking-widest uppercase shadow-lg shadow-emerald-950/40 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{tag}</span>
                    </div>

                    {/* Dynamic Title with Gradient Text */}
                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white drop-shadow-md">
                        {title}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl font-normal drop-shadow">
                        {subtitle}
                    </p>

                    {/* Feature Highlights Pills */}
                    <div className="flex flex-wrap gap-2.5 pt-2">
                        {highlights.map((h) => (
                            <span
                                key={h}
                                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-semibold text-slate-200 backdrop-blur-md flex items-center gap-2 transition"
                            >
                                <span className="text-emerald-400 font-bold">✓</span>
                                {h}
                            </span>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-4 pt-4">
                        <Link
                            href={`${base}/quote`}
                            className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-emerald-500/25 hover:shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
                        >
                            <span>📦</span>
                            <span>{labels.ctaQuote}</span>
                        </Link>

                        <a
                            href={`https://wa.me/905336840175?text=${whatsappPrefill}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-4 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/60 text-emerald-300 font-bold text-sm backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
                        >
                            <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse" />
                            <span>WhatsApp: 0533 684 01 75</span>
                        </a>

                        <Link
                            href={`${base}/products`}
                            className="px-6 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm backdrop-blur-md hover:border-slate-500 transition"
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
                        className="w-12 h-12 rounded-full bg-slate-900/70 hover:bg-slate-800 border border-white/20 text-white grid place-items-center backdrop-blur-md transition hover:scale-110 active:scale-90"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={nextSlide}
                        aria-label="Next Slide"
                        className="w-12 h-12 rounded-full bg-slate-900/70 hover:bg-slate-800 border border-white/20 text-white grid place-items-center backdrop-blur-md transition hover:scale-110 active:scale-90"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Bottom Strip: 5 Slide Indicators with Titles & Progress Bar */}
            <div className="relative z-10 border-t border-white/10 bg-slate-950/85 backdrop-blur-md py-4">
                <div className="container-x">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {SLIDES.map((slide, i) => {
                            const slideTitle = slide.tag[locale] || slide.tag.en || "";
                            const isActive = i === current;
                            return (
                                <button
                                    key={slide.image}
                                    onClick={() => setCurrent(i)}
                                    className={`relative text-left p-3 rounded-xl transition border ${
                                        isActive
                                            ? "bg-white/15 border-cyan-400/60 shadow-lg shadow-cyan-950/50"
                                            : "bg-white/5 border-white/10 hover:bg-white/10 opacity-70 hover:opacity-100"
                                    }`}
                                >
                                    <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                                        <span className={isActive ? "text-cyan-300" : "text-slate-400"}>
                                            0{i + 1}
                                        </span>
                                        {isActive && (
                                            <span className="text-emerald-400 font-sans text-[9px] uppercase tracking-wider font-extrabold">
                                                Live
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs font-bold text-white line-clamp-1 leading-snug">
                                        {slideTitle}
                                    </p>

                                    {/* Active Animated Progress Line */}
                                    {isActive && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 rounded-b-xl animate-pulse" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Marquee Ticker */}
            <div className="relative z-10 border-t border-white/10 bg-black/60 py-2.5 overflow-hidden" aria-hidden>
                <div className="marquee flex w-max gap-8 font-mono text-[11px] uppercase tracking-[.25em] text-slate-400">
                    {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((kw, i) => (
                        <span key={`${kw}-${i}`} className="whitespace-nowrap flex items-center gap-4">
                            <span className="text-emerald-400">&bull;</span>
                            {kw}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
