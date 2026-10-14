import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "ASIAPLAST — Yönetim Paneli",
    description: "ASIAPLAST Kurumsal Yönetim ve Operasyon Paneli",
    robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
            index: false,
            follow: false,
            noimageindex: true
        }
    }
};

export default function DashboardRootLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
