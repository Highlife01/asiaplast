import type { Locale } from "./locales";

export type Dict = {
    site: Record<string, string>;
    nav: Record<string, string>;
    hero: Record<string, string>;
    sections: Record<string, string>;
    forms: Record<string, string>;
    quote: Record<string, string>;
    footer: Record<string, string>;
    faq: readonly { readonly q: string; readonly a: string }[] | { q: string; a: string }[];
};

const en = {
    site: {
        name: "ASIAPLAST",
        tagline: "Reliable Garbage Bag Solutions for Global Markets",
        subtagline:
            "Wholesale garbage bags, industrial bin liners and private-label packaging solutions for international buyers.",
        ctaQuote: "Request a Quote",
        ctaProducts: "Explore Products",
        ctaDistributor: "Become a Distributor",
        language: "Language"
    },
    nav: {
        home: "Home",
        about: "About Us",
        products: "Products",
        export: "Global Export",
        privateLabel: "Private Label / OEM",
        knowledge: "Knowledge Center",
        faq: "FAQ",
        quote: "Request a Quote",
        contact: "Contact"
    },
    hero: {
        badge: "Garbage Bags Manufacturer & Global Exporter",
        title: "Reliable Garbage Bag Solutions for Global Markets",
        subtitle:
            "Wholesale garbage bags, industrial bin liners and private-label packaging for importers, distributors and retail chains.",
        stat1: "Product categories",
        stat2: "Export markets served",
        stat3: "Container loadings managed",
        stat4: "Quality-controlled batches"
    },
    sections: {
        productsTitle: "Product Range",
        productsLead:
            "Manufactured to specification for wholesale, retail and industrial buyers — with private-label options on every line.",
        whyTitle: "Why sourcing teams choose ASIAPLAST",
        whyLead: "A single, accountable supply partner from film extrusion to container loading.",
        why1Title: "Specification-driven production",
        why1Text: "Gauge, width, length, color, sealing and packing defined per SKU and verified at every batch.",
        why2Title: "Export-ready logistics",
        why2Text: "Palletized, container-optimized packing with export documentation for FOB, CIF and DAP shipments.",
        why3Title: "Private label & OEM",
        why3Text: "Your brand, your print, your carton — retail-ready packaging built to your artwork.",
        why4Title: "Responsive quoting",
        why4Text: "Bulk quotations typically returned within one business day with full technical datasheets.",
        industriesTitle: "Industries we serve",
        faqTitle: "Frequently asked questions",
        ctaTitle: "Ready for a bulk quotation?",
        ctaText: "Send your specifications, destination and volume — receive a complete offer with packing details.",
        contactTitle: "Contact our export desk",
        contactLead: "Tell us what you need. Messages arrive directly in our sales dashboard and are answered by a real person.",
        productsViewAll: "View all products",
        productsRequest: "Request bulk pricing",
        specTitle: "Technical specifications",
        relatedTitle: "Related products"
    },
    forms: {
        name: "Full name",
        company: "Company",
        email: "Business email",
        phone: "Phone / WhatsApp",
        country: "Destination country",
        message: "Your message",
        productInterest: "Product of interest",
        volume: "Estimated order volume",
        deliveryTerm: "Preferred delivery term",
        send: "Send message",
        sending: "Sending…",
        quoteSend: "Request quotation",
        successContact: "Thank you — your message has been received. Our export desk will reply shortly.",
        successQuote: "Thank you — your quotation request has been received. Reference:",
        error: "Something went wrong. Please try again.",
        rateLimited: "Too many requests. Please wait a moment and try again.",
        required: "This field is required",
        invalidEmail: "Please enter a valid business email",
        consent: "I agree that my details may be used to answer this inquiry.",
        productCategory: "Product category",
        selectPlaceholder: "Select…"
    },
    quote: {
        title: "Request Bulk Quotation",
        lead: "Complete the form below — our export team replies with pricing, packing and lead time.",
        volumePlaceholder: "e.g. 1 x 40' HQ container, or 500,000 bags"
    },
    footer: {
        rights: "All rights reserved.",
        company: "Global Garbage Bags & Plastic Packaging Solutions",
        links: "Company",
        products: "Products",
        contactUs: "Contact",
        privacy: "Privacy Policy",
        terms: "Terms & Conditions",
        cookies: "Cookie Policy",
        admin: "Admin"
    },
    faq: [
        {
            q: "What is your minimum order quantity (MOQ)?",
            a: "MOQ depends on the product line and specification. Standard ranges typically start from one pallet, while private-label production usually starts from one 20' container. Send your target volume for an exact answer."
        },
        {
            q: "Which delivery terms do you offer?",
            a: "We quote EXW, FOB, CIF and DAP. Container-optimized pallet packing and full export documentation are standard."
        },
        {
            q: "Do you produce private-label garbage bags?",
            a: "Yes. Brand print, carton design, color and specification can be built to your artwork, subject to print plate and volume requirements."
        },
        {
            q: "How fast do you answer quotation requests?",
            a: "Bulk quotations are typically returned within one business day, including technical datasheets and packing details."
        }
    ]
};

const tr: Dict = {
    site: {
        name: "ASIAPLAST",
        tagline: "Dünya Pazarları İçin Güvenilir Çöp Poşeti Çözümleri",
        subtagline:
            "Toptan çöp poşeti, endüstriyel çöp poşeti ve özel markalı ambalaj çözümleri; ithalatçılar, distribütörler ve perakende zincirleri için.",
        ctaQuote: "Teklif İsteyin",
        ctaProducts: "Ürünleri İnceleyin",
        ctaDistributor: "Distribütör Olun",
        language: "Dil"
    },
    nav: {
        home: "Ana Sayfa",
        about: "Hakkımızda",
        products: "Ürünler",
        export: "Küresel İhracat",
        privateLabel: "Özel Marka / OEM",
        knowledge: "Bilgi Merkezi",
        faq: "SSS",
        quote: "Teklif İsteyin",
        contact: "İletişim"
    },
    hero: {
        badge: "Çöp Poşeti Üreticisi & Küresel İhracatçı",
        title: "Dünya Pazarları İçin Güvenilir Çöp Poşeti Çözümleri",
        subtitle:
            "İthalatçılar, distribütörler ve perakende zincirleri için toptan çöp poşeti, endüstriyel poşet ve özel markalı ambalaj.",
        stat1: "Ürün kategorisi",
        stat2: "Hizmet verilen pazar",
        stat3: "Yönetilen konteyner yüklemesi",
        stat4: "Kalite kontrol edilen parti"
    },
    sections: {
        productsTitle: "Ürün Yelpazesi",
        productsLead:
            "Toptan, perakende ve endüstriyel alıcılar için spesifikasyona göre üretilir — her hatta özel marka seçeneği.",
        whyTitle: "Satın alma ekipleri neden ASIAPLAST'ı seçiyor",
        whyLead: "Film ekstrüzyonundan konteyner yüklemesine kadar tek, hesap verebilir tedarik ortağı.",
        why1Title: "Spesifikasyona dayalı üretim",
        why1Text: "Kalınlık, genişlik, uzunluk, renk, sızdırmazlık ve paketleme her SKU için tanımlanır ve her partide doğrulanır.",
        why2Title: "İhracata hazır lojistik",
        why2Text: "Paletli, konteyner optimize paketleme; FOB, CIF ve DAP sevkiyatlar için tam ihracat belgeleri.",
        why3Title: "Özel marka & OEM",
        why3Text: "Sizin markanız, baskınız ve koliniz — tasarımınıza uygun perakende hazır ambalaj.",
        why4Title: "Hızlı teklif",
        why4Text: "Toplu teklifler genellikle bir iş günü içinde teknik veri formlarıyla birlikte iletilir.",
        industriesTitle: "Hizmet verdiğimiz sektörler",
        faqTitle: "Sık sorulan sorular",
        ctaTitle: "Toplu teklif için hazır mısınız?",
        ctaText: "Spesifikasyonlarınızı, hedef ülkenizi ve miktarınızı gönderin — paketleme detaylarıyla eksiksiz teklif alın.",
        contactTitle: "İhracat masamızla iletişime geçin",
        contactLead: "İhtiyacınızı bize yazın. Mesajlar doğrudan satış panelimize düşer ve gerçek bir kişi tarafından yanıtlanır.",
        productsViewAll: "Tüm ürünleri gör",
        productsRequest: "Toplu fiyat isteyin",
        specTitle: "Teknik özellikler",
        relatedTitle: "İlgili ürünler"
    },
    forms: {
        name: "Ad soyad",
        company: "Firma",
        email: "Kurumsal e-posta",
        phone: "Telefon / WhatsApp",
        country: "Hedef ülke",
        message: "Mesajınız",
        productInterest: "İlgilendiğiniz ürün",
        volume: "Tahmini sipariş hacmi",
        deliveryTerm: "Tercih edilen teslim şekli",
        send: "Mesaj gönder",
        sending: "Gönderiliyor…",
        quoteSend: "Teklif talebi gönder",
        successContact: "Teşekkürler — mesajınız alındı. İhracat masamız kısa sürede yanıtlayacak.",
        successQuote: "Teşekkürler — teklif talebiniz alındı. Referans:",
        error: "Bir sorun oluştu. Lütfen tekrar deneyin.",
        rateLimited: "Çok fazla istek gönderildi. Lütfen kısa süre bekleyip tekrar deneyin.",
        required: "Bu alan zorunludur",
        invalidEmail: "Geçerli bir kurumsal e-posta girin",
        consent: "Bu talebi yanıtlamak için bilgilerimin kullanılmasını kabul ediyorum.",
        productCategory: "Ürün kategorisi",
        selectPlaceholder: "Seçiniz…"
    },
    quote: {
        title: "Toplu Teklif Talebi",
        lead: "Aşağıdaki formu doldurun — ihracat ekibimiz fiyat, paketleme ve teslim süresiyle yanıt verir.",
        volumePlaceholder: "örn. 1 x 40' HC konteyner ya da 500.000 adet"
    },
    footer: {
        rights: "Tüm hakları saklıdır.",
        company: "Küresel Çöp Poşeti & Plastik Ambalaj Çözümleri",
        links: "Kurumsal",
        products: "Ürünler",
        contactUs: "İletişim",
        privacy: "Gizlilik Politikası",
        terms: "Şartlar ve Koşullar",
        cookies: "Çerez Politikası",
        admin: "Yönetim"
    },
    faq: [
        {
            q: "Minimum sipariş miktarınız nedir?",
            a: "MOQ ürün hattına ve spesifikasyona göre değişir. Standart ürünlerde genellikle bir paletten başlar; özel markalı üretimde genellikle bir 20' konteynerden başlar. Kesin yanıt için hedef miktarınızı gönderin."
        },
        {
            q: "Hangi teslim şekillerini sunuyorsunuz?",
            a: "EXW, FOB, CIF ve DAP teklif ediyoruz. Konteyner optimize paletleme ve tam ihracat belgeleri standarttır."
        },
        {
            q: "Özel markalı çöp poşeti üretiyor musunuz?",
            a: "Evet. Marka baskısı, koli tasarımı, renk ve spesifikasyon; baskı kalıp ve miktar koşullarıyla birlikte tasarımınıza göre üretilir."
        },
        {
            q: "Teklif taleplerine ne kadar hızlı yanıt veriyorsunuz?",
            a: "Toplu teklifler genellikle bir iş günü içinde teknik veri formları ve paketleme detaylarıyla birlikte iletilir."
        }
    ]
};

const de: Dict = {
    site: {
        name: "ASIAPLAST",
        tagline: "Zuverlässige Müllbeutel-Lösungen für internationale Märkte",
        subtagline:
            "Müllbeutel Großhandel, industrielle Abfallsäcke und Private-Label-Verpackungen für Importeure, Händler und Handelsketten.",
        ctaQuote: "Angebot anfordern",
        ctaProducts: "Produkte entdecken",
        ctaDistributor: "Distributor werden",
        language: "Sprache"
    },
    nav: {
        home: "Startseite",
        about: "Über uns",
        products: "Produkte",
        export: "Globaler Export",
        privateLabel: "Private Label / OEM",
        knowledge: "Wissenszentrum",
        faq: "FAQ",
        quote: "Angebot anfordern",
        contact: "Kontakt"
    },
    hero: {
        badge: "Müllbeutel-Hersteller & Globaler Exporteur",
        title: "Zuverlässige Müllbeutel-Lösungen für internationale Märkte",
        subtitle:
            "Müllbeutel im Großhandel, industrielle Abfallsäcke und Private-Label-Verpackungen für Importeure und Händler.",
        stat1: "Produktkategorien",
        stat2: "Belieferte Märkte",
        stat3: "Verwaltete Containerladungen",
        stat4: "Qualitätsgeprüfte Chargen"
    },
    sections: {
        productsTitle: "Produktsortiment",
        productsLead:
            "Nach Spezifikation gefertigt für Großhandel, Einzelhandel und Industrie — mit Private-Label-Optionen in jeder Linie.",
        whyTitle: "Warum Einkaufsteams ASIAPLAST wählen",
        whyLead: "Ein einziger, verantwortlicher Lieferpartner von der Folienextrusion bis zur Containerbeladung.",
        why1Title: "Spezifikationsgetriebene Produktion",
        why1Text: "Dicke, Breite, Länge, Farbe, Versiegelung und Verpackung werden pro SKU definiert und je Charge geprüft.",
        why2Title: "Exportfertige Logistik",
        why2Text: "Palletisierte, containeroptimierte Verpackung mit vollständigen Exportdokumenten für FOB, CIF und DAP.",
        why3Title: "Private Label & OEM",
        why3Text: "Ihre Marke, Ihr Druck, Ihr Karton — handelsfertige Verpackung nach Ihrer Grafikvorlage.",
        why4Title: "Schnelle Angebote",
        why4Text: "Mengenangebote in der Regel innerhalb eines Werktages inklusive technischer Datenblätter.",
        industriesTitle: "Branchen, die wir beliefern",
        faqTitle: "Häufige Fragen",
        ctaTitle: "Bereit für ein Mengenangebot?",
        ctaText: "Senden Sie Spezifikation, Zielland und Menge — erhalten Sie ein komplettes Angebot inklusive Verpackungsdetails.",
        contactTitle: "Kontaktieren Sie unseren Exportbereich",
        contactLead: "Schreiben Sie uns Ihren Bedarf. Nachrichten gehen direkt in unserem Vertriebs-Dashboard ein und werden persönlich beantwortet.",
        productsViewAll: "Alle Produkte ansehen",
        productsRequest: "Mengenpreise anfragen",
        specTitle: "Technische Daten",
        relatedTitle: "Ähnliche Produkte"
    },
    forms: {
        name: "Vollständiger Name",
        company: "Unternehmen",
        email: "Geschäftliche E-Mail",
        phone: "Telefon / WhatsApp",
        country: "Zielland",
        message: "Ihre Nachricht",
        productInterest: "Gewünschtes Produkt",
        volume: "Geschätzte Bestellmenge",
        deliveryTerm: "Gewünschte Lieferbedingung",
        send: "Nachricht senden",
        sending: "Wird gesendet…",
        quoteSend: "Angebot anfordern",
        successContact: "Vielen Dank — Ihre Nachricht ist eingegangen. Unser Exportteam antwortet in Kürze.",
        successQuote: "Vielen Dank — Ihre Angebotsanfrage ist eingegangen. Referenz:",
        error: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
        rateLimited: "Zu viele Anfragen. Bitte warten Sie einen Moment und versuchen Sie es erneut.",
        required: "Dieses Feld ist erforderlich",
        invalidEmail: "Bitte geben Sie eine gültige geschäftliche E-Mail-Adresse ein",
        consent: "Ich stimme zu, dass meine Angaben zur Beantwortung dieser Anfrage verwendet werden.",
        productCategory: "Produktkategorie",
        selectPlaceholder: "Auswählen…"
    },
    quote: {
        title: "Mengenangebot anfordern",
        lead: "Füllen Sie das Formular aus — unser Exportteam antwortet mit Preisen, Verpackung und Lieferzeit.",
        volumePlaceholder: "z. B. 1 x 40' HQ Container oder 500.000 Beutel"
    },
    footer: {
        rights: "Alle Rechte vorbehalten.",
        company: "Globale Müllbeutel- & Kunststoffverpackungslösungen",
        links: "Unternehmen",
        products: "Produkte",
        contactUs: "Kontakt",
        privacy: "Datenschutzerklärung",
        terms: "AGB",
        cookies: "Cookie-Richtlinie",
        admin: "Verwaltung"
    },
    faq: [
        {
            q: "Was ist Ihre Mindestbestellmenge (MOQ)?",
            a: "Die MOQ hängt von Produktlinie und Spezifikation ab. Standardartikel beginnen typischerweise ab einer Palette, Private-Label-Produktion meist ab einem 20'-Container. Senden Sie uns Ihre Zielmenge für eine genaue Antwort."
        },
        {
            q: "Welche Lieferbedingungen bieten Sie an?",
            a: "Wir offerieren EXW, FOB, CIF und DAP. Containeroptimierte Palettierung und vollständige Exportdokumente sind Standard."
        },
        {
            q: "Produzieren Sie Private-Label-Müllbeutel?",
            a: "Ja. Markendruck, Kartondesign, Farbe und Spezifikation können nach Ihrer Vorlage gefertigt werden, vorbehaltlich Druckform- und Mengenanforderungen."
        },
        {
            q: "Wie schnell beantworten Sie Angebotsanfragen?",
            a: "Mengenangebote erhalten Sie in der Regel innerhalb eines Werktages, inklusive technischer Datenblätter und Verpackungsdetails."
        }
    ]
};

const fr: Dict = {
    site: {
        name: "ASIAPLAST",
        tagline: "Des solutions fiables de sacs poubelle pour les marchés mondiaux",
        subtagline:
            "Sacs poubelle en gros, sacs à déchets industriels et emballages en marque propre pour importateurs, distributeurs et chaînes de retail.",
        ctaQuote: "Demander un devis",
        ctaProducts: "Découvrir les produits",
        ctaDistributor: "Devenir distributeur",
        language: "Langue"
    },
    nav: {
        home: "Accueil",
        about: "À propos",
        products: "Produits",
        export: "Export mondial",
        privateLabel: "Marque propre / OEM",
        knowledge: "Centre de connaissances",
        faq: "FAQ",
        quote: "Demander un devis",
        contact: "Contact"
    },
    hero: {
        badge: "Fabricant de sacs poubelle & exportateur mondial",
        title: "Des solutions fiables de sacs poubelle pour les marchés mondiaux",
        subtitle:
            "Sacs poubelle en gros, sacs industriels et emballage en marque propre pour importateurs et distributeurs.",
        stat1: "Catégories de produits",
        stat2: "Marchés desservis",
        stat3: "Chargements conteneur gérés",
        stat4: "Lots contrôlés qualité"
    },
    sections: {
        productsTitle: "Gamme de produits",
        productsLead:
            "Fabriqués selon spécification pour le gros, le retail et l'industrie — option marque propre sur chaque ligne.",
        whyTitle: "Pourquoi les équipes achats choisissent ASIAPLAST",
        whyLead: "Un partenaire d'approvisionnement unique et responsable, de l'extrusion du film au chargement du conteneur.",
        why1Title: "Production pilotée par la spécification",
        why1Text: "Épaisseur, largeur, longueur, couleur, soudure et conditionnement définis par SKU et vérifiés à chaque lot.",
        why2Title: "Logistique prête à l'export",
        why2Text: "Palettisation optimisée conteneur et documentation d'exportation complète pour FOB, CIF et DAP.",
        why3Title: "Marque propre & OEM",
        why3Text: "Votre marque, votre impression, votre carton — un emballage prêt pour le retail selon votre artwork.",
        why4Title: "Devis réactifs",
        why4Text: "Devis en volume généralement retournés en un jour ouvré avec fiches techniques complètes.",
        industriesTitle: "Secteurs desservis",
        faqTitle: "Questions fréquentes",
        ctaTitle: "Prêt pour un devis en volume ?",
        ctaText: "Envoyez vos spécifications, destination et volumes — recevez une offre complète avec détails d'emballage.",
        contactTitle: "Contactez notre bureau export",
        contactLead: "Dites-nous votre besoin. Les messages arrivent directement dans notre tableau de bord des ventes et sont traités par une vraie personne.",
        productsViewAll: "Voir tous les produits",
        productsRequest: "Demander les prix en gros",
        specTitle: "Spécifications techniques",
        relatedTitle: "Produits associés"
    },
    forms: {
        name: "Nom complet",
        company: "Société",
        email: "E-mail professionnel",
        phone: "Téléphone / WhatsApp",
        country: "Pays de destination",
        message: "Votre message",
        productInterest: "Produit souhaité",
        volume: "Volume de commande estimé",
        deliveryTerm: "Incoterm souhaité",
        send: "Envoyer le message",
        sending: "Envoi…",
        quoteSend: "Demander un devis",
        successContact: "Merci — votre message a bien été reçu. Notre bureau export vous répondra rapidement.",
        successQuote: "Merci — votre demande de devis a été reçue. Référence :",
        error: "Une erreur s'est produite. Veuillez réessayer.",
        rateLimited: "Trop de requêtes. Veuillez patienter un instant puis réessayer.",
        required: "Ce champ est obligatoire",
        invalidEmail: "Veuillez saisir un e-mail professionnel valide",
        consent: "J'accepte que mes coordonnées soient utilisées pour répondre à cette demande.",
        productCategory: "Catégorie de produit",
        selectPlaceholder: "Sélectionner…"
    },
    quote: {
        title: "Demander un devis en volume",
        lead: "Remplissez le formulaire — notre équipe export répond avec prix, emballage et délais.",
        volumePlaceholder: "ex. 1 conteneur 40' HQ ou 500 000 sacs"
    },
    footer: {
        rights: "Tous droits réservés.",
        company: "Sacs poubelle & emballages plastiques à l'échelle mondiale",
        links: "Société",
        products: "Produits",
        contactUs: "Contact",
        privacy: "Politique de confidentialité",
        terms: "Conditions générales",
        cookies: "Politique cookies",
        admin: "Administration"
    },
    faq: [
        {
            q: "Quelle est votre quantité minimale de commande (MOQ) ?",
            a: "La MOQ dépend de la gamme et de la spécification. Les produits standards commencent généralement à une palette ; la production en marque propre à un conteneur 20'. Envoyez votre volume cible pour une réponse exacte."
        },
        {
            q: "Quels incoterms proposez-vous ?",
            a: "Nous cotons EXW, FOB, CIF et DAP. La palettisation optimisée conteneur et la documentation d'export complète sont standards."
        },
        {
            q: "Produisez-vous des sacs en marque propre ?",
            a: "Oui. Impression de marque, design du carton, couleur et spécification peuvent être réalisés selon votre artwork, sous réserve des exigences de cliché et de volume."
        },
        {
            q: "En combien de temps répondez-vous aux demandes de devis ?",
            a: "Les devis en volume sont généralement envoyés en un jour ouvré, avec fiches techniques et détails d'emballage."
        }
    ]
};

const ar: Dict = {
    site: {
        name: "ASIAPLAST",
        tagline: "حلول موثوقة لأكياس القمامة للأسواق العالمية",
        subtagline:
            "أكياس قمامة بالجملة، أكياس نفايات صناعية وحلول تغليف بعلامة تجارية خاصة للمستوردين والموزعين وسلاسل التجزئة.",
        ctaQuote: "اطلب عرض سعر",
        ctaProducts: "استكشف المنتجات",
        ctaDistributor: "كن موزعاً",
        language: "اللغة"
    },
    nav: {
        home: "الرئيسية",
        about: "من نحن",
        products: "المنتجات",
        export: "التصدير العالمي",
        privateLabel: "علامة خاصة / تصنيع بعلامة الغير",
        knowledge: "مركز المعرفة",
        faq: "الأسئلة الشائعة",
        quote: "اطلب عرض سعر",
        contact: "اتصل بنا"
    },
    hero: {
        badge: "مصنّع أكياس قمامة ومصدّر عالمي",
        title: "حلول موثوقة لأكياس القمامة للأسواق العالمية",
        subtitle: "أكياس قمامة بالجملة وأكياس نفايات صناعية وتغليف بعلامة خاصة للمستوردين والموزعين.",
        stat1: "فئات المنتجات",
        stat2: "الأسواق التي نخدمها",
        stat3: "تحميلات الحاويات المُدارة",
        stat4: "دفعات مفحوصة الجودة"
    },
    sections: {
        productsTitle: "مجموعة المنتجات",
        productsLead: "تُصنَّع وفق المواصفات لتجار الجملة والتجزئة والصناعة — مع خيار العلامة الخاصة في كل خط.",
        whyTitle: "لماذا تختار فرق الشراء ASIAPLAST",
        whyLead: "شريك توريد واحد مسؤول من بثق الفيلم حتى تحميل الحاوية.",
        why1Title: "إنتاج قائم على المواصفات",
        why1Text: "يُحدَّد السماكة والعرض والطول واللون واللحام والتعبئة لكل صنف ويُتحقق منه في كل دفعة.",
        why2Title: "لوجستيات جاهزة للتصدير",
        why2Text: "تعبئة على باليتات محسّنة للحاويات مع مستندات تصدير كاملة لشروط FOB وCIF وDAP.",
        why3Title: "علامة خاصة وتصنيع بعلامة الغير",
        why3Text: "علامتك وطباعتك وكرتونك — تغليف جاهز للتجزئة وفق تصميمك.",
        why4Title: "عروض أسعار سريعة",
        why4Text: "تُرسل عروض الجملة عادةً خلال يوم عمل واحد مع صحائف البيانات الفنية.",
        industriesTitle: "القطاعات التي نخدمها",
        faqTitle: "الأسئلة الشائعة",
        ctaTitle: "جاهز لعرض سعر بالجملة؟",
        ctaText: "أرسل مواصفاتك وبلد الوجهة والكمية — واستلم عرضاً كاملاً مع تفاصيل التعبئة.",
        contactTitle: "تواصل مع مكتب التصدير",
        contactLead: "أخبرنا باحتياجك. تصل الرسائل مباشرة إلى لوحة مبيعاتنا ويرد عليها شخص حقيقي.",
        productsViewAll: "عرض جميع المنتجات",
        productsRequest: "اطلب أسعار الجملة",
        specTitle: "المواصفات الفنية",
        relatedTitle: "منتجات ذات صلة"
    },
    forms: {
        name: "الاسم الكامل",
        company: "الشركة",
        email: "البريد الإلكتروني للعمل",
        phone: "الهاتف / واتساب",
        country: "بلد الوجهة",
        message: "رسالتك",
        productInterest: "المنتج المطلوب",
        volume: "حجم الطلب التقديري",
        deliveryTerm: "شروط التسليم المفضلة",
        send: "إرسال الرسالة",
        sending: "جارٍ الإرسال…",
        quoteSend: "إرسال طلب عرض السعر",
        successContact: "شكراً لك — تم استلام رسالتك. سيرد مكتب التصدير قريباً.",
        successQuote: "شكراً لك — تم استلام طلب عرض السعر. المرجع:",
        error: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
        rateLimited: "طلبات كثيرة جداً. يرجى الانتظار قليلاً ثم المحاولة مجدداً.",
        required: "هذا الحقل مطلوب",
        invalidEmail: "يرجى إدخال بريد إلكتروني صحيح للعمل",
        consent: "أوافق على استخدام بياناتي للرد على هذا الطلب.",
        productCategory: "فئة المنتج",
        selectPlaceholder: "اختر…"
    },
    quote: {
        title: "طلب عرض سعر بالجملة",
        lead: "أكمل النموذج — سيرد فريق التصدير بالأسعار والتعبئة ومدة التوريد.",
        volumePlaceholder: "مثال: حاوية 40 قدم HQ أو 500,000 كيس"
    },
    footer: {
        rights: "جميع الحقوق محفوظة.",
        company: "حلول عالمية لأكياس القمامة والتغليف البلاستيكي",
        links: "الشركة",
        products: "المنتجات",
        contactUs: "اتصل بنا",
        privacy: "سياسة الخصوصية",
        terms: "الشروط والأحكام",
        cookies: "سياسة الكوكيز",
        admin: "الإدارة"
    },
    faq: [
        {
            q: "ما هو الحد الأدنى لكمية الطلب؟",
            a: "يعتمد الحد الأدنى على خط المنتج والمواصفات. المنتجات القياسية تبدأ عادةً من منصة واحدة، بينما يبدأ إنتاج العلامة الخاصة عادةً من حاوية 20 قدم. أرسل الكمية المستهدفة للحصول على إجابة دقيقة."
        },
        {
            q: "ما شروط التسليم التي تقدمونها؟",
            a: "نقدم عروض EXW وFOB وCIF وDAP، مع باليتات محسّنة للحاويات ومستندات تصدير كاملة كمعيار."
        },
        {
            q: "هل تنتجون أكياساً بعلامة خاصة؟",
            a: "نعم. يمكن تنفيذ طباعة العلامة وتصميم الكرتون واللون والمواصفات وفق تصميمك، مع مراعاة متطلبات القالب والكمية."
        },
        {
            q: "ما مدة سرعة الرد على طلبات عروض الأسعار؟",
            a: "تُرسل عروض الجملة عادةً خلال يوم عمل واحد مع صحائف البيانات الفنية وتفاصيل التعبئة."
        }
    ]
};

// Fallback dictionaries for non-phase-1 locales: they inherit English content
// until professionally translated. They are still routable, canonicalized to /en/
// equivalents by the hreflang map and sitemap (only ACTIVE_LOCALES are indexed).
const dictionaries: Partial<Record<Locale, Dict>> = { en, tr, de, fr, ar };

export function getDictionary(locale: Locale): Dict {
    return dictionaries[locale] ?? en;
}

export { en as defaultDictionary };
