'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import TiptapEditor from '@/components/admin/TiptapEditor';

type FAQ = { question: string; answer: string };

const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('News');
  const [author, setAuthor] = useState("Editorial Team");
  const [articleType, setArticleType] = useState<'standard' | 'listicle'>('standard');
  const [featuredImage, setFeaturedImage] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [ctaTitle, setCtaTitle] = useState('');
  const [ctaButton, setCtaButton] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [faq, setFaq] = useState<FAQ[]>([]);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, content, excerpt, category, author, articleType, featuredImage, imageAlt, seoTitle, ctaTitle, ctaButton, ctaLink, faq, isPublished })
      });
      router.push('/admin/articles');
    } finally { setSaving(false); }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <h1 className="text-2xl font-bold text-[#0B1B40] mb-6">Create Article</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input value={title} onChange={e => { setTitle(e.target.value); if (!slug) setSlug(toSlug(e.target.value)); }} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug</label><div className="flex gap-2"><input value={slug} onChange={e => setSlug(e.target.value)} className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" placeholder="article-slug" /><button type="button" onClick={() => setSlug(toSlug(title))} className="text-xs text-[#1F51C6] hover:underline whitespace-nowrap">Auto</button></div></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><input value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Author</label><input value={author} onChange={e => setAuthor(e.target.value)} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Article Type</label>
            <select value={articleType} onChange={e => setArticleType(e.target.value as any)} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]">
              <option value="standard">Standard Article</option>
              <option value="listicle">Listicle (Ranked Items)</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label><textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6] h-20" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
            <div className="flex items-center gap-3">
              {featuredImage && <img src={featuredImage} className="w-16 h-16 rounded-full object-cover border" loading="lazy" />}
              <label className="cursor-pointer text-sm text-[#1F51C6] hover:underline">
                {featuredImage ? 'Change' : 'Upload Image'}
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  const fd = new FormData(); fd.append('file', file);
                  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
                  if (res.ok) { const d = await res.json(); setFeaturedImage(d.url); }
                }} />
              </label>
              {featuredImage && <button type="button" onClick={() => setFeaturedImage('')} className="text-xs text-red-500">Remove</button>}
            </div>
            <div className="mt-3"><label className="block text-sm font-medium text-gray-700 mb-1">Image Alt Text (SEO)</label><input value={imageAlt} onChange={e => setImageAlt(e.target.value)} maxLength={255} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" placeholder="Describe the image for SEO & accessibility" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Content</label><TiptapEditor content={content} onChange={setContent} /></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#0B1B40]">SEO</h2>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label><input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" /></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#0B1B40]">FAQ</h2>
          {faq.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <input value={item.question} onChange={e => { const f = [...faq]; f[i] = { ...f[i], question: e.target.value }; setFaq(f); }} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" placeholder="Question" />
                <textarea value={item.answer} onChange={e => { const f = [...faq]; f[i] = { ...f[i], answer: e.target.value }; setFaq(f); }} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6] h-16" placeholder="Answer" />
              </div>
              <button type="button" onClick={() => setFaq(faq.filter((_, j) => j !== i))} className="mt-2 text-red-500"><X className="w-4 h-4" /></button>
            </div>
          ))}
          <button type="button" onClick={() => setFaq([...faq, { question: '', answer: '' }])} className="text-sm text-[#1F51C6] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add FAQ</button>
        </div>
        <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#0B1B40]">CTA</h2>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input value={ctaTitle} onChange={e => setCtaTitle(e.target.value)} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label><input value={ctaButton} onChange={e => setCtaButton(e.target.value)} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Link</label><input value={ctaLink} onChange={e => setCtaLink(e.target.value)} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" /></div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="status" checked={!isPublished} onChange={() => setIsPublished(false)} className="accent-[#1F51C6]" /><span className="text-sm text-gray-600">Draft</span></label>
              <label className="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="status" checked={isPublished} onChange={() => setIsPublished(true)} className="accent-[#1F51C6]" /><span className="text-sm text-gray-600">Published</span></label>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={saving} className="bg-[#1F51C6] hover:bg-[#163FA3] text-white px-5 py-2 rounded-full text-sm font-semibold disabled:opacity-60">
            {saving ? 'Saving...' : isPublished ? 'Publish Article' : 'Save as Draft'}
          </button>
        </div>
      </form>
    </div>
  );
}
