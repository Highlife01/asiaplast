import { z } from "zod";

const cleanText = (max: number) => z.string().trim().min(1).max(max);
const optText = (max: number, def = "") => z.string().trim().max(max).optional().default(def);

export const contactSchema = z.object({
    name: cleanText(120),
    company: optText(160),
    email: z.string().trim().email().max(200),
    phone: optText(40),
    country: cleanText(80),
    subject: optText(200, "Genel İletişim"),
    message: z.string().trim().min(10).max(4000),
    locale: z.string().trim().max(8).default("en"),
    sourcePage: z.string().trim().max(200).default("/contact"),
    honeypot: optText(100),
    idempotencyKey: optText(80),
    isTest: z.boolean().optional().default(false)
});

export const bagSpecsSchema = z
    .object({
        dimensions: optText(120),
        color: optText(80),
        thicknessMicron: optText(60),
        packagingPref: optText(120),
        sealType: optText(80)
    })
    .optional()
    .default({
        dimensions: "",
        color: "",
        thicknessMicron: "",
        packagingPref: "",
        sealType: ""
    });

export const quoteSchema = z.object({
    name: cleanText(120),
    company: cleanText(160),
    email: z.string().trim().email().max(200),
    phone: optText(40),
    country: cleanText(80),
    categoryId: cleanText(60),
    productId: z.string().trim().max(120).nullable().optional().default(null),
    quantity: optText(80),
    unit: optText(60),
    volume: optText(160),
    bagSpecs: bagSpecsSchema,
    deliveryTerm: z.enum(["EXW", "FOB", "CIF", "DAP"]),
    deliveryLocation: optText(160),
    message: optText(4000),
    locale: z.string().trim().max(8).default("en"),
    sourcePage: z.string().trim().max(200).default("/quote"),
    honeypot: optText(100),
    idempotencyKey: optText(80),
    isTest: z.boolean().optional().default(false)
});

export const productTranslationSchema = z.object({
    name: optText(180),
    shortDescription: optText(400),
    description: optText(4000)
});

export const productInputSchema = z.object({
    slug: z
        .string()
        .trim()
        .min(2)
        .max(120)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug yalnızca küçük harf, rakam ve tire içerebilir"),
    active: z.boolean().default(true),
    sortOrder: z.number().int().min(0).max(9999).default(10),
    categoryId: cleanText(60),
    name: cleanText(180),
    shortDescription: cleanText(400),
    description: cleanText(4000),
    moq: optText(120, "Spesifikasyona göre belirlenir"),
    imageUrl: z.string().trim().max(500).nullable().optional().default(null),
    specs: z
        .array(
            z.object({
                label: cleanText(80),
                value: cleanText(200)
            })
        )
        .max(30)
        .default([]),
    translations: z
        .record(z.string(), productTranslationSchema)
        .optional()
        .default({})
});

export const companySettingsSchema = z.object({
    name: cleanText(120),
    legalName: optText(200),
    email: z.string().trim().email().max(200),
    phone: optText(60),
    whatsapp: optText(60),
    country: cleanText(80),
    city: optText(80),
    address: optText(300),
    workingHours: optText(160),
    socialLinks: z
        .object({
            linkedin: optText(300),
            instagram: optText(300),
            facebook: optText(300),
            youtube: optText(300),
            x: optText(300)
        })
        .default({
            linkedin: "",
            instagram: "",
            facebook: "",
            youtube: "",
            x: ""
        }),
    analyticsRetentionDays: z.number().int().min(7).max(730).default(90)
});

/** Heuristic spam check — server-side protection without external third-party tracking. */
export function looksLikeSpam(text: string): boolean {
    const lower = text.toLowerCase();
    const urls = (lower.match(/https?:\/\//g) || []).length;
    if (urls >= 3) return true;
    if (/(viagra|casino|crypto ?pump|seo ?offer|backlink ?package|porn|betting)/i.test(lower)) return true;
    return false;
}
