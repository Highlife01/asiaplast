import type { Locale } from "./locales";

type Active = "en" | "tr" | "de" | "fr" | "ar";

function active(locale: Locale): Active {
    return locale === "tr" || locale === "de" || locale === "fr" || locale === "ar" ? locale : "en";
}

export type Industry = { name: string; text: string };
export type CategoryCopy = { name: string; blurb: string };
export type CopyBlock = { title: string; lead: string; paragraphs: string[]; items: { title: string; text: string }[] };
export type LegalPage = { title: string; updated: string; sections: { heading: string; text: string }[] };

const industries: Record<Active, Industry[]> = {
    en: [
        { name: "Retail & Wholesale", text: "Private-label programs for chains and importers." },
        { name: "HoReCa", text: "Hotels, restaurants and catering waste streams." },
        { name: "Healthcare", text: "Color-coded clinical and sanitary waste handling." },
        { name: "Municipal", text: "Heavy-duty sacks for city sanitation fleets." },
        { name: "Facility Management", text: "Bin liner programs for malls and offices." },
        { name: "Industry", text: "Production waste, liners and compactors." }
    ],
    tr: [
        { name: "Perakende & Toptan", text: "Zincirler ve ithalatçılar için özel marka programları." },
        { name: "HoReCa", text: "Otel, restoran ve catering atık akışları." },
        { name: "Sağlık", text: "Renk kodlu klinik ve hijyenik atık yönetimi." },
        { name: "Belediye", text: "Kent temizlik filoları için ağır hizmet poşetleri." },
        { name: "Tesis yönetimi", text: "AVM ve ofisler için çöp poşeti programları." },
        { name: "Sanayi", text: "Üretim atığı, liner ve kompaktörler." }
    ],
    de: [
        { name: "Einzel- & Großhandel", text: "Private-Label-Programme für Ketten und Importeure." },
        { name: "HoReCa", text: "Hotels, Restaurants und Catering-Abfallströme." },
        { name: "Gesundheitswesen", text: "Farbcodierte klinische und hygienische Entsorgung." },
        { name: "Kommunal", text: "Schwerlastsäcke für städtische Reinigungsflotten." },
        { name: "Facility Management", text: "Behälterliner für Malls und Büros." },
        { name: "Industrie", text: "Produktionsabfall, Liner und Verdichter." }
    ],
    fr: [
        { name: "Retail & gros", text: "Programmes marque propre pour enseignes et importateurs." },
        { name: "HoReCa", text: "Hôtels, restaurants et flux de déchets de restauration." },
        { name: "Santé", text: "Tri clinique et sanitaire à code couleur." },
        { name: "Municipal", text: "Sacs haute résistance pour flottes de propreté urbaine." },
        { name: "Facility management", text: "Programmes de sacs pour centres commerciaux et bureaux." },
        { name: "Industrie", text: "Déchets de production, sacs et compacteurs." }
    ],
    ar: [
        { name: "التجزئة والجملة", text: "برامج علامة خاصة للسلاسل والمستوردين." },
        { name: "الضيافة", text: "تيارات نفايات الفنادق والمطاعم والتموين." },
        { name: "الرعاية الصحية", text: "مناولة نفايات سريرية وصحية بترميز لوني." },
        { name: "البلديات", text: "أكياس ثقيلة لأسطول نظافة المدن." },
        { name: "إدارة المنشآت", text: "برامج أكياس للأسواق والمكاتب." },
        { name: "الصناعة", text: "نفايات الإنتاج والبطانات والضاغطات." }
    ]
};

const categories: Record<Active, Record<string, CategoryCopy>> = {
    en: {
        "heavy-duty": { name: "Heavy Duty Garbage Bags", blurb: "High load-bearing sacks for construction, municipal and industrial waste." },
        household: { name: "Household Garbage Bags", blurb: "Retail-ready rolls and T-shirt bags in S/M/L with color options." },
        "industrial-liners": { name: "Industrial Bin Liners", blurb: "Large-volume liners for factories, hotels, hospitals and cleaners." },
        drawstring: { name: "Drawstring Garbage Bags", blurb: "Draw-tape closure for easy lifting and hygienic tying." },
        "star-seal": { name: "Star-Seal Garbage Bags", blurb: "Star-bottom seals distribute weight — the leak-resistant standard." },
        colored: { name: "Colored Garbage Bags", blurb: "Color-coded separation bags in standard and custom shades." },
        "custom-size": { name: "Custom Size Trash Bags", blurb: "Made-to-order widths, lengths and gauges." },
        "private-label": { name: "Private Label Garbage Bags", blurb: "Your brand, print and carton — retail-ready packaging." }
    },
    tr: {
        "heavy-duty": { name: "Ağır Hizmet Çöp Poşeti", blurb: "İnşaat, belediye ve sanayi atığı için yüksek taşıma kapasitesi." },
        household: { name: "Ev Tipi Çöp Poşeti", blurb: "Perakendeye hazır rulo ve tişört poşetler, renk seçenekleriyle." },
        "industrial-liners": { name: "Endüstriyel Konteyner Torbaları", blurb: "Fabrika, otel, hastane ve temizlik firmaları için büyük hacim." },
        drawstring: { name: "Büzgülü Çöp Poşeti", blurb: "Kolay kaldırma ve hijyenik bağlama için çekme ipli ağız." },
        "star-seal": { name: "Yıldız Taban Çöp Poşeti", blurb: "Yıldız taban yükü dağıtır — sızıntıya dirençli standart." },
        colored: { name: "Renkli Çöp Poşeti", blurb: "Atık ayrıştırma için standart ve özel tonlar." },
        "custom-size": { name: "Ölçüye Özel Çöp Poşeti", blurb: "Siparişe göre en, boy ve kalınlık." },
        "private-label": { name: "Özel Marka Çöp Poşeti", blurb: "Markanız, baskınız ve koliniz — rafta hazır ambalaj." }
    },
    de: {
        "heavy-duty": { name: "Schwere Müllbeutel", blurb: "Hoch belastbare Säcke für Bau, Kommune und Industrie." },
        household: { name: "Haushalts-Müllbeutel", blurb: "Handelsfertige Rollen und Hemdchentragetaschen in S/M/L." },
        "industrial-liners": { name: "Industrielle Abfallsäcke", blurb: "Großvolumen-Liner für Fabriken, Hotels und Kliniken." },
        drawstring: { name: "Müllbeutel mit Zugband", blurb: "Zugband für einfaches Heben und hygienisches Verschließen." },
        "star-seal": { name: "Sternboden-Müllbeutel", blurb: "Sternboden verteilt das Gewicht — leckagesicherer Standard." },
        colored: { name: "Farbige Müllbeutel", blurb: "Farbcodierte Trennung in Standard- und Sonderfarben." },
        "custom-size": { name: "Müllbeutel nach Maß", blurb: "Breite, Länge und Stärke auf Bestellung." },
        "private-label": { name: "Private-Label-Müllbeutel", blurb: "Ihre Marke, Ihr Druck, Ihr Karton." }
    },
    fr: {
        "heavy-duty": { name: "Sacs poubelle haute résistance", blurb: "Sacs à forte charge pour chantier, commune et industrie." },
        household: { name: "Sacs poubelle ménagers", blurb: "Rouleaux et sacs gilet prêts retail, tailles S/M/L." },
        "industrial-liners": { name: "Sacs industriels", blurb: "Grands volumes pour usines, hôtels et hôpitaux." },
        drawstring: { name: "Sacs à lien coulissant", blurb: "Lien intégré pour soulever et fermer facilement." },
        "star-seal": { name: "Sacs fond étoile", blurb: "Le fond étoile répartit le poids — standard anti-fuite." },
        colored: { name: "Sacs poubelle colorés", blurb: "Tri à code couleur, teintes standard ou sur mesure." },
        "custom-size": { name: "Sacs aux dimensions", blurb: "Largeur, longueur et micron sur commande." },
        "private-label": { name: "Sacs en marque propre", blurb: "Votre marque, votre impression, votre carton." }
    },
    ar: {
        "heavy-duty": { name: "أكياس قمامة للخدمة الشاقة", blurb: "أكياس عالية التحمل للبناء والبلديات والصناعة." },
        household: { name: "أكياس قمامة منزلية", blurb: "رولات جاهزة للتجزئة بأحجام وألوان متعددة." },
        "industrial-liners": { name: "بطانات حاويات صناعية", blurb: "أحجام كبيرة للمصانع والفنادق والمستشفيات." },
        drawstring: { name: "أكياس برباط سحب", blurb: "رباط مدمج للرفع والإغلاق الصحي." },
        "star-seal": { name: "أكياس بقاع نجمي", blurb: "القاع النجمي يوزع الوزن — معيار مقاومة التسرب." },
        colored: { name: "أكياس قمامة ملونة", blurb: "فرز بالألوان بدرجات قياسية أو مخصصة." },
        "custom-size": { name: "أكياس بمقاس مخصص", blurb: "العرض والطول والسماكة حسب الطلب." },
        "private-label": { name: "أكياس بعلامة خاصة", blurb: "علامتك وطباعتك وكرتونك." }
    }
};

const about: Record<Active, CopyBlock> = {
    en: {
        title: "About ASIAPLAST",
        lead: "A specification-driven manufacturer of garbage bags and bin liners for wholesale, retail and industrial buyers.",
        paragraphs: [
            "ASIAPLAST supplies importers, distributors and retail chains with LDPE/HDPE garbage bags produced to an agreed technical sheet — gauge, width, length, colour, seal and packing defined per SKU.",
            "Every batch is gauge-controlled and seal-tested before packing. We quote EXW, FOB, CIF and DAP with container-optimised palletisation and export documents.",
            "Private-label and OEM programs are available on every line: brand print, carton design and custom counts."
        ],
        items: [
            { title: "Specification first", text: "Each SKU is locked to a datasheet and verified at production." },
            { title: "Export packing", text: "Palletised loads built for 20' and 40' HQ containers." },
            { title: "One accountable desk", text: "Quotation, sampling and shipment handled by the same export team." }
        ]
    },
    tr: {
        title: "ASIAPLAST hakkında",
        lead: "Toptan, perakende ve endüstriyel alıcılar için spesifikasyona dayalı çöp poşeti üreticisi.",
        paragraphs: [
            "ASIAPLAST, ithalatçı, distribütör ve zincirlere LDPE/HDPE çöp poşeti tedarik eder; kalınlık, en, boy, renk, kaynak ve paketleme her SKU için teknik föye bağlanır.",
            "Her parti paketlemeden önce kalınlık ve kaynak kontrolünden geçer. EXW, FOB, CIF ve DAP teklif ederiz.",
            "Özel marka ve OEM her hatta mümkündür: marka baskısı, koli tasarımı ve özel adetler."
        ],
        items: [
            { title: "Önce spesifikasyon", text: "Her SKU bir veri formuna kilitlenir ve üretimde doğrulanır." },
            { title: "İhracat paketleme", text: "20' ve 40' HC konteyner için paletli yükleme." },
            { title: "Tek masa", text: "Teklif, numune ve sevkiyat aynı ihracat ekibinde." }
        ]
    },
    de: {
        title: "Über ASIAPLAST",
        lead: "Spezifikationsgetriebener Hersteller von Müllbeuteln für Großhandel, Retail und Industrie.",
        paragraphs: [
            "ASIAPLAST liefert Importeuren, Händlern und Ketten LDPE/HDPE-Müllbeutel nach vereinbartem Datenblatt.",
            "Jede Charge wird vor dem Packen auf Stärke und Siegel geprüft. Wir bieten EXW, FOB, CIF und DAP.",
            "Private Label und OEM sind in jeder Linie möglich."
        ],
        items: [
            { title: "Spezifikation zuerst", text: "Jedes SKU ist an ein Datenblatt gebunden." },
            { title: "Exportverpackung", text: "Palettiert für 20'- und 40'-HQ-Container." },
            { title: "Ein Ansprechpartner", text: "Angebot, Muster und Versand beim selben Exportteam." }
        ]
    },
    fr: {
        title: "À propos d'ASIAPLAST",
        lead: "Fabricant de sacs poubelle piloté par la spécification, pour le gros, le retail et l'industrie.",
        paragraphs: [
            "ASIAPLAST fournit importateurs, distributeurs et enseignes en sacs LDPE/HDPE selon fiche technique convenue.",
            "Chaque lot est contrôlé (micron et soudure) avant conditionnement. Nous cotons EXW, FOB, CIF et DAP.",
            "La marque propre et l'OEM sont disponibles sur chaque ligne."
        ],
        items: [
            { title: "La spécification d'abord", text: "Chaque SKU est verrouillé sur une fiche et vérifié en production." },
            { title: "Emballage export", text: "Palettes conçues pour conteneurs 20' et 40' HQ." },
            { title: "Un seul bureau", text: "Devis, échantillons et expédition par la même équipe export." }
        ]
    },
    ar: {
        title: "عن ASIAPLAST",
        lead: "مصنّع أكياس قمامة قائم على المواصفات لتجار الجملة والتجزئة والصناعة.",
        paragraphs: [
            "تورّد ASIAPLAST للمستوردين والموزعين والسلاسل أكياس LDPE/HDPE وفق صحيفة فنية متفق عليها.",
            "تُفحص كل دفعة قبل التعبئة. نقدّم عروض EXW وFOB وCIF وDAP.",
            "العلامة الخاصة والتصنيع للغير متاحان في كل خط."
        ],
        items: [
            { title: "المواصفة أولاً", text: "يُقفل كل صنف على صحيفة بيانات ويُتحقق منه في الإنتاج." },
            { title: "تعبئة تصدير", text: "باليتات محسّنة لحاويات 20 و40 قدم." },
            { title: "مكتب واحد", text: "العرض والعينة والشحن لدى فريق التصدير نفسه." }
        ]
    }
};

const exportPage: Record<Active, CopyBlock> = {
    en: {
        title: "Global export",
        lead: "Container-ready packing and full export documentation for buyers worldwide.",
        paragraphs: [
            "We ship to importers and distributors across Europe, the Middle East, Africa and Asia. Packing is designed around 20' and 40' HQ containers.",
            "Standard documents include commercial invoice, packing list, certificate of origin and, where required, a test report for the agreed specification."
        ],
        items: [
            { title: "EXW", text: "Collection from our packing point." },
            { title: "FOB", text: "Port of loading arranged with your forwarder or ours." },
            { title: "CIF", text: "Freight and insurance to the named destination port." },
            { title: "DAP", text: "Delivered to an agreed place, duties unpaid." }
        ]
    },
    tr: {
        title: "Küresel ihracat",
        lead: "Dünya alıcıları için konteynere hazır paketleme ve tam ihracat evrakı.",
        paragraphs: [
            "Avrupa, Ortadoğu, Afrika ve Asya'daki ithalatçı ve distribütörlere sevkiyat yapıyoruz.",
            "Standart evrak: ticari fatura, çeki listesi, menşe ve gerektiğinde test raporu."
        ],
        items: [
            { title: "EXW", text: "Paketleme noktasından teslim." },
            { title: "FOB", text: "Yükleme limanı sizin veya bizim forwarder ile." },
            { title: "CIF", text: "Varış limanına navlun ve sigorta." },
            { title: "DAP", text: "Anlaşılan yere teslim, vergiler hariç." }
        ]
    },
    de: {
        title: "Globaler Export",
        lead: "Containerfertige Verpackung und vollständige Exportdokumente.",
        paragraphs: [
            "Wir liefern an Importeure in Europa, dem Nahen Osten, Afrika und Asien.",
            "Standarddokumente: Handelsrechnung, Packliste, Ursprungszeugnis und bei Bedarf Prüfbericht."
        ],
        items: [
            { title: "EXW", text: "Abholung am Packpunkt." },
            { title: "FOB", text: "Verladehafen mit Ihrem oder unserem Spediteur." },
            { title: "CIF", text: "Fracht und Versicherung zum Bestimmungshafen." },
            { title: "DAP", text: "Geliefert an vereinbarten Ort, unverzollt." }
        ]
    },
    fr: {
        title: "Export mondial",
        lead: "Emballage prêt conteneur et documentation d'export complète.",
        paragraphs: [
            "Nous livrons importateurs et distributeurs en Europe, Moyen-Orient, Afrique et Asie.",
            "Documents types : facture, packing list, certificat d'origine et rapport d'essai si requis."
        ],
        items: [
            { title: "EXW", text: "Enlèvement au point d'emballage." },
            { title: "FOB", text: "Port d'embarquement avec votre transitaire ou le nôtre." },
            { title: "CIF", text: "Fret et assurance jusqu'au port de destination." },
            { title: "DAP", text: "Rendu au lieu convenu, droits non acquittés." }
        ]
    },
    ar: {
        title: "التصدير العالمي",
        lead: "تعبئة جاهزة للحاوية ومستندات تصدير كاملة.",
        paragraphs: [
            "نُشحن للمستوردين في أوروبا والشرق الأوسط وأفريقيا وآسيا.",
            "المستندات القياسية: فاتورة تجارية وقائمة تعبئة وشهادة منشأ وتقرير اختبار عند الحاجة."
        ],
        items: [
            { title: "EXW", text: "الاستلام من نقطة التعبئة." },
            { title: "FOB", text: "ميناء التحميل مع وكيل الشحن." },
            { title: "CIF", text: "النولون والتأمين حتى ميناء الوصول." },
            { title: "DAP", text: "التسليم لمكان متفق عليه دون الرسوم." }
        ]
    }
};

const privateLabel: Record<Active, CopyBlock> = {
    en: {
        title: "Private label / OEM",
        lead: "Your brand on retail-ready rolls, printed bags and cartons.",
        paragraphs: [
            "We produce own-brand programs for retailers and importers: flexo print up to 6 colours, custom counts per roll, display cartons and barcode labels.",
            "Send artwork and target specification — we return a pre-press proof and a sampling plan before mass production."
        ],
        items: [
            { title: "1. Brief", text: "Artwork, size, gauge, count and destination." },
            { title: "2. Proof", text: "Pre-press proof and, if needed, a fit sample." },
            { title: "3. Production", text: "Batch control against the locked datasheet." },
            { title: "4. Pack & ship", text: "Retail cartons, pallets and export documents." }
        ]
    },
    tr: {
        title: "Özel marka / OEM",
        lead: "Perakendeye hazır rulo, baskılı poşet ve kolilerde sizin markanız.",
        paragraphs: [
            "Perakendeci ve ithalatçılar için özel marka programı: 6 renge kadar fleksobaskı, rulo adedi, teşhir kolisi ve barkod.",
            "Tasarım ve spesifikasyonu gönderin — seri üretimden önce prova ve numune planı iletiriz."
        ],
        items: [
            { title: "1. Brief", text: "Tasarım, ölçü, kalınlık, adet ve hedef ülke." },
            { title: "2. Prova", text: "Baskı provası ve gerekirse ölçü numunesi." },
            { title: "3. Üretim", text: "Kilitli föye göre parti kontrolü." },
            { title: "4. Sevkiyat", text: "Perakende koli, palet ve ihracat evrakı." }
        ]
    },
    de: {
        title: "Private Label / OEM",
        lead: "Ihre Marke auf handelsfertigen Rollen, Beuteln und Kartons.",
        paragraphs: [
            "Eigenmarkenprogramme für Handel und Importeure: Flexodruck bis 6 Farben, Stückzahlen, Displaykartons und Barcodes.",
            "Senden Sie Artwork und Spezifikation — wir liefern Proof und Bemusterung vor der Serie."
        ],
        items: [
            { title: "1. Briefing", text: "Artwork, Maß, Stärke, Stückzahl, Zielmarkt." },
            { title: "2. Proof", text: "Druckproof und bei Bedarf Passmuster." },
            { title: "3. Produktion", text: "Chargenkontrolle gegen das Datenblatt." },
            { title: "4. Versand", text: "Kartons, Paletten, Exportdokumente." }
        ]
    },
    fr: {
        title: "Marque propre / OEM",
        lead: "Votre marque sur rouleaux, sacs imprimés et cartons prêts retail.",
        paragraphs: [
            "Programmes marque propre : flexo jusqu'à 6 couleurs, quantités par rouleau, cartons et codes-barres.",
            "Envoyez le visuel et la spécification — bon à tirer et plan d'échantillonnage avant série."
        ],
        items: [
            { title: "1. Brief", text: "Visuel, taille, micron, quantités, destination." },
            { title: "2. BAT", text: "Bon à tirer et échantillon d'ajustement si besoin." },
            { title: "3. Production", text: "Contrôle de lot selon la fiche verrouillée." },
            { title: "4. Expédition", text: "Cartons, palettes et documents d'export." }
        ]
    },
    ar: {
        title: "علامة خاصة / تصنيع للغير",
        lead: "علامتك على رولات وأكياس وكرتون جاهز للتجزئة.",
        paragraphs: [
            "برامج علامة خاصة: طباعة فلكسو حتى 6 ألوان، عدد مخصص في الرول، كراتين عرض وباركود.",
            "أرسل التصميم والمواصفة — نعيد بروفة طباعة وخطة عينات قبل الإنتاج."
        ],
        items: [
            { title: "1. الموجز", text: "التصميم والمقاس والسماكة والعدد والوجهة." },
            { title: "2. البروفة", text: "بروفة طباعة وعينة مقاس عند الحاجة." },
            { title: "3. الإنتاج", text: "ضبط الدفعة وفق الصحيفة المقفلة." },
            { title: "4. الشحن", text: "كرتون التجزئة والباليتات ومستندات التصدير." }
        ]
    }
};

const privacy: Record<Active, LegalPage> = {
    en: {
        title: "Privacy Policy & Data Protection",
        updated: "13 October 2026",
        sections: [
            { heading: "Data Controller", text: "AsiaPlast Polimer ve Plastik Sanayi Dış Ticaret A.Ş. (Tax ID: 0910842190 - İkitelli Tax Office, Mersis: 0091084219000001, Trade Registry: 842190-5) operates this portal to process corporate wholesale and export inquiries under GDPR and Turkish Data Protection Law (KVKK Law No: 6698)." },
            { heading: "What We Collect", text: "When you submit a contact, quotation, or technical datasheet (TDS) request, we collect your name, company name, corporate email, phone/WhatsApp, target country, specifications, and language preference. We do not sell or lease corporate data." },
            { heading: "Purpose & Legal Grounds", text: "Data is processed strictly to prepare B2B commercial quotations, verify technical extrusion parameters, issue proforma invoices, and fulfill delivery orders under legitimate business interest and contractual performance." },
            { heading: "Analytics & Session Cookies", text: "We use a single first-party HttpOnly __session cookie for admin authentication and anonymous first-party visit statistics. We do not use localStorage, sessionStorage, IndexedDB, third-party advertising trackers, or device fingerprinting." },
            { heading: "Data Retention & Security", text: "Records are stored in secure cloud systems for commercial and fiscal audit compliance periods, after which they are systematically deleted or anonymized." },
            { heading: "Your Rights & Contact", text: "You may exercise your rights of access, rectification, or deletion by contacting export@asiaplastik.com.tr or writing to our Global Export Office at Dünya Ticaret Merkezi, A-2 Blok Kat: 9, Bakırköy / İstanbul." }
        ]
    },
    tr: {
        title: "Gizlilik Politikası ve KVKK Aydınlatma Metni",
        updated: "13 Ekim 2026",
        sections: [
            { heading: "Veri Sorumlusu", text: "6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca veri sorumlusu: AsiaPlast Polimer ve Plastik Sanayi Dış Ticaret A.Ş. (İkitelli Vergi Dairesi - 0910842190 | Mersis No: 0091084219000001 | Ticaret Sicil No: 842190-5)." },
            { heading: "Toplanan Veriler", text: "İletişim, teklif alma ve TDS teknik föy talep formları üzerinden paylaşılan ad-soyad, kurumsal unvan, iş e-postası, telefon/WhatsApp, ülke ve teknik ürün talepleri işlenmektedir. Verileriniz üçüncü şahıslara ticari amaçla satılmaz." },
            { heading: "İşleme Amacı ve Hukuki Sebepler", text: "Veriler; B2B teklif ve proforma fatura düzenlenmesi, teknik üretim fizibilitesi yapılması ve sözleşme süreçlerinin yürütülmesi amaçlarıyla KVKK 5/2 maddesi kapsamında meşru menfaat ve sözleşmenin ifası hukuki sebepleriyle işlenir." },
            { heading: "Analitik ve Oturum Çerezleri", text: "Yönetim paneli kimlik doğrulaması ve anonim birinci taraf ziyaret istatistikleri için tek bir HttpOnly __session çerezi kullanılır. localStorage, sessionStorage, IndexedDB, üçüncü taraf reklam izleyicileri veya cihaz parmak izi kullanılmaz." },
            { heading: "Saklama Süresi ve Güvenlik", text: "Toplanan ticari talep kayıtları, yasal zamanaşımı ve ticari arşiv süreleri boyunca güvenli sunucularda saklanır; sürenin bitiminde imha edilir veya anonim hale getirilir." },
            { heading: "Haklarınız ve Başvuru", text: "KVKK'nın 11. maddesi kapsamındaki haklarınızı export@asiaplastik.com.tr e-posta adresimiz üzerinden veya DTM Bakırköy / İstanbul İhracat Ofisimize yazılı olarak başvurarak kullanabilirsiniz." }
        ]
    },
    de: {
        title: "Datenschutzerklärung & DSGVO-Hinweise",
        updated: "13. Oktober 2026",
        sections: [
            { heading: "Verantwortliche Stelle", text: "Verantwortlicher im Sinne der DSGVO und des türkischen Datenschutzgesetzes (KVKK Nr. 6698): AsiaPlast Polimer ve Plastik Sanayi Dış Ticaret A.Ş. (USt-IdNr.: 0910842190, Mersis: 0091084219000001, Handelsregister: 842190-5)." },
            { heading: "Erhobene Daten", text: "Bei Kontaktaufnahme, Angebotsanfragen oder TDS-Datenblattabrufen verarbeiten wir Name, Firmenname, geschäftliche E-Mail, Telefon/WhatsApp, Zielland und Produktspezifikationen." },
            { heading: "Zweck und Rechtsgrundlage", text: "Die Datenverarbeitung erfolgt zur Bearbeitung gewerblicher B2B-Anfragen, Erstellung von Proforma-Rechnungen und Vertragsanbahnung gem. Art. 6 Abs. 1 lit. b und f DSGVO." },
            { heading: "Analyse- & Sitzungs-Cookies", text: "Wir verwenden ein einziges First-Party-HttpOnly-Cookie (__session) für die Admin-Authentifizierung und anonyme Besuchsstatistiken. Es werden weder localStorage, sessionStorage, IndexedDB noch Fingerprinting verwendet." },
            { heading: "Speicherdauer", text: "Anfragedaten werden gemäß den gesetzlichen handels- und steuerrechtlichen Aufbewahrungspflichten gespeichert und anschließend datenschutzkonform gelöscht." },
            { heading: "Betroffenenrechte", text: "Sie haben das Recht auf Auskunft, Berichtigung und Löschung. Wenden Sie sich bitte an export@asiaplastik.com.tr oder schriftlich an unser Exportbüro am World Trade Center (DTM), Bakırköy / Istanbul." }
        ]
    },
    fr: {
        title: "Politique de Confidentialité et RGPD",
        updated: "13 octobre 2026",
        sections: [
            { heading: "Responsable du Traitement", text: "AsiaPlast Polimer ve Plastik Sanayi Dış Ticaret A.Ş. (N° d'enregistrement fiscal : 0910842190, Mersis : 0091084219000001, Registre du commerce : 842190-5) exploite cette plateforme conformément au RGPD et à la loi turque KVKK n° 6698." },
            { heading: "Données Collectées", text: "Nous collectons nom, entreprise, e-mail professionnel, téléphone/WhatsApp, pays de destination et spécifications techniques fournis lors des demandes de devis et fiches TDS." },
            { heading: "Finalités et Bases Légales", text: "Les données sont traitées pour l'établissement de propositions commerciales B2B, études de faisabilité et exécution contractuelle (Art. 6.1.b et 6.1.f RGPD)." },
            { heading: "Cookies Analytiques et de Session", text: "Un seul cookie first-party HttpOnly (__session) est utilisé pour l'authentification admin et les statistiques anonymes. Pas de localStorage, sessionStorage, IndexedDB ni d'empreinte d'appareil." },
            { heading: "Conservation des Données", text: "Les dossiers commerciaux sont conservés pendant les durées légales de prescription commerciale avant archivage sécurisé ou suppression." },
            { heading: "Vos Droits", text: "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et d'effacement via export@asiaplastik.com.tr ou auprès de notre Bureau Export au World Trade Center d'Istanbul." }
        ]
    },
    ar: {
        title: "سياسة الخصوصية وحماية البيانات",
        updated: "13 أكتوبر 2026",
        sections: [
            { heading: "المسؤول عن معالجة البيانات", text: "شركة AsiaPlast Polimer ve Plastik Sanayi Dış Ticaret A.Ş. (الرقم الضريبي: 0910842190 - إيكيتيلي، رقم السجل التجاري: 842190-5، ميرسيس: 0091084219000001) تدير هذا الموقع وفق اللائحة العامة لحماية البيانات والقانون التركي KVKK رقم 6698." },
            { heading: "البيانات التي نجمعها", text: "عند تقديم طلب عرض أسعار أو بطاقة TDS فنية، نجمع الاسم، اسم الشركة، البريد التجاري، الهاتف، بلد الوجهة والمواصفات الفنية المطلوبة. لا نبيع بيانات الشركات إطلاقاً." },
            { heading: "الغرض والأساس القانوني", text: "تُعالج البيانات لإعداد عروض الأسعار وفواتير البروفورما وتنفيذ عقود التصدير وفق المصلحة المشروعة والوفاء بالعقود." },
            { heading: "ملفات الجلسة والتحليلات", text: "نستخدم ملف تعريف ارتباط واحد HttpOnly (__session) لمصادقة الإدارة وإحصاءات الزيارة المجهولة. لا نستخدم localStorage أو sessionStorage أو IndexedDB أو بصمة الجهاز." },
            { heading: "فترة الاحتفاظ بالبيانات", text: "تُحفظ السجلات طوال الفترة القانونية والتجارية اللازمة ثم تُحذف أو تُعمّى بشكل آمن." },
            { heading: "حقوقكم والتواصل", text: "يحق لكم طلب الوصول إلى البيانات أو تعديلها عبر مراسلة export@asiaplastik.com.tr أو مراسلة مكتب التصدير الدولي في مركز التجارة العالمي، بكركوي / إسطنبول." }
        ]
    }
};

const terms: Record<Active, LegalPage> = {
    en: {
        title: "Terms & conditions",
        updated: "11 October 2026",
        sections: [
            { heading: "Quotations", text: "Prices, lead times and packing on a quotation are valid for the period stated on the offer and apply only to the specification quoted. They are not a public offer." },
            { heading: "Orders", text: "A contract is formed when we confirm the order in writing (including email). Production starts after the agreed payment terms are met." },
            { heading: "Specification", text: "Goods are manufactured to the locked technical sheet. Minor process tolerances are inherent to blown-film production." },
            { heading: "Delivery", text: "Incoterms on the confirmation govern risk and cost. Transit delays outside our control do not constitute a breach." },
            { heading: "Website", text: "Content on this site is informational. We may update product descriptions without notice. Governing law and venue will be stated on the order confirmation." }
        ]
    },
    tr: {
        title: "Şartlar ve koşullar",
        updated: "11 Ekim 2026",
        sections: [
            { heading: "Teklifler", text: "Fiyat, süre ve paketleme teklifte yazılan süre için ve yalnızca o spesifikasyon için geçerlidir. Genel izahname değildir." },
            { heading: "Sipariş", text: "Sözleşme yazılı (e-posta dahil) teyitle kurulur. Üretim, ödeme koşulu sağlanınca başlar." },
            { heading: "Spesifikasyon", text: "Ürün kilitli teknik föye göre üretilir. Film üretiminde küçük proses toleransları doğaldır." },
            { heading: "Teslimat", text: "Risk ve masraf teyitteki Incoterm'e tabidir. Kontrolümüz dışındaki gecikme ihlal sayılmaz." },
            { heading: "Site", text: "İçerik bilgilendirme amaçlıdır. Ürün açıklamaları güncellenebilir. Uygulanacak hukuk sipariş teyidinde belirtilir." }
        ]
    },
    de: {
        title: "Allgemeine Geschäftsbedingungen",
        updated: "11. Oktober 2026",
        sections: [
            { heading: "Angebote", text: "Preise und Fristen gelten für den im Angebot genannten Zeitraum und nur für die angebotene Spezifikation." },
            { heading: "Bestellung", text: "Vertrag mit schriftlicher Bestätigung (auch E-Mail). Produktion nach vereinbarter Zahlung." },
            { heading: "Spezifikation", text: "Fertigung nach gesperrtem Datenblatt. Folientoleranzen sind produktionsbedingt." },
            { heading: "Lieferung", text: "Incoterm der Bestätigung regelt Gefahr und Kosten." },
            { heading: "Website", text: "Inhalte sind informativ. Anwendbares Recht steht in der Auftragsbestätigung." }
        ]
    },
    fr: {
        title: "Conditions générales",
        updated: "11 octobre 2026",
        sections: [
            { heading: "Devis", text: "Prix et délais valables pour la période indiquée et pour la seule spécification cotée." },
            { heading: "Commande", text: "Contrat formé par confirmation écrite (e-mail compris). Production après paiement convenu." },
            { heading: "Spécification", text: "Fabrication selon la fiche verrouillée. Tolérances de film inhérentes au process." },
            { heading: "Livraison", text: "L'incoterm de la confirmation régit risques et frais." },
            { heading: "Site", text: "Contenu informatif. Le droit applicable figure sur la confirmation de commande." }
        ]
    },
    ar: {
        title: "الشروط والأحكام",
        updated: "11 أكتوبر 2026",
        sections: [
            { heading: "العروض", text: "الأسعار والمدد والتعبئة سارية للمدة المذكورة وللمواصفة المعروضة فقط." },
            { heading: "الطلب", text: "ينعقد العقد بالتأكيد الكتابي (بما فيه البريد). يبدأ الإنتاج بعد شرط الدفع." },
            { heading: "المواصفة", text: "يُصنَّع وفق الصحيفة المقفلة. تفاوتات الفيلم طبيعية في الإنتاج." },
            { heading: "التسليم", text: "شرط الإنكوتيرم في التأكيد يحكم المخاطر والتكاليف." },
            { heading: "الموقع", text: "المحتوى إعلامي. يُذكر القانون الواجب في تأكيد الطلب." }
        ]
    }
};

export function getIndustries(locale: Locale): Industry[] {
    return industries[active(locale)];
}

export function getCategoryCopy(locale: Locale, id: string): CategoryCopy {
    return categories[active(locale)][id] || categories.en[id] || { name: id, blurb: "" };
}

export function getAboutCopy(locale: Locale): CopyBlock {
    return about[active(locale)];
}

export function getExportCopy(locale: Locale): CopyBlock {
    return exportPage[active(locale)];
}

export function getPrivateLabelCopy(locale: Locale): CopyBlock {
    return privateLabel[active(locale)];
}

export function getPrivacyCopy(locale: Locale): LegalPage {
    return privacy[active(locale)];
}

export function getTermsCopy(locale: Locale): LegalPage {
    return terms[active(locale)];
}
