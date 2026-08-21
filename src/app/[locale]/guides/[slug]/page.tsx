import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { initialArticles } from '@/lib/mock-data';
import { db } from '@/lib/db';
import { articles } from '@/db/schema';
import { eq, desc, and, ne } from 'drizzle-orm';
import { locales } from '@/i18n/routing';
import ArticleStandard from '@/templates/ArticleStandard';
import ArticleListicle from '@/templates/ArticleListicle';
import { generateToc, injectHeadingIds } from '@/lib/extract-toc';

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string; slug: string }> };

function formatDate(d: Date | string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function computeReadTime(text: string): string {
  const wpm = 200;
  const words = text?.split(/\s+/).length || 0;
  return `${Math.max(1, Math.ceil(words / wpm))} min read`;
}

export async function generateStaticParams() {
  const mockSlugs = initialArticles.map(a => a.slug);

  let dbSlugs: string[] = [];
  try {
    const rows = await db.select({ slug: articles.slug }).from(articles).where(eq(articles.isPublished, true));
    dbSlugs = rows.map(r => r.slug);
  } catch {}

  const allSlugs = [...new Set([...mockSlugs, ...dbSlugs])];

  return locales.flatMap(locale =>
    allSlugs.map(slug => ({ locale, slug }))
  );
}

async function fetchArticle(slug: string) {
  const mock = initialArticles.find(a => a.slug === slug);
  if (mock) {
    const content = mock.content || "";
    return { ...mock, toc: generateToc(content), enhancedContent: injectHeadingIds(content) };
  }

  try {
    const [dbArticle] = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
    if (!dbArticle) return null;

    const content = dbArticle.content || "";
    const toc = content ? generateToc(content) : [];
    const enhancedContent = content ? injectHeadingIds(content) : "";

    return {
      id: dbArticle.id,
      title: dbArticle.title,
      slug: dbArticle.slug,
      content,
      enhancedContent,
      excerpt: dbArticle.excerpt || "",
      date: formatDate(dbArticle.publishedAt || dbArticle.createdAt),
      dateModified: formatDate(dbArticle.updatedAt),
      readTime: computeReadTime(content),
      category: dbArticle.category || "Articles",
      image: dbArticle.featuredImage || "/placeholder.jpg",
      imageAlt: dbArticle.imageAlt || undefined,
      author: dbArticle.author || "Editorial Team",
      seoTitle: dbArticle.seoTitle || undefined,
      faq: (dbArticle.faq as { question: string; answer: string }[]) || [],
      ctaTitle: dbArticle.ctaTitle || undefined,
      ctaButton: dbArticle.ctaButton || undefined,
      ctaLink: dbArticle.ctaLink || undefined,
      toc,
      isHtml: true,
      isListicle: dbArticle.type === "listicle",
    };
  } catch (e) {
    console.error("Failed to fetch article:", e);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await fetchArticle(slug);
  if (!article) return { title: "Article Not Found" };
  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: `https://chaletexpress.com/${locale}/guides/${slug}`,
      languages: {
        en: `https://chaletexpress.com/en/guides/${slug}`,
        fr: `https://chaletexpress.com/fr/guides/${slug}`,
        "x-default": `https://chaletexpress.com/en/guides/${slug}`,
      },
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.date,
      images: [{ url: article.image, width: 1200, height: 630 }],
    },
  };
}

async function fetchRecentArticles(excludeSlug: string) {
  try {
    const rows = await db
      .select({
        slug: articles.slug,
        title: articles.title,
        excerpt: articles.excerpt,
        featuredImage: articles.featuredImage,
        category: articles.category,
        publishedAt: articles.publishedAt,
        createdAt: articles.createdAt,
      })
      .from(articles)
      .where(and(eq(articles.isPublished, true), ne(articles.slug, excludeSlug)))
      .orderBy(desc(articles.publishedAt))
      .limit(3);

    return rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt || "",
      image: r.featuredImage || "/placeholder.jpg",
      category: r.category || "Articles",
      date: formatDate(r.publishedAt || r.createdAt),
    }));
  } catch {
    return [];
  }
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const article = await fetchArticle(slug);

  if (!article) notFound();

  const recentArticles = await fetchRecentArticles(slug);

  if (article.isListicle) {
    return <ArticleListicle locale={locale} article={article} toc={article.toc} enhancedContent={article.enhancedContent} recentArticles={recentArticles} />;
  }

  return <ArticleStandard locale={locale} article={article} isHtml={(article as any).isHtml} toc={article.toc} enhancedContent={article.enhancedContent} recentArticles={recentArticles} />;
}
