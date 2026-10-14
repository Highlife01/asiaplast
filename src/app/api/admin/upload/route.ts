import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireSession, verifySameOrigin } from "@/lib/session";
import { adminStorage } from "@/lib/firebaseAdmin";
import { logAudit } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

function detectImageType(buf: Buffer): { ext: string; mime: string } | null {
    if (buf.length < 12) return null;
    // JPEG: FF D8 FF
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
        return { ext: "jpg", mime: "image/jpeg" };
    }
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
        buf[0] === 0x89 &&
        buf[1] === 0x50 &&
        buf[2] === 0x4e &&
        buf[3] === 0x47
    ) {
        return { ext: "png", mime: "image/png" };
    }
    // WebP: RIFF....WEBP
    if (
        buf.subarray(0, 4).toString("ascii") === "RIFF" &&
        buf.subarray(8, 12).toString("ascii") === "WEBP"
    ) {
        return { ext: "webp", mime: "image/webp" };
    }
    return null;
}

export async function POST(request: Request) {
    try {
        if (!(await verifySameOrigin(request))) {
            return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
        }
        const session = await requireSession();
        const formData = await request.formData().catch(() => null);
        if (!formData) {
            return NextResponse.json({ error: "Geçersiz dosya verisi" }, { status: 400 });
        }

        const file = formData.get("file");
        if (!(file instanceof File)) {
            return NextResponse.json({ error: "Yüklenecek görsel dosyası seçilmedi" }, { status: 400 });
        }

        if (file.size <= 0 || file.size > MAX_BYTES) {
            return NextResponse.json(
                { error: "Görsel boyutu en fazla 5 MB olabilir." },
                { status: 400 }
            );
        }

        const buf = Buffer.from(await file.arrayBuffer());
        const detected = detectImageType(buf);
        if (!detected) {
            return NextResponse.json(
                { error: "Yalnızca gerçek JPEG, PNG veya WebP görselleri yüklenebilir." },
                { status: 400 }
            );
        }

        const objectName = `asiaplast/products/${randomUUID()}.${detected.ext}`;
        const downloadToken = randomUUID();
        const bucket = adminStorage().bucket();
        const fileRef = bucket.file(objectName);

        await fileRef.save(buf, {
            resumable: false,
            contentType: detected.mime,
            metadata: {
                cacheControl: "public, max-age=31536000",
                metadata: {
                    firebaseStorageDownloadTokens: downloadToken,
                    uploadedBy: session.email
                }
            }
        });

        const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
            objectName
        )}?alt=media&token=${downloadToken}`;

        await logAudit(session.email, "upload_product_image", objectName, {
            size: file.size,
            mime: detected.mime
        });

        return NextResponse.json({
            ok: true,
            url,
            path: objectName
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }
        console.error("[admin-upload] error:", err);
        return NextResponse.json({ error: "Görsel Firebase Storage'a yüklenemedi" }, { status: 500 });
    }
}
