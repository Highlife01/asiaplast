import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSession, verifySameOrigin } from "@/lib/session";
import { getCompanySettings, saveCompanySettings } from "@/lib/repo";
import { companySettingsSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await requireSession();
        const settings = await getCompanySettings();
        return NextResponse.json({ ok: true, settings });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }
        console.error("[settings-get] error:", err);
        return NextResponse.json({ error: "Ayarlar yüklenemedi" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        if (!(await verifySameOrigin(request))) {
            return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
        }
        const session = await requireSession();
        const body = await request.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ error: "Geçersiz JSON verisi" }, { status: 400 });
        }

        const parsed = companySettingsSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Doğrulama hatası", issues: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const updated = await saveCompanySettings(parsed.data, session.email);
        revalidatePath("/", "layout");

        return NextResponse.json({ ok: true, settings: updated });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }
        console.error("[settings-put] error:", err);
        return NextResponse.json({ error: "Firma ayarları kaydedilemedi" }, { status: 500 });
    }
}
