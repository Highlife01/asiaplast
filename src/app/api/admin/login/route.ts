import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { adminAuth, db, COLLECTIONS } from "@/lib/firebaseAdmin";
import {
    createSessionToken,
    getSessionBag,
    serializeSessionBag,
    sessionCookieOptions,
    SESSION_COOKIE,
    getClientIp,
    verifySameOrigin
} from "@/lib/session";
import { rateLimitShared } from "@/lib/rateLimit";
import { logAudit, recordLoginAttempt } from "@/lib/repo";
import { extractGeoFromHeaders, parseUserAgentAndHints } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function verifyPasswordWithFirebaseAuth(
    email: string,
    password: string
): Promise<{ uid: string; email: string; idToken: string } | null> {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_WEB_API_KEY;
    if (!apiKey) {
        throw new Error("FIREBASE_API_KEY_MISSING");
    }

    const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(apiKey)}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                password,
                returnSecureToken: true
            })
        }
    );

    if (!res.ok) return null;
    const data = (await res.json().catch(() => null)) as {
        localId?: string;
        email?: string;
        idToken?: string;
    } | null;

    if (!data?.localId || !data?.idToken) return null;
    return {
        uid: data.localId,
        email: data.email || email,
        idToken: data.idToken
    };
}

export async function POST(request: Request) {
    try {
        if (!(await verifySameOrigin(request))) {
            return NextResponse.json({ error: "Geçersiz istek kaynağı (Origin)" }, { status: 403 });
        }

        const ip = await getClientIp();
        const burst = await rateLimitShared(`admin-login:${ip}`, 8, 60_000);
        if (!burst.allowed) {
            return NextResponse.json(
                { error: "Çok fazla giriş denemesi yapıldı. Lütfen biraz bekleyin.", code: "RATE_LIMITED" },
                { status: 429, headers: { "Retry-After": String(burst.retryAfterSeconds) } }
            );
        }

        const h = await headers();
        const geo = extractGeoFromHeaders(h);
        const ua = parseUserAgentAndHints(h.get("user-agent"), {
            secChUa: h.get("sec-ch-ua"),
            secChUaMobile: h.get("sec-ch-ua-mobile"),
            secChUaPlatform: h.get("sec-ch-ua-platform"),
            secChUaPlatformVersion: h.get("sec-ch-ua-platform-version"),
            secChUaModel: h.get("sec-ch-ua-model"),
            acceptLanguage: h.get("accept-language")
        });

        const body = (await request.json().catch(() => null)) as {
            idToken?: string;
            email?: string;
            password?: string;
            isTest?: boolean;
        } | null;

        if (!body || (!body.idToken && (!body.email || !body.password))) {
            return NextResponse.json({ error: "E-posta ve şifre (veya Firebase ID Token) gereklidir." }, { status: 400 });
        }

        const isTest = Boolean(body.isTest) || h.get("x-asiaplast-test") === "1";
        let uid = "";
        let email = (body.email || "").trim().toLowerCase();
        let displayName = "Yönetici";
        let customClaims: Record<string, unknown> = {};

        if (body.idToken) {
            try {
                const decoded = await adminAuth().verifyIdToken(body.idToken, true);
                uid = decoded.uid;
                email = (decoded.email || email).toLowerCase();
                displayName = decoded.name || email;
                const userRecord = await adminAuth().getUser(uid);
                customClaims = (userRecord.customClaims || {}) as Record<string, unknown>;
            } catch {
                await recordLoginAttempt({
                    email: email || "bilinmiyor",
                    success: false,
                    reason: "Geçersiz veya süresi dolmuş Firebase ID Token",
                    method: "firebase_id_token",
                    countryCode: geo.countryCode,
                    countryName: geo.countryName,
                    city: geo.city,
                    deviceType: ua.deviceType,
                    osName: `${ua.osName} ${ua.osVersion}`.trim(),
                    browserName: `${ua.browserName} ${ua.browserVersion}`.trim(),
                    isTest
                }).catch(() => undefined);
                return NextResponse.json({ error: "Kimlik doğrulama başarısız oldu." }, { status: 401 });
            }
        } else if (body.email && body.password) {
            const verified = await verifyPasswordWithFirebaseAuth(email, body.password);
            if (!verified) {
                await recordLoginAttempt({
                    email,
                    success: false,
                    reason: "Hatalı e-posta veya şifre (Firebase Auth)",
                    method: "firebase_password",
                    countryCode: geo.countryCode,
                    countryName: geo.countryName,
                    city: geo.city,
                    deviceType: ua.deviceType,
                    osName: `${ua.osName} ${ua.osVersion}`.trim(),
                    browserName: `${ua.browserName} ${ua.browserVersion}`.trim(),
                    isTest
                }).catch(() => undefined);
                return NextResponse.json({ error: "E-posta adresi veya şifre hatalı." }, { status: 401 });
            }
            uid = verified.uid;
            email = verified.email.toLowerCase();
            const userRecord = await adminAuth().getUser(uid);
            displayName = userRecord.displayName || email;
            customClaims = (userRecord.customClaims || {}) as Record<string, unknown>;
        }

        // Server-side RBAC check: custom claims OR Firestore asiaplast_admins registry
        const adminDoc = await db().collection(COLLECTIONS.admins).doc(uid).get();
        const adminData = adminDoc.exists ? adminDoc.data() : null;
        const isClaimAdmin =
            customClaims.admin === true ||
            customClaims.asiaplastAdmin === true ||
            customClaims.nilasyaRole === "ROOT_SUPER_ADMIN";
        const isRegistryAdmin = adminDoc.exists && adminData?.disabled !== true && adminData?.admin === true;

        if (!isClaimAdmin && !isRegistryAdmin) {
            await recordLoginAttempt({
                email,
                uid,
                success: false,
                reason: "Yönetici yetkisi bulunmuyor (RBAC Reddedildi)",
                method: "firebase_auth",
                countryCode: geo.countryCode,
                countryName: geo.countryName,
                city: geo.city,
                deviceType: ua.deviceType,
                osName: `${ua.osName} ${ua.osVersion}`.trim(),
                browserName: `${ua.browserName} ${ua.browserVersion}`.trim(),
                isTest
            }).catch(() => undefined);
            return NextResponse.json(
                { error: "Bu hesap için ASIAPLAST yönetici yetkisi tanımlanmamıştır." },
                { status: 403 }
            );
        }

        const isSuper =
            customClaims.superadmin === true ||
            customClaims.nilasyaRole === "ROOT_SUPER_ADMIN" ||
            (Array.isArray(adminData?.roles) && adminData.roles.includes("superadmin"));
        const roles = isSuper ? ["admin", "superadmin"] : ["admin"];

        const ttlHours = Number(process.env.ADMIN_SESSION_TTL_HOURS || 12);
        const token = await createSessionToken({
            uid,
            email,
            displayName,
            roles,
            admin: true
        });

        const bag = await getSessionBag();
        bag.admin = token;

        const res = NextResponse.json({ ok: true, email, roles });
        res.cookies.set(SESSION_COOKIE, serializeSessionBag(bag), sessionCookieOptions(ttlHours * 3600));

        await recordLoginAttempt({
            email,
            uid,
            success: true,
            reason: "Başarılı yönetici oturumu açıldı",
            method: "firebase_auth",
            countryCode: geo.countryCode,
            countryName: geo.countryName,
            city: geo.city,
            deviceType: ua.deviceType,
            osName: `${ua.osName} ${ua.osVersion}`.trim(),
            browserName: `${ua.browserName} ${ua.browserVersion}`.trim(),
            isTest
        }).catch(() => undefined);

        await logAudit(email, "admin_login", uid, { country: geo.countryCode, device: ua.deviceType }).catch(
            () => undefined
        );

        return res;
    } catch (err) {
        console.error("[admin-login] error");
        return NextResponse.json({ error: "Kimlik doğrulama servisinde bir hata oluştu." }, { status: 500 });
    }
}
