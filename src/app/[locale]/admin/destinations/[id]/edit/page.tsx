'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Eye } from 'lucide-react';

const EXPLORE_ICONS = ['Waves', 'Trees', 'Compass', 'MapPin', 'Mountain', 'TreePine', 'Sunrise'];

export default function EditDestinationPage() {
  const router = useRouter(); const params = useParams(); const locale = params.locale as string;
  const [title, setTitle] = useState(''); const [slug, setSlug] = useState('');
  const [seoTitle, setSeoTitle] = useState(''); const [metaDescription, setMetaDescription] = useState('');
  const [featuredImage, setFeaturedImage] = useState(''); const [isPublished, setIsPublished] = useState(true);
  const [locationData, setLocationData] = useState<any>({ hero: {}, intro: { highlights: [] }, featured: {}, cta: {}, search: { columns: [] }, learnMore: { faq: [] }, about: {} });
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/pages/${params.id}`).then(r => r.json()).then(data => {
      const p = data.page;
      setTitle(p.title); setSlug(p.slug);
      setSeoTitle(p.seoTitle); setMetaDescription(p.metaDescription);
      setFeaturedImage(p.featuredImage || ''); setIsPublished(p.isPublished);
      setLocationData(typeof p.locationData === 'object' && p.locationData !== null ? p.locationData : { hero: {}, intro: { highlights: [] }, featured: {}, cta: {}, search: { columns: [] }, learnMore: { faq: [] }, about: {} });
      setLoading(false);
    });
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await fetch(`/api/admin/pages/${params.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, slug, seoTitle, metaDescription, featuredImage, locationData, isPublished })
    });
    setSaving(false); router.push(`/${locale}/admin/destinations`);
  }

  if (loading) return <div className="p-10 text-slate-400">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <h1 className="text-2xl font-bold text-[#191e3b] mb-6">Edit Destination</h1>
      <p className="text-sm text-slate-500 mb-6">Published at <code className="text-[#0f51ec]">/cottage-country/{slug || '...'}</code></p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Name</label><input value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]" required /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Slug</label><div className="flex gap-2"><input value={slug} onChange={e => setSlug(e.target.value)} className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#0f51ec]" /><button type="button" onClick={() => router.push(`/${locale}/cottage-country/${slug}?preview=true`)} className="bg-[#0f51ec] hover:bg-[#0d44c9] text-white px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Preview</button></div></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Featured Image</label>
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
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#191e3b]">SEO</h2>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">SEO Title</label><input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label><textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec] h-20" /></div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#191e3b]">Hero Section</h2>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Tag</label><input value={locationData.hero?.tag ?? ''} onChange={e => setLocationData({ ...locationData, hero: { ...locationData.hero, tag: e.target.value } })} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Title</label><input value={locationData.hero?.title ?? ''} onChange={e => setLocationData({ ...locationData, hero: { ...locationData.hero, title: e.target.value } })} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Subtitle</label><textarea value={locationData.hero?.subtitle ?? ''} onChange={e => setLocationData({ ...locationData, hero: { ...locationData.hero, subtitle: e.target.value } })} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec] h-20" /></div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Background Image</label>
            <div className="flex items-center gap-3">
              {locationData.hero?.image && <img src={locationData.hero.image} alt={locationData.hero?.imageAlt || ''} className="w-16 h-16 rounded-xl object-cover border" loading="lazy" />}
              <label className="cursor-pointer text-sm text-[#0f51ec] hover:underline">
                Upload Image
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  const fd = new FormData(); fd.append('file', file);
                  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
                  if (res.ok) { const d = await res.json(); setLocationData({ ...locationData, hero: { ...locationData.hero, image: d.url } }); }
                }} />
              </label>
            </div>
            <div className="mt-3"><label className="block text-sm font-medium text-slate-700 mb-1">Image Alt Text (SEO)</label><input value={locationData.hero?.imageAlt ?? ''} onChange={e => setLocationData({ ...locationData, hero: { ...locationData.hero, imageAlt: e.target.value } })} maxLength={255} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]" placeholder="Describe the hero image for SEO & accessibility" /></div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#191e3b]">Intro Section</h2>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Description</label><textarea value={locationData.intro?.description ?? ''} onChange={e => setLocationData({ ...locationData, intro: { ...locationData.intro, description: e.target.value } })} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec] h-20" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Highlights Title</label><input value={locationData.intro?.highlightsTitle ?? ''} onChange={e => setLocationData({ ...locationData, intro: { ...locationData.intro, highlightsTitle: e.target.value } })} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Subtitle</label><textarea value={locationData.intro?.subtitle ?? ''} onChange={e => setLocationData({ ...locationData, intro: { ...locationData.intro, subtitle: e.target.value } })} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec] h-20" /></div>
          <div>
            <h4 className="text-sm font-semibold text-slate-600 mb-3">Highlight Cards</h4>
            {(locationData.intro?.highlights ?? []).map((item: any, i: number) => (
              <div key={i} className="border border-slate-200 rounded-xl p-4 mb-4 space-y-3">
                <div className="flex gap-2">
                  <select value={item.icon} onChange={(e) => {
                    const arr = [...(locationData.intro?.highlights || [])]; arr[i] = { ...arr[i], icon: e.target.value };
                    setLocationData({ ...locationData, intro: { ...locationData.intro, highlights: arr } });
                  }} className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20">
                    {EXPLORE_ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                  </select>
                  <input placeholder="Title" value={item.title} onChange={(e) => {
                    const arr = [...(locationData.intro?.highlights || [])]; arr[i] = { ...arr[i], title: e.target.value };
                    setLocationData({ ...locationData, intro: { ...locationData.intro, highlights: arr } });
                  }} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                </div>
                <textarea placeholder="Description" value={item.description} onChange={(e) => {
                  const arr = [...(locationData.intro?.highlights || [])]; arr[i] = { ...arr[i], description: e.target.value };
                  setLocationData({ ...locationData, intro: { ...locationData.intro, highlights: arr } });
                }} rows={2} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                <button type="button" onClick={() => setLocationData({ ...locationData, intro: { ...locationData.intro, highlights: (locationData.intro?.highlights || []).filter((_: any, idx: number) => idx !== i) } })} className="text-xs text-red-500 hover:text-red-700">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => setLocationData({ ...locationData, intro: { ...locationData.intro, highlights: [...(locationData.intro?.highlights || []), { icon: 'Compass', title: '', description: '' }] } })} className="text-sm text-[#0f51ec] font-semibold hover:underline">+ Add Card</button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#191e3b]">Featured Section</h2>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Title</label><input value={locationData.featured?.title ?? ''} onChange={e => setLocationData({ ...locationData, featured: { ...locationData.featured, title: e.target.value } })} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Description</label><textarea value={locationData.featured?.description ?? ''} onChange={e => setLocationData({ ...locationData, featured: { ...locationData.featured, description: e.target.value } })} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec] h-20" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Shortcode <span className="text-slate-400 font-normal">(ex: <code className="text-[#0f51ec]">[ontario, rating, 6]</code>)</span></label><input value={locationData.featured?.shortcode ?? ''} onChange={e => setLocationData({ ...locationData, featured: { ...locationData.featured, shortcode: e.target.value } })} className="w-full border border-gray-300 rounded-full px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#0f51ec]" placeholder="[province, category, limit]" /></div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#191e3b]">Learn More Section</h2>
          <div className="grid grid-cols-5 gap-6">
            <div className="col-span-3 space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Title</label><input value={locationData.learnMore?.title ?? ''} onChange={e => setLocationData({ ...locationData, learnMore: { ...locationData.learnMore, title: e.target.value } })} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Subtitle</label><input value={locationData.learnMore?.subtitle ?? ''} onChange={e => setLocationData({ ...locationData, learnMore: { ...locationData.learnMore, subtitle: e.target.value } })} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]" placeholder="A short subtitle above the title" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Description</label><textarea value={locationData.learnMore?.description ?? ''} onChange={e => setLocationData({ ...locationData, learnMore: { ...locationData.learnMore, description: e.target.value } })} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec] h-28" /></div>
              <div>
                <h4 className="text-sm font-semibold text-slate-600 mb-3">FAQ Items</h4>
                {(locationData.learnMore?.faq ?? []).map((item: any, i: number) => (
                  <div key={i} className="border border-slate-200 rounded-xl p-4 mb-4 space-y-3">
                    <input placeholder="Question" value={item.q} onChange={(e) => {
                      const arr = [...(locationData.learnMore?.faq || [])]; arr[i] = { ...arr[i], q: e.target.value };
                      setLocationData({ ...locationData, learnMore: { ...locationData.learnMore, faq: arr } });
                    }} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                    <textarea placeholder="Answer" value={item.a} onChange={(e) => {
                      const arr = [...(locationData.learnMore?.faq || [])]; arr[i] = { ...arr[i], a: e.target.value };
                      setLocationData({ ...locationData, learnMore: { ...locationData.learnMore, faq: arr } });
                    }} rows={3} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                    <button type="button" onClick={() => setLocationData({ ...locationData, learnMore: { ...locationData.learnMore, faq: (locationData.learnMore?.faq || []).filter((_: any, idx: number) => idx !== i) } })} className="text-xs text-red-500 hover:text-red-700">Remove FAQ</button>
                  </div>
                ))}
                <button type="button" onClick={() => setLocationData({ ...locationData, learnMore: { ...locationData.learnMore, faq: [...(locationData.learnMore?.faq || []), { q: '', a: '' }] } })} className="text-sm text-[#0f51ec] font-semibold hover:underline">+ Add FAQ Item</button>
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
              {locationData.learnMore?.image && <img src={locationData.learnMore.image} alt={locationData.learnMore?.imageAlt || ''} className="w-full aspect-[4/3] rounded-2xl object-cover border mb-2" loading="lazy" />}
              <label className="cursor-pointer text-sm text-[#0f51ec] hover:underline">
                {locationData.learnMore?.image ? 'Change' : 'Upload Image'}
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  const fd = new FormData(); fd.append('file', file);
                  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
                  if (res.ok) { const d = await res.json(); setLocationData({ ...locationData, learnMore: { ...locationData.learnMore, image: d.url } }); }
                }} />
              </label>
              {locationData.learnMore?.image && <button type="button" onClick={() => setLocationData({ ...locationData, learnMore: { ...locationData.learnMore, image: '' } })} className="text-xs text-red-500 ml-2">Remove</button>}
              <div className="mt-3"><label className="block text-sm font-medium text-slate-700 mb-1">Image Alt Text (SEO)</label><input value={locationData.learnMore?.imageAlt ?? ''} onChange={e => setLocationData({ ...locationData, learnMore: { ...locationData.learnMore, imageAlt: e.target.value } })} maxLength={255} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]" placeholder="Describe the image for SEO & accessibility" /></div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#191e3b]">About Section</h2>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Title</label><input value={locationData.about?.title ?? ''} onChange={e => setLocationData({ ...locationData, about: { ...locationData.about, title: e.target.value } })} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Content <span className="text-slate-400 font-normal">(displayed justified, full width)</span></label><textarea value={locationData.about?.content ?? ''} onChange={e => setLocationData({ ...locationData, about: { ...locationData.about, content: e.target.value } })} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec] h-40" /></div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#191e3b]">CTA Section</h2>
          <div className="grid grid-cols-5 gap-6">
            <div className="col-span-3 space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Title</label><input value={locationData.cta?.title ?? ''} onChange={e => setLocationData({ ...locationData, cta: { ...locationData.cta, title: e.target.value } })} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Description</label><textarea value={locationData.cta?.description ?? ''} onChange={e => setLocationData({ ...locationData, cta: { ...locationData.cta, description: e.target.value } })} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec] h-20" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Button Text</label><input value={locationData.cta?.buttonText ?? ''} onChange={e => setLocationData({ ...locationData, cta: { ...locationData.cta, buttonText: e.target.value } })} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Button Link</label><input value={locationData.cta?.buttonLink ?? ''} onChange={e => setLocationData({ ...locationData, cta: { ...locationData.cta, buttonLink: e.target.value } })} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]" /></div>
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
              {locationData.cta?.image && <img src={locationData.cta.image} alt={locationData.cta?.imageAlt || ''} className="w-full aspect-[4/3] rounded-2xl object-cover border mb-2" loading="lazy" />}
              <label className="cursor-pointer text-sm text-[#0f51ec] hover:underline">
                {locationData.cta?.image ? 'Change' : 'Upload Image'}
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  const fd = new FormData(); fd.append('file', file);
                  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
                  if (res.ok) { const d = await res.json(); setLocationData({ ...locationData, cta: { ...locationData.cta, image: d.url } }); }
                }} />
              </label>
              {locationData.cta?.image && <button type="button" onClick={() => setLocationData({ ...locationData, cta: { ...locationData.cta, image: '' } })} className="text-xs text-red-500 ml-2">Remove</button>}
              <div className="mt-3"><label className="block text-sm font-medium text-slate-700 mb-1">Image Alt Text (SEO)</label><input value={locationData.cta?.imageAlt ?? ''} onChange={e => setLocationData({ ...locationData, cta: { ...locationData.cta, imageAlt: e.target.value } })} maxLength={255} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]" placeholder="Describe the image for SEO & accessibility" /></div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#191e3b]">Search Section</h2>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Title</label><input value={locationData.search?.title ?? ''} onChange={e => setLocationData({ ...locationData, search: { ...locationData.search, title: e.target.value } })} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Description</label><textarea value={locationData.search?.description ?? ''} onChange={e => setLocationData({ ...locationData, search: { ...locationData.search, description: e.target.value } })} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f51ec] h-20" /></div>
          <div>
            <h4 className="text-sm font-semibold text-slate-600 mb-3">Columns (4 columns)</h4>
            {(locationData.search?.columns ?? []).map((col: any, ci: number) => (
              <div key={ci} className="border border-slate-200 rounded-xl p-4 mb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <input placeholder="Column Title" value={col.title} onChange={(e) => {
                    const arr = [...(locationData.search?.columns || [])]; arr[ci] = { ...arr[ci], title: e.target.value };
                    setLocationData({ ...locationData, search: { ...locationData.search, columns: arr } });
                  }} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                  <button type="button" onClick={() => setLocationData({ ...locationData, search: { ...locationData.search, columns: (locationData.search?.columns || []).filter((_: any, idx: number) => idx !== ci) } })} className="text-xs text-red-500 hover:text-red-700 ml-2 shrink-0">Remove Column</button>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-2">Links</p>
                  {(col.links ?? []).map((link: any, li: number) => (
                    <div key={li} className="flex gap-2 mb-2">
                      <input placeholder="Text" value={link.text} onChange={(e) => {
                        const arr = [...(locationData.search?.columns || [])];
                        const links = [...(arr[ci].links || [])]; links[li] = { ...links[li], text: e.target.value };
                        arr[ci] = { ...arr[ci], links };
                        setLocationData({ ...locationData, search: { ...locationData.search, columns: arr } });
                      }} className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20 text-sm" />
                      <input placeholder="URL" value={link.url} onChange={(e) => {
                        const arr = [...(locationData.search?.columns || [])];
                        const links = [...(arr[ci].links || [])]; links[li] = { ...links[li], url: e.target.value };
                        arr[ci] = { ...arr[ci], links };
                        setLocationData({ ...locationData, search: { ...locationData.search, columns: arr } });
                      }} className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20 text-sm font-mono" />
                      <button type="button" onClick={() => {
                        const arr = [...(locationData.search?.columns || [])];
                        const links = (arr[ci].links || []).filter((_: any, idx: number) => idx !== li);
                        arr[ci] = { ...arr[ci], links };
                        setLocationData({ ...locationData, search: { ...locationData.search, columns: arr } });
                      }} className="text-xs text-red-500 hover:text-red-700 shrink-0">Remove</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => {
                    const arr = [...(locationData.search?.columns || [])];
                    const links = [...(arr[ci].links || []), { text: '', url: '' }];
                    arr[ci] = { ...arr[ci], links };
                    setLocationData({ ...locationData, search: { ...locationData.search, columns: arr } });
                  }} className="text-xs text-[#0f51ec] font-semibold hover:underline">+ Add Link</button>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setLocationData({ ...locationData, search: { ...locationData.search, columns: [...(locationData.search?.columns || []), { title: '', links: [] }] } })} className="text-sm text-[#0f51ec] font-semibold hover:underline">+ Add Column</button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Status</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="status" checked={!isPublished} onChange={() => setIsPublished(false)} className="accent-[#0f51ec]" /><span className="text-sm text-slate-600">Draft</span></label>
              <label className="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="status" checked={isPublished} onChange={() => setIsPublished(true)} className="accent-[#0f51ec]" /><span className="text-sm text-slate-600">Published</span></label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.push(`/${locale}/admin/destinations`)} className="px-4 py-2 border border-gray-300 rounded-full text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          {slug && <button type="button" onClick={() => window.open(`/${locale}/cottage-country/${slug}?preview=true`, '_blank')} className="px-4 py-2 border border-gray-300 rounded-full text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"><Eye className="w-4 h-4" /> Preview</button>}
          <button type="submit" disabled={saving} className="bg-[#0f51ec] hover:bg-[#0d44c9] text-white px-5 py-2 rounded-full text-sm font-semibold disabled:opacity-60">{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </form>
    </div>
  );
}
