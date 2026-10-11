import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listCollection, type QuoteRequest, type ContactMessage } from "@/lib/repo";
import { COLLECTIONS } from "@/lib/firebaseAdmin";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

// Initial demonstration data when Firestore has no records yet
const SAMPLE_QUOTES: QuoteRequest[] = [
    {
        id: "rfq_demo_01",
        name: "Hans Becker",
        company: "Nordic Clean GmbH",
        email: "h.becker@nordicclean.de",
        phone: "+49 40 12345678",
        country: "Germany",
        categoryId: "heavy-duty",
        productLabel: "Heavy Duty Industrial Bags (120 µm)",
        volume: "2 x 40' HQ Containers",
        deliveryTerm: "FOB",
        message: "Need star-seal construction, black color, custom carton with our German distributor EAN barcodes.",
        locale: "de",
        sourcePage: "/de/products/heavy-duty-garbage-bags",
        status: "new"
    },
    {
        id: "rfq_demo_02",
        name: "Tariq Al-Mansoor",
        company: "Emirates Sanitation Supplies",
        email: "tariq@sanitationsupplies.ae",
        phone: "+971 4 9876543",
        country: "United Arab Emirates",
        categoryId: "drawstring",
        productLabel: "Drawstring Trash Bags (35L)",
        volume: "1 x 40' HQ Container",
        deliveryTerm: "CIF",
        message: "White LDPE film with turquoise drawtape handle. Delivery to Jebel Ali Port.",
        locale: "ar",
        sourcePage: "/ar/quote",
        status: "reviewing"
    },
    {
        id: "rfq_demo_03",
        name: "Claire Dubois",
        company: "BioServices France SARL",
        email: "c.dubois@bioservices.fr",
        phone: "+33 1 23456789",
        country: "France",
        categoryId: "household",
        productLabel: "UN 3291 Biohazard Medical Sacks",
        volume: "500,000 Bags",
        deliveryTerm: "DAP",
        message: "Yellow color with biohazard warning print in French. Require EN 13592 certification sheet.",
        locale: "fr",
        sourcePage: "/fr/products",
        status: "converted"
    }
];

const SAMPLE_MESSAGES: ContactMessage[] = [
    {
        id: "msg_demo_01",
        name: "David Miller",
        company: "Apex Wholesale UK",
        email: "d.miller@apexpackaging.co.uk",
        phone: "+44 20 7946 0912",
        country: "United Kingdom",
        message: "We distribute janitorial supplies to 300+ facilities in England. Looking for reliable long-term OEM manufacturing partnership for star-seal bin liners.",
        locale: "en",
        sourcePage: "/en/contact",
        status: "new"
    },
    {
        id: "msg_demo_02",
        name: "Mehmet Demir",
        company: "Anadolu Ambalaj Dağıtım",
        email: "mehmet@anadoluambalaj.com.tr",
        phone: "+90 532 111 2233",
        country: "Turkey",
        message: "Hastaneler için kırmızı ve sarı tıbbi atık torbalarında yıllık sözleşme şartları ve termin süreleri hakkında bilgi almak istiyoruz.",
        locale: "tr",
        sourcePage: "/tr/contact",
        status: "answered"
    }
];

export default async function AdminDashboardPage() {
    const session = await getSession();

    if (!session || !session.admin) {
        redirect("/admin/login");
    }

    let quotes: QuoteRequest[] = [];
    let messages: ContactMessage[] = [];

    try {
        quotes = await listCollection<QuoteRequest>(COLLECTIONS.quoteRequests, {
            orderBy: "createdAt",
            desc: true,
            limit: 100
        });
    } catch {
        // Fallback if Firestore collection not yet created
    }

    try {
        messages = await listCollection<ContactMessage>(COLLECTIONS.contactMessages, {
            orderBy: "createdAt",
            desc: true,
            limit: 100
        });
    } catch {
        // Fallback if Firestore collection not yet created
    }

    // Merge live records with demo fallback if empty
    const finalQuotes = quotes.length > 0 ? quotes : SAMPLE_QUOTES;
    const finalMessages = messages.length > 0 ? messages : SAMPLE_MESSAGES;

    return (
        <AdminDashboardClient
            quotes={finalQuotes}
            messages={finalMessages}
            operatorEmail={session.email}
            operatorRole={session.roles.includes("superadmin") ? "superadmin" : "admin"}
        />
    );
}
