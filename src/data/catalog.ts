import type { Locale } from "@/lib/i18n/locales";

/**
 * Product category definitions and seed catalog with full 5-language localization.
 * (English, Turkish, German, French, Arabic)
 */

export type Category = {
    id: string;
    icon: string;
    en: { name: string; blurb: string };
    tr: { name: string; blurb: string };
    de: { name: string; blurb: string };
    fr: { name: string; blurb: string };
    ar: { name: string; blurb: string };
};

export const CATEGORIES: Category[] = [
    {
        id: "heavy-duty",
        icon: "🛢️",
        en: {
            name: "Heavy Duty Garbage Bags",
            blurb: "High load-bearing sacks for construction sites, municipal sanitation and industrial waste streams."
        },
        tr: {
            name: "Ağır Hizmet Çöp Poşeti",
            blurb: "Şantiye, belediye temizlik filoları ve ağır sanayi atıkları için ekstra mukavemetli çöp torbaları."
        },
        de: {
            name: "Schwerlast-Müllsäcke",
            blurb: "Hoch belastbare Säcke für Baustellen, Kommunalbetriebe und Industrieabfälle."
        },
        fr: {
            name: "Sacs Poubelle Haute Résistance",
            blurb: "Sacs à forte charge pour chantiers, propreté urbaine et déchets industriels."
        },
        ar: {
            name: "أكياس نفايات شديدة التحمل",
            blurb: "أكياس عالية المتانة لمواقع البناء والبلديات والنفايات الصناعية الثقيلة."
        }
    },
    {
        id: "household",
        icon: "🏠",
        en: {
            name: "Household Garbage Bags",
            blurb: "Retail-ready rolls and T-shirt bags in small, medium and large sizes with color options."
        },
        tr: {
            name: "Ev Tipi Çöp Poşeti",
            blurb: "S/M/L ebatlarında, perakendeye hazır perforeli rulo ve tişört poşetler, koku bariyeri ve renk seçenekleriyle."
        },
        de: {
            name: "Haushalts-Müllbeutel",
            blurb: "Handelsfertige Rollen in S/M/L mit Geruchsbarriere und Farboptionen."
        },
        fr: {
            name: "Sacs Poubelle Ménagers",
            blurb: "Rouleaux prêts pour la vente au détail en tailles S/M/L avec options parfumées et colorées."
        },
        ar: {
            name: "أكياس قمامة منزلية",
            blurb: "رولات مثقوبة جاهزة للبيع بالتجزئة بأحجام متنوعة وحواجز روائح متطورة."
        }
    },
    {
        id: "industrial-liners",
        icon: "🏭",
        en: {
            name: "Industrial Bin Liners",
            blurb: "Large-volume liners for factories, hotels, hospitals, restaurants and cleaning companies."
        },
        tr: {
            name: "Endüstriyel Konteyner Torbaları",
            blurb: "240L–1100L tekerlekli çöp konteynerleri, kompaktörler ve otel/fabrika temizliği için battal boy astar poşetler."
        },
        de: {
            name: "Industrielle Abfallsäcke",
            blurb: "Großvolumen-Liner für 240L–1100L Müllgroßbehälter, Fabriken und Hotels."
        },
        fr: {
            name: "Housses de Conteneurs Industriels",
            blurb: "Grands volumes adaptés aux conteneurs roulants de 240L à 1100L et compacteurs."
        },
        ar: {
            name: "بطانات حاويات صناعية",
            blurb: "أكياس ذات سعة كبيرة مخصصة للحاويات سعة 240 إلى 1100 لتر والمصانع والفنادق."
        }
    },
    {
        id: "drawstring",
        icon: "🎀",
        en: {
            name: "Drawstring Garbage Bags",
            blurb: "Convenient draw-tape closure bags for easy lifting and hygienic tying."
        },
        tr: {
            name: "Büzgülü Çöp Poşeti",
            blurb: "Tek hareketle kapanan büzgülü kordonlu ağız yapısı, kolay kaldırma ve hijyenik sızdırmaz bağlama."
        },
        de: {
            name: "Zugband-Müllbeutel",
            blurb: "Integrierter Zugbandverschluss für leichtes Tragen und hygienisches Verschließen."
        },
        fr: {
            name: "Sacs à Lien Coulissant",
            blurb: "Fermeture par lien coulissant intégré pour un levage ergonomique et hygiénique."
        },
        ar: {
            name: "أكياس برباط سحب",
            blurb: "أربطة سحب مدمجة لسهولة الحمل والإغلاق المحكم والنظيف."
        }
    },
    {
        id: "star-seal",
        icon: "⭐",
        en: {
            name: "Star-Seal Garbage Bags",
            blurb: "Star-bottom seals distribute weight evenly — the professional choice for leak resistance."
        },
        tr: {
            name: "Yıldız Taban Çöp Poşeti",
            blurb: "Ağırlığı dairesel olarak tabana eşit dağıtan yıldız kaynak teknolojisi — sızıntılara karşı en güvenilir standart."
        },
        de: {
            name: "Sternboden-Müllbeutel",
            blurb: "Sternboden-Verschweißung verteilt das Gewicht gleichmäßig und verhindert Leckagen."
        },
        fr: {
            name: "Sacs Fond Étoile",
            blurb: "Soudure en étoile pour une parfaite répartition de la charge et zéro fuite."
        },
        ar: {
            name: "أكياس بقاع نجمي مانع للتسرب",
            blurb: "تصميم القاع النجمي الدائري يوزع الوزن بالتساوي ويضمن مقاومة فائقة للتسرب."
        }
    },
    {
        id: "colored",
        icon: "🎨",
        en: {
            name: "Colored Garbage Bags",
            blurb: "Color-coded waste separation bags in blue, yellow, red, green and custom shades."
        },
        tr: {
            name: "Renkli Çöp Poşeti",
            blurb: "Geri dönüşüm ve atık ayrıştırma sistemleri için mavi, sarı, kırmızı, yeşil ve kurumsal renk seçenekleri."
        },
        de: {
            name: "Farbige Müllbeutel",
            blurb: "Farbcodierte Müllbeutel für Sortiersysteme in Blau, Gelb, Rot, Grün und Sonderfarben."
        },
        fr: {
            name: "Sacs Poubelle Colorés",
            blurb: "Sacs de tri sélectif à code couleur : bleu, jaune, rouge, vert et teintes sur mesure."
        },
        ar: {
            name: "أكياس نفايات ملونة",
            blurb: "أكياس ترميز لوني لفرز وتدوير النفايات (أزرق، أصفر، أحمر، أخضر وألوان مخصصة)."
        }
    },
    {
        id: "custom-size",
        icon: "📐",
        en: {
            name: "Custom Size Trash Bags",
            blurb: "Made-to-order widths, lengths and gauges for non-standard bins and machinery."
        },
        tr: {
            name: "Ölçüye Özel Çöp Poşeti",
            blurb: "Standart dışı çöp kovaları ve endüstriyel makineler için özel en, boy, körük ve mikron üretimi."
        },
        de: {
            name: "Müllbeutel nach Maß",
            blurb: "Individuelle Breiten, Längen und Folienstärken für Spezialbehälter und Maschinen."
        },
        fr: {
            name: "Sacs Poubelle Sur Mesure",
            blurb: "Dimensions, soufflets et épaisseurs personnalisés selon les dimensions exactes de vos bacs."
        },
        ar: {
            name: "أكياس نفايات بمقاسات مخصصة",
            blurb: "تصنيع حسب الطلب للعرض والطول والسماكة للحاويات والآلات غير القياسية."
        }
    },
    {
        id: "private-label",
        icon: "🏷️",
        en: {
            name: "Private Label Garbage Bags",
            blurb: "Your brand, print and carton — retail-ready packaging produced to your artwork."
        },
        tr: {
            name: "Özel Marka (Private Label / OEM)",
            blurb: "Markanız, 6 renge kadar flekso logonuz, özel koli tasarımınız ve EAN barkodunuz ile rafta hazır ambalaj."
        },
        de: {
            name: "Private Label / OEM Müllbeutel",
            blurb: "Ihre Marke, 6-Farben-Flexodruck, Verpackungsdesign und EAN-Barcodes für den Handel."
        },
        fr: {
            name: "Sacs en Marque Distributeur (OEM)",
            blurb: "Votre marque, impression flexo jusqu'à 6 couleurs, cartons et codes-barres EAN prêts pour les rayons."
        },
        ar: {
            name: "أكياس بعلامة تجارية خاصة (OEM)",
            blurb: "شعارك التجاري وطباعة فلكسو حتى 6 ألوان مع كرتون مخصص وباركود EAN دولي."
        }
    }
];

export type LocalizedString = Record<"en" | "tr" | "de" | "fr" | "ar", string>;

export type SeedProductRaw = {
    slug: string;
    categoryId: string;
    names: LocalizedString;
    shortDescriptions: LocalizedString;
    descriptions: LocalizedString;
    standards: LocalizedString;
    moq: LocalizedString;
    sortOrder: number;
    specs: {
        label: LocalizedString;
        value: LocalizedString;
    }[];
};

export type SeedProduct = {
    slug: string;
    categoryId: string;
    name: string;
    shortDescription: string;
    description: string;
    standards?: string;
    moq: string;
    sortOrder: number;
    specs: { label: string; value: string }[];
};

export const RAW_PRODUCTS: SeedProductRaw[] = [
    {
        slug: "heavy-duty-garbage-bags",
        categoryId: "heavy-duty",
        names: {
            tr: "Ağır Hizmet Çöp Poşeti (120–150 µm)",
            en: "Heavy Duty Garbage Bags (120–150 µm)",
            de: "Schwerlast-Müllsäcke (120–150 µm)",
            fr: "Sacs Poubelle Haute Résistance (120–150 µm)",
            ar: "أكياس نفايات شديدة التحمل (120-150 ميكرون)"
        },
        shortDescriptions: {
            tr: "İnşaat, moloz, belediye ve ağır sanayi atıkları için delinmeye dirençli LDPE/HDPE çöp torbası.",
            en: "Puncture-resistant LDPE/HDPE sacks engineered for construction sites and heavy industrial waste.",
            de: "Reißfeste LDPE/HDPE-Säcke für Baustellen, Bauschutt und schwere Industrieabfälle.",
            fr: "Sacs renforcés anti-perforation en LDPE/HDPE pour chantiers et déchets industriels lourds.",
            ar: "أكياس LDPE/HDPE متينة ومقاومة للثقب مخصصة لمواقع البناء والنفايات الصناعية الثقيلة."
        },
        descriptions: {
            tr: "ASIAPLAST ağır hizmet çöp torbaları, saf veya yüksek kaliteli geri dönüştürülmüş LDPE/HDPE harmanından üretilir. Ekstra kalın gövde yapısı sayesinde keskin ve ağır moloz atıklarında yırtılma yapmaz. Her parti sevkiyat öncesinde mikron kontrolünden ve taban kaynak sızdırmazlık testinden geçer.",
            en: "ASIAPLAST heavy duty refuse sacks are engineered from virgin or certified recycled LDPE/HDPE blends with reinforced gauges for maximum tear and dart-impact resistance. Every production lot is quality-verified under strict ASTM standards before container packing.",
            de: "ASIAPLAST Schwerlast-Müllsäcke werden aus sortenreinen oder recycelten LDPE/HDPE-Mischungen gefertigt. Höchste Durchstoß- und Reißfestigkeit für anspruchsvolle Bauschutt- und Industrieabfälle, geprüft nach anerkannten europäischen Standards.",
            fr: "Fabriqués en mélanges PEBD/PEHD vierges ou recyclés haute densité, les sacs haute résistance ASIAPLAST offrent une barrière robuste contre les déchirures et perforations provoquées par les déchets volumineux et abrasifs de chantiers.",
            ar: "تُصنع أكياس النفايات الثقيلة من ASIAPLAST من خامات البولي إيثيلين البكر أو المعاد تدويره عالي الكثافة. تتميز بمقاومة فائقة للتمزق والثقب الناتجة عن مخلفات البناء والأوزان الثقيلة مع اختبارات جودة لكل دفعة قبل الشحن."
        },
        standards: {
            tr: "ASTM D1709 (Dart Düşme Darbe Testi) & ISO 9001:2015",
            en: "ASTM D1709 Dart Impact Resistance & ISO 9001:2015",
            de: "ASTM D1709 Durchstoßprüfung & ISO 9001:2015",
            fr: "Conformité ASTM D1709 (Résistance aux chocs) & ISO 9001:2015",
            ar: "معايير ASTM D1709 لمقاومة الصدمات و ISO 9001:2015"
        },
        moq: {
            tr: "Spesifikasyona göre 1 palet veya 20' konteyner",
            en: "1 Pallet standard or 1 x 20' HQ Container OEM",
            de: "1 Palette Standard oder 20'-Container OEM",
            fr: "1 Palette standard ou 1 conteneur 20' OEM",
            ar: "باليت واحد للمعياري أو حاوية 20 قدم للمخصص"
        },
        sortOrder: 1,
        specs: [
            {
                label: { tr: "Hammadde", en: "Material", de: "Material", fr: "Matière", ar: "المادة الخام" },
                value: { tr: "LDPE / HDPE / Recycled PCR Karışım", en: "LDPE / HDPE / Recycled PCR Blends", de: "LDPE / HDPE / Recyceltes PCR", fr: "PEBD / PEHD / Mélanges PCR", ar: "LDPE / HDPE / خليط PCR معاد تدويره" }
            },
            {
                label: { tr: "Kalınlık", en: "Thickness", de: "Folienstärke", fr: "Épaisseur", ar: "السماكة" },
                value: { tr: "40 – 200 mikron (Standart: 120–150 µm)", en: "40 – 200 micron (Standard: 120–150 µm)", de: "40 – 200 µm (Standard: 120–150 µm)", fr: "40 – 200 microns (Standard: 120–150 µm)", ar: "40 - 200 ميكرون (القياسي: 120-150 ميكرون)" }
            },
            {
                label: { tr: "Genişlik", en: "Width", de: "Breite", fr: "Largeur", ar: "العرض" },
                value: { tr: "50 – 150 cm", en: "50 – 150 cm", de: "50 – 150 cm", fr: "50 – 150 cm", ar: "50 - 150 سم" }
            },
            {
                label: { tr: "Uzunluk", en: "Length", de: "Länge", fr: "Longueur", ar: "الطول" },
                value: { tr: "70 – 250 cm", en: "70 – 250 cm", de: "70 – 250 cm", fr: "70 – 250 cm", ar: "70 - 250 سم" }
            },
            {
                label: { tr: "Kaynak Tipi", en: "Bottom Sealing", de: "Bodennaht", fr: "Type de Soudure", ar: "نوع اللحام" },
                value: { tr: "Yıldız Taban veya Güçlendirilmiş Düz Kaynak", en: "Star Seal or Reinforced Flat Seal", de: "Sternboden oder verstärkte Flachnaht", fr: "Fond Étoile ou Soudure Plate Renforcée", ar: "قاع نجمي أو لحام مسطح مدعم" }
            },
            {
                label: { tr: "Paketleme", en: "Packaging", de: "Verpackung", fr: "Conditionnement", ar: "التعبئة" },
                value: { tr: "Ruloda perforeli veya dökme koli içi palet", en: "Perforated rolls or flat-packed in export cartons", de: "Perforierte Rollen oder lose im Exportkarton", fr: "Rouleaux prédécoupés ou vrac en carton export", ar: "رولات مثقوبة أو كراتين تصدير على باليتات" }
            },
            {
                label: { tr: "Flekso Baskı", en: "Flexo Printing", de: "Druck", fr: "Impression", ar: "الطباعة" },
                value: { tr: "6 renge kadar logo ve uyarı metni baskısı", en: "Up to 6 colors flexo logo & hazard warning", de: "Bis zu 6-Farben-Flexodruck für Logo & Text", fr: "Jusqu'à 6 couleurs flexo pour logos et textes", ar: "طباعة فليكسو حتى 6 ألوان للشعار والتحذيرات" }
            }
        ]
    },
    {
        slug: "household-garbage-bags",
        categoryId: "household",
        names: {
            tr: "Ev Tipi Çöp Poşeti — Perakende Ruloları",
            en: "Household Garbage Bags — Retail-Ready Rolls",
            de: "Haushalts-Müllbeutel — Handelsfertige Rollen",
            fr: "Sacs Poubelle Ménagers — Rouleaux Retail",
            ar: "أكياس نفايات منزلية — رولات تجزئة"
        },
        shortDescriptions: {
            tr: "Market zincirleri ve evsel kullanım için S/M/L ebatlarında perforeli ve kolay bağlamalı poşetler.",
            en: "Retail-ready perforated rolls in S/M/L sizes with odor-barrier and color options.",
            de: "Handelsfertige Müllbeutelrollen in den Größen S/M/L mit Geruchsschutz und Farbvielfalt.",
            fr: "Rouleaux prédécoupés pour supermarchés en tailles S/M/L avec barrière anti-odeurs.",
            ar: "رولات مثقوبة جاهزة للأسواق بأحجام S/M/L وحواجز فعالة للروائح الكريهة."
        },
        descriptions: {
            tr: "Evsel ve ofis atıkları için üretilen ASIAPLAST ev tipi çöp torbaları; kolay koparılan düzgün perfore hattı, sağlam taban kaynağı ve market raflarına hazır renkli ambalaj bantları ile sunulur. Özel marka (Private Label) siparişlerinde rulo içi poşet sayısı ve koli tasarımı alıcıya özel üretilir.",
            en: "Manufactured for supermarket chains and private-label retail brands. Features clean tear-off perforations, leak-tight seals, and eye-catching packaging sleeves. Custom counts per roll and shelf-ready cartons available.",
            de: "Hergestellt für Supermarktketten und Eigenmarkenprogramme im Einzelhandel. Saubere Abrissperforation, zuverlässige Dichtigkeit und verkaufsfördernde Banderolen nach Kundenvorgabe.",
            fr: "Conçus pour la grande distribution et les marques de distributeurs. Prédécoupe nette pour un détachement facile, soudure étanche et étiquetage personnalisé prêt pour la mise en rayon.",
            ar: "مصممة خصيصاً لسلاسل السوبرماركت والعلامات التجارية الخاصة. تتميز بثقوب سهلة القطع وإحكام تام ضد التسرب وأغلفة ملونة جذابة تلبي رغبة المستهلك النهائي."
        },
        standards: {
            tr: "EN 13592 (Evsel Atık Torbası Standardı) & ISO 9001",
            en: "EN 13592 Domestic Waste Sacks & ISO 9001:2015",
            de: "EN 13592 Haushaltsabfallsäcke & ISO 9001:2015",
            fr: "Norme EN 13592 (Sacs pour ordures ménagères)",
            ar: "معيار EN 13592 للنفايات المنزلية و ISO 9001"
        },
        moq: {
            tr: "Özel marka için 5.000 rulo / Standart 1 palet",
            en: "5,000 rolls private label / 1 pallet standard",
            de: "5.000 Rollen Eigenmarke / 1 Palette Standard",
            fr: "5 000 rouleaux marque distributeur / 1 palette",
            ar: "5,000 رول للعلامة الخاصة / باليت للمعياري"
        },
        sortOrder: 2,
        specs: [
            {
                label: { tr: "Hammadde", en: "Material", de: "Material", fr: "Matière", ar: "المادة الخام" },
                value: { tr: "LDPE / HDPE / Parfümlü Katkılı", en: "LDPE / HDPE / Fragranced Additives", de: "LDPE / HDPE / Duftzusatz", fr: "PEBD / PEHD / Parfumé", ar: "LDPE / HDPE / مع معطرات اختيارية" }
            },
            {
                label: { tr: "Kapasite", en: "Capacity", de: "Volumen", fr: "Contenance", ar: "السعة" },
                value: { tr: "15L, 30L, 50L, 70L, 100L", en: "15L, 30L, 50L, 70L, 100L", de: "15L, 30L, 50L, 70L, 100L", fr: "15L, 30L, 50L, 70L, 100L", ar: "15، 30، 50، 70، 100 لتر" }
            },
            {
                label: { tr: "Kalınlık", en: "Thickness", de: "Folienstärke", fr: "Épaisseur", ar: "السماكة" },
                value: { tr: "12 – 40 mikron", en: "12 – 40 micron", de: "12 – 40 µm", fr: "12 – 40 microns", ar: "12 - 40 ميكرون" }
            },
            {
                label: { tr: "Format", en: "Format", de: "Format", fr: "Format", ar: "الشكل" },
                value: { tr: "Ruloda perforeli veya kulaklı / büzgülü", en: "Perforated coreless rolls / handle ties", de: "Perforierte Rollen ohne Kern / mit Henkel", fr: "Rouleaux sans mandrin / liens à nouer", ar: "رولات مثقوبة بدون كرتون داخلي أو بمقابض" }
            }
        ]
    },
    {
        slug: "industrial-bin-liners",
        categoryId: "industrial-liners",
        names: {
            tr: "Endüstriyel Konteyner Torbaları (240L – 1100L)",
            en: "Industrial Bin Liners (240L – 1100L)",
            de: "Industrielle Großbehälter-Liner (240L – 1100L)",
            fr: "Sacs pour Conteneurs Industriels (240L – 1100L)",
            ar: "بطانات حاويات صناعية كبيرة (240L - 1100L)"
        },
        shortDescriptions: {
            tr: "Belediye tekerlekli çöp konteynerleri, fabrikalar ve oteller için büyük hacimli astar poşetler.",
            en: "Extra-large liners tailored for 240L, 660L, and 1100L wheelie bins and compactors.",
            de: "Extragroße Abfallsäcke passgenau für 240L–1100L Müllgroßbehälter und Pressen.",
            fr: "Housses grand volume conçues pour bacs roulants de 240L, 660L et 1100L et compacteurs.",
            ar: "أكياس عملاقة مصممة خصيصاً للحاويات المدولبة سعة 240 و 660 و 1100 لتر والمكابس."
        },
        descriptions: {
            tr: "ASIAPLAST endüstriyel konteyner poşetleri; otel, hastane, AVM ve fabrika çöp konteynerlerinin iç cidarlarını temiz tutmak ve atık tahliyesini hızlandırmak için tasarlanmıştır. Geniş körüklü yapısı ve güçlendirilmiş taban kaynağı sayesinde ağır ve ıslak atıklarda patlama yapmaz.",
            en: "Designed for commercial facilities, municipal sanitation, and compactor units. Keeps large bins hygienic and eliminates manual cleaning. Heavy gauges resist wet leakage and sharp debris.",
            de: "Optimal für gewerbliche Liegenschaften, Gastronomie und städtische Abfallwirtschaft. Hält Abfallbehälter sauber, vermeidet Geruchsbildung und hält auch feuchten und schweren Abfällen stand.",
            fr: "Indispensables pour maintenir les conteneurs urbains et industriels propres. Réduit considérablement le temps de nettoyage des bacs et résiste aux déchets lourds et humides.",
            ar: "مثالية للمجمعات التجارية والفنادق والمنشآت الصناعية للحفاظ على نظافة الحاويات الكبيرة من الداخل ومنع التصاق الأوساخ وتسرب السوائل الثقيلة."
        },
        standards: {
            tr: "DIN 30740 Tekerlekli Konteyner Uyumlu & ISO 9001",
            en: "DIN 30740 Wheelie Bin Compliant & ISO 9001:2015",
            de: "Passend nach DIN 30740 für MGB & ISO 9001",
            fr: "Compatible conteneurs norme DIN 30740",
            ar: "مطابق لمقاييس الحاويات القياسية DIN 30740"
        },
        moq: {
            tr: "1 Palet (Yaklaşık 500–1.000 koli)",
            en: "1 Pallet (~500–1,000 cartons)",
            de: "1 Palette (~500–1.000 Kartons)",
            fr: "1 Palette (~500–1 000 cartons)",
            ar: "1 باليت (حوالي 500 إلى 1000 كرتون)"
        },
        sortOrder: 3,
        specs: [
            {
                label: { tr: "Uyumlu Konteyner", en: "Bin Fit", de: "Behältergröße", fr: "Conteneur compatible", ar: "سعة الحاوية" },
                value: { tr: "240 Litre, 660 Litre, 1100 Litre", en: "240 Litres, 660 Litres, 1100 Litres", de: "240 Liter, 660 Liter, 1100 Liter", fr: "240 Litres, 660 Litres, 1100 Litres", ar: "240 لتر، 660 لتر، 1100 لتر" }
            },
            {
                label: { tr: "Ebatlar", en: "Dimensions", de: "Abmessungen", fr: "Dimensions", ar: "الأبعاد" },
                value: { tr: "120x150 cm / 140x160 cm / 170x180 cm", en: "120x150 cm / 140x160 cm / 170x180 cm", de: "120x150 cm / 140x160 cm / 170x180 cm", fr: "120x150 cm / 140x160 cm / 170x180 cm", ar: "120x150 سم / 140x160 سم / 170x180 سم" }
            },
            {
                label: { tr: "Kalınlık", en: "Thickness", de: "Folienstärke", fr: "Épaisseur", ar: "السماكة" },
                value: { tr: "35 – 120 mikron", en: "35 – 120 micron", de: "35 – 120 µm", fr: "35 – 120 microns", ar: "35 - 120 ميكرون" }
            }
        ]
    },
    {
        slug: "drawstring-garbage-bags",
        categoryId: "drawstring",
        names: {
            tr: "Büzgülü Çöp Poşeti — Kolay Bağlamalı",
            en: "Drawstring Garbage Bags — Quick-Glide Tie",
            de: "Zugband-Müllbeutel — Reißfest & Praktisch",
            fr: "Sacs Poubelle à Lien Coulissant",
            ar: "أكياس قمامة برباط سحب فائق الجودة"
        },
        shortDescriptions: {
            tr: "Entegre çekme ipli büzgü kordonu sayesinde kirlere dokunmadan tek hareketle kapanır ve taşınır.",
            en: "Draw-tape closure bags for effortless one-pull closure and hygienic transport.",
            de: "Integrierter Zugbandrand für einhändiges Schließen und sauberen Transport.",
            fr: "Fermeture par lien coulissant ultra-résistant pour un nouage et transport sans contact.",
            ar: "أكياس مزودة بشريط سحب علوي للإغلاق الفوري وحمل النفايات دون ملامستها."
        },
        descriptions: {
            tr: "ASIAPLAST büzgülü çöp torbaları, yüksek elastikiyete sahip polietilen büzgü kordonu ile donatılmıştır. Torba ağzı büzüldüğünde çöp kokusunu hapseder, ellerin çöple temasını önler ve taşıma sırasında ağırlığı dengeler. Avrupa ve Orta Doğu perakende pazarlarının en çok talep gören premium ürünüdür.",
            en: "Equipped with heavy-duty co-extruded drawtapes. The smooth drawstring mechanism contains odors securely, prevents contact with refuse, and provides comfortable carrying handles for modern households and offices.",
            de: "Ausgestattet mit robusten Zugbändern. Schließt Gerüche sicher ein, verhindert das Auslaufen von Flüssigkeiten und bietet höchsten Bedienkomfort im Haushalt und im Gewerbe.",
            fr: "Dotés d'un ruban coulissant coextrudé très résistant. Retient les mauvaises odeurs, évite les fuites et facilite la manutention quotidienne en cuisine comme en milieu professionnel.",
            ar: "مزودة بشريط سحب عالي المتانة. تحبس الروائح الكريهة وتمنع انسكاب السوائل وتوفر مقابض حمل مريحة للبيوت والمكاتب الحديثة."
        },
        standards: {
            tr: "EN 13592 Büzgü Mukavemeti Standardı & ISO 9001",
            en: "EN 13592 Drawstring Tensile Test & ISO 9001:2015",
            de: "EN 13592 Zugband-Prüfung & ISO 9001:2015",
            fr: "Conforme EN 13592 (Résistance au lien)",
            ar: "مطابق لاختبارات الشد EN 13592 و ISO 9001"
        },
        moq: {
            tr: "10.000 rulo özel marka",
            en: "10,000 rolls private label",
            de: "10.000 Rollen Eigenmarke",
            fr: "10 000 rouleaux marque propre",
            ar: "10,000 رول للعلامة الخاصة"
        },
        sortOrder: 4,
        specs: [
            {
                label: { tr: "Hammadde", en: "Material", de: "Material", fr: "Matière", ar: "المادة الخام" },
                value: { tr: "Çok Katmanlı Co-Ex LDPE", en: "Multi-Layer Co-Ex LDPE", de: "Mehrschichtiges Co-Ex LDPE", fr: "PEBD multicouche coextrudé", ar: "بولي إيثيلين متعدد الطبقات Co-Ex" }
            },
            {
                label: { tr: "Büzgü Kordonu", en: "Drawtape", de: "Zugband", fr: "Lien", ar: "شريط السحب" },
                value: { tr: "Yüksek mukavemetli renkli PE şerit", en: "High-tensile virgin PE drawtape", de: "Reißfestes PE-Farbband", fr: "Ruban PE vierge haute résistance", ar: "شريط بولي إيثيلين ملون شديد التحمل" }
            },
            {
                label: { tr: "Ebatlar", en: "Sizes", de: "Größen", fr: "Tailles", ar: "المقاسات" },
                value: { tr: "35 Litre (55x65 cm) / 60 Litre (65x75 cm) / 100 Litre", en: "35L (55x65 cm) / 60L (65x75 cm) / 100L", de: "35L (55x65 cm) / 60L (65x75 cm) / 100L", fr: "35L (55x65 cm) / 60L (65x75 cm) / 100L", ar: "35 لتر / 60 لتر / 100 لتر" }
            }
        ]
    },
    {
        slug: "star-seal-garbage-bags",
        categoryId: "star-seal",
        names: {
            tr: "Yıldız Taban Çöp Poşeti — Sızdırmaz Taban",
            en: "Star-Seal Garbage Bags — Leak-Proof Bottom",
            de: "Sternboden-Müllbeutel — Auslaufsicher",
            fr: "Sacs Poubelle Fond Étoile Étanche",
            ar: "أكياس نفايات بقاع نجمي عازل للتسرب"
        },
        shortDescriptions: {
            tr: "Dairesel yıldız kaynak dikişi sayesinde köşe zayıflığını ortadan kaldırır ve sızıntıyı sıfırlar.",
            en: "Eliminates corner stress points and distributes waste weight symmetrically.",
            de: "Verhindert Eckrisse durch zentrierte Sternfaltung und bietet höchste Dichtigkeit.",
            fr: "Supprime les points de faiblesse dans les angles pour une résistance maximale aux liquides.",
            ar: "يلغي نقاط الضعف في الزوايا ويوزع ثقل النفايات بشكل دائري متوازن لمنع أي تسريب."
        },
        descriptions: {
            tr: "Geleneksel düz dikişli torbalarda ağırlık en çok alt köşelere biner ve buralardan patlama yaşanır. ASIAPLAST yıldız taban torbaları, sekiz katlı katlama ve dairesel merkez kaynağıyla çöp kutusunun formunu tam alır. Sıvı ve ağır ıslak atık içeren otel, restoran ve sağlık kuruluşları için en güvenli çözümdür.",
            en: "Flat-bottom bags have vulnerable corners. Star-seal construction creates an 8-layer circular bottom that conforms perfectly to round trash bins and eliminates leaks. The janitorial standard worldwide.",
            de: "Im Gegensatz zu Flachbeuteln verteilt der Sternboden das Gewicht gleichmäßig und passt sich zylindrischen Eimern ideal an. Unverzichtbar für Gastronomie und Reinigungsdienste.",
            fr: "La soudure en étoile est la référence professionnelle des entreprises de nettoyage. Épouse la forme des bacs ronds sans perdre de volume et résiste aux déchets humides sans rupture.",
            ar: "الأكياس المسطحة العادية تتمزق غالباً من الزوايا، بينما يوفر القاع النجمي ثماني طبقات محكمة عند المركز تجعل الكيس يتطابق مع شكل الحاوية الدائرية ويقاوم تسرب السوائل."
        },
        standards: {
            tr: "Sıvı Sızdırmazlık Test Raporu & ISO 9001",
            en: "Hydrostatic Leak-Tightness Verified & ISO 9001:2015",
            de: "Hydrostatisch geprüft leckagefrei & ISO 9001",
            fr: "Étanchéité hydrostatique garantie & ISO 9001",
            ar: "فحص العزل الهيدروستاتيكي المانع للتسرب و ISO 9001"
        },
        moq: {
            tr: "1 Palet",
            en: "1 Pallet",
            de: "1 Palette",
            fr: "1 Palette",
            ar: "1 باليت"
        },
        sortOrder: 5,
        specs: [
            {
                label: { tr: "Taban Kaynağı", en: "Seal Type", de: "Nahtart", fr: "Type de soudure", ar: "نوع اللحام" },
                value: { tr: "8 Katlı Simetrik Yıldız Taban", en: "8-Fold Symmetrical Star Seal", de: "8-fach gefalteter Sternboden", fr: "Soudure étoile 8 plis", ar: "لحام نجمي متناظر بـ 8 طبقات" }
            },
            {
                label: { tr: "Kova Uyumu", en: "Bin Fit", de: "Behälterform", fr: "Compatibilité", ar: "ملاءمة الحاويات" },
                value: { tr: "Silindirik ve kare kovalarla tam uyum", en: "Conforms tightly to round & square cans", de: "Passt sich runden und eckigen Eimern an", fr: "Épouse parfaitement bacs ronds et carrés", ar: "يتطابق تماماً مع الحاويات الدائرية والمربعة" }
            }
        ]
    },
    {
        slug: "colored-garbage-bags",
        categoryId: "colored",
        names: {
            tr: "Renkli Çöp Poşeti — Atık Ayrıştırma",
            en: "Colored Garbage Bags — Waste Segregation",
            de: "Farbige Müllbeutel — Abfalltrennung",
            fr: "Sacs Poubelle de Tri Sélectif Colorés",
            ar: "أكياس نفايات ملونة لفرز وتصنيف المخلفات"
        },
        shortDescriptions: {
            tr: "Mavi, sarı, kırmızı, yeşil ve siyah renklerde geri dönüşüm ve tıbbi atık ayrıştırma torbaları.",
            en: "Color-coded sacks for recycling, healthcare, compost, and industrial sorting programs.",
            de: "Farbcodierte Abfallsäcke für Wertstoff-, Klinik- und Bioabfalltrennung.",
            fr: "Sacs à code couleur pour le tri sélectif, le recyclage et les flux hospitaliers.",
            ar: "أكياس ملونة مخصصة لفرز النفايات وتدويرها في المستشفيات والبلديات والمصانع."
        },
        descriptions: {
            tr: "Çevre mevzuatlarına ve kurumsal geri dönüşüm hedeflerine uyum sağlamak için renk kodlu çöp torbaları hayati önem taşır. Mavi (kağıt/karton), sarı (plastik/ambalaj), yeşil (organik/cam) ve kırmızı (tehlikeli/tıbbi) gibi uluslararası tonlarda, opak veya yarı saydam masterbatch formülasyonlarıyla üretilir.",
            en: "Essential for municipal waste separation and hospital sanitation workflows. Produced with high-opacity color masterbatches in Blue (Paper), Yellow (Plastics), Green (Glass/Organic), and Red (Biohazard).",
            de: "Unverzichtbar für betriebliche und kommunale Wertstofftrennung. Blickdicht oder transluzent eingefärbt in Blau, Gelb, Grün und Rot mit hoher Farbkonstanz.",
            fr: "Indispensables pour respecter les directives européennes de tri à la source. Teintés dans la masse en bleu, jaune, vert ou rouge selon les filières de recyclage de votre pays.",
            ar: "ضرورية لتنفيذ خطط إعادة التدوير وفرز النفايات. تتوفر بدرجات ألوان ثابتة ومعتمة: الأزرق للأوراق، الأصفر للبلاستيك، الأخضر للمواد العضوية، والأحمر للنفايات الطبية."
        },
        standards: {
            tr: "Uluslararası Renk Kodlama & ISO 9001",
            en: "International Color-Coding Standards & ISO 9001",
            de: "Internationale Farbleitsysteme & ISO 9001",
            fr: "Standards internationaux de tri sélectif & ISO 9001",
            ar: "معايير الترميز اللوني الدولية و ISO 9001"
        },
        moq: {
            tr: "Renk başına 1 palet",
            en: "1 Pallet per color shade",
            de: "1 Palette pro Farbe",
            fr: "1 Palette par couleur",
            ar: "باليت واحد لكل لون"
        },
        sortOrder: 6,
        specs: [
            {
                label: { tr: "Standart Renkler", en: "Colors", de: "Standardfarben", fr: "Coloris", ar: "الألوان القياسية" },
                value: { tr: "Mavi, Sarı, Kırmızı, Yeşil, Şeffaf, Gri, Siyah", en: "Blue, Yellow, Red, Green, Clear, Grey, Black", de: "Blau, Gelb, Rot, Grün, Transparent, Grau, Schwarz", fr: "Bleu, Jaune, Rouge, Vert, Transparent, Gris, Noir", ar: "أزرق، أصفر، أحمر، أخضر، شفاف، رمادي، أسود" }
            },
            {
                label: { tr: "Opaklık", en: "Opacity", de: "Deckkraft", fr: "Opacité", ar: "درجة التعتيم" },
                value: { tr: "%100 Opak veya Yarı Şeffaf Kontrol Tipi", en: "100% Opaque or Semi-Translucent Inspectable", de: "100% blickdicht oder transluzent", fr: "100% opaque ou translucide pour contrôle visuel", ar: "100% معتم أو شبه شفاف للفحص البصري" }
            }
        ]
    },
    {
        slug: "custom-size-trash-bags",
        categoryId: "custom-size",
        names: {
            tr: "Ölçüye Özel Çöp Poşeti — Siparişe Özel Üretim",
            en: "Custom Size Trash Bags — Tailored Engineering",
            de: "Müllbeutel nach Maß — Kundenspezifische Fertigung",
            fr: "Sacs Poubelle Sur Mesure — Fabrication Spécifique",
            ar: "أكياس نفايات بمقاسات ومواصفات مخصصة"
        },
        shortDescriptions: {
            tr: "Standart dışı tüm ebat, mikron, körük ve koli ihtiyaçlarınız için özel ekstrüzyon üretimi.",
            en: "Tailored widths, lengths, side-gussets, and thicknesses engineered to your exact CAD specs.",
            de: "Sonderanfertigungen nach Maß: Breite, Länge, Seitenfalte und Stärke exakt nach Ihren Vorgaben.",
            fr: "Dimensions, soufflets latéraux et épaisseurs sur mesure selon votre cahier des charges technique.",
            ar: "تصنيع مخصص بدقة عالية لجميع الأبعاد والسماكات والطيات الجانبية وفقاً لمتطلبات منشأتك."
        },
        descriptions: {
            tr: "Kalıp ve ekstrüzyon hattı esnekliğimiz sayesinde 30 cm genişlikten 200 cm genişliğe, 10 mikrondan 200 mikrona kadar her türlü teknik torba gereksinimini karşılıyoruz. Atık kutunuzun ebatlarını veya mevcut numunenizi gönderin, mühendislerimiz 24 saat içinde teknik çizim ve teklif sunsun.",
            en: "From compact 30 cm liners to 200 cm industrial covers. We engineer custom LDPE/HDPE films with custom degassing vents, punched handles, and specialized additive blends (anti-static, UV stabilized, anti-bacterial).",
            de: "Dank flexibler Extrusionslinien fertigen wir Breiten von 30 bis 200 cm und Stärken von 10 bis 200 µm. Auch mit Spezialzusätzen wie Antistatika, UV-Schutz oder antibakterieller Ausrüstung lieferbar.",
            fr: "Notre parc machine nous permet d'extruder des laizes de 30 cm à 200 cm et des épaisseurs de 10 à 200 microns. Additifs techniques disponibles sur demande : anti-UV, antistatique, antibactérien.",
            ar: "مرونة خطوط البثق لدينا تتيح إنتاج عروض من 30 سم حتى 200 سم وسماكات من 10 حتى 200 ميكرون مع إمكانية إضافة مضادات الأشعة فوق البنفسجية أو المضادات الإستاتيكية."
        },
        standards: {
            tr: "Müşteri Teknik Şartnamesi & ISO 9001 Toleransları",
            en: "Customer Specification Locked & ISO 9001 Tolerances",
            de: "Kundenspezifikation & ISO 9001 Toleranzgrenzen",
            fr: "Cahier des charges client & Tolérances ISO 9001",
            ar: "وفقاً لدفتر الشروط والمواصفات الفنية المعتمدة"
        },
        moq: {
            tr: "Ölçüye göre 1.000 kg hammadde eşdeğeri",
            en: "Equivalent to 1,000 kg polymer run",
            de: "Entspricht 1.000 kg Extrusionscharge",
            fr: "Équivalent à 1 000 kg de polymère",
            ar: "يعادل 1,000 كغم من خامات البوليمر"
        },
        sortOrder: 7,
        specs: [
            {
                label: { tr: "Genişlik Aralığı", en: "Width Range", de: "Breitenbereich", fr: "Plage de largeur", ar: "نطاق العرض" },
                value: { tr: "30 cm – 220 cm", en: "30 cm – 220 cm", de: "30 cm – 220 cm", fr: "30 cm – 220 cm", ar: "30 سم - 220 سم" }
            },
            {
                label: { tr: "Uzunluk Aralığı", en: "Length Range", de: "Längenbereich", fr: "Plage de longueur", ar: "نطاق الطول" },
                value: { tr: "40 cm – 300 cm", en: "40 cm – 300 cm", de: "40 cm – 300 cm", fr: "40 cm – 300 cm", ar: "40 سم - 300 سم" }
            },
            {
                label: { tr: "Kalınlık Aralığı", en: "Gauge Range", de: "Stärkenbereich", fr: "Plage d'épaisseur", ar: "نطاق السماكة" },
                value: { tr: "10 µm – 200 µm", en: "10 µm – 200 µm", de: "10 µm – 200 µm", fr: "10 µm – 200 µm", ar: "10 ميكرون - 200 ميكرون" }
            },
            {
                label: { tr: "Özel İşlemler", en: "Special Features", de: "Zusatzausstattung", fr: "Finitions", ar: "المعالجات الخاصة" },
                value: { tr: "Yan Körük, Delikli Havalandırma, UV Katkı, Perfore", en: "Side gussets, micro-venting, UV inhibitor, core types", de: "Seitenfalten, Entlüftungslöcher, UV-Schutz, Perforation", fr: "Soufflets, micro-perforations, anti-UV, types de mandrin", ar: "طيات جانبية، فتحات تهوية دقيقة، مقاومة أشعة الشمس" }
            }
        ]
    },
    {
        slug: "private-label-garbage-bags",
        categoryId: "private-label",
        names: {
            tr: "Özel Marka (Private Label / OEM) Çöp Poşeti",
            en: "Private Label Garbage Bags — Complete OEM",
            de: "Private Label / OEM Müllbeutel — Handelsmarken",
            fr: "Sacs Poubelle en Marque Distributeur (OEM / MDD)",
            ar: "أكياس نفايات بالعلامة التجارية الخاصة (OEM)"
        },
        shortDescriptions: {
            tr: "Perakende zincirleri ve toptancılar için kendi markanızla koli, rulo etiketi ve flekso baskılı üretim.",
            en: "Full own-brand program: customized packaging, retail cartons, barcodes, and pre-press support.",
            de: "Komplettes Handelsmarkenprogramm: Eigene Marke, Verkaufsverpackung, EAN-Barcodes und Displaykartons.",
            fr: "Programme marque propre complet : packaging personnalisé, impression logos, cartons présentoirs et EAN.",
            ar: "برنامج متكامل لتصنيع علامتك التجارية الخاصة: تصميم العبوات، كراتين العرض، باركود EAN، وطباعة فلكسو."
        },
        descriptions: {
            tr: "Uluslararası süpermarket zincirleri, toptancı distribütörler ve temizlik markaları için baştan sona özel marka (OEM) üretimi sağlıyoruz. Ambalaj grafikleriniz, rulo sarım adetleri, teşhir kutusu tasarımları ve uluslararası EAN-13 barkodlarınız teknik ekibimizce eksiksiz uygulanır.",
            en: "ASIAPLAST delivers turnkey private-label solutions for retail chains and hygiene brands. We provide digital proofs, custom roll counts, branded outer cartons, and pallet packing optimized for international ocean freight containers.",
            de: "Schlüsselfertige Private-Label-Lösungen für Lebensmittelketten und Hygiene-Großhändler. Von der Druckvorstufe über Sonderstückzahlen pro Rolle bis hin zu transportsicheren Displaykartons mit EAN-Auszeichnung.",
            fr: "Solutions clés en main pour les enseignes de distribution et grossistes en hygiène. Nous prenons en charge la photogravure, l'impression personnalisée des rouleaux et cartons et le palettage optimisé pour conteneurs maritimes.",
            ar: "حلول تصنيع متكاملة للعلامات التجارية الخاصة وسلاسل البيع بالتجزئة. نوفر تجهيز قوالب الطباعة، تصاميم العبوات الكرتونية، وباركود EAN الدولي مع ترتيب باليتات مثالي للشحن البحري."
        },
        standards: {
            tr: "Uluslararası Perakende & Barkod Standartları & ISO 9001",
            en: "GS1 Global Barcode Standard & ISO 9001:2015",
            de: "GS1 EAN-Konformität & ISO 9001:2015",
            fr: "Conformité codes-barres GS1 & ISO 9001",
            ar: "معايير باركود GS1 العالمية و ISO 9001"
        },
        moq: {
            tr: "1 x 20' Konteyner (Karma SKU imkanı)",
            en: "1 x 20' Container (Mixed SKU allowed)",
            de: "1 x 20'-Container (Gemischte SKU möglich)",
            fr: "1 Conteneur 20' (Mix de références possible)",
            ar: "حاوية 20 قدم (مع إمكانية تنوع الأصناف)"
        },
        sortOrder: 8,
        specs: [
            {
                label: { tr: "Baskı Yeteneği", en: "Printing", de: "Druckmöglichkeiten", fr: "Impression", ar: "قدرات الطباعة" },
                value: { tr: "6 Renge Kadar Yüksek Çözünürlüklü Flekso", en: "Up to 6-color high-definition flexographic print", de: "Bis zu 6-Farben-HD-Flexodruck", fr: "Flexographie haute définition jusqu'à 6 couleurs", ar: "طباعة فليكسو فائقة الدقة حتى 6 ألوان" }
            },
            {
                label: { tr: "Koli Ambalajı", en: "Carton Packaging", de: "Kartonage", fr: "Cartonnage", ar: "التعبئة الكرتونية" },
                value: { tr: "Özel baskılı renkli teşhir kolisi veya standart kraft", en: "Custom color display shipper or standard brown kraft", de: "Bedruckter Displaykarton oder robuster Kraftkarton", fr: "Carton présentoir imprimé ou kraft standard", ar: "كرتون عرض ملون مطبوع أو كرتون بني قياسي" }
            },
            {
                label: { tr: "Barkodlama", en: "Barcode / EAN", de: "Barcodes", fr: "Codes-barres", ar: "الباركود" },
                value: { tr: "GS1 EAN-13, ITF-14 ve QR Kod Entegrasyonu", en: "GS1 EAN-13, ITF-14, and QR code compliant", de: "GS1 EAN-13, ITF-14 und QR-Code fähig", fr: "Intégration GS1 EAN-13, ITF-14 et codes QR", ar: "تضمين باركود GS1 EAN-13 و ITF-14 و QR Code" }
            }
        ]
    }
];

function resolveLocale(locale?: string): "en" | "tr" | "de" | "fr" | "ar" {
    if (locale === "tr" || locale === "de" || locale === "fr" || locale === "ar") {
        return locale;
    }
    return "en";
}

export function getLocalizedProducts(locale?: Locale): SeedProduct[] {
    const l = resolveLocale(locale);
    return RAW_PRODUCTS.map((raw) => ({
        slug: raw.slug,
        categoryId: raw.categoryId,
        name: raw.names[l] || raw.names.en,
        shortDescription: raw.shortDescriptions[l] || raw.shortDescriptions.en,
        description: raw.descriptions[l] || raw.descriptions.en,
        standards: raw.standards[l] || raw.standards.en,
        moq: raw.moq[l] || raw.moq.en,
        sortOrder: raw.sortOrder,
        specs: raw.specs.map((s) => ({
            label: s.label[l] || s.label.en,
            value: s.value[l] || s.value.en
        }))
    }));
}

export function getLocalizedProduct(slug: string, locale?: Locale): SeedProduct | null {
    const products = getLocalizedProducts(locale);
    return products.find((p) => p.slug === slug) || null;
}

// Default export for backward compatibility
export const SEED_PRODUCTS: SeedProduct[] = getLocalizedProducts("en");
