import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { initialArticles } from '@/lib/mock-data';
import { db } from '@/lib/db';
import { articles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import ArticleStandard from '@/templates/ArticleStandard';
import ArticleListicle from '@/templates/ArticleListicle';

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

async function fetchArticle(slug: string) {
  const mock = initialArticles.find(a => a.slug === slug);
  if (mock) return mock;

  try {
    const [dbArticle] = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
    if (!dbArticle) return null;

    return {
      id: dbArticle.id,
      title: dbArticle.title,
      slug: dbArticle.slug,
      content: dbArticle.content || "",
      excerpt: dbArticle.excerpt || "",
      date: formatDate(dbArticle.publishedAt || dbArticle.createdAt),
      readTime: computeReadTime(dbArticle.content || ""),
      category: dbArticle.category || "Articles",
      image: dbArticle.featuredImage || "/placeholder.jpg",
      author: dbArticle.author || "Editorial Team",
      seoTitle: dbArticle.seoTitle || undefined,
      faq: dbArticle.faq || [],
      ctaTitle: dbArticle.ctaTitle || undefined,
      ctaButton: dbArticle.ctaButton || undefined,
      ctaLink: dbArticle.ctaLink || undefined,
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
    alternates: { canonical: `https://chaletexpress.com/${locale}/guides/${slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.date,
      images: [{ url: article.image, width: 1200, height: 630 }],
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const article = await fetchArticle(slug);

  if (!article) notFound();

  if (article.isListicle) {
    return <ArticleListicle locale={locale} article={article} />;
  }

  return <ArticleStandard locale={locale} article={article} isHtml={(article as any).isHtml} />;
}
