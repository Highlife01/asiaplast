import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSession, verifySameOrigin } from "@/lib/session";
import { saveProduct, deleteProduct, getProducts } from "@/lib/repo";
import { productInputSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!(await verifySameOrigin(request))) {
            return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
        }
        const session = await requireSession();
        const { id } = await params;
        const body = await request.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ error: "Geçersiz JSON verisi" }, { status: 400 });
        }

        const all = await getProducts({ includeInactive: true });
        const existing = all.find((p) => p.id === id);
        if (!existing) {
            return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
        }

        const merged = {
            slug: body.slug ?? existing.slug,
            active: typeof body.active === "boolean" ? body.active : existing.active,
            sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : existing.sortOrder,
            categoryId: body.categoryId ?? existing.categoryId,
            name: body.name ?? existing.name,
            shortDescription: body.shortDescription ?? existing.shortDescription,
            description: body.description ?? existing.description,
            moq: body.moq ?? existing.moq,
            imageUrl: body.imageUrl !== undefined ? body.imageUrl : existing.imageUrl,
            specs: Array.isArray(body.specs) ? body.specs : existing.specs,
            translations: body.translations && typeof body.translations === "object" ? body.translations : existing.translations
        };

        const parsed = productInputSchema.safeParse(merged);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Doğrulama hatası", issues: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const saved = await saveProduct(id, parsed.data, session.email);
        revalidatePath("/", "layout");

        return NextResponse.json({ ok: true, item: saved });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }
        if (msg === "PRODUCT_NOT_FOUND") {
            return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
        }
        if (msg === "SLUG_ALREADY_EXISTS") {
            return NextResponse.json(
                { error: "Bu URL (slug) başka bir üründe kullanılıyor." },
                { status: 409 }
            );
        }
        console.error("[product-update] error:", err);
        return NextResponse.json({ error: "Ürün güncellenemedi" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!(await verifySameOrigin(request))) {
            return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
        }
        const session = await requireSession();
        const { id } = await params;

        await deleteProduct(id, session.email);
        revalidatePath("/", "layout");

        return NextResponse.json({ ok: true, id });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }
        console.error("[product-delete] error:", err);
        return NextResponse.json({ error: "Ürün silinemedi" }, { status: 500 });
    }
}
