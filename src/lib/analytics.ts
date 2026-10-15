export type DeviceType = "telefon" | "tablet" | "bilgisayar" | "Bilinmiyor";
export type BotClassification = "human" | "bot" | "uncertain";

export interface ParsedUserAgent {
    deviceType: DeviceType;
    deviceBrand: string;
    deviceModel: string;
    osName: string;
    osVersion: string;
    browserName: string;
    browserVersion: string;
    botStatus: BotClassification;
    botReason: string;
}

export interface GeoLocationInfo {
    countryCode: string;
    countryName: string;
    region: string;
    city: string;
    source: string;
}

const COUNTRY_NAMES_TR: Record<string, string> = {
    TR: "Türkiye",
    US: "Amerika Birleşik Devletleri",
    DE: "Almanya",
    GB: "Birleşik Krallık",
    FR: "Fransa",
    IT: "İtalya",
    ES: "İspanya",
    NL: "Hollanda",
    RU: "Rusya",
    AE: "Birleşik Arap Emirlikleri",
    SA: "Suudi Arabistan",
    IQ: "Irak",
    QA: "Katar",
    KW: "Kuveyt",
    EG: "Mısır",
    MA: "Fas",
    DZ: "Cezayir",
    TN: "Tunus",
    LY: "Libya",
    NG: "Nijerya",
    GH: "Gana",
    KE: "Kenya",
    ZA: "Güney Afrika",
    CN: "Çin",
    JP: "Japonya",
    KR: "Güney Kore",
    IN: "Hindistan",
    MY: "Malezya",
    SG: "Singapur",
    ID: "Endonezya",
    AZ: "Azerbaycan",
    GE: "Gürcistan",
    UA: "Ukrayna",
    RO: "Romanya",
    BG: "Bulgaristan",
    GR: "Yunanistan",
    PL: "Polonya",
    BE: "Belçika",
    AT: "Avusturya",
    CH: "İsviçre",
    SE: "İsveç",
    NO: "Norveç",
    DK: "Danimarka",
    CA: "Kanada",
    BR: "Brezilya",
    MX: "Meksika",
    AU: "Avustralya"
};

const KNOWN_BOT_PATTERNS: { pattern: RegExp; label: string }[] = [
    { pattern: /googlebot|google-extended|adsbot-google|apis-google/i, label: "Googlebot" },
    { pattern: /bingbot|msnbot|adidxbot/i, label: "Bingbot" },
    { pattern: /gptbot|oai-searchbot|chatgpt-user/i, label: "OpenAI Bot" },
    { pattern: /claudebot|anthropic-ai/i, label: "ClaudeBot" },
    { pattern: /perplexitybot/i, label: "PerplexityBot" },
    { pattern: /applebot/i, label: "Applebot" },
    { pattern: /yandexbot|yandexmobilebot/i, label: "YandexBot" },
    { pattern: /duckduckbot/i, label: "DuckDuckBot" },
    { pattern: /baiduspider/i, label: "Baiduspider" },
    { pattern: /facebookexternalhit|meta-externalagent/i, label: "Meta Crawler" },
    { pattern: /twitterbot/i, label: "Twitterbot" },
    { pattern: /linkedinbot/i, label: "LinkedInBot" },
    { pattern: /ahrefsbot/i, label: "AhrefsBot" },
    { pattern: /semrushbot/i, label: "SemrushBot" },
    { pattern: /mj12bot/i, label: "MJ12bot" },
    { pattern: /petalbot/i, label: "PetalBot" },
    { pattern: /headlesschrome|puppeteer|playwright|selenium|phantomjs/i, label: "Headless Tarayıcı" },
    {
        pattern: /\b(curl|wget|python-requests|python-urllib|go-http-client|node-fetch|libwww-perl|scrapy)\b/i,
        label: "HTTP İstemci Betiği"
    }
];

const ANDROID_BRAND_PREFIXES: { pattern: RegExp; brand: string }[] = [
    { pattern: /^(SM-|GT-|SCH-|SGH-|SHV-|SC-)/i, brand: "Samsung" },
    { pattern: /^Pixel\b/i, brand: "Google" },
    { pattern: /^(Redmi|Mi\b|POCO|M20|M21|210|220|221|230|231|240)/i, brand: "Xiaomi" },
    { pattern: /^(HUAWEI|VOG-|ELE-|ANA-|ELS-|NOH-|lya-|mar-|stk-)/i, brand: "Huawei" },
    { pattern: /^(CPH\d|RMX\d|OPPO)/i, brand: "OPPO / Realme" },
    { pattern: /^(V2\d{3}|vivo)/i, brand: "Vivo" },
    { pattern: /^(ONEPLUS|KB20|LE21|NE22|CPH24)/i, brand: "OnePlus" },
    { pattern: /^(moto\b|XT\d{4})/i, brand: "Motorola" },
    { pattern: /^(ASUS_|AI22|ZS6)/i, brand: "Asus" },
    { pattern: /^(LM-|LG-)/i, brand: "LG" },
    { pattern: /^(XQ-|SOV\d|SO-\d)/i, brand: "Sony" },
    { pattern: /^Infinix/i, brand: "Infinix" },
    { pattern: /^TECNO/i, brand: "Tecno" }
];

function cleanHint(value: string | null | undefined): string {
    if (!value) return "";
    return value.replace(/^"+|"+$/g, "").trim();
}

function inferBrandFromModel(model: string): string {
    for (const item of ANDROID_BRAND_PREFIXES) {
        if (item.pattern.test(model)) return item.brand;
    }
    return "Bilinmiyor";
}

export function parseUserAgentAndHints(
    rawUa: string | null | undefined,
    headers?: {
        secChUa?: string | null;
        secChUaMobile?: string | null;
        secChUaPlatform?: string | null;
        secChUaPlatformVersion?: string | null;
        secChUaModel?: string | null;
        acceptLanguage?: string | null;
    },
    clientHintModel?: string | null,
    clientHintPlatformVersion?: string | null
): ParsedUserAgent {
    const ua = (rawUa || "").trim();
    if (!ua) {
        return {
            deviceType: "Bilinmiyor",
            deviceBrand: "Bilinmiyor",
            deviceModel: "Model belirlenemedi",
            osName: "Bilinmiyor",
            osVersion: "Bilinmiyor",
            browserName: "Bilinmiyor",
            browserVersion: "Bilinmiyor",
            botStatus: "uncertain",
            botReason: "User-Agent başlığı gönderilmedi"
        };
    }

    // 1. Bot classification
    let botStatus: BotClassification = "human";
    let botReason = "Standart tarayıcı imzası";

    for (const item of KNOWN_BOT_PATTERNS) {
        if (item.pattern.test(ua)) {
            botStatus = "bot";
            botReason = `Bilinen bot imzası: ${item.label}`;
            break;
        }
    }

    if (botStatus === "human") {
        if (/\b(bot|crawler|spider|slurp|archiver|ia_archiver)\b/i.test(ua)) {
            botStatus = "bot";
            botReason = "Genel tarayıcı bot imzası";
        } else if (
            /\b(axios|okhttp|java\/|apache-httpclient|postmanruntime|insomnia|got\s*\()\b/i.test(ua) ||
            (!/mozilla\/5\.0/i.test(ua) && !headers?.acceptLanguage)
        ) {
            botStatus = "uncertain";
            botReason = "Standart dışı istemci veya eksik dil başlığı (kesin değil)";
        }
    }

    // 2. OS & Version
    let osName = "Bilinmiyor";
    let osVersion = "Bilinmiyor";

    const hintPlatform = cleanHint(headers?.secChUaPlatform);
    const hintPlatformVer = cleanHint(clientHintPlatformVersion || headers?.secChUaPlatformVersion);

    if (/iPhone|iPod/i.test(ua)) {
        osName = "iOS";
        const m = ua.match(/OS (\d+[_\d]*)/i);
        if (m?.[1]) osVersion = m[1].replace(/_/g, ".");
    } else if (/iPad/i.test(ua)) {
        osName = "iPadOS";
        const m = ua.match(/OS (\d+[_\d]*)/i);
        if (m?.[1]) osVersion = m[1].replace(/_/g, ".");
    } else if (/Android/i.test(ua)) {
        osName = "Android";
        const m = ua.match(/Android\s+([0-9.]+)/i);
        if (hintPlatformVer && hintPlatformVer !== "0.0.0") {
            osVersion = hintPlatformVer;
        } else if (m?.[1]) {
            osVersion = m[1];
        }
    } else if (/Windows NT/i.test(ua) || hintPlatform === "Windows") {
        osName = "Windows";
        const ntMatch = ua.match(/Windows NT\s+([0-9.]+)/i);
        if (hintPlatformVer) {
            const major = Number(hintPlatformVer.split(".")[0]);
            if (major >= 13) osVersion = "11";
            else if (major > 0) osVersion = "10";
            else osVersion = "10/11";
        } else if (ntMatch?.[1]) {
            const nt = ntMatch[1];
            if (nt === "10.0") osVersion = "10/11";
            else if (nt === "6.3") osVersion = "8.1";
            else if (nt === "6.2") osVersion = "8";
            else if (nt === "6.1") osVersion = "7";
            else osVersion = nt;
        }
    } else if (/Macintosh|Mac OS X/i.test(ua) || hintPlatform === "macOS") {
        osName = "macOS";
        const m = ua.match(/Mac OS X\s+([0-9_]+)/i);
        if (hintPlatformVer && hintPlatformVer !== "0.0.0") {
            osVersion = hintPlatformVer;
        } else if (m?.[1]) {
            const candidate = m[1].replace(/_/g, ".");
            osVersion = candidate === "10.15.7" ? "10.15+ (Tarayıcı Kısıtlı)" : candidate;
        }
    } else if (/CrOS/i.test(ua) || hintPlatform === "Chrome OS") {
        osName = "ChromeOS";
    } else if (/Linux/i.test(ua) || hintPlatform === "Linux") {
        osName = "Linux";
    }

    // 3. Browser & Version
    let browserName = "Bilinmiyor";
    let browserVersion = "Bilinmiyor";

    const edg = ua.match(/Edg(?:e|A|iOS)?\/([0-9.]+)/);
    const opr = ua.match(/(?:OPR|Opera)\/([0-9.]+)/);
    const samsung = ua.match(/SamsungBrowser\/([0-9.]+)/);
    const yandex = ua.match(/YaBrowser\/([0-9.]+)/);
    const crios = ua.match(/CriOS\/([0-9.]+)/);
    const fxios = ua.match(/FxiOS\/([0-9.]+)/);
    const firefox = ua.match(/Firefox\/([0-9.]+)/);
    const chrome = ua.match(/Chrome\/([0-9.]+)/);
    const safariVer = ua.match(/Version\/([0-9.]+).*Safari\//);

    if (edg) {
        browserName = "Microsoft Edge";
        browserVersion = edg[1];
    } else if (opr) {
        browserName = "Opera";
        browserVersion = opr[1];
    } else if (samsung) {
        browserName = "Samsung Internet";
        browserVersion = samsung[1];
    } else if (yandex) {
        browserName = "Yandex Browser";
        browserVersion = yandex[1];
    } else if (crios) {
        browserName = "Chrome (iOS)";
        browserVersion = crios[1];
    } else if (fxios) {
        browserName = "Firefox (iOS)";
        browserVersion = fxios[1];
    } else if (firefox) {
        browserName = "Firefox";
        browserVersion = firefox[1];
    } else if (chrome && !/Chromium/i.test(ua)) {
        browserName = "Chrome";
        browserVersion = chrome[1];
    } else if (safariVer || (/Safari\//i.test(ua) && !/Chrome|Chromium/i.test(ua))) {
        browserName = "Safari";
        browserVersion = safariVer?.[1] || "Bilinmiyor";
    }

    // 4. Device Type, Brand & Model
    // ACCURACY RULE: Never guess phone models (especially iPhone) from screen resolution.
    // If browser does not provide exact model via UA or Client Hints, return "Model belirlenemedi".
    let deviceType: DeviceType = "bilgisayar";
    let deviceBrand = "Bilinmiyor";
    let deviceModel = "Model belirlenemedi";

    const isTabletUa = /iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua);
    const isMobileUa =
        /Mobile|iPhone|iPod|Android.*Mobile|Windows Phone|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
        headers?.secChUaMobile === "?1";

    if (isTabletUa) {
        deviceType = "tablet";
    } else if (isMobileUa) {
        deviceType = "telefon";
    } else if (osName === "Windows" || osName === "macOS" || osName === "Linux" || osName === "ChromeOS") {
        deviceType = "bilgisayar";
    } else if (botStatus === "bot") {
        deviceType = "Bilinmiyor";
    }

    const rawHintModel = cleanHint(clientHintModel || headers?.secChUaModel);

    if (/iPhone/i.test(ua)) {
        deviceBrand = "Apple";
        // iOS Safari & WebKit never expose specific iPhone hardware models in UA or Client Hints
        deviceModel = "Model belirlenemedi";
    } else if (/iPad/i.test(ua)) {
        deviceBrand = "Apple";
        deviceModel = "Model belirlenemedi";
    } else if (/Macintosh|Mac OS X/i.test(ua)) {
        deviceBrand = "Apple";
        deviceModel = "Model belirlenemedi";
    } else if (rawHintModel && rawHintModel !== "K" && rawHintModel.toLowerCase() !== "unknown") {
        deviceModel = rawHintModel.slice(0, 80);
        deviceBrand = inferBrandFromModel(deviceModel);
    } else if (/Android/i.test(ua)) {
        const androidMatch = ua.match(/Android\s+[0-9.]+;\s*([^;)]+?)(?:\s+Build\/[^)]*)?\)/i);
        const token = androidMatch?.[1]?.trim() || "";
        // Chrome UA reduction uses "K" placeholder when high-entropy hints are not sent
        if (token && token !== "K" && !/^(Linux|U|wv|en-[A-Z]{2}|tr-[A-Z]{2}|Mobile)$/i.test(token)) {
            deviceModel = token.slice(0, 80);
            deviceBrand = inferBrandFromModel(deviceModel);
        } else {
            deviceModel = "Model belirlenemedi";
        }
    }

    return {
        deviceType,
        deviceBrand,
        deviceModel,
        osName,
        osVersion,
        browserName,
        browserVersion,
        botStatus,
        botReason
    };
}

export function extractGeoFromHeaders(headers: Headers): GeoLocationInfo {
    const appEngineCountry = headers.get("x-appengine-country")?.trim().toUpperCase();
    const cfCountry = headers.get("cf-ipcountry")?.trim().toUpperCase();
    const vercelCountry = headers.get("x-vercel-ip-country")?.trim().toUpperCase();
    const fastlyCountry = headers.get("fastly-geo-country")?.trim().toUpperCase();
    const customCountry = headers.get("x-country-code")?.trim().toUpperCase();

    const rawCode = appEngineCountry || cfCountry || vercelCountry || fastlyCountry || customCountry || "";
    const validCode =
        /^[A-Z]{2}$/.test(rawCode) && rawCode !== "ZZ" && rawCode !== "XX" && rawCode !== "T1" ? rawCode : "";

    const source = appEngineCountry
        ? "Google Cloud / Firebase Hosting"
        : cfCountry
        ? "Cloudflare Edge"
        : vercelCountry
        ? "Edge Geo Header"
        : fastlyCountry
        ? "Fastly CDN Geo"
        : validCode
        ? "Sunucu Konum Başlığı"
        : "Yerel / Doğrulanmış Başlık Yok";

    const rawRegion =
        headers.get("x-appengine-region")?.trim() ||
        headers.get("x-vercel-ip-country-region")?.trim() ||
        headers.get("cf-region")?.trim() ||
        "";
    const rawCity =
        headers.get("x-appengine-city")?.trim() ||
        headers.get("x-vercel-ip-city")?.trim() ||
        headers.get("cf-ipcity")?.trim() ||
        "";

    const decodeSafe = (val: string) => {
        if (!val || val === "?" || val.toLowerCase() === "unknown" || val.toLowerCase() === "zz") return "Bilinmiyor";
        try {
            return decodeURIComponent(val).slice(0, 80);
        } catch {
            return val.slice(0, 80);
        }
    };

    const countryCode = validCode || "Bilinmiyor";
    const countryName = validCode ? `${COUNTRY_NAMES_TR[validCode] || validCode} (${validCode})` : "Bilinmiyor";

    return {
        countryCode,
        countryName,
        region: decodeSafe(rawRegion),
        city: decodeSafe(rawCity),
        source
    };
}

const SENSITIVE_QUERY_KEYS = new Set([
    "password",
    "pass",
    "pwd",
    "token",
    "access_token",
    "refresh_token",
    "id_token",
    "secret",
    "key",
    "api_key",
    "apikey",
    "otp",
    "code",
    "session",
    "sid",
    "email",
    "phone",
    "tel",
    "message",
    "company",
    "contactname"
]);

export function sanitizeReferrer(rawReferrer: string | null | undefined, ownHost?: string): string {
    if (!rawReferrer || typeof rawReferrer !== "string") return "Doğrudan Giriş";
    const trimmed = rawReferrer.trim();
    if (!trimmed) return "Doğrudan Giriş";
    try {
        const parsed = new URL(trimmed);
        if (ownHost && parsed.host.toLowerCase() === ownHost.toLowerCase()) {
            return "Site İçi Geçiş";
        }
        const cleanPath = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname.slice(0, 80) : "";
        return `${parsed.origin}${cleanPath}`.slice(0, 160);
    } catch {
        return "Bilinmiyor";
    }
}

export interface UtmInfo {
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    utmTerm: string;
    utmContent: string;
}

export function extractSafeUtm(rawQuery: Record<string, unknown> | null | undefined): UtmInfo {
    const clean = (val: unknown) => {
        if (typeof val !== "string") return "";
        const trimmed = val.trim().slice(0, 100);
        if (trimmed.includes("@")) return "[Maskelendi]";
        return trimmed;
    };
    return {
        utmSource: clean(rawQuery?.utm_source),
        utmMedium: clean(rawQuery?.utm_medium),
        utmCampaign: clean(rawQuery?.utm_campaign),
        utmTerm: clean(rawQuery?.utm_term),
        utmContent: clean(rawQuery?.utm_content)
    };
}

export function sanitizePathForAnalytics(rawPath: string | null | undefined): string {
    if (!rawPath || typeof rawPath !== "string") return "/";
    try {
        const base = "https://example.invalid";
        const url = new URL(rawPath.startsWith("/") ? rawPath : `/${rawPath}`, base);
        for (const key of Array.from(url.searchParams.keys())) {
            if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase()) || !key.toLowerCase().startsWith("utm_")) {
                url.searchParams.delete(key);
            }
        }
        return url.pathname.slice(0, 180) || "/";
    } catch {
        return rawPath.split("?")[0]?.slice(0, 180) || "/";
    }
}

export function formatDurationTr(seconds: number): string {
    const safe = Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds) : 0;
    if (safe === 0) return "Tek etkinlik (0 sn)";
    if (safe < 60) return `${safe} sn`;
    const mins = Math.floor(safe / 60);
    const remSec = safe % 60;
    if (mins < 60) {
        return remSec > 0 ? `${mins} dk ${remSec} sn` : `${mins} dk`;
    }
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return remMins > 0 ? `${hours} sa ${remMins} dk` : `${hours} sa`;
}

export function maskEmail(email: string | null | undefined): string {
    if (!email || !email.includes("@")) return email || "Bilinmiyor";
    const [local, domain] = email.split("@");
    if (local.length <= 2) return `${local[0] || "*"}***@${domain}`;
    return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
}
