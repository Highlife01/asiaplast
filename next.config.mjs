/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    skipMiddlewareUrlNormalize: true,
    images: {
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
                    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
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
