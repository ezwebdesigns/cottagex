'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Edit, Trash2, Eye, Languages, Loader2 } from 'lucide-react';

interface Page {
  id: string;
  title: string;
  slug: string;
  locale: string;
  template: string;
  isPublished: boolean;
  translationOf?: number | null;
  content?: string;
  seoTitle?: string;
  metaDescription?: string;
  featuredImage?: string;
  faq?: { question: string; answer: string }[];
  ctaTitle?: string;
  ctaButton?: string;
  ctaLink?: string;
  ctaDescription?: string;
  exploreTitle?: string;
  exploreSubtitle?: string;
  exploreDescription?: string;
  exploreItems?: ExploreItem[];
  locationData?: LocationData;
  publishedAt?: string | null;
}

interface ExploreItem {
  icon: string;
  title: string;
  description: string;
}

interface LocationData {
  hero: {
    tag: string;
    title: string;
    subtitle: string;
    image: string;
    imageAlt: string;
  };
  intro: {
    description: string;
    highlightsTitle: string;
    subtitle: string;
    highlights: { icon: string; title: string; description: string }[];
  };
  featured: {
    title: string;
    description: string;
  };
  explore: {
    items: { icon: string; title: string; description: string }[];
  };
  search: {
    title: string;
    description: string;
  };
}

export default function AdminPagesPage() {
  const router = useRouter(); const locale = useParams()?.locale as string;
  const [pages, setPages] = useState<Page[]>([]);
  const [localeFilter, setLocaleFilter] = useState<'all' | 'en' | 'fr'>('all');
  const [translatingId, setTranslatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/pages');
    const data = await res.json();
    setPages((data.pages || []).filter((p: Page) => p.template !== 'location'));
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  async function remove(id: string) {
    if (!confirm('Delete this page?')) return;
    await fetch(`/api/admin/pages/${id}`, { method: 'DELETE' });
    setPages(pages.filter(p => p.id !== id));
  }

  async function translatePage(page: Page) {
    setTranslatingId(page.id);
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`);
      if (!res.ok) return;
      const { page: full } = await res.json();

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

      const frSlug = `${page.slug}-fr`;
      const translated = {
        title: await translate(full.title),
        slug: frSlug,
        locale: 'fr',
        translationOf: full.id,
        template: full.template,
        content: full.content ? await translate(full.content) : full.content,
        seoTitle: full.seoTitle ? await translate(full.seoTitle) : full.seoTitle,
        metaDescription: full.metaDescription ? await translate(full.metaDescription) : full.metaDescription,
        featuredImage: full.featuredImage,
        faq: Array.isArray(full.faq) ? await Promise.all(full.faq.map(async (item: { question: string; answer: string }) => ({
          ...item,
          question: item.question ? await translate(item.question) : item.question,
          answer: item.answer ? await translate(item.answer) : item.answer,
        }))) : full.faq,
        ctaTitle: full.ctaTitle ? await translate(full.ctaTitle) : full.ctaTitle,
        ctaButton: full.ctaButton ? await translate(full.ctaButton) : full.ctaButton,
        ctaLink: full.ctaLink,
        ctaDescription: full.ctaDescription ? await translate(full.ctaDescription) : full.ctaDescription,
        exploreTitle: full.exploreTitle ? await translate(full.exploreTitle) : full.exploreTitle,
        exploreSubtitle: full.exploreSubtitle ? await translate(full.exploreSubtitle) : full.exploreSubtitle,
        exploreDescription: full.exploreDescription ? await translate(full.exploreDescription) : full.exploreDescription,
        exploreItems: full.exploreItems,
        locationData: full.locationData,
        isPublished: false,
        publishedAt: null,
      };

      const createRes = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(translated),
      });
      if (createRes.ok) {
        const { page: newPage } = await createRes.json();
        router.push(`/${locale}/admin/pages/${newPage.id}/edit`);
      } else {
        alert('Failed to create FR translation — slug may already exist.');
      }
    } catch {
      alert('Translation failed.');
    }
    setTranslatingId(null);
  }

  const filtered = pages.filter(p => localeFilter === 'all' || p.locale === localeFilter);

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#191e3b]">Pages</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            {(['all', 'en', 'fr'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLocaleFilter(l)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  localeFilter === l ? 'bg-white text-[#191e3b] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >{l === 'all' ? 'All' : l.toUpperCase()}</button>
            ))}
          </div>
          <button onClick={() => router.push(`/${locale}/admin/pages/new`)} className="bg-[#0f51ec] hover:bg-[#0d44c9] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Create New Page
          </button>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {pages.length === 0 ? (
          <p className="p-6 text-slate-500 text-sm">No pages yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500 font-medium">
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Lang</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((page) => (
                <tr key={page.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-4 font-medium text-[#191e3b]">{page.title}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${page.locale === 'fr' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {page.locale?.toUpperCase() || 'EN'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${page.isPublished ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {page.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => window.open(`/${locale}/${page.slug}?preview=true`, '_blank')} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><Eye className="w-4 h-4 text-slate-400" /></button>
                      <button onClick={() => router.push(`/${locale}/admin/pages/${page.id}/edit`)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><Edit className="w-4 h-4 text-slate-500" /></button>
                      {(page.locale === 'en' || !page.locale) && !page.translationOf && (
                        <button onClick={() => translatePage(page)} disabled={translatingId === page.id} className="p-1.5 hover:bg-purple-50 rounded-lg transition-colors" title="Translate to FR">
                          {translatingId === page.id ? <Loader2 className="w-4 h-4 text-purple-500 animate-spin" /> : <Languages className="w-4 h-4 text-purple-500" />}
                        </button>
                      )}
                      <button onClick={() => remove(page.id)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
