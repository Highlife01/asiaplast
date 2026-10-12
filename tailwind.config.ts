import type { Config } from "tailwindcss";

const config: Config = {
    content: ["./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                brand: {
                    navy: "#0F172A",
                    "navy-dark": "#020617",
                    "navy-light": "#1E293B",
                    green: "#059669",
                    "green-dark": "#047857",
                    "green-light": "#ECFDF5",
                    teal: "#0D9488",
                    cyan: "#0891B2"
                },
                surface: {
                    DEFAULT: "#FFFFFF",
                    soft: "#F8FAFC",
                    subtle: "#F1F5F9",
                    border: "#E2E8F0"
                }
            },
            fontFamily: {
                sans: ["var(--font-inter)", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
                display: ["var(--font-manrope)", "var(--font-inter)", "system-ui", "sans-serif"]
            },
            boxShadow: {
                xs: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
                card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 10px 25px -5px rgba(0, 0, 0, 0.04)",
                "card-hover": "0 20px 35px -10px rgba(0, 0, 0, 0.08), 0 1px 3px 0 rgba(0, 0, 0, 0.05)",
                cta: "0 10px 25px -5px rgba(5, 150, 105, 0.35)",
                glass: "0 8px 32px 0 rgba(15, 23, 42, 0.06)"
            }
        }
    },
    plugins: []
};

export default config;
