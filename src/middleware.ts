import { NextResponse, type NextRequest } from "next/server";

const ACTIVE = ["en", "tr", "de", "fr", "ar"] as const;
const DEFAULT = "en";

function withLocale(request: NextRequest, locale: string, response: NextResponse) {
    response.headers.set("x-locale", locale);
    return response;
}

/**
 * English has no prefix. Other locales: /tr, /de, /fr, /ar.
 * /en and /en/... redirect to the unprefixed path.
 */
export function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const segments = pathname.split("/").filter(Boolean);
    const first = segments[0] || "";

    const hostHeader = request.headers.get("host");

    if (first === DEFAULT) {
        const cleanPath = `/${segments.slice(1).join("/")}` || "/";
        const redirectUrl = new URL(`${cleanPath === "" ? "/" : cleanPath}${search}`, request.url);
        if (hostHeader) redirectUrl.host = hostHeader;
        return NextResponse.redirect(redirectUrl, 308);
    }

    if ((ACTIVE as readonly string[]).includes(first) && first !== DEFAULT) {
        const headers = new Headers(request.headers);
        headers.set("x-locale", first);
        return withLocale(request, first, NextResponse.next({ request: { headers } }));
    }

    const rewriteUrl = new URL(`/${DEFAULT}${pathname === "/" ? "" : pathname}${search}`, request.url);
    if (hostHeader) rewriteUrl.host = hostHeader;
    const headers = new Headers(request.headers);
    headers.set("x-locale", DEFAULT);
    return withLocale(request, DEFAULT, NextResponse.rewrite(rewriteUrl, { request: { headers } }));
}

export const config = {
    matcher: [
        "/((?!dashboard|admin|api|_next|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|icon|apple-icon|opengraph-image|twitter-image|.*\\.).*)"
    ]
};
