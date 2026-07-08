'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Save, Loader2, Settings as SettingsIcon, Home, Search, Image, Megaphone, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';

type HomepageHero = { tag: string; title: string; description: string; image: string; imageAlt: string };
type DestItem = { name: string; properties: string; image: string; imageAlt?: string; link?: string };
type HomepageDestinations = { title: string; description: string; items: DestItem[] };
type HomepageSearch = { title: string; description: string; columns?: { title: string; links: { text: string; url: string }[] }[] };
type ExploreItem = { icon: string; title: string; description: string };
type HomepageExplore = { title: string; description: string; subtitle: string; image: string; imageAlt: string; items: ExploreItem[] };
type HomepageInspiration = { title: string; description: string };
type HomepageFeaturedChalets = { title: string; subtitle: string };
type HomepageCTA = { title: string; description: string; buttonText: string; buttonLink: string; image: string; imageAlt: string };
type HomepageCTABar = { title: string; description: string; buttonText: string; buttonLink: string };
type CategoryItem = { id: string; labelEn: string; labelFr: string; icon: string; link: string };
type CategoryBarConfig = { items: CategoryItem[] };

const tabs = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'homepage', label: 'Homepage', icon: Home },
  { id: 'seo', label: 'SEO', icon: Globe },
  { id: 'header', label: 'Header', icon: Image },
  { id: 'footer', label: 'Footer', icon: Megaphone },
];

export default function AdminSettingsPage() {
  const { locale } = useParams<{ locale: string }>();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [general, setGeneral] = useState<any>(null);
  const [seo, setSeo] = useState<any>(null);
  const [header, setHeader] = useState<any>(null);
  const [footer, setFooter] = useState<any>(null);
  const [hero, setHero] = useState<HomepageHero | null>(null);
  const [destinations, setDestinations] = useState<HomepageDestinations | null>(null);
  const [search, setSearch] = useState<HomepageSearch | null>(null);
  const [explore, setExplore] = useState<HomepageExplore | null>(null);
  const [inspiration, setInspiration] = useState<HomepageInspiration | null>(null);
  const [featured, setFeatured] = useState<HomepageFeaturedChalets | null>(null);
  const [cta, setCta] = useState<HomepageCTA | null>(null);
  const [ctaBar, setCtaBar] = useState<HomepageCTABar | null>(null);
  const [categories, setCategories] = useState<CategoryBarConfig | null>(null);

  const [openHomeSection, setOpenHomeSection] = useState<string>('hero');

  const fetchSection = useCallback(async (section: string) => {
    const res = await fetch(`/api/admin/settings?section=${section}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  }, []);

  useEffect(() => {
    fetchSection('general').then(setGeneral);
    fetchSection('seo').then(setSeo);
    fetchSection('header').then(setHeader);
    fetchSection('footer').then(setFooter);
    fetchSection('homepage_hero').then(setHero);
    fetchSection('homepage_destinations').then(setDestinations);
    fetchSection('homepage_search').then(setSearch);
    fetchSection('homepage_explore').then(setExplore);
    fetchSection('homepage_inspiration').then(setInspiration);
    fetchSection('homepage_featured').then(setFeatured);
    fetchSection('homepage_cta').then(setCta);
    fetchSection('homepage_cta_bar').then(setCtaBar);
    fetchSection('homepage_categories').then(setCategories);
  }, [fetchSection]);


  const saveSection = async (section: string, data: any) => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, data }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const interpolate = (text: string) => text?.replace(/\{locale\}/g, locale);

  if (!general) return <div className="p-10 text-slate-400">Loading...</div>;

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-200">
      <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#191e3b]">Settings</h1>
          <p className="text-sm text-slate-400 mt-1">Navigation, footer, logo &amp; favicon</p>
          {saved && <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-full">Saved</span>}
      </div>

      <div className="flex gap-1 border-b border-slate-100 mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-[#0f51ec] text-[#0f51ec]' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm max-w-2xl">
          <h2 className="text-lg font-bold text-[#191e3b] mb-6">General</h2>
          <div className="space-y-4">
            <Field label="Site Name" value={general.siteName} onChange={(v) => setGeneral({ ...general, siteName: v })} />
            <Field label="Site Description" value={general.siteDescription} onChange={(v) => setGeneral({ ...general, siteDescription: v })} textarea />
            <ImageUploader label="Logo" value={general.logo} onChange={(v) => setGeneral({ ...general, logo: v })} />
            <ImageUploader label="Favicon" value={general.favicon} onChange={(v) => setGeneral({ ...general, favicon: v })} />
          </div>
          <SaveButton onClick={() => saveSection('general', general)} saving={saving} />
        </div>
      )}

      {activeTab === 'homepage' && (
        <div className="space-y-4 max-w-3xl">
          {hero && (
            <CollapsibleSection title="1 — Hero Section" id="hero" isOpen={openHomeSection === 'hero'} onToggle={() => setOpenHomeSection(openHomeSection === 'hero' ? '' : 'hero')}>
              <Field label="Tag" value={hero.tag} onChange={(v) => setHero({ ...hero, tag: v })} />
              <Field label="Title" value={hero.title} onChange={(v) => setHero({ ...hero, title: v })} />
              <Field label="Description" value={hero.description} onChange={(v) => setHero({ ...hero, description: v })} textarea />
              <ImageUploader label="Background Image" value={hero.image} onChange={(v) => setHero({ ...hero, image: v })} />
              <Field label="Image Alt Text (SEO)" value={hero.imageAlt} onChange={(v) => setHero({ ...hero, imageAlt: v })} maxLength={255} />
              <SaveButton onClick={() => saveSection('homepage_hero', hero)} saving={saving} />
            </CollapsibleSection>
          )}

          {categories && (
            <CollapsibleSection title="2 — Category Icons" id="categories" isOpen={openHomeSection === 'categories'} onToggle={() => setOpenHomeSection(openHomeSection === 'categories' ? '' : 'categories')}>
              <div>
                <div className="space-y-3">
                  {categories.items.map((item, i) => (
                    <div key={i} className="p-3 border border-slate-100 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">Category {i + 1}</span>
                        <button onClick={() => {
                          const newItems = categories.items.filter((_, idx) => idx !== i);
                          setCategories({ ...categories, items: newItems });
                        }} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                      </div>
                      <input placeholder="ID (ex: lakefront)" value={item.id} onChange={(e) => {
                        const arr = [...categories.items]; arr[i] = { ...arr[i], id: e.target.value };
                        setCategories({ ...categories, items: arr });
                      }} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                      <input placeholder="Label (English)" value={item.labelEn} onChange={(e) => {
                        const arr = [...categories.items]; arr[i] = { ...arr[i], labelEn: e.target.value };
                        setCategories({ ...categories, items: arr });
                      }} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                      <input placeholder="Label (French)" value={item.labelFr} onChange={(e) => {
                        const arr = [...categories.items]; arr[i] = { ...arr[i], labelFr: e.target.value };
                        setCategories({ ...categories, items: arr });
                      }} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                      <select value={item.icon} onChange={(e) => {
                         const arr = [...categories.items]; arr[i] = { ...arr[i], icon: e.target.value };
                         setCategories({ ...categories, items: arr });
                       }} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20">
                         {['Sailboat', 'Bath', 'Users', 'Gem', 'Dog', 'Mountain', 'Heart', 'Home', 'Trees', 'TreePine', 'Umbrella', 'Building2', 'MountainSnow', 'Waves', 'Footprints', 'Compass', 'MapPin', 'Sunrise'].map(icon => (
                           <option key={icon} value={icon}>{icon}</option>
                         ))}
                       </select>
                       <input placeholder="Link (ex: /en/cottage-country/ontario)" value={item.link} onChange={(e) => {
                         const arr = [...categories.items]; arr[i] = { ...arr[i], link: e.target.value };
                         setCategories({ ...categories, items: arr });
                       }} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                    </div>
                  ))}
                  <button onClick={() => setCategories({ ...categories, items: [...categories.items, { id: '', labelEn: '', labelFr: '', icon: 'Compass', link: '' }] })} className="text-sm text-[#0f51ec] font-semibold hover:underline">
                    + Add Category
                  </button>
                </div>
              </div>
              <SaveButton onClick={() => saveSection('homepage_categories', categories)} saving={saving} />
            </CollapsibleSection>
          )}

          {ctaBar && (
            <CollapsibleSection title="3 — CTA Bar" id="cta-bar" isOpen={openHomeSection === 'cta-bar'} onToggle={() => setOpenHomeSection(openHomeSection === 'cta-bar' ? '' : 'cta-bar')}>
              <Field label="Title" value={ctaBar.title} onChange={(v) => setCtaBar({ ...ctaBar, title: v })} />
              <Field label="Description" value={ctaBar.description} onChange={(v) => setCtaBar({ ...ctaBar, description: v })} textarea />
              <Field label="Button Text" value={ctaBar.buttonText} onChange={(v) => setCtaBar({ ...ctaBar, buttonText: v })} />
              <Field label="Button Link" value={ctaBar.buttonLink} onChange={(v) => setCtaBar({ ...ctaBar, buttonLink: v })} />
              <SaveButton onClick={() => saveSection('homepage_cta_bar', ctaBar)} saving={saving} />
            </CollapsibleSection>
          )}

          {featured && (
            <CollapsibleSection title="4 — Featured Chalets" id="featured" isOpen={openHomeSection === 'featured'} onToggle={() => setOpenHomeSection(openHomeSection === 'featured' ? '' : 'featured')}>
              <Field label="Title" value={featured.title} onChange={(v) => setFeatured({ ...featured, title: v })} />
              <Field label="Subtitle" value={featured.subtitle} onChange={(v) => setFeatured({ ...featured, subtitle: v })} textarea />
              <p className="text-xs text-slate-400">Chalets data comes from the database — only the title and subtitle are editable here.</p>
              <SaveButton onClick={() => saveSection('homepage_featured', featured)} saving={saving} />
            </CollapsibleSection>
          )}

          {destinations && (
            <CollapsibleSection title="5 — Destinations Section" id="destinations" isOpen={openHomeSection === 'destinations'} onToggle={() => setOpenHomeSection(openHomeSection === 'destinations' ? '' : 'destinations')}>
              <Field label="Title" value={destinations.title} onChange={(v) => setDestinations({ ...destinations, title: v })} />
              <Field label="Description" value={destinations.description} onChange={(v) => setDestinations({ ...destinations, description: v })} textarea />
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-slate-600 mb-3">Destination Items</h4>
                <div className="space-y-3">
                  {destinations.items.map((item, i) => (
                    <div key={i} className="p-3 border border-slate-100 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">Item {i + 1}</span>
                        <button onClick={() => {
                          const newItems = destinations.items.filter((_, idx) => idx !== i);
                          setDestinations({ ...destinations, items: newItems });
                        }} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                      </div>
                      <input placeholder="Name" value={item.name} onChange={(e) => {
                        const newItems = [...destinations.items];
                        newItems[i] = { ...newItems[i], name: e.target.value };
                        setDestinations({ ...destinations, items: newItems });
                      }} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                      <input placeholder="Properties (e.g. 320+ cottages)" value={item.properties} onChange={(e) => {
                        const newItems = [...destinations.items];
                        newItems[i] = { ...newItems[i], properties: e.target.value };
                        setDestinations({ ...destinations, items: newItems });
                      }} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                      <input placeholder="Link (e.g. /en/cottage-country/ontario)" value={item.link || ''} onChange={(e) => {
                         const newItems = [...destinations.items];
                         newItems[i] = { ...newItems[i], link: e.target.value };
                         setDestinations({ ...destinations, items: newItems });
                       }} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                       <ImageUploader label="Image" value={item.image} onChange={(v) => {
                         const newItems = [...destinations.items];
                         newItems[i] = { ...newItems[i], image: v };
                         setDestinations({ ...destinations, items: newItems });
                       }} />
                       <Field label="Image Alt Text (SEO)" value={item.imageAlt || ''} onChange={(v) => {
                         const newItems = [...destinations.items];
                         newItems[i] = { ...newItems[i], imageAlt: v };
                         setDestinations({ ...destinations, items: newItems });
                       }} maxLength={255} />
                      </div>
                  ))}
                  <button onClick={() => setDestinations({ ...destinations, items: [...destinations.items, { name: '', properties: '', image: '', link: '' }] })} className="text-sm text-[#0f51ec] font-semibold hover:underline">
                    + Add Item
                  </button>
                </div>
              </div>
              <SaveButton onClick={() => saveSection('homepage_destinations', destinations)} saving={saving} />
            </CollapsibleSection>
          )}

          {explore && (
            <CollapsibleSection title="6 — Explore Section" id="explore" isOpen={openHomeSection === 'explore'} onToggle={() => setOpenHomeSection(openHomeSection === 'explore' ? '' : 'explore')}>
              <Field label="Title" value={explore.title} onChange={(v) => setExplore({ ...explore, title: v })} />
              <Field label="Description" value={explore.description} onChange={(v) => setExplore({ ...explore, description: v })} textarea />
              <Field label="Subtitle" value={explore.subtitle} onChange={(v) => setExplore({ ...explore, subtitle: v })} textarea />
              <ImageUploader label="Image" value={explore.image} onChange={(v) => setExplore({ ...explore, image: v })} />
              <Field label="Image Alt Text (SEO)" value={explore.imageAlt} onChange={(v) => setExplore({ ...explore, imageAlt: v })} maxLength={255} />
              <div>
                <h4 className="text-sm font-semibold text-slate-600 mb-3">Items</h4>
                {explore.items.map((item, i) => (
                  <div key={i} className="border border-slate-200 rounded-xl p-4 mb-4 space-y-3">
                    <div className="flex gap-2">
                      <select value={item.icon} onChange={(e) => {
                        const arr = [...explore.items]; arr[i] = { ...arr[i], icon: e.target.value };
                        setExplore({ ...explore, items: arr });
                      }} className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20">
                        {['Waves', 'Trees', 'Compass', 'MapPin', 'Mountain', 'TreePine', 'Sunrise'].map(icon => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                      <input placeholder="Title" value={item.title} onChange={(e) => {
                        const arr = [...explore.items]; arr[i] = { ...arr[i], title: e.target.value };
                        setExplore({ ...explore, items: arr });
                      }} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                    </div>
                    <textarea placeholder="Description" value={item.description} onChange={(e) => {
                      const arr = [...explore.items]; arr[i] = { ...arr[i], description: e.target.value };
                      setExplore({ ...explore, items: arr });
                    }} rows={2} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                    <button onClick={() => setExplore({ ...explore, items: explore.items.filter((_, idx) => idx !== i) })} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                  </div>
                ))}
                <button onClick={() => setExplore({ ...explore, items: [...explore.items, { icon: 'Compass', title: '', description: '' }] })} className="text-sm text-[#0f51ec] font-semibold hover:underline">+ Add Item</button>
              </div>
              <SaveButton onClick={() => saveSection('homepage_explore', explore)} saving={saving} />
            </CollapsibleSection>
          )}

          {inspiration && (
            <CollapsibleSection title="7 — Inspiration Section" id="inspiration" isOpen={openHomeSection === 'inspiration'} onToggle={() => setOpenHomeSection(openHomeSection === 'inspiration' ? '' : 'inspiration')}>
              <Field label="Title" value={inspiration.title} onChange={(v) => setInspiration({ ...inspiration, title: v })} />
              <Field label="Description" value={inspiration.description} onChange={(v) => setInspiration({ ...inspiration, description: v })} textarea />
              <SaveButton onClick={() => saveSection('homepage_inspiration', inspiration)} saving={saving} />
            </CollapsibleSection>
          )}

          {search && (
            <CollapsibleSection title="8 — Search Section" id="search" isOpen={openHomeSection === 'search'} onToggle={() => setOpenHomeSection(openHomeSection === 'search' ? '' : 'search')}>
              <Field label="Title" value={search.title} onChange={(v) => setSearch({ ...search, title: v })} />
              <Field label="Description" value={search.description} onChange={(v) => setSearch({ ...search, description: v })} textarea />
              <div>
                <h4 className="text-sm font-semibold text-slate-600 mb-3">Columns (4 columns)</h4>
                {(search.columns ?? []).map((col, ci) => (
                  <div key={ci} className="border border-slate-200 rounded-xl p-4 mb-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <input placeholder="Column Title" value={col.title} onChange={(e) => {
                        const arr = [...(search.columns || [])]; arr[ci] = { ...arr[ci], title: e.target.value };
                        setSearch({ ...search, columns: arr });
                      }} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                      <button type="button" onClick={() => setSearch({ ...search, columns: (search.columns || []).filter((_, idx) => idx !== ci) })} className="text-xs text-red-500 hover:text-red-700 ml-2 shrink-0">Remove Column</button>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Links</p>
                      {(col.links ?? []).map((link, li) => (
                        <div key={li} className="flex gap-2 mb-2">
                          <input placeholder="Text" value={link.text} onChange={(e) => {
                            const arr = [...(search.columns || [])];
                            const links = [...(arr[ci].links || [])]; links[li] = { ...links[li], text: e.target.value };
                            arr[ci] = { ...arr[ci], links };
                            setSearch({ ...search, columns: arr });
                          }} className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20 text-sm" />
                          <input placeholder="URL" value={link.url} onChange={(e) => {
                            const arr = [...(search.columns || [])];
                            const links = [...(arr[ci].links || [])]; links[li] = { ...links[li], url: e.target.value };
                            arr[ci] = { ...arr[ci], links };
                            setSearch({ ...search, columns: arr });
                          }} className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20 text-sm font-mono" />
                          <button type="button" onClick={() => {
                            const arr = [...(search.columns || [])];
                            const links = (arr[ci].links || []).filter((_, idx) => idx !== li);
                            arr[ci] = { ...arr[ci], links };
                            setSearch({ ...search, columns: arr });
                          }} className="text-xs text-red-500 hover:text-red-700 shrink-0">Remove</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => {
                        const arr = [...(search.columns || [])];
                        const links = [...(arr[ci].links || []), { text: '', url: '' }];
                        arr[ci] = { ...arr[ci], links };
                        setSearch({ ...search, columns: arr });
                      }} className="text-xs text-[#0f51ec] font-semibold hover:underline">+ Add Link</button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setSearch({ ...search, columns: [...(search.columns || []), { title: '', links: [] }] })} className="text-sm text-[#0f51ec] font-semibold hover:underline">+ Add Column</button>
              </div>
              <SaveButton onClick={() => saveSection('homepage_search', search)} saving={saving} />
            </CollapsibleSection>
          )}

          {cta && (
            <CollapsibleSection title="9 — CTA Section" id="cta" isOpen={openHomeSection === 'cta'} onToggle={() => setOpenHomeSection(openHomeSection === 'cta' ? '' : 'cta')}>
              <Field label="Title" value={cta.title} onChange={(v) => setCta({ ...cta, title: v })} />
              <Field label="Description" value={cta.description} onChange={(v) => setCta({ ...cta, description: v })} textarea />
              <Field label="Button Text" value={cta.buttonText} onChange={(v) => setCta({ ...cta, buttonText: v })} />
              <Field label="Button Link" value={cta.buttonLink} onChange={(v) => setCta({ ...cta, buttonLink: v })} />
              <ImageUploader label="Image" value={cta.image} onChange={(v) => setCta({ ...cta, image: v })} />
              <Field label="Image Alt Text (SEO)" value={cta.imageAlt} onChange={(v) => setCta({ ...cta, imageAlt: v })} maxLength={255} />
              <SaveButton onClick={() => saveSection('homepage_cta', cta)} saving={saving} />
            </CollapsibleSection>
          )}
        </div>
      )}

      {activeTab === 'seo' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm max-w-2xl">
          <h2 className="text-lg font-bold text-[#191e3b] mb-6">SEO</h2>
          <div className="space-y-4">
            <Field label="Default Title" value={seo?.defaultTitle ?? ''} onChange={(v) => setSeo({ ...seo, defaultTitle: v })} />
            <Field label="Default Description" value={seo?.defaultDescription ?? ''} onChange={(v) => setSeo({ ...seo, defaultDescription: v })} textarea />
            <ImageUploader label="OG Image" value={seo?.ogImage ?? ''} onChange={(v) => setSeo({ ...seo, ogImage: v })} />
            <Field label="Google Analytics ID" value={seo?.googleAnalyticsId ?? ''} onChange={(v) => setSeo({ ...seo, googleAnalyticsId: v })} />
          </div>
          <SaveButton onClick={() => saveSection('seo', seo)} saving={saving} />
        </div>
      )}

      {activeTab === 'header' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm max-w-2xl">
          <h2 className="text-lg font-bold text-[#191e3b] mb-6">Header</h2>
          <div className="space-y-4">
            <Field label="Logo Text" value={header?.logoText ?? ''} onChange={(v) => setHeader({ ...header, logoText: v })} />
            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-3">Menu Items</h4>
              <div className="space-y-3">
                {(header?.menuItems ?? []).map((item: any, i: number) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input placeholder="Label" value={item.label} onChange={(e) => {
                      const newItems = [...header.menuItems];
                      newItems[i] = { ...newItems[i], label: e.target.value };
                      setHeader({ ...header, menuItems: newItems });
                    }} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                    <input placeholder="href (use {locale})" value={item.href} onChange={(e) => {
                      const newItems = [...header.menuItems];
                      newItems[i] = { ...newItems[i], href: e.target.value };
                      setHeader({ ...header, menuItems: newItems });
                    }} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                    <button onClick={() => setHeader({ ...header, menuItems: header.menuItems.filter((_: any, idx: number) => idx !== i) })} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                  </div>
                ))}
                <button onClick={() => setHeader({ ...header, menuItems: [...header.menuItems, { label: '', href: '' }] })} className="text-sm text-[#0f51ec] font-semibold hover:underline">
                  + Add Menu Item
                </button>
              </div>
            </div>
          </div>
          <SaveButton onClick={() => saveSection('header', header)} saving={saving} />
        </div>
      )}

      {activeTab === 'footer' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm max-w-2xl">
          <h2 className="text-lg font-bold text-[#191e3b] mb-6">Footer</h2>
          <div className="space-y-4">
            <Field label="Description" value={footer?.description ?? ''} onChange={(v) => setFooter({ ...footer, description: v })} textarea />
            <ImageUploader label="Logo" value={footer?.logo ?? ''} onChange={(v) => setFooter({ ...footer, logo: v })} />

            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-3">DISCOVER</h4>
              <div className="space-y-2">
                {(footer?.discover ?? []).map((item: any, i: number) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input placeholder="Label" value={item.label} onChange={(e) => {
                      const arr = [...footer.discover]; arr[i] = { ...arr[i], label: e.target.value };
                      setFooter({ ...footer, discover: arr });
                    }} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                    <input placeholder="href (use {locale})" value={item.href} onChange={(e) => {
                      const arr = [...footer.discover]; arr[i] = { ...arr[i], href: e.target.value };
                      setFooter({ ...footer, discover: arr });
                    }} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                    <button onClick={() => setFooter({ ...footer, discover: footer.discover.filter((_: any, idx: number) => idx !== i) })} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                  </div>
                ))}
                <button onClick={() => setFooter({ ...footer, discover: [...(footer?.discover || []), { label: '', href: '' }] })} className="text-sm text-[#0f51ec] font-semibold hover:underline">+ Add Link</button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-3">QUICK LINKS</h4>
              <div className="space-y-2">
                {(footer?.quickLinks ?? []).map((item: any, i: number) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input placeholder="Label" value={item.label} onChange={(e) => {
                      const arr = [...footer.quickLinks]; arr[i] = { ...arr[i], label: e.target.value };
                      setFooter({ ...footer, quickLinks: arr });
                    }} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                    <input placeholder="href (use {locale})" value={item.href} onChange={(e) => {
                      const arr = [...footer.quickLinks]; arr[i] = { ...arr[i], href: e.target.value };
                      setFooter({ ...footer, quickLinks: arr });
                    }} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                    <button onClick={() => setFooter({ ...footer, quickLinks: footer.quickLinks.filter((_: any, idx: number) => idx !== i) })} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                  </div>
                ))}
                <button onClick={() => setFooter({ ...footer, quickLinks: [...(footer?.quickLinks || []), { label: '', href: '' }] })} className="text-sm text-[#0f51ec] font-semibold hover:underline">+ Add Link</button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-3">ABOUT</h4>
              <div className="space-y-2">
                {(footer?.about ?? []).map((item: any, i: number) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input placeholder="Label" value={item.label} onChange={(e) => {
                      const arr = [...footer.about]; arr[i] = { ...arr[i], label: e.target.value };
                      setFooter({ ...footer, about: arr });
                    }} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                    <input placeholder="href (use {locale})" value={item.href} onChange={(e) => {
                      const arr = [...footer.about]; arr[i] = { ...arr[i], href: e.target.value };
                      setFooter({ ...footer, about: arr });
                    }} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                    <button onClick={() => setFooter({ ...footer, about: footer.about.filter((_: any, idx: number) => idx !== i) })} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                  </div>
                ))}
                <button onClick={() => setFooter({ ...footer, about: [...(footer?.about || []), { label: '', href: '' }] })} className="text-sm text-[#0f51ec] font-semibold hover:underline">+ Add Link</button>
              </div>
            </div>
          </div>
          <SaveButton onClick={() => saveSection('footer', footer)} saving={saving} />
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, textarea, maxLength }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean; maxLength?: number }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} maxLength={maxLength}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20 focus:border-[#0f51ec]" />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} maxLength={maxLength}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20 focus:border-[#0f51ec]" />
      )}
    </div>
  );
}

function SaveButton({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <button onClick={onClick} disabled={saving}
      className="mt-6 inline-flex items-center gap-2 bg-[#0f51ec] text-white px-6 py-2.5 rounded-full font-semibold hover:bg-[#0d44c9] transition-colors disabled:opacity-50">
      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
      Save
    </button>
  );
}

function CollapsibleSection({ title, id, isOpen, onToggle, children }: { title: string; id: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-8 py-4 hover:bg-slate-50 transition-colors">
        <h3 className="text-lg font-bold text-[#191e3b]">{title}</h3>
        {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
      </button>
      {isOpen && <div className="px-8 pb-8 space-y-4">{children}</div>}
    </div>
  );
}
