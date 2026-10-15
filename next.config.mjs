/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    compress: true,
    skipMiddlewareUrlNormalize: true,
    images: {
        formats: ["image/webp"],
        deviceSizes: [640, 828, 1080, 1280, 1600],
        imageSizes: [128, 256, 384],
        minimumCacheTTL: 31536000,
        remotePatterns: [
            { protocol: "https", hostname: "firebasestorage.googleapis.com" },
            { protocol: "https", hostname: "storage.googleapis.com" }
        ]
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "X-Frame-Options", value: "SAMEORIGIN" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
                    { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
                    { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self'" }
                ]
            },
            {
                source: "/images/:path*",
                headers: [
                    { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }
                ]
            },
            {
                source: "/icons/:path*",
                headers: [
                    { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }
                ]
            },
            {
                source: "/dashboard",
                headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
            },
            {
                source: "/dashboard/:path*",
                headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
            },
            {
                source: "/admin",
                headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
            },
            {
                source: "/admin/:path*",
                headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
            }
        ];
    }
};

export default nextConfig;
