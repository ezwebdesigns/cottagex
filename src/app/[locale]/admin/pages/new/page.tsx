'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import TiptapEditor from '@/components/admin/TiptapEditor';

type FAQ = { question: string; answer: string };

const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');

export default function NewPagePage() {
  const router = useRouter(); const locale = useParams()?.locale as string;
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [ctaTitle, setCtaTitle] = useState('');
  const [ctaDescription, setCtaDescription] = useState('');
  const [ctaButton, setCtaButton] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [faq, setFaq] = useState<FAQ[]>([]);
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, content, template: 'standard', seoTitle, metaDescription, featuredImage, ctaTitle, ctaDescription, ctaButton, ctaLink, faq, isPublished })
      });
      if (res.ok) router.push(`/${locale}/admin/pages`);
    } finally { setSaving(false); }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <h1 className="text-2xl font-bold text-[#191e3b] mb-6">Create Page</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input value={title} onChange={e => { setTitle(e.target.value); if (!slug) setSlug(toSlug(e.target.value)); }} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]" placeholder="Page title" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
            <div className="flex gap-2">
              <input value={slug} onChange={e => setSlug(e.target.value)} className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#0f51ec]" placeholder="page-slug" />
              <button type="button" onClick={() => setSlug(toSlug(title))} className="text-xs text-[#0f51ec] hover:underline whitespace-nowrap" title="Generate from title">Auto</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Featured Image</label>
            <div className="flex items-center gap-3">
              {featuredImage && <img src={featuredImage} className="w-16 h-16 rounded-full object-cover border" loading="lazy" />}
              <label className="cursor-pointer text-sm text-[#0f51ec] hover:underline">
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
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
            <TiptapEditor content={content} onChange={setContent} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#191e3b]">SEO</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">SEO Title</label>
            <input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]" placeholder="SEO title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label>
            <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec] h-20" placeholder="Meta description" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#191e3b]">FAQ</h2>
          {faq.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <input value={item.question} onChange={e => { const f = [...faq]; f[i] = { ...f[i], question: e.target.value }; setFaq(f); }} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]" placeholder="Question" />
                <textarea value={item.answer} onChange={e => { const f = [...faq]; f[i] = { ...f[i], answer: e.target.value }; setFaq(f); }} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec] h-16" placeholder="Answer" />
              </div>
              <button type="button" onClick={() => setFaq(faq.filter((_, j) => j !== i))} className="mt-2 text-red-500"><X className="w-4 h-4" /></button>
            </div>
          ))}
          <button type="button" onClick={() => setFaq([...faq, { question: '', answer: '' }])} className="text-sm text-[#0f51ec] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add FAQ</button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#191e3b]">CTA</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input value={ctaTitle} onChange={e => setCtaTitle(e.target.value)} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={ctaDescription} onChange={e => setCtaDescription(e.target.value)} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec] h-20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Button Text</label>
              <input value={ctaButton} onChange={e => setCtaButton(e.target.value)} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Link</label>
              <input value={ctaLink} onChange={e => setCtaLink(e.target.value)} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Status</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="status" checked={!isPublished} onChange={() => setIsPublished(false)} className="accent-[#0f51ec]" />
                <span className="text-sm text-slate-600">Draft</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="status" checked={isPublished} onChange={() => setIsPublished(true)} className="accent-[#0f51ec]" />
                <span className="text-sm text-slate-600">Published</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-full text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={saving} className="bg-[#0f51ec] hover:bg-[#0d44c9] text-white px-5 py-2 rounded-full text-sm font-semibold disabled:opacity-60">
            {saving ? 'Saving...' : isPublished ? 'Publish Page' : 'Save as Draft'}
          </button>
        </div>
      </form>
    </div>
  );
}
