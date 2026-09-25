import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { initialArticles } from '@/lib/mock-data';
import { db } from '@/lib/db';
import { articles } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { getCached } from '@/lib/cache';
import { locales } from '@/i18n/routing';
import { getPublishedArticles } from '@/lib/cached-settings';
import { auth } from '@/lib/auth';
import ArticleStandard from '@/templates/ArticleStandard';
import ArticleListicle from '@/templates/ArticleListicle';
import { generateToc, injectHeadingIds } from '@/lib/extract-toc';
import { extractShortcodes, fetchCottagesForShortcodes, getCottagesForShortcode } from '@/lib/shortcode-cottages';

export const revalidate = 3600;
export const dynamic = 'force-dynamic';

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

/** Admin preview (?preview=1): view unpublished drafts. Requires a
 * logged-in admin session; preview hits use a separate short-TTL cache
 * key so drafts never leak into the public cache. */
async function canPreview(searchParams?: { [key: string]: string | string[] | undefined }): Promise<boolean> {
  if (searchParams?.preview !== '1') return false;
  try {
    const session = await auth();
    return !!session?.user;
  } catch {
    return false;
  }
}

async function fetchArticle(slug: string, locale: string, preview = false) {
  const mock = initialArticles.find(a => a.slug === slug);
  if (mock) {
    const content = mock.content || "";
    const shortcodes = extractShortcodes(content);
    const cottagesMap = await fetchCottagesForShortcodes(shortcodes);
    return { ...mock, toc: generateToc(content), enhancedContent: injectHeadingIds(content), cottagesMap };
  }

  try {
    // Locale-preferred row with EN fallback, cached 1h and shared
    // between generateMetadata and the page via the same key.
    const rows = await getCached<any[]>(`articles:by-slug:${locale}:${slug}${preview ? ':preview' : ''}`, () =>
      db.select().from(articles).where(
        and(
          eq(articles.slug, slug),
          ...(preview ? [] : [eq(articles.isPublished, true)]),
          inArray(articles.locale, locale === 'fr' ? ['fr', 'en'] : ['en']),
        ),
      ).limit(2),
    preview ? 60 : 3600);
    const dbArticle = rows.find((r: any) => r.locale === locale) || rows.find((r: any) => r.locale === 'en');
    if (!dbArticle) return null;

    const content = dbArticle.content || "";
    const toc = content ? generateToc(content) : [];
    const enhancedContent = content ? injectHeadingIds(content) : "";
    const shortcodes = extractShortcodes(content);
    const cottagesMap = await fetchCottagesForShortcodes(shortcodes);

    return {
      id: dbArticle.id,
      title: dbArticle.title,
      slug: dbArticle.slug,
      content,
      enhancedContent,
      excerpt: dbArticle.excerpt || "",
      date: formatDate(dbArticle.publishedAt || dbArticle.createdAt),
      // Raw ISO dates for valid OG article:published_time (formatted date is not ISO).
      publishedIso: (dbArticle.publishedAt || dbArticle.createdAt || null)?.toISOString?.() || null,
      updatedIso: dbArticle.updatedAt?.toISOString?.() || null,
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
      cottagesMap,
    };
  } catch (e) {
    console.error("Failed to fetch article:", e);
    return null;
  }
}

export async function generateMetadata({ params, searchParams }: Props & {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const preview = await canPreview(await searchParams);
  const article = await fetchArticle(slug, locale, preview);
  // NOTE: do NOT call notFound() here — it would prevent this noindex
  // metadata from applying (Next 16 streams 200 with loading.tsx present,
  // see vercel/next.js#93008). The page below calls notFound() for the UI;
  // this robots tag is what keeps missing slugs out of Google.
  if (!article) {
    return { title: "Article Not Found", robots: { index: false, follow: false } };
  }
  const description = article.excerpt
    || `${article.title} — Practical advice and curated picks from Chalet Express guides.`;
  const image = article.image && article.image !== '/placeholder.jpg'
    ? article.image
    : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200';
  return {
    // Prefer the CMS SEO title when set; template appends "| Chalet Express".
    title: (article as any).seoTitle || article.title,
    description,
    alternates: {
      canonical: `https://chaletexpress.com/${locale}/guides/${slug}`,
      languages: {
        en: `https://chaletexpress.com/en/guides/${slug}`,
        fr: `https://chaletexpress.com/fr/guides/${slug}`,
        "x-default": `https://chaletexpress.com/en/guides/${slug}`,
      },
    },
    openGraph: {
      title: (article as any).seoTitle || article.title,
      description,
      type: "article",
      publishedTime: (article as any).publishedIso || undefined,
      images: [{ url: image, width: 1200, height: 630 }],
    },
    ...(preview ? { robots: { index: false, follow: false } } : {}),
  };
}

async function fetchRecentArticles(excludeSlug: string, locale: string) {
  try {
    const all = await getPublishedArticles(locale);
    return all
      .filter((r: any) => r.slug !== excludeSlug)
      .slice(0, 3)
      .map((r: any) => ({
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
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale, slug } = await params;
  const preview = await canPreview(await searchParams);
  const article = await fetchArticle(slug, locale, preview);

  if (!article) notFound();

  const recentArticles = await fetchRecentArticles(slug, locale);

  const pathname = `/${locale}/guides/${slug}`;
  if (article.isListicle) {
    return <ArticleListicle locale={locale} article={article} toc={article.toc} enhancedContent={article.enhancedContent} recentArticles={recentArticles} cottagesMap={article.cottagesMap} pathname={pathname} />;
  }

  return <ArticleStandard locale={locale} article={article} isHtml={(article as any).isHtml} toc={article.toc} enhancedContent={article.enhancedContent} recentArticles={recentArticles} cottagesMap={article.cottagesMap} pathname={pathname} />;
}
