import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listCollection, type QuoteRequest, type ContactMessage } from "@/lib/repo";
import { queryAnalyticsReport, queryLoginLogs, type AnalyticsReport, type LoginLogDoc } from "@/lib/analytics";
import { COLLECTIONS } from "@/lib/firebaseAdmin";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    const session = await getSession();

    if (!session || !session.admin) {
        redirect("/admin/login");
    }

    let quotes: QuoteRequest[] = [];
    let messages: ContactMessage[] = [];
    let initialAnalytics: AnalyticsReport | null = null;
    let initialLogins: LoginLogDoc[] = [];
    let initialError: string | null = null;

    try {
        quotes = await listCollection<QuoteRequest>(COLLECTIONS.quoteRequests, {
            orderBy: "createdAt",
            desc: true,
            limit: 200
        });
    } catch (err) {
        console.error("Quotes fetch error:", err);
        initialError = "Veritabanı bağlantı hatası: Teklif talepleri sunucudan alınamadı.";
    }

    try {
        messages = await listCollection<ContactMessage>(COLLECTIONS.contactMessages, {
            orderBy: "createdAt",
            desc: true,
            limit: 200
        });
    } catch (err) {
        console.error("Messages fetch error:", err);
        initialError = initialError || "Veritabanı bağlantı hatası: İletişim mesajları sunucudan alınamadı.";
    }

    try {
        initialAnalytics = await queryAnalyticsReport({ pageSize: 20 });
    } catch (err) {
        console.error("Analytics fetch error:", err);
    }

    try {
        const loginData = await queryLoginLogs(1, 20);
        initialLogins = loginData.logs;
    } catch (err) {
        console.error("Login logs fetch error:", err);
    }

    return (
        <AdminDashboardClient
            initialQuotes={quotes}
            initialMessages={messages}
            initialAnalytics={initialAnalytics}
            initialLogins={initialLogins}
            initialError={initialError}
            operatorEmail={session.email}
            operatorRole={session.roles.includes("superadmin") ? "superadmin" : "admin"}
        />
    );
}
