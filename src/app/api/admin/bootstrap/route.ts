import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { adminAuth, db, COLLECTIONS } from "@/lib/firebaseAdmin";
import { rateLimit } from "@/lib/rateLimit";
import { getClientIp, verifySameOrigin } from "@/lib/session";
import { logAudit, recordLoginAttempt } from "@/lib/repo";
import { extractGeoFromHeaders, parseUserAgentAndHints } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const snap = await db().collection(COLLECTIONS.admins).where("admin", "==", true).limit(1).get();
        return NextResponse.json({
            hasAdmins: !snap.empty,
            bootstrapConfigured: Boolean(process.env.ADMIN_BOOTSTRAP_TOKEN)
        });
    } catch {
        return NextResponse.json({ hasAdmins: true, bootstrapConfigured: false });
    }
}

export async function POST(request: Request) {
    try {
        if (!(await verifySameOrigin(request))) {
            return NextResponse.json({ error: "Geçersiz istek kaynağı" }, { status: 403 });
        }

        const ip = await getClientIp();
        const burst = rateLimit(`admin-bootstrap:${ip}`, 3, 60_000);
        if (!burst.allowed) {
            return NextResponse.json({ error: "Çok fazla deneme yapıldı." }, { status: 429 });
        }

        // Check if an admin already exists
        const existingSnap = await db().collection(COLLECTIONS.admins).where("admin", "==", true).limit(1).get();
        if (!existingSnap.empty) {
            return NextResponse.json(
                { error: "Sistemde tanımlı yönetici hesabı mevcut. Güvenlik nedeniyle ilk kurulum kapalıdır." },
                { status: 403 }
            );
        }

        const expectedSetupToken = process.env.ADMIN_BOOTSTRAP_TOKEN;
        if (!expectedSetupToken) {
            return NextResponse.json(
                { error: "Sunucuda ADMIN_BOOTSTRAP_TOKEN tanımlı değil. Lütfen npm run admin:set komutunu kullanın." },
                { status: 403 }
            );
        }

        const body = (await request.json().catch(() => null)) as {
            email?: string;
            password?: string;
            displayName?: string;
            setupToken?: string;
        } | null;

        if (!body?.email || !body?.password || !body?.setupToken) {
            return NextResponse.json({ error: "E-posta, şifre ve kurulum anahtarı zorunludur." }, { status: 400 });
        }

        if (body.setupToken !== expectedSetupToken) {
            return NextResponse.json({ error: "Geçersiz kurulum anahtarı." }, { status: 403 });
        }

        if (body.password.length < 12) {
            return NextResponse.json(
                { error: "Güvenlik kuralları gereği yönetici şifresi en az 12 karakter olmalıdır." },
                { status: 400 }
            );
        }

        const email = body.email.trim().toLowerCase();
        const displayName = (body.displayName || "AsiaPlast Superadmin").trim();

        let userRecord;
        try {
            userRecord = await adminAuth().getUserByEmail(email);
            userRecord = await adminAuth().updateUser(userRecord.uid, {
                password: body.password,
                displayName
            });
        } catch {
            userRecord = await adminAuth().createUser({
                email,
                password: body.password,
                displayName,
                emailVerified: true
            });
        }

        const existingClaims = userRecord.customClaims || {};
        const roles = ["admin", "superadmin"];

        await adminAuth().setCustomUserClaims(userRecord.uid, {
            ...existingClaims,
            admin: true,
            asiaplastAdmin: true,
            superadmin: true,
            roles
        });

        await db()
            .collection(COLLECTIONS.admins)
            .doc(userRecord.uid)
            .set({
                uid: userRecord.uid,
                email,
                displayName,
                roles,
                admin: true,
                asiaplastAdmin: true,
                disabled: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

        const h = await headers();
        const geo = extractGeoFromHeaders(h);
        const ua = parseUserAgentAndHints(h.get("user-agent"));

        await recordLoginAttempt({
            email,
            uid: userRecord.uid,
            success: true,
            reason: "İlk yönetici hesabı güvenli kurulum ile oluşturuldu",
            method: "bootstrap",
            countryCode: geo.countryCode,
            countryName: geo.countryName,
            city: geo.city,
            deviceType: ua.deviceType,
            osName: `${ua.osName} ${ua.osVersion}`.trim(),
            browserName: `${ua.browserName} ${ua.browserVersion}`.trim()
        }).catch(() => undefined);

        await logAudit(email, "bootstrap_admin_created", userRecord.uid);

        return NextResponse.json({ ok: true, email, uid: userRecord.uid }, { status: 201 });
    } catch {
        console.error("[admin-bootstrap] error");
        return NextResponse.json({ error: "Yönetici hesabı oluşturulamadı." }, { status: 500 });
    }
}
