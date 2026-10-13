import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/site/JsonLd";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@/lib/i18n/locales";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata, localePath } from "@/lib/seo";
import { getKnowledgeArticle, getKnowledgeArticles, getRelatedKnowledge } from "@/data/knowledge";

export const revalidate = 3600;

export async function generateStaticParams() {
    const params: { locale: string; slug: string }[] = [];
    for (const locale of ACTIVE_LOCALES) {
        for (const article of getKnowledgeArticles()) {
            params.push({ locale, slug: article.slug });
        }
    }
    return params;
}

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale, slug } = await params;
    const l = isLocale(locale) ? locale : ("en" as Locale);
    const article = getKnowledgeArticle(slug);
    if (!article) return { title: "Not found" };
    return buildMetadata({
        title: article.title,
        description: article.excerpt,
        path: `/knowledge/${article.slug}`,
        locale: l
    });
}

export default async function KnowledgeArticlePage({ params }: Props) {
    const { locale, slug } = await params;
    const l = isLocale(locale) ? locale : ("en" as Locale);
    const dict = getDictionary(l);
    const article = getKnowledgeArticle(slug);
    if (!article) notFound();

    const related = getRelatedKnowledge(article.slug);
    const listHref = localePath(l, "/knowledge");
    const quoteHref = localePath(l, "/quote");

    return (
        <>
            <JsonLd
                data={breadcrumbJsonLd([
                    { name: dict.nav.home, path: localePath(l, "/") },
                    { name: dict.nav.knowledge, path: listHref },
                    { name: article.title, path: localePath(l, `/knowledge/${article.slug}`) }
                ])}
            />
            <JsonLd
                data={articleJsonLd({
                    title: article.title,
                    description: article.excerpt,
                    slug: article.slug,
                    dateModified: article.updated,
                    locale: l
                })}
            />

            <article>
                <section className="hero-bg border-b border-slate-200/80 py-16 text-slate-900 sm:py-20">
                    <div className="container-x max-w-3xl">
                        <p className="chip mb-3">
                            <Link href={listHref} className="hover:underline">
                                {dict.nav.knowledge}
                            </Link>
                        </p>
                        <h1 className="font-display text-3xl font-black text-slate-900 sm:text-5xl">{article.title}</h1>
                        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">{article.excerpt}</p>
                        <p className="mt-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                            {article.readTime} · {article.updated}
                        </p>
                    </div>
                </section>

                <section className="section">
                    <div className="container-x max-w-3xl space-y-8">
                        {article.sections.map((section) => (
                            <div key={section.heading} className="card p-6 sm:p-8">
                                <h2 className="font-display text-xl font-bold text-slate-900">{section.heading}</h2>
                                {section.paragraphs.map((paragraph) => (
                                    <p key={paragraph.slice(0, 48)} className="mt-3 text-sm leading-relaxed text-slate-600">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        ))}

                        <div className="card border-slate-200/80 bg-gradient-to-b from-white to-slate-50/70 p-8 text-center">
                            <p className="font-display text-xl font-bold text-slate-900">{dict.sections.ctaTitle}</p>
                            <p className="mt-2 text-sm text-slate-600">{dict.sections.ctaText}</p>
                            <Link href={quoteHref} className="btn-primary mt-4 !px-8 !py-3.5 shadow-cta">
                                {dict.site.ctaQuote}
                            </Link>
                        </div>
                    </div>
                </section>
            </article>

            {related.length > 0 && (
                <section className="section border-t border-slate-200/80 bg-slate-50/60">
                    <div className="container-x">
                        <h2 className="font-display text-2xl font-black text-slate-900">{dict.nav.knowledge}</h2>
                        <div className="mt-6 grid gap-5 sm:grid-cols-3">
                            {related.map((item) => (
                                <Link
                                    key={item.slug}
                                    href={localePath(l, `/knowledge/${item.slug}`)}
                                    className="card flex h-full flex-col p-6 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/40"
                                >
                                    <h3 className="font-display text-base font-bold leading-snug text-slate-900">{item.title}</h3>
                                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{item.excerpt}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
