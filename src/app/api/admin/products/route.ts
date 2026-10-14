import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSession, verifySameOrigin } from "@/lib/session";
import { getProducts, saveProduct } from "@/lib/repo";
import { productInputSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await requireSession();
        const items = await getProducts({ includeInactive: true });
        return NextResponse.json({ ok: true, items });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }
        console.error("[products-list] error:", err);
        return NextResponse.json({ error: "Ürünler yüklenemedi" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        if (!(await verifySameOrigin(request))) {
            return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
        }
        const session = await requireSession();
        const body = await request.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ error: "Geçersiz JSON verisi" }, { status: 400 });
        }

        const parsed = productInputSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Doğrulama hatası", issues: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const saved = await saveProduct(null, parsed.data, session.email);
        revalidatePath("/", "layout");

        return NextResponse.json({ ok: true, item: saved }, { status: 201 });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }
        if (msg === "SLUG_ALREADY_EXISTS") {
            return NextResponse.json(
                { error: "Bu URL (slug) başka bir üründe kullanılıyor. Lütfen farklı bir slug girin." },
                { status: 409 }
            );
        }
        console.error("[product-create] error:", err);
        return NextResponse.json({ error: "Ürün oluşturulamadı" }, { status: 500 });
    }
}
