'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';

type ExploreItem = { icon: string; title: string; description: string };

const EXPLORE_ICONS = ['Waves', 'Trees', 'Compass', 'MapPin', 'Mountain', 'TreePine', 'Sunrise'];

export default function NewDestinationPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [ctaTitle, setCtaTitle] = useState('');
  const [ctaDescription, setCtaDescription] = useState('');
  const [ctaButton, setCtaButton] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [locationData, setLocationData] = useState<any>({ hero: {}, intro: { highlights: [] }, featured: {}, explore: { items: [] }, search: {} });
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
        body: JSON.stringify({ title, template: 'location', seoTitle, metaDescription, featuredImage, ctaTitle, ctaDescription, ctaButton, ctaLink, locationData, isPublished })
      });
      if (res.ok) router.push('/admin/destinations');
    } finally { setSaving(false); }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <h1 className="text-2xl font-bold text-[#0B1B40] mb-6">Create Destination</h1>
      <p className="text-sm text-gray-500 mb-6">This will be published at <code className="text-[#1F51C6]">/cottage-country/&lt;slug&gt;</code></p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" placeholder="e.g. Algonquin Park" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
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
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#0B1B40]">SEO</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
            <input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" placeholder="SEO title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
            <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6] h-20" placeholder="Meta description" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#0B1B40]">Hero Section</h2>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tag</label><input value={locationData.hero?.tag ?? ''} onChange={e => setLocationData({ ...locationData, hero: { ...locationData.hero, tag: e.target.value } })} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input value={locationData.hero?.title ?? ''} onChange={e => setLocationData({ ...locationData, hero: { ...locationData.hero, title: e.target.value } })} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label><textarea value={locationData.hero?.subtitle ?? ''} onChange={e => setLocationData({ ...locationData, hero: { ...locationData.hero, subtitle: e.target.value } })} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6] h-20" /></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Background Image</label>
            <div className="flex items-center gap-3">
              {locationData.hero?.image && <img src={locationData.hero.image} className="w-16 h-16 rounded-xl object-cover border" />}
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
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Shortcode <span className="text-gray-400 font-normal">(ex: <code className="text-[#1F51C6]">[ontario, rating, 6]</code>)</span></label><input value={locationData.featured?.shortcode ?? ''} onChange={e => setLocationData({ ...locationData, featured: { ...locationData.featured, shortcode: e.target.value } })} className="w-full border border-gray-300 rounded-full px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" placeholder="[province, category, limit]" /></div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#0B1B40]">Explore Section</h2>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input value={locationData.explore?.title ?? ''} onChange={e => setLocationData({ ...locationData, explore: { ...locationData.explore, title: e.target.value } })} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label><input value={locationData.explore?.subtitle ?? ''} onChange={e => setLocationData({ ...locationData, explore: { ...locationData.explore, subtitle: e.target.value } })} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={locationData.explore?.description ?? ''} onChange={e => setLocationData({ ...locationData, explore: { ...locationData.explore, description: e.target.value } })} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6] h-20" /></div>
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-3">Items</h4>
            {(locationData.explore?.items ?? []).map((item: any, i: number) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
                <div className="flex gap-2">
                  <select value={item.icon} onChange={(e) => {
                    const arr = [...(locationData.explore?.items || [])]; arr[i] = { ...arr[i], icon: e.target.value };
                    setLocationData({ ...locationData, explore: { ...locationData.explore, items: arr } });
                  }} className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20">
                    {EXPLORE_ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                  </select>
                  <input placeholder="Title" value={item.title} onChange={(e) => {
                    const arr = [...(locationData.explore?.items || [])]; arr[i] = { ...arr[i], title: e.target.value };
                    setLocationData({ ...locationData, explore: { ...locationData.explore, items: arr } });
                  }} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20" />
                </div>
                <textarea placeholder="Description" value={item.description} onChange={(e) => {
                  const arr = [...(locationData.explore?.items || [])]; arr[i] = { ...arr[i], description: e.target.value };
                  setLocationData({ ...locationData, explore: { ...locationData.explore, items: arr } });
                }} rows={2} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20" />
                <button type="button" onClick={() => setLocationData({ ...locationData, explore: { ...locationData.explore, items: (locationData.explore?.items || []).filter((_: any, idx: number) => idx !== i) } })} className="text-xs text-red-500 hover:text-red-700">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => setLocationData({ ...locationData, explore: { ...locationData.explore, items: [...(locationData.explore?.items || []), { icon: 'Compass', title: '', description: '' }] } })} className="text-sm text-[#1F51C6] font-semibold hover:underline">+ Add Item</button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#0B1B40]">Learn More Section</h2>
          <div className="grid grid-cols-5 gap-6">
            <div className="col-span-3 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input value={locationData.learnMore?.title ?? ''} onChange={e => setLocationData({ ...locationData, learnMore: { ...locationData.learnMore, title: e.target.value } })} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" placeholder="Learn more about..." /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={locationData.learnMore?.description ?? ''} onChange={e => setLocationData({ ...locationData, learnMore: { ...locationData.learnMore, description: e.target.value } })} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6] h-28" placeholder="Paragraph describing the region..." /></div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              {locationData.learnMore?.image && <img src={locationData.learnMore.image} className="w-full aspect-[4/3] rounded-2xl object-cover border mb-2" />}
              <label className="cursor-pointer text-sm text-[#1F51C6] hover:underline">
                {locationData.learnMore?.image ? 'Change' : 'Upload Image'}
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  const fd = new FormData(); fd.append('file', file);
                  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
                  if (res.ok) { const d = await res.json(); setLocationData({ ...locationData, learnMore: { ...locationData.learnMore, image: d.url } }); }
                }} />
              </label>
              {locationData.learnMore?.image && <button type="button" onClick={() => setLocationData({ ...locationData, learnMore: { ...locationData.learnMore, image: '' } })} className="text-xs text-red-500 ml-2">Remove</button>}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#0B1B40]">Search Section</h2>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input value={locationData.search?.title ?? ''} onChange={e => setLocationData({ ...locationData, search: { ...locationData.search, title: e.target.value } })} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={locationData.search?.description ?? ''} onChange={e => setLocationData({ ...locationData, search: { ...locationData.search, description: e.target.value } })} className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6] h-20" /></div>
        </div>

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
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="status" checked={!isPublished} onChange={() => setIsPublished(false)} className="accent-[#1F51C6]" />
                <span className="text-sm text-gray-600">Draft</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="status" checked={isPublished} onChange={() => setIsPublished(true)} className="accent-[#1F51C6]" />
                <span className="text-sm text-gray-600">Published</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={saving} className="bg-[#1F51C6] hover:bg-[#163FA3] text-white px-5 py-2 rounded-full text-sm font-semibold disabled:opacity-60">
            {saving ? 'Saving...' : isPublished ? 'Publish Destination' : 'Save as Draft'}
          </button>
        </div>
      </form>
    </div>
  );
}
