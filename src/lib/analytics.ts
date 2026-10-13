import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db, COLLECTIONS } from "./firebaseAdmin";
import { parseUserAgent, resolveGeoLocation, type DeviceInfo, type GeoLocation } from "./geoDeviceParser";

export type VisitedPage = {
    path: string;
    title?: string;
    visitedAt: string;
    timeSpentSeconds?: number;
};

export type VisitorEvent = {
    type: "pageview" | "heartbeat" | "conversion";
    path: string;
    timestamp: string;
    details?: string;
};

export type VisitorSessionDoc = {
    id: string;
    sessionId: string;
    firstSeenAt: string;
    lastSeenAt: string;
    durationSeconds: number;
    pageCount: number;
    entryPage: string;
    lastPage: string;
    visitedPages: VisitedPage[];
    referrer: string;
    utm: {
        source?: string;
        medium?: string;
        campaign?: string;
        term?: string;
        content?: string;
    };
    country: string;
    countryCode: string;
    region: string;
    city: string;
    timezone: string;
    isApproximateLocation: boolean;
    deviceType: "telefon" | "tablet" | "bilgisayar" | "bot";
    deviceBrand: string;
    deviceModel: string;
    os: string;
    browser: string;
    browserLanguage: string;
    screenResolution: string;
    isBot: boolean;
    botName: string | null;
    hasConversion: boolean;
    conversionType: "none" | "rfq" | "contact" | "both";
    conversionRefId?: string | null;
    events: VisitorEvent[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
};

export type LoginLogDoc = {
    id: string;
    email: string;
    success: boolean;
    failureReason?: string | null;
    country: string;
    city: string;
    deviceType: "telefon" | "tablet" | "bilgisayar";
    os: string;
    browser: string;
    timestamp: Timestamp;
    isoTime: string;
};

// 1. Record visitor pageview / event
export async function recordVisitorEvent(params: {
    sessionId: string;
    path: string;
    title?: string;
    referrer?: string;
    utm?: {
        source?: string;
        medium?: string;
        campaign?: string;
        term?: string;
        content?: string;
    };
    screenResolution?: string;
    browserLanguage?: string;
    userAgent: string;
    ip: string;
    headers?: Headers | Record<string, string | string[] | undefined>;
}): Promise<void> {
    const {
        sessionId,
        path,
        title,
        referrer,
        utm,
        screenResolution,
        browserLanguage,
        userAgent,
        ip,
        headers
    } = params;

    const nowIso = new Date().toISOString();
    const docRef = db().collection(COLLECTIONS.visitorSessions).doc(sessionId);
    const existingSnap = await docRef.get();

    if (!existingSnap.exists) {
        // Resolve Geo & Device info on first event
        const geo: GeoLocation = await resolveGeoLocation(ip, headers);
        const device: DeviceInfo = parseUserAgent(userAgent);

        const newDoc: Omit<VisitorSessionDoc, "id"> = {
            sessionId,
            firstSeenAt: nowIso,
            lastSeenAt: nowIso,
            durationSeconds: 0,
            pageCount: 1,
            entryPage: path,
            lastPage: path,
            visitedPages: [
                {
                    path,
                    title: title || path,
                    visitedAt: nowIso,
                    timeSpentSeconds: 0
                }
            ],
            referrer: referrer && referrer !== "undefined" ? referrer : "Doğrudan Trafik (Direct)",
            utm: utm || {},
            country: geo.country,
            countryCode: geo.countryCode,
            region: geo.region,
            city: geo.city,
            timezone: geo.timezone,
            isApproximateLocation: geo.isApproximate,
            deviceType: device.deviceType,
            deviceBrand: device.deviceBrand,
            deviceModel: device.deviceModel,
            os: device.os,
            browser: device.browser,
            browserLanguage: browserLanguage || "Bilinmiyor",
            screenResolution: screenResolution || "Veri alınamadı",
            isBot: device.isBot,
            botName: device.botName,
            hasConversion: false,
            conversionType: "none",
            conversionRefId: null,
            events: [
                {
                    type: "pageview",
                    path,
                    timestamp: nowIso,
                    details: title
                }
            ],
            createdAt: FieldValue.serverTimestamp() as unknown as Timestamp,
            updatedAt: FieldValue.serverTimestamp() as unknown as Timestamp
        };

        await docRef.set(newDoc);
    } else {
        const existing = existingSnap.data() as VisitorSessionDoc;
        const firstTime = new Date(existing.firstSeenAt).getTime();
        const durationSec = Math.max(0, Math.round((Date.now() - firstTime) / 1000));

        // Deduplicate rapid refresh on exact same path within 3 seconds
        const lastPage = existing.visitedPages?.[existing.visitedPages.length - 1];
        const isDuplicateReload =
            lastPage &&
            lastPage.path === path &&
            Date.now() - new Date(lastPage.visitedAt).getTime() < 3000;

        let visitedPages = existing.visitedPages || [];
        if (!isDuplicateReload) {
            visitedPages = [
                ...visitedPages,
                {
                    path,
                    title: title || path,
                    visitedAt: nowIso,
                    timeSpentSeconds: 0
                }
            ].slice(-50); // limit to last 50 pages to keep document compact
        }

        const events = [
            ...(existing.events || []),
            {
                type: "pageview" as const,
                path,
                timestamp: nowIso,
                details: isDuplicateReload ? "Yenileme (Reload)" : title
            }
        ].slice(-100);

        await docRef.update({
            lastSeenAt: nowIso,
            lastPage: path,
            durationSeconds: durationSec,
            pageCount: visitedPages.length,
            visitedPages,
            events,
            updatedAt: FieldValue.serverTimestamp()
        });
    }
}

// 2. Record visitor heartbeat (periodic duration ping)
export async function recordVisitorHeartbeat(sessionId: string, currentPath: string): Promise<void> {
    if (!sessionId) return;
    const docRef = db().collection(COLLECTIONS.visitorSessions).doc(sessionId);
    const existingSnap = await docRef.get();
    if (!existingSnap.exists) return;

    const existing = existingSnap.data() as VisitorSessionDoc;
    const nowIso = new Date().toISOString();
    const firstTime = new Date(existing.firstSeenAt).getTime();
    const durationSec = Math.max(0, Math.round((Date.now() - firstTime) / 1000));

    // Update last visited page time spent
    const visitedPages = existing.visitedPages || [];
    if (visitedPages.length > 0) {
        const last = visitedPages[visitedPages.length - 1];
        if (last.path === currentPath) {
            const pageStart = new Date(last.visitedAt).getTime();
            last.timeSpentSeconds = Math.max(0, Math.round((Date.now() - pageStart) / 1000));
        }
    }

    await docRef.update({
        lastSeenAt: nowIso,
        durationSeconds: durationSec,
        visitedPages,
        updatedAt: FieldValue.serverTimestamp()
    });
}

// 3. Mark session conversion on form submission
export async function markSessionConversion(
    sessionId: string | null | undefined,
    type: "rfq" | "contact",
    refId: string
): Promise<void> {
    if (!sessionId) return;
    try {
        const docRef = db().collection(COLLECTIONS.visitorSessions).doc(sessionId);
        const snap = await docRef.get();
        if (!snap.exists) return;

        const data = snap.data() as VisitorSessionDoc;
        const currentType = data.conversionType || "none";
        const newType =
            currentType === "none"
                ? type
                : currentType === type
                ? type
                : "both";

        const nowIso = new Date().toISOString();
        const events = [
            ...(data.events || []),
            {
                type: "conversion" as const,
                path: data.lastPage || "/quote",
                timestamp: nowIso,
                details: `${type === "rfq" ? "Teklif/Sipariş Formu" : "İletişim Mesajı"} gönderildi (Ref: ${refId})`
            }
        ].slice(-100);

        await docRef.update({
            hasConversion: true,
            conversionType: newType,
            conversionRefId: refId,
            events,
            updatedAt: FieldValue.serverTimestamp()
        });
    } catch {
        // Non-blocking
    }
}

// 4. Record login attempts (successful and failed)
export async function recordLoginAttempt(params: {
    email: string;
    success: boolean;
    failureReason?: string;
    ip: string;
    userAgent: string;
    headers?: Headers | Record<string, string | string[] | undefined>;
}): Promise<void> {
    const { email, success, failureReason, ip, userAgent, headers } = params;
    const nowIso = new Date().toISOString();
    const geo = await resolveGeoLocation(ip, headers);
    const device = parseUserAgent(userAgent);

    await db().collection(COLLECTIONS.loginLogs).add({
        email: email.trim().toLowerCase(),
        success,
        failureReason: failureReason || null,
        country: geo.country,
        city: geo.city,
        deviceType: device.deviceType === "bot" ? "bilgisayar" : device.deviceType,
        os: device.os,
        browser: device.browser,
        timestamp: FieldValue.serverTimestamp(),
        isoTime: nowIso
    });
}

// 5. Query visitor sessions with filtering and aggregation
export type AnalyticsFilter = {
    dateRange?: "today" | "7d" | "30d" | "all";
    country?: string;
    deviceType?: string;
    browser?: string;
    conversionStatus?: "all" | "converted" | "unconverted";
    includeBots?: boolean;
    page?: number;
    pageSize?: number;
};

export type AnalyticsReport = {
    totalSessions: number;
    totalVisits: number;
    uniqueVisitors: number;
    activeVisitors: number;
    conversionCount: number;
    conversionRate: number;
    windowMinutesForActive: number;
    measurementNotes: {
        uniqueVisitorsMethod: string;
        activeVisitorsMethod: string;
        ipGeoNote: string;
    };
    breakdowns: {
        countries: { name: string; count: number; percentage: number }[];
        devices: { name: string; count: number; percentage: number }[];
        operatingSystems: { name: string; count: number; percentage: number }[];
        browsers: { name: string; count: number; percentage: number }[];
        trafficSources: { name: string; count: number; percentage: number }[];
        topPages: { path: string; count: number; percentage: number }[];
    };
    sessions: VisitorSessionDoc[];
    pagination: {
        currentPage: number;
        pageSize: number;
        totalPages: number;
        totalRecords: number;
    };
};

export async function queryAnalyticsReport(filter: AnalyticsFilter = {}): Promise<AnalyticsReport> {
    const pageSize = Math.min(100, Math.max(10, filter.pageSize || 20));
    const currentPage = Math.max(1, filter.page || 1);

    // Fetch records (Firestore query)
    const snap = await db()
        .collection(COLLECTIONS.visitorSessions)
        .orderBy("createdAt", "desc")
        .limit(1000)
        .get();

    const now = Date.now();
    const ACTIVE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes activity window

    // In-memory filter pipeline on retrieved real records
    let allRecords: VisitorSessionDoc[] = snap.docs.map((d) => {
        const data = d.data();
        return {
            id: d.id,
            sessionId: data.sessionId || d.id,
            firstSeenAt: data.firstSeenAt || "",
            lastSeenAt: data.lastSeenAt || "",
            durationSeconds: data.durationSeconds || 0,
            pageCount: data.pageCount || 1,
            entryPage: data.entryPage || "/",
            lastPage: data.lastPage || "/",
            visitedPages: data.visitedPages || [],
            referrer: data.referrer || "Doğrudan Trafik",
            utm: data.utm || {},
            country: data.country || "Bilinmiyor",
            countryCode: data.countryCode || "Bilinmiyor",
            region: data.region || "Bilinmiyor",
            city: data.city || "Bilinmiyor",
            timezone: data.timezone || "UTC",
            isApproximateLocation: data.isApproximateLocation ?? true,
            deviceType: data.deviceType || "bilgisayar",
            deviceBrand: data.deviceBrand || "Bilinmiyor",
            deviceModel: data.deviceModel || "Model belirlenemedi",
            os: data.os || "Bilinmiyor",
            browser: data.browser || "Bilinmiyor",
            browserLanguage: data.browserLanguage || "Bilinmiyor",
            screenResolution: data.screenResolution || "Veri alınamadı",
            isBot: Boolean(data.isBot),
            botName: data.botName || null,
            hasConversion: Boolean(data.hasConversion),
            conversionType: data.conversionType || "none",
            conversionRefId: data.conversionRefId || null,
            events: data.events || [],
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        } as VisitorSessionDoc;
    });

    // 1. Bot filter
    if (!filter.includeBots) {
        allRecords = allRecords.filter((r) => !r.isBot && r.deviceType !== "bot");
    }

    // 2. Date range filter
    if (filter.dateRange && filter.dateRange !== "all") {
        let maxAgeMs = 30 * 86400000;
        if (filter.dateRange === "today") maxAgeMs = 86400000;
        else if (filter.dateRange === "7d") maxAgeMs = 7 * 86400000;
        allRecords = allRecords.filter((r) => {
            const time = new Date(r.firstSeenAt).getTime();
            return !isNaN(time) && now - time <= maxAgeMs;
        });
    }

    // 3. Country filter
    if (filter.country && filter.country !== "all") {
        allRecords = allRecords.filter((r) => r.country.toLowerCase() === filter.country!.toLowerCase());
    }

    // 4. Device filter
    if (filter.deviceType && filter.deviceType !== "all") {
        allRecords = allRecords.filter((r) => r.deviceType === filter.deviceType);
    }

    // 5. Browser filter
    if (filter.browser && filter.browser !== "all") {
        allRecords = allRecords.filter((r) => r.browser.toLowerCase().startsWith(filter.browser!.toLowerCase()));
    }

    // 6. Conversion filter
    if (filter.conversionStatus === "converted") {
        allRecords = allRecords.filter((r) => r.hasConversion);
    } else if (filter.conversionStatus === "unconverted") {
        allRecords = allRecords.filter((r) => !r.hasConversion);
    }

    // Aggregations based on real filtered records
    const totalSessions = allRecords.length;
    let totalVisits = 0;
    let conversionCount = 0;
    let activeVisitors = 0;
    const uniqueVisitorIds = new Set<string>();

    const countryCounts: Record<string, number> = {};
    const deviceCounts: Record<string, number> = {};
    const osCounts: Record<string, number> = {};
    const browserCounts: Record<string, number> = {};
    const sourceCounts: Record<string, number> = {};
    const pageCounts: Record<string, number> = {};

    for (const record of allRecords) {
        totalVisits += record.pageCount || 1;
        uniqueVisitorIds.add(record.sessionId);
        if (record.hasConversion) conversionCount++;

        // Active check: lastSeenAt within last 15 mins
        const lastSeen = new Date(record.lastSeenAt).getTime();
        if (!isNaN(lastSeen) && now - lastSeen <= ACTIVE_WINDOW_MS) {
            activeVisitors++;
        }

        // Breakdowns
        countryCounts[record.country] = (countryCounts[record.country] || 0) + 1;
        deviceCounts[record.deviceType] = (deviceCounts[record.deviceType] || 0) + 1;
        osCounts[record.os] = (osCounts[record.os] || 0) + 1;
        const mainBrowser = record.browser.split(" ")[0] || "Bilinmiyor";
        browserCounts[mainBrowser] = (browserCounts[mainBrowser] || 0) + 1;

        const src = record.utm?.source
            ? `UTM: ${record.utm.source}`
            : record.referrer?.includes("http")
            ? new URL(record.referrer).hostname
            : record.referrer || "Doğrudan";
        sourceCounts[src] = (sourceCounts[src] || 0) + 1;

        // Pages
        for (const p of record.visitedPages || []) {
            pageCounts[p.path] = (pageCounts[p.path] || 0) + 1;
        }
    }

    const conversionRate = totalSessions > 0 ? Number(((conversionCount / totalSessions) * 100).toFixed(1)) : 0;

    const toSortedArray = (counts: Record<string, number>, total: number) =>
        Object.entries(counts)
            .map(([name, count]) => ({
                name,
                count,
                percentage: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0
            }))
            .sort((a, b) => b.count - a.count);

    // Pagination
    const totalRecords = allRecords.length;
    const totalPages = Math.ceil(totalRecords / pageSize) || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedSessions = allRecords.slice(startIndex, startIndex + pageSize);

    return {
        totalSessions,
        totalVisits,
        uniqueVisitors: uniqueVisitorIds.size,
        activeVisitors,
        conversionCount,
        conversionRate,
        windowMinutesForActive: 15,
        measurementNotes: {
            uniqueVisitorsMethod: "Birinci taraf oturum belirteci (ap_visitor_session) bazında ölçülmüştür. Cihaz parmak izi kullanılmaz.",
            activeVisitorsMethod: "Son 15 dakika içerisinde sayfada doğrulanmış etkinlik veya heartbeat kaydı bulunan oturumlar.",
            ipGeoNote: "IP konumu sunucu tarafında yaklaşık olarak belirlenmiştir; VPN, proxy veya kurumsal ağlar gerçek konumu değiştirebilir."
        },
        breakdowns: {
            countries: toSortedArray(countryCounts, totalSessions).slice(0, 10),
            devices: toSortedArray(deviceCounts, totalSessions),
            operatingSystems: toSortedArray(osCounts, totalSessions).slice(0, 10),
            browsers: toSortedArray(browserCounts, totalSessions).slice(0, 10),
            trafficSources: toSortedArray(sourceCounts, totalSessions).slice(0, 10),
            topPages: toSortedArray(pageCounts, totalVisits)
                .slice(0, 10)
                .map((p) => ({ path: p.name, count: p.count, percentage: p.percentage }))
        },
        sessions: paginatedSessions,
        pagination: {
            currentPage,
            pageSize,
            totalPages,
            totalRecords
        }
    };
}

// 6. Query login logs with pagination
export async function queryLoginLogs(page = 1, pageSize = 20): Promise<{
    logs: LoginLogDoc[];
    pagination: { currentPage: number; pageSize: number; totalPages: number; totalRecords: number };
}> {
    const snap = await db()
        .collection(COLLECTIONS.loginLogs)
        .orderBy("timestamp", "desc")
        .limit(200)
        .get();

    const allLogs: LoginLogDoc[] = snap.docs.map((d) => {
        const data = d.data();
        return {
            id: d.id,
            email: data.email || "",
            success: Boolean(data.success),
            failureReason: data.failureReason || null,
            country: data.country || "Bilinmiyor",
            city: data.city || "Bilinmiyor",
            deviceType: data.deviceType || "bilgisayar",
            os: data.os || "Bilinmiyor",
            browser: data.browser || "Bilinmiyor",
            timestamp: data.timestamp,
            isoTime: data.isoTime || (data.timestamp ? data.timestamp.toDate().toISOString() : "")
        };
    });

    const totalRecords = allLogs.length;
    const totalPages = Math.ceil(totalRecords / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const logs = allLogs.slice(startIndex, startIndex + pageSize);

    return {
        logs,
        pagination: {
            currentPage: page,
            pageSize,
            totalPages,
            totalRecords
        }
    };
}

// 7. Cleanup retention (e.g., purge sessions older than 90 days)
export async function cleanExpiredAnalytics(retentionDays = 90): Promise<{ deletedSessions: number; deletedLogins: number }> {
    const cutoffDate = new Date(Date.now() - retentionDays * 86400000);
    const cutoffIso = cutoffDate.toISOString();

    let deletedSessions = 0;
    let deletedLogins = 0;

    // Purge visitor sessions
    const sessionSnap = await db()
        .collection(COLLECTIONS.visitorSessions)
        .where("firstSeenAt", "<", cutoffIso)
        .limit(200)
        .get();

    const batch1 = db().batch();
    sessionSnap.docs.forEach((doc) => {
        batch1.delete(doc.ref);
        deletedSessions++;
    });
    if (deletedSessions > 0) await batch1.commit();

    // Purge login logs
    const loginSnap = await db()
        .collection(COLLECTIONS.loginLogs)
        .where("timestamp", "<", Timestamp.fromDate(cutoffDate))
        .limit(200)
        .get();

    const batch2 = db().batch();
    loginSnap.docs.forEach((doc) => {
        batch2.delete(doc.ref);
        deletedLogins++;
    });
    if (deletedLogins > 0) await batch2.commit();

    return { deletedSessions, deletedLogins };
}
