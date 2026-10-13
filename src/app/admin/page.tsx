import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listCollection, type QuoteRequest, type ContactMessage } from "@/lib/repo";
import { queryAnalyticsReport, queryLoginLogs, type AnalyticsReport, type LoginLogDoc } from "@/lib/analytics";
import { COLLECTIONS } from "@/lib/firebaseAdmin";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

function serializeForClient<T>(data: T): T {
    if (!data) return data;
    return JSON.parse(
        JSON.stringify(data, (_, val) => {
            if (val && typeof val === "object" && typeof val.toDate === "function") {
                return val.toDate().toISOString();
            }
            if (val && typeof val === "object" && typeof val._seconds === "number") {
                return new Date(val._seconds * 1000).toISOString();
            }
            return val;
        })
    );
}

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
            initialQuotes={serializeForClient(quotes)}
            initialMessages={serializeForClient(messages)}
            initialAnalytics={serializeForClient(initialAnalytics)}
            initialLogins={serializeForClient(initialLogins)}
            initialError={initialError}
            operatorEmail={session.email}
            operatorRole={session.roles.includes("superadmin") ? "superadmin" : "admin"}
        />
    );
}
