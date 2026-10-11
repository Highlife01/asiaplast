import { z } from "zod";

const cleanText = (max: number) => z.string().trim().min(1).max(max);

export const contactSchema = z.object({
    name: cleanText(120),
    company: z.string().trim().max(160).optional().default(""),
    email: z.string().trim().email().max(200),
    phone: z.string().trim().max(40).optional().default(""),
    country: cleanText(80),
    message: z.string().trim().min(10).max(4000),
    locale: z.string().trim().max(8).default("en"),
    sourcePage: z.string().trim().max(200).default("/contact")
});

export const quoteSchema = z.object({
    name: cleanText(120),
    company: cleanText(160),
    email: z.string().trim().email().max(200),
    phone: z.string().trim().max(40).optional().default(""),
    country: cleanText(80),
    categoryId: cleanText(60),
    productId: z.string().trim().max(120).nullable().optional().default(null),
    volume: cleanText(160),
    deliveryTerm: z.enum(["EXW", "FOB", "CIF", "DAP"]),
    message: z.string().trim().max(4000).optional().default(""),
    locale: z.string().trim().max(8).default("en"),
    sourcePage: z.string().trim().max(200).default("/quote")
});

/** Very light heuristic spam check — no external service dependency. */
export function looksLikeSpam(text: string): boolean {
    const lower = text.toLowerCase();
    const urls = (lower.match(/https?:\/\//g) || []).length;
    if (urls >= 3) return true;
    if (/(viagra|casino|crypto ?pump|seo ?offer|backlink ?package)/.test(lower)) return true;
    return false;
}
