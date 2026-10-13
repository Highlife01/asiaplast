import "server-only";

export type DeviceInfo = {
    deviceType: "telefon" | "tablet" | "bilgisayar" | "bot";
    deviceBrand: string;
    deviceModel: string;
    os: string;
    browser: string;
    isBot: boolean;
    botName: string | null;
};

export type GeoLocation = {
    country: string;
    countryCode: string;
    region: string;
    city: string;
    timezone: string;
    isApproximate: boolean;
};

// Known crawlers and bots
const BOT_PATTERNS: { regex: RegExp; name: string }[] = [
    { regex: /Googlebot/i, name: "Googlebot" },
    { regex: /bingbot|msnbot/i, name: "Bingbot" },
    { regex: /YandexBot|YandexImages/i, name: "YandexBot" },
    { regex: /Baiduspider/i, name: "Baiduspider" },
    { regex: /DuckDuckBot/i, name: "DuckDuckBot" },
    { regex: /facebookexternalhit|Facebot/i, name: "FacebookBot" },
    { regex: /Twitterbot/i, name: "Twitterbot" },
    { regex: /LinkedInBot/i, name: "LinkedInBot" },
    { regex: /WhatsApp/i, name: "WhatsApp Preview" },
    { regex: /TelegramBot/i, name: "TelegramBot" },
    { regex: /Slackbot/i, name: "Slackbot" },
    { regex: /Applebot/i, name: "Applebot" },
    { regex: /SemrushBot/i, name: "SemrushBot" },
    { regex: /AhrefsBot/i, name: "AhrefsBot" },
    { regex: /curl|wget|python-requests|node-fetch|axios|Postman/i, name: "Automated HTTP Client" },
    { regex: /HeadlessChrome|PhantomJS/i, name: "Headless Browser" }
];

// In-memory cache for IP geo lookups to prevent rate limiting & enhance speed
const geoCache = new Map<string, { data: GeoLocation; expires: number }>();

export function parseUserAgent(uaString: string | null | undefined): DeviceInfo {
    if (!uaString) {
        return {
            deviceType: "bilgisayar",
            deviceBrand: "Bilinmiyor",
            deviceModel: "Model belirlenemedi",
            os: "Bilinmiyor",
            browser: "Bilinmiyor",
            isBot: false,
            botName: null
        };
    }

    const ua = uaString;

    // 1. Bot check
    for (const b of BOT_PATTERNS) {
        if (b.regex.test(ua)) {
            return {
                deviceType: "bot",
                deviceBrand: "Bot / Crawler",
                deviceModel: b.name,
                os: "Sunucu / Bot",
                browser: b.name,
                isBot: true,
                botName: b.name
            };
        }
    }

    // 2. Device Type
    let deviceType: "telefon" | "tablet" | "bilgisayar" = "bilgisayar";
    if (/tablet|ipad|playbook|silk/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua))) {
        deviceType = "tablet";
    } else if (/mobile|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop|windows phone/i.test(ua)) {
        deviceType = "telefon";
    }

    // 3. Operating System
    let os = "Bilinmiyor";
    if (/windows nt 10\.0/i.test(ua)) os = "Windows 10/11";
    else if (/windows nt 6\.3/i.test(ua)) os = "Windows 8.1";
    else if (/windows nt 6\.1/i.test(ua)) os = "Windows 7";
    else if (/windows/i.test(ua)) os = "Windows";
    else if (/android (\d+([\._]\d+)*)/i.test(ua)) {
        const m = ua.match(/android (\d+([\._]\d+)*)/i);
        os = `Android ${m ? m[1].replace(/_/g, ".") : ""}`.trim();
    } else if (/iphone os (\d+([\._]\d+)*)/i.test(ua)) {
        const m = ua.match(/iphone os (\d+([\._]\d+)*)/i);
        os = `iOS ${m ? m[1].replace(/_/g, ".") : ""}`.trim();
    } else if (/ipad; cpu os (\d+([\._]\d+)*)/i.test(ua)) {
        const m = ua.match(/ipad; cpu os (\d+([\._]\d+)*)/i);
        os = `iPadOS ${m ? m[1].replace(/_/g, ".") : ""}`.trim();
    } else if (/mac os x (\d+([\._]\d+)*)/i.test(ua)) {
        const m = ua.match(/mac os x (\d+([\._]\d+)*)/i);
        os = `macOS ${m ? m[1].replace(/_/g, ".") : ""}`.trim();
    } else if (/cros/i.test(ua)) {
        os = "ChromeOS";
    } else if (/linux/i.test(ua)) {
        os = "Linux";
    }

    // 4. Browser
    let browser = "Bilinmiyor";
    if (/edg\/(\d+[\.\d]*)/i.test(ua)) {
        const m = ua.match(/edg\/(\d+[\.\d]*)/i);
        browser = `Edge ${m ? m[1].split(".")[0] : ""}`.trim();
    } else if (/opr\/(\d+[\.\d]*)|opera/i.test(ua)) {
        const m = ua.match(/opr\/(\d+[\.\d]*)/i);
        browser = `Opera ${m ? m[1].split(".")[0] : ""}`.trim();
    } else if (/samsungbrowser\/(\d+[\.\d]*)/i.test(ua)) {
        const m = ua.match(/samsungbrowser\/(\d+[\.\d]*)/i);
        browser = `Samsung Internet ${m ? m[1].split(".")[0] : ""}`.trim();
    } else if (/chrome\/(\d+[\.\d]*)/i.test(ua) && !/chromium/i.test(ua)) {
        const m = ua.match(/chrome\/(\d+[\.\d]*)/i);
        browser = `Chrome ${m ? m[1].split(".")[0] : ""}`.trim();
    } else if (/firefox\/(\d+[\.\d]*)/i.test(ua)) {
        const m = ua.match(/firefox\/(\d+[\.\d]*)/i);
        browser = `Firefox ${m ? m[1].split(".")[0] : ""}`.trim();
    } else if (/version\/(\d+[\.\d]*).+safari/i.test(ua)) {
        const m = ua.match(/version\/(\d+[\.\d]*)/i);
        browser = `Safari ${m ? m[1].split(".")[0] : ""}`.trim();
    }

    // 5. Device Brand & Model
    // RULE: Never guess iPhone model from screen size. Write 'Model belirlenemedi'.
    let deviceBrand = "Bilinmiyor";
    let deviceModel = "Model belirlenemedi";

    if (/iphone/i.test(ua)) {
        deviceBrand = "Apple";
        deviceModel = "Model belirlenemedi"; // Exact iPhone model is not exposed by Safari User-Agent
    } else if (/ipad/i.test(ua)) {
        deviceBrand = "Apple";
        deviceModel = "Model belirlenemedi";
    } else if (/macintosh/i.test(ua)) {
        deviceBrand = "Apple";
        deviceModel = "Mac";
    } else if (/samsung|sm-[a-z0-9]+/i.test(ua)) {
        deviceBrand = "Samsung";
        const sm = ua.match(/sm-[a-z0-9]+/i);
        deviceModel = sm ? sm[0].toUpperCase() : "Model belirlenemedi";
    } else if (/huawei|honor/i.test(ua)) {
        deviceBrand = "Huawei";
        deviceModel = "Model belirlenemedi";
    } else if (/xiaomi|redmi|poco/i.test(ua)) {
        deviceBrand = "Xiaomi";
        deviceModel = "Model belirlenemedi";
    } else if (deviceType === "bilgisayar") {
        deviceBrand = "Masaüstü / Dizüstü";
        deviceModel = "PC / Workstation";
    }

    return {
        deviceType,
        deviceBrand,
        deviceModel,
        os,
        browser,
        isBot: false,
        botName: null
    };
}

export async function resolveGeoLocation(
    ip: string,
    reqHeaders?: Headers | Record<string, string | string[] | undefined>
): Promise<GeoLocation> {
    // Check known hosting proxy headers first (Firebase / GCP / Cloudflare / Vercel)
    const getHeader = (name: string): string | undefined => {
        if (!reqHeaders) return undefined;
        if (typeof (reqHeaders as Headers).get === "function") {
            return (reqHeaders as Headers).get(name) || undefined;
        }
        const val = (reqHeaders as Record<string, string | string[] | undefined>)[name.toLowerCase()];
        return Array.isArray(val) ? val[0] : val;
    };

    const headerCountry =
        getHeader("x-country-code") ||
        getHeader("x-client-geo-country") ||
        getHeader("cf-ipcountry") ||
        getHeader("x-appengine-country") ||
        getHeader("x-geo-country");

    const headerCity =
        getHeader("x-client-geo-city") ||
        getHeader("x-appengine-city") ||
        getHeader("x-geo-city");

    const headerRegion =
        getHeader("x-client-geo-region") ||
        getHeader("x-appengine-region") ||
        getHeader("x-geo-region");

    if (headerCountry && headerCountry !== "XX" && headerCountry !== "T1") {
        return {
            country: headerCountry.toUpperCase(),
            countryCode: headerCountry.toUpperCase(),
            region: headerRegion || "Bilinmiyor",
            city: headerCity || "Bilinmiyor",
            timezone: "UTC",
            isApproximate: true
        };
    }

    // Check if localhost / private IP
    const cleanIp = ip.split(",")[0].trim();
    if (!cleanIp || cleanIp === "127.0.0.1" || cleanIp === "::1" || cleanIp.startsWith("192.168.") || cleanIp.startsWith("10.") || cleanIp === "unknown") {
        return {
            country: "Yerel Ağ / Geliştirme",
            countryCode: "LOC",
            region: "Localhost",
            city: "Geliştirme Ortamı",
            timezone: "Europe/Istanbul",
            isApproximate: false
        };
    }

    // Check in-memory cache (expires in 24 hours)
    const cached = geoCache.get(cleanIp);
    if (cached && cached.expires > Date.now()) {
        return cached.data;
    }

    // Fetch from reliable free IP geolocation service (timeout 2500ms)
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const res = await fetch(`http://ip-api.com/json/${cleanIp}?fields=status,message,country,countryCode,regionName,city,timezone`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
            const data = await res.json();
            if (data.status === "success") {
                const geo: GeoLocation = {
                    country: data.country || "Bilinmiyor",
                    countryCode: data.countryCode || "Bilinmiyor",
                    region: data.regionName || "Bilinmiyor",
                    city: data.city || "Bilinmiyor",
                    timezone: data.timezone || "UTC",
                    isApproximate: true
                };
                geoCache.set(cleanIp, { data: geo, expires: Date.now() + 86400000 });
                return geo;
            }
        }
    } catch {
        // Fallback on timeout or network block
    }

    return {
        country: "Bilinmiyor",
        countryCode: "Bilinmiyor",
        region: "Bilinmiyor",
        city: "Bilinmiyor",
        timezone: "UTC",
        isApproximate: true
    };
}
