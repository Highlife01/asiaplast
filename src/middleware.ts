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

    if (first === DEFAULT) {
        const url = request.nextUrl.clone();
        url.pathname = `/${segments.slice(1).join("/")}` || "/";
        if (url.pathname === "") url.pathname = "/";
        url.search = search;
        return NextResponse.redirect(url, 308);
    }

    if ((ACTIVE as readonly string[]).includes(first) && first !== DEFAULT) {
        const headers = new Headers(request.headers);
        headers.set("x-locale", first);
        return withLocale(request, first, NextResponse.next({ request: { headers } }));
    }

    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT}${pathname === "/" ? "" : pathname}`;
    url.search = search;
    const headers = new Headers(request.headers);
    headers.set("x-locale", DEFAULT);
    return withLocale(request, DEFAULT, NextResponse.rewrite(url, { request: { headers } }));
}

export const config = {
    matcher: [
        "/((?!admin|api|_next|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|icon|apple-icon|opengraph-image|twitter-image|.*\\.).*)"
    ]
};
