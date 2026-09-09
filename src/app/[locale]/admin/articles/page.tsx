'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Search, Pencil, Trash2, Eye, FileText, Copy, Languages, Loader2 } from 'lucide-react';

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  featuredImage: string;
  isPublished: boolean;
  author?: string;
  date?: string;
  locale?: string;
  translationOf?: number | null;
};

export default function AdminArticlesPage() {
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState('');
  const [translatingId, setTranslatingId] = useState<number | null>(null);

// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let mounted = true;
    async function fetchPosts() {
      try {
        const res = await fetch('/api/admin/articles');
        const data = await res.json();
        if (mounted) setPosts(data.posts || []);
      } catch {
        if (mounted) setPosts([]);
      }
    }
    fetchPosts();
    return () => { mounted = false; };
  }, []);

  async function translateArticle(a: Post) {
    const articleId = Number(a.id);
    setTranslatingId(articleId);
    try {
      const res = await fetch(`/api/admin/articles/${a.id}`);
      if (!res.ok) return;
      const { post: full } = await res.json();

      const translate = async (text: string) => {
        if (!text) return text;
        const r = await fetch('/api/admin/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLang: 'FR', sourceLang: 'EN' }),
        });
        if (!r.ok) return text;
        const d = await r.json();
        return d.translated || text;
      };

      const frSlug = `${full.slug}-fr`;
      const frTitle = await translate(full.title);
      const frExcerpt = full.excerpt ? await translate(full.excerpt) : full.excerpt;
      const frContent = full.content ? await translate(full.content) : full.content;
      const frSeoTitle = full.seoTitle ? await translate(full.seoTitle) : full.seoTitle;
      const frSeoKeywords = full.seoKeywords ? await translate(full.seoKeywords) : full.seoKeywords;
      const frCtaTitle = full.ctaTitle ? await translate(full.ctaTitle) : full.ctaTitle;
      const frCtaButton = full.ctaButton ? await translate(full.ctaButton) : full.ctaButton;

      let frFaq = full.faq;
      if (Array.isArray(full.faq) && full.faq.length > 0) {
        frFaq = await Promise.all(
          full.faq.map(async (item: { question: string; answer: string }) => ({
            ...item,
            question: item.question ? await translate(item.question) : item.question,
            answer: item.answer ? await translate(item.answer) : item.answer,
          }))
        );
      }

      const createRes = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: frTitle,
          slug: frSlug,
          locale: 'fr',
          translationOf: full.id,
          type: full.type,
          content: frContent,
          excerpt: frExcerpt,
          category: full.category,
          author: full.author,
          featuredImage: full.featuredImage,
          imageAlt: full.imageAlt,
          seoTitle: frSeoTitle,
          seoKeywords: frSeoKeywords,
          faq: frFaq,
          ctaTitle: frCtaTitle,
          ctaButton: frCtaButton,
          ctaLink: full.ctaLink,
          isPublished: false,
          publishedAt: null,
        }),
      });

      if (createRes.ok) {
        const { post: newPost } = await createRes.json();
        router.push(`/${locale}/admin/articles/${newPost.id}/edit`);
      } else {
        alert('Failed to create FR translation — slug may already exist.');
      }
    } catch {
      alert('Translation failed.');
    } finally {
      setTranslatingId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this article?')) return;
    await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
    // Refetch posts after delete
    try {
      const res = await fetch('/api/admin/articles');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      setPosts([]);
    }
  }

  async function duplicate(id: string, currentSlug: string) {
    const newSlug = prompt('Enter slug for the copy:', `${currentSlug}-copy`);
    if (!newSlug) return;
    const res = await fetch(`/api/admin/articles/${id}`);
    if (!res.ok) return;
    const { post } = await res.json();
    const { ...rest } = post;
    const createRes = await fetch('/api/admin/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...rest, slug: newSlug, title: `${rest.title} (copy)`, isPublished: false, publishedAt: null }),
    });
    if (createRes.ok) {
      const { post: newPost } = await createRes.json();
      router.push(`/${locale}/admin/articles/${newPost.id}/edit`);
    } else {
      alert('Failed to duplicate — slug may already exist.');
    }
  }

  const filtered = posts.filter(a => a.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#191e3b]">Articles</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your travel guides and blog posts</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0f51ec]"
          />
        </div>
        <button
          onClick={() => router.push(`/${locale}/admin/articles/new`)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0f51ec] text-white text-sm font-semibold hover:bg-[#0d44c9] transition-colors min-h-[44px]"
        >
          <Plus className="w-4 h-4" /> New Article
        </button>
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-[#191e3b]">No articles yet</p>
          <p className="text-xs text-slate-400 mt-1">Create your first article to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <div key={a.id} className="p-5 rounded-2xl bg-white border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded-full bg-[#77e1fb]/20 text-[#191e3b] text-xs font-semibold">
                  {a.category || 'Uncategorized'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${a.isPublished ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                  {a.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="w-full h-32 rounded-xl bg-slate-50 overflow-hidden mb-3">
                {a.featuredImage ? (
                  <img src={a.featuredImage} alt="" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-slate-300" />
                  </div>
                )}
              </div>
              <h3 className="font-bold text-[#191e3b] text-sm leading-tight mb-2">{a.title}</h3>
              <p className="text-xs text-slate-400 mb-4">{a.author ? `by ${a.author}` : ''}{a.date ? ` · ${a.date}` : ''}</p>
              <div className="flex items-center gap-2">
                {a.slug && (
                  <a
                    href={`/${locale}/guides/${a.slug}?preview=true`}
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-[#191e3b] transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </a>
                )}
                {!a.translationOf && (a.locale === 'en' || !a.locale) && (
                  <button
                    onClick={() => translateArticle(a)}
                    disabled={translatingId === Number(a.id)}
                    className="w-9 h-9 rounded-full hover:bg-purple-50 flex items-center justify-center transition-colors"
                    title="Translate to FR"
                  >
                    {translatingId === Number(a.id) ? (
                      <Loader2 className="w-3.5 h-3.5 text-purple-500 animate-spin" />
                    ) : (
                      <Languages className="w-3.5 h-3.5 text-purple-500" />
                    )}
                  </button>
                )}
                <button
                  onClick={() => router.push(`/${locale}/admin/articles/${a.id}/edit`)}
                  className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5 text-slate-500" />
                </button>
                <button
                  onClick={() => duplicate(a.id, a.slug)}
                  className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
                  title="Duplicate"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => remove(a.id)}
                  className="w-9 h-9 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
