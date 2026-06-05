'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, X, Eye } from 'lucide-react';
import TiptapEditor from '@/components/admin/TiptapEditor';

type FAQ = { question: string; answer: string };
type ExploreItem = { icon: string; title: string; description: string };

const EXPLORE_ICONS = ['Waves', 'Trees', 'Compass', 'MapPin', 'Mountain', 'TreePine', 'Sunrise'];

export default function EditPagePage() {
  const router = useRouter(); const params = useParams();
  const [title, setTitle] = useState(''); const [content, setContent] = useState(''); const [slug, setSlug] = useState(''); const [template, setTemplate] = useState('');
  const [seoTitle, setSeoTitle] = useState(''); const [metaDescription, setMetaDescription] = useState('');
  const [featuredImage, setFeaturedImage] = useState(''); const [isPublished, setIsPublished] = useState(true);
  const [ctaTitle, setCtaTitle] = useState(''); const [ctaDescription, setCtaDescription] = useState(''); const [ctaButton, setCtaButton] = useState(''); const [ctaLink, setCtaLink] = useState('');
  const [exploreTitle, setExploreTitle] = useState(''); const [exploreSubtitle, setExploreSubtitle] = useState(''); const [exploreDescription, setExploreDescription] = useState('');
  const [exploreItems, setExploreItems] = useState<ExploreItem[]>([]);
  const [locationData, setLocationData] = useState<any>({ hero: {}, intro: { highlights: [] }, featured: {}, explore: { items: [] }, search: {} });
  const [faq, setFaq] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/pages/${params.id}`).then(r => r.json()).then(data => {
      const p = data.page;
      setTitle(p.title); setContent(p.content); setSlug(p.slug); setTemplate(p.template || '');
      setSeoTitle(p.seoTitle); setMetaDescription(p.metaDescription);
      setFeaturedImage(p.featuredImage || ''); setIsPublished(p.isPublished);
      setCtaTitle(p.ctaTitle || ''); setCtaDescription(p.ctaDescription || ''); setCtaButton(p.ctaButton || ''); setCtaLink(p.ctaLink || '');
      setExploreTitle(p.exploreTitle || ''); setExploreSubtitle(p.exploreSubtitle || ''); setExploreDescription(p.exploreDescription || '');
      setExploreItems(Array.isArray(p.exploreItems) ? p.exploreItems : []);
      setLocationData(typeof p.locationData === 'object' && p.locationData !== null ? p.locationData : { hero: {}, intro: { highlights: [] }, featured: {}, explore: { items: [] }, search: {} });
      setFaq(Array.isArray(p.faq) ? p.faq : []); setLoading(false);
    });
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await fetch(`/api/admin/pages/${params.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, slug, content, seoTitle, metaDescription, featuredImage, ctaTitle, ctaDescription, ctaButton, ctaLink, exploreTitle, exploreSubtitle, exploreDescription, exploreItems, locationData, faq, isPublished })
    });
    setSaving(false); router.push('/admin/pages');
  }

  if (loading) return <div className="p-10 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <h1 className="text-2xl font-bold text-[#0B1B40] mb-6">Edit Page</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug</label><div className="flex gap-2"><input value={slug} onChange={e => setSlug(e.target.value)} className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" /><button type="button" onClick={() => setSlug(title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, ''))} className="text-xs text-[#1F51C6] hover:underline whitespace-nowrap">Auto</button></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
            <div className="flex items-center gap-3">
              {featuredImage && <img src={featuredImage} className="w-16 h-16 rounded-full object-cover border" />}
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
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Content</label><TiptapEditor content={content} onChange={setContent} /></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#0B1B40]">SEO</h2>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label><input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label><textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6] h-20" /></div>
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
        {template === 'location' && (
          <>
            <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-[#0B1B40]">Hero Section</h2>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Tag</label><input value={locationData.hero?.tag ?? ''} onChange={e => setLocationData({ ...locationData, hero: { ...locationData.hero, tag: e.target.value } })} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input value={locationData.hero?.title ?? ''} onChange={e => setLocationData({ ...locationData, hero: { ...locationData.hero, title: e.target.value } })} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label><textarea value={locationData.hero?.subtitle ?? ''} onChange={e => setLocationData({ ...locationData, hero: { ...locationData.hero, subtitle: e.target.value } })} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6] h-20" /></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Background Image</label>
                <div className="flex items-center gap-3">
                  {locationData.hero?.image && <img src={locationData.hero.image} alt={locationData.hero?.imageAlt || ''} className="w-16 h-16 rounded-xl object-cover border" />}
                  <label className="cursor-pointer text-sm text-[#1F51C6] hover:underline">
                    Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0]; if (!file) return;
                      const fd = new FormData(); fd.append('file', file);
                      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
                      if (res.ok) { const d = await res.json(); setLocationData({ ...locationData, hero: { ...locationData.hero, image: d.url } }); }
                    }} />
                  </label>
                </div>
                <div className="mt-3"><label className="block text-sm font-medium text-gray-700 mb-1">Image Alt Text (SEO)</label><input value={locationData.hero?.imageAlt ?? ''} onChange={e => setLocationData({ ...locationData, hero: { ...locationData.hero, imageAlt: e.target.value } })} maxLength={255} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" placeholder="Describe the hero image for SEO & accessibility" /></div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-[#0B1B40]">Intro Section</h2>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={locationData.intro?.description ?? ''} onChange={e => setLocationData({ ...locationData, intro: { ...locationData.intro, description: e.target.value } })} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6] h-20" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Highlights Title</label><input value={locationData.intro?.highlightsTitle ?? ''} onChange={e => setLocationData({ ...locationData, intro: { ...locationData.intro, highlightsTitle: e.target.value } })} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label><textarea value={locationData.intro?.subtitle ?? ''} onChange={e => setLocationData({ ...locationData, intro: { ...locationData.intro, subtitle: e.target.value } })} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6] h-20" /></div>
              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-3">Highlight Cards</h4>
                {(locationData.intro?.highlights ?? []).map((item: any, i: number) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
                    <div className="flex gap-2">
                      <select value={item.icon} onChange={(e) => {
                        const arr = [...(locationData.intro?.highlights || [])]; arr[i] = { ...arr[i], icon: e.target.value };
                        setLocationData({ ...locationData, intro: { ...locationData.intro, highlights: arr } });
                      }} className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20">
                        {EXPLORE_ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                      </select>
                      <input placeholder="Title" value={item.title} onChange={(e) => {
                        const arr = [...(locationData.intro?.highlights || [])]; arr[i] = { ...arr[i], title: e.target.value };
                        setLocationData({ ...locationData, intro: { ...locationData.intro, highlights: arr } });
                      }} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20" />
                    </div>
                    <textarea placeholder="Description" value={item.description} onChange={(e) => {
                      const arr = [...(locationData.intro?.highlights || [])]; arr[i] = { ...arr[i], description: e.target.value };
                      setLocationData({ ...locationData, intro: { ...locationData.intro, highlights: arr } });
                    }} rows={2} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20" />
                    <button type="button" onClick={() => setLocationData({ ...locationData, intro: { ...locationData.intro, highlights: (locationData.intro?.highlights || []).filter((_: any, idx: number) => idx !== i) } })} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                  </div>
                ))}
                <button type="button" onClick={() => setLocationData({ ...locationData, intro: { ...locationData.intro, highlights: [...(locationData.intro?.highlights || []), { icon: 'Compass', title: '', description: '' }] } })} className="text-sm text-[#1F51C6] font-semibold hover:underline">+ Add Card</button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-[#0B1B40]">Featured Section</h2>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input value={locationData.featured?.title ?? ''} onChange={e => setLocationData({ ...locationData, featured: { ...locationData.featured, title: e.target.value } })} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={locationData.featured?.description ?? ''} onChange={e => setLocationData({ ...locationData, featured: { ...locationData.featured, description: e.target.value } })} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6] h-20" /></div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-[#0B1B40]">Explore Section</h2>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input value={exploreTitle} onChange={e => setExploreTitle(e.target.value)} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label><input value={exploreSubtitle} onChange={e => setExploreSubtitle(e.target.value)} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={exploreDescription} onChange={e => setExploreDescription(e.target.value)} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6] h-20" /></div>
              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-3">Items</h4>
                {exploreItems.map((item, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
                    <div className="flex gap-2">
                      <select value={item.icon} onChange={(e) => {
                        const arr = [...exploreItems]; arr[i] = { ...arr[i], icon: e.target.value };
                        setExploreItems(arr);
                      }} className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20">
                        {EXPLORE_ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                      </select>
                      <input placeholder="Title" value={item.title} onChange={(e) => {
                        const arr = [...exploreItems]; arr[i] = { ...arr[i], title: e.target.value };
                        setExploreItems(arr);
                      }} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20" />
                    </div>
                    <textarea placeholder="Description" value={item.description} onChange={(e) => {
                      const arr = [...exploreItems]; arr[i] = { ...arr[i], description: e.target.value };
                      setExploreItems(arr);
                    }} rows={2} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20" />
                    <button type="button" onClick={() => setExploreItems(exploreItems.filter((_, idx) => idx !== i))} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                  </div>
                ))}
                <button type="button" onClick={() => setExploreItems([...exploreItems, { icon: 'Compass', title: '', description: '' }])} className="text-sm text-[#1F51C6] font-semibold hover:underline">+ Add Item</button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-[#0B1B40]">Search Section</h2>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input value={locationData.search?.title ?? ''} onChange={e => setLocationData({ ...locationData, search: { ...locationData.search, title: e.target.value } })} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={locationData.search?.description ?? ''} onChange={e => setLocationData({ ...locationData, search: { ...locationData.search, description: e.target.value } })} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6] h-20" /></div>
            </div>
          </>
        )}

        <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#0B1B40]">CTA</h2>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input value={ctaTitle} onChange={e => setCtaTitle(e.target.value)} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={ctaDescription} onChange={e => setCtaDescription(e.target.value)} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6] h-20" /></div>
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
          <button type="button" onClick={() => router.push('/admin/pages')} className="px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          {slug && <button type="button" onClick={() => window.open(`/${slug}?preview=true`, '_blank')} className="px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1.5"><Eye className="w-4 h-4" /> Preview</button>}
          <button type="submit" disabled={saving} className="bg-[#1F51C6] hover:bg-[#163FA3] text-white px-5 py-2 rounded-full text-sm font-semibold disabled:opacity-60">{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </form>
    </div>
  );
}
