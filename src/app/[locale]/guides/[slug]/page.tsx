import type { Metadata } from "next";
import { initialArticles } from '@/lib/mock-data';
import ArticleStandard from '@/templates/ArticleStandard';
import ArticleListicle from '@/templates/ArticleListicle';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = initialArticles.find(a => a.slug === slug);
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
  const article = initialArticles.find(a => a.slug === slug);

  if (!article) return <div className="p-10 text-center text-slate-400">Article not found</div>;

  if (article.isListicle) {
    return <ArticleListicle locale={locale} article={article} />;
  }

  return <ArticleStandard locale={locale} article={article} />;
}
