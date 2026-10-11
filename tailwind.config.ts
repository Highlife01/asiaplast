import type { Config } from "tailwindcss";

const config: Config = {
    content: ["./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                brand: {
                    navy: "#10243A",
                    "navy-dark": "#0B1A2B",
                    "navy-light": "#1B3A5C",
                    green: "#19A974",
                    "green-dark": "#128A5D",
                    "green-light": "#E6F7F0"
                },
                surface: {
                    DEFAULT: "#FFFFFF",
                    soft: "#F4F7FA",
                    border: "#E3E9F0"
                }
            },
            fontFamily: {
                sans: ["var(--font-inter)", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
                display: ["var(--font-manrope)", "var(--font-inter)", "system-ui", "sans-serif"]
            },
            boxShadow: {
                card: "0 1px 2px rgba(16,36,58,.06), 0 8px 24px rgba(16,36,58,.08)",
                cta: "0 8px 20px rgba(25,169,116,.35)"
            }
        }
    },
    plugins: []
};

export default config;
