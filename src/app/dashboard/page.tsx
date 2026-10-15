import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import {
    listContactMessages,
    listQuoteRequests,
    listConfirmedOrders,
    getProducts,
    listVisitorSessions,
    listLoginLogs,
    listAuditLogs,
    getCompanySettings
} from "@/lib/repo";
import { DEFAULT_COMPANY_SETTINGS } from "@/lib/config";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardServerPage() {
    const session = await getSession();
    if (!session) {
        redirect("/dashboard/login");
    }

    try {
        const [
            messages,
            quotes,
            orders,
            products,
            visits,
            loginLogs,
            auditLogs,
            settings
        ] = await Promise.all([
            listContactMessages({ limit: 400 }),
            listQuoteRequests({ limit: 400 }),
            listConfirmedOrders({ limit: 300 }),
            getProducts({ includeInactive: true }),
            listVisitorSessions({ limit: 500 }),
            listLoginLogs({ limit: 250 }),
            listAuditLogs(100),
            getCompanySettings()
        ]);

        return (
            <DashboardClient
                user={{
                    uid: session.uid,
                    email: session.email,
                    displayName: session.displayName,
                    roles: session.roles
                }}
                initialData={{
                    serverTime: new Date().toISOString(),
                    messages,
                    quotes,
                    orders,
                    products,
                    visits,
                    loginLogs,
                    auditLogs,
                    settings
                }}
                initialError={null}
            />
        );
    } catch (err) {
        console.error("[dashboard-page] Firestore load error:", err);
        return (
            <DashboardClient
                user={{
                    uid: session.uid,
                    email: session.email,
                    displayName: session.displayName,
                    roles: session.roles
                }}
                initialData={{
                    serverTime: new Date().toISOString(),
                    messages: [],
                    quotes: [],
                    orders: [],
                    products: [],
                    visits: [],
                    loginLogs: [],
                    auditLogs: [],
                    settings: {
                        ...DEFAULT_COMPANY_SETTINGS,
                        updatedAt: null,
                        updatedBy: null
                    }
                }}
                initialError="Firestore veritabanı bağlantısı sırasında hata oluştu. Örnek veya sahte veri gösterilmemektedir; lütfen bağlantıyı kontrol edip 'Yenile' düğmesine basın."
            />
        );
    }
}
