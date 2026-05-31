'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Save, Loader2, Settings as SettingsIcon, Home, Search, Image, Megaphone, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';

type HomepageHero = { tag: string; title: string; description: string; image: string };
type DestItem = { name: string; properties: string; image: string };
type GalleryTab = { name: string; category: string };
type HomepageDestinations = { title: string; description: string; ctaText: string; ctaLink: string; items: DestItem[] };
type HomepageGallery = { title: string; description: string; tabs: GalleryTab[] };
type HomepageSearch = { title: string; description: string };
type ExploreItem = { icon: string; title: string; description: string };
type HomepageExplore = { title: string; description: string; subtitle: string; items: ExploreItem[] };
type HomepageCTA = { title: string; description: string; buttonText: string; buttonLink: string; image: string };

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
  const [gallery, setGallery] = useState<HomepageGallery | null>(null);
  const [search, setSearch] = useState<HomepageSearch | null>(null);
  const [explore, setExplore] = useState<HomepageExplore | null>(null);
  const [cta, setCta] = useState<HomepageCTA | null>(null);

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
    fetchSection('homepage_gallery').then(setGallery);
    fetchSection('homepage_search').then(setSearch);
    fetchSection('homepage_explore').then(setExplore);
    fetchSection('homepage_cta').then(setCta);
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

  if (!general) return <div className="p-10 text-gray-400">Loading...</div>;

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-200">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0B1B40] flex items-center gap-2">
          <SettingsIcon size={24} className="text-[#1F51C6]" /> Settings
        </h1>
        {saved && <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-full">Saved</span>}
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-[#1F51C6] text-[#1F51C6]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm max-w-2xl">
          <h2 className="text-lg font-bold text-[#0B1B40] mb-6">General</h2>
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
            <CollapsibleSection title="Hero Section" id="hero" isOpen={openHomeSection === 'hero'} onToggle={() => setOpenHomeSection(openHomeSection === 'hero' ? '' : 'hero')}>
              <Field label="Tag" value={hero.tag} onChange={(v) => setHero({ ...hero, tag: v })} />
              <Field label="Title" value={hero.title} onChange={(v) => setHero({ ...hero, title: v })} />
              <Field label="Description" value={hero.description} onChange={(v) => setHero({ ...hero, description: v })} textarea />
              <ImageUploader label="Background Image" value={hero.image} onChange={(v) => setHero({ ...hero, image: v })} />
              <SaveButton onClick={() => saveSection('homepage_hero', hero)} saving={saving} />
            </CollapsibleSection>
          )}

          {destinations && (
            <CollapsibleSection title="Destinations Section" id="destinations" isOpen={openHomeSection === 'destinations'} onToggle={() => setOpenHomeSection(openHomeSection === 'destinations' ? '' : 'destinations')}>
              <Field label="Title" value={destinations.title} onChange={(v) => setDestinations({ ...destinations, title: v })} />
              <Field label="Description" value={destinations.description} onChange={(v) => setDestinations({ ...destinations, description: v })} textarea />
              <Field label="CTA Text" value={destinations.ctaText} onChange={(v) => setDestinations({ ...destinations, ctaText: v })} />
              <Field label="CTA Link" value={destinations.ctaLink} onChange={(v) => setDestinations({ ...destinations, ctaLink: v })} />
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-600 mb-3">Destination Items</h4>
                <div className="space-y-3">
                  {destinations.items.map((item, i) => (
                    <div key={i} className="p-3 border border-gray-100 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400">Item {i + 1}</span>
                        <button onClick={() => {
                          const newItems = destinations.items.filter((_, idx) => idx !== i);
                          setDestinations({ ...destinations, items: newItems });
                        }} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                      </div>
                      <input placeholder="Name" value={item.name} onChange={(e) => {
                        const newItems = [...destinations.items];
                        newItems[i] = { ...newItems[i], name: e.target.value };
                        setDestinations({ ...destinations, items: newItems });
                      }} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20" />
                      <input placeholder="Properties (e.g. 320+ cottages)" value={item.properties} onChange={(e) => {
                        const newItems = [...destinations.items];
                        newItems[i] = { ...newItems[i], properties: e.target.value };
                        setDestinations({ ...destinations, items: newItems });
                      }} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20" />
                      <ImageUploader label="Image" value={item.image} onChange={(v) => {
                        const newItems = [...destinations.items];
                        newItems[i] = { ...newItems[i], image: v };
                        setDestinations({ ...destinations, items: newItems });
                      }} />
                    </div>
                  ))}
                  <button onClick={() => setDestinations({ ...destinations, items: [...destinations.items, { name: '', properties: '', image: '' }] })} className="text-sm text-[#1F51C6] font-semibold hover:underline">
                    + Add Item
                  </button>
                </div>
              </div>
              <SaveButton onClick={() => saveSection('homepage_destinations', destinations)} saving={saving} />
            </CollapsibleSection>
          )}

          {gallery && (
            <CollapsibleSection title="Gallery Section" id="gallery" isOpen={openHomeSection === 'gallery'} onToggle={() => setOpenHomeSection(openHomeSection === 'gallery' ? '' : 'gallery')}>
              <Field label="Title" value={gallery.title} onChange={(v) => setGallery({ ...gallery, title: v })} />
              <Field label="Description" value={gallery.description} onChange={(v) => setGallery({ ...gallery, description: v })} textarea />
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-600 mb-3">Gallery Tabs</h4>
                <div className="space-y-2">
                  {gallery.tabs.map((tab, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input placeholder="Name (English)" value={tab.name} onChange={(e) => {
                        const newTabs = [...gallery.tabs];
                        newTabs[i] = { ...newTabs[i], name: e.target.value };
                        setGallery({ ...gallery, tabs: newTabs });
                      }} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20" />
                      <input placeholder="Category (French)" value={tab.category} onChange={(e) => {
                        const newTabs = [...gallery.tabs];
                        newTabs[i] = { ...newTabs[i], category: e.target.value };
                        setGallery({ ...gallery, tabs: newTabs });
                      }} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20" />
                      <button onClick={() => {
                        const newTabs = gallery.tabs.filter((_, idx) => idx !== i);
                        setGallery({ ...gallery, tabs: newTabs });
                      }} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                    </div>
                  ))}
                  <button onClick={() => setGallery({ ...gallery, tabs: [...gallery.tabs, { name: '', category: '' }] })} className="text-sm text-[#1F51C6] font-semibold hover:underline">
                    + Add Tab
                  </button>
                </div>
              </div>
              <SaveButton onClick={() => saveSection('homepage_gallery', gallery)} saving={saving} />
            </CollapsibleSection>
          )}

          {search && (
            <CollapsibleSection title="Search Section" id="search" isOpen={openHomeSection === 'search'} onToggle={() => setOpenHomeSection(openHomeSection === 'search' ? '' : 'search')}>
              <Field label="Title" value={search.title} onChange={(v) => setSearch({ ...search, title: v })} />
              <Field label="Description" value={search.description} onChange={(v) => setSearch({ ...search, description: v })} textarea />
              <SaveButton onClick={() => saveSection('homepage_search', search)} saving={saving} />
            </CollapsibleSection>
          )}

          {explore && (
            <CollapsibleSection title="Explore Section" id="explore" isOpen={openHomeSection === 'explore'} onToggle={() => setOpenHomeSection(openHomeSection === 'explore' ? '' : 'explore')}>
              <Field label="Title" value={explore.title} onChange={(v) => setExplore({ ...explore, title: v })} />
              <Field label="Description" value={explore.description} onChange={(v) => setExplore({ ...explore, description: v })} textarea />
              <Field label="Subtitle" value={explore.subtitle} onChange={(v) => setExplore({ ...explore, subtitle: v })} textarea />
              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-3">Items</h4>
                {explore.items.map((item, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
                    <div className="flex gap-2">
                      <select value={item.icon} onChange={(e) => {
                        const arr = [...explore.items]; arr[i] = { ...arr[i], icon: e.target.value };
                        setExplore({ ...explore, items: arr });
                      }} className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20">
                        {['Waves', 'Trees', 'Compass', 'MapPin', 'Mountain', 'TreePine', 'Sunrise'].map(icon => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                      <input placeholder="Title" value={item.title} onChange={(e) => {
                        const arr = [...explore.items]; arr[i] = { ...arr[i], title: e.target.value };
                        setExplore({ ...explore, items: arr });
                      }} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20" />
                    </div>
                    <textarea placeholder="Description" value={item.description} onChange={(e) => {
                      const arr = [...explore.items]; arr[i] = { ...arr[i], description: e.target.value };
                      setExplore({ ...explore, items: arr });
                    }} rows={2} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20" />
                    <button onClick={() => setExplore({ ...explore, items: explore.items.filter((_, idx) => idx !== i) })} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                  </div>
                ))}
                <button onClick={() => setExplore({ ...explore, items: [...explore.items, { icon: 'Compass', title: '', description: '' }] })} className="text-sm text-[#1F51C6] font-semibold hover:underline">+ Add Item</button>
              </div>
              <SaveButton onClick={() => saveSection('homepage_explore', explore)} saving={saving} />
            </CollapsibleSection>
          )}

          {cta && (
            <CollapsibleSection title="CTA Section" id="cta" isOpen={openHomeSection === 'cta'} onToggle={() => setOpenHomeSection(openHomeSection === 'cta' ? '' : 'cta')}>
              <Field label="Title" value={cta.title} onChange={(v) => setCta({ ...cta, title: v })} />
              <Field label="Description" value={cta.description} onChange={(v) => setCta({ ...cta, description: v })} textarea />
              <Field label="Button Text" value={cta.buttonText} onChange={(v) => setCta({ ...cta, buttonText: v })} />
              <Field label="Button Link" value={cta.buttonLink} onChange={(v) => setCta({ ...cta, buttonLink: v })} />
              <ImageUploader label="Image" value={cta.image} onChange={(v) => setCta({ ...cta, image: v })} />
              <SaveButton onClick={() => saveSection('homepage_cta', cta)} saving={saving} />
            </CollapsibleSection>
          )}
        </div>
      )}

      {activeTab === 'seo' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm max-w-2xl">
          <h2 className="text-lg font-bold text-[#0B1B40] mb-6">SEO</h2>
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
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm max-w-2xl">
          <h2 className="text-lg font-bold text-[#0B1B40] mb-6">Header</h2>
          <div className="space-y-4">
            <Field label="Logo Text" value={header?.logoText ?? ''} onChange={(v) => setHeader({ ...header, logoText: v })} />
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-3">Menu Items</h4>
              <div className="space-y-3">
                {(header?.menuItems ?? []).map((item: any, i: number) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input placeholder="Label" value={item.label} onChange={(e) => {
                      const newItems = [...header.menuItems];
                      newItems[i] = { ...newItems[i], label: e.target.value };
                      setHeader({ ...header, menuItems: newItems });
                    }} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20" />
                    <input placeholder="href (use {locale})" value={item.href} onChange={(e) => {
                      const newItems = [...header.menuItems];
                      newItems[i] = { ...newItems[i], href: e.target.value };
                      setHeader({ ...header, menuItems: newItems });
                    }} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20" />
                    <button onClick={() => setHeader({ ...header, menuItems: header.menuItems.filter((_: any, idx: number) => idx !== i) })} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                  </div>
                ))}
                <button onClick={() => setHeader({ ...header, menuItems: [...header.menuItems, { label: '', href: '' }] })} className="text-sm text-[#1F51C6] font-semibold hover:underline">
                  + Add Menu Item
                </button>
              </div>
            </div>
          </div>
          <SaveButton onClick={() => saveSection('header', header)} saving={saving} />
        </div>
      )}

      {activeTab === 'footer' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm max-w-2xl">
          <h2 className="text-lg font-bold text-[#0B1B40] mb-6">Footer</h2>
          <div className="space-y-4">
            <Field label="Description" value={footer?.description ?? ''} onChange={(v) => setFooter({ ...footer, description: v })} textarea />
            <ImageUploader label="Logo" value={footer?.logo ?? ''} onChange={(v) => setFooter({ ...footer, logo: v })} />

            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-3">DISCOVER</h4>
              <div className="space-y-2">
                {(footer?.discover ?? []).map((item: any, i: number) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input placeholder="Label" value={item.label} onChange={(e) => {
                      const arr = [...footer.discover]; arr[i] = { ...arr[i], label: e.target.value };
                      setFooter({ ...footer, discover: arr });
                    }} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20" />
                    <input placeholder="href (use {locale})" value={item.href} onChange={(e) => {
                      const arr = [...footer.discover]; arr[i] = { ...arr[i], href: e.target.value };
                      setFooter({ ...footer, discover: arr });
                    }} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20" />
                    <button onClick={() => setFooter({ ...footer, discover: footer.discover.filter((_: any, idx: number) => idx !== i) })} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                  </div>
                ))}
                <button onClick={() => setFooter({ ...footer, discover: [...(footer?.discover || []), { label: '', href: '' }] })} className="text-sm text-[#1F51C6] font-semibold hover:underline">+ Add Link</button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-3">QUICK LINKS</h4>
              <div className="space-y-2">
                {(footer?.quickLinks ?? []).map((item: any, i: number) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input placeholder="Label" value={item.label} onChange={(e) => {
                      const arr = [...footer.quickLinks]; arr[i] = { ...arr[i], label: e.target.value };
                      setFooter({ ...footer, quickLinks: arr });
                    }} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20" />
                    <input placeholder="href (use {locale})" value={item.href} onChange={(e) => {
                      const arr = [...footer.quickLinks]; arr[i] = { ...arr[i], href: e.target.value };
                      setFooter({ ...footer, quickLinks: arr });
                    }} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20" />
                    <button onClick={() => setFooter({ ...footer, quickLinks: footer.quickLinks.filter((_: any, idx: number) => idx !== i) })} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                  </div>
                ))}
                <button onClick={() => setFooter({ ...footer, quickLinks: [...(footer?.quickLinks || []), { label: '', href: '' }] })} className="text-sm text-[#1F51C6] font-semibold hover:underline">+ Add Link</button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-3">ABOUT</h4>
              <div className="space-y-2">
                {(footer?.about ?? []).map((item: any, i: number) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input placeholder="Label" value={item.label} onChange={(e) => {
                      const arr = [...footer.about]; arr[i] = { ...arr[i], label: e.target.value };
                      setFooter({ ...footer, about: arr });
                    }} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20" />
                    <input placeholder="href (use {locale})" value={item.href} onChange={(e) => {
                      const arr = [...footer.about]; arr[i] = { ...arr[i], href: e.target.value };
                      setFooter({ ...footer, about: arr });
                    }} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20" />
                    <button onClick={() => setFooter({ ...footer, about: footer.about.filter((_: any, idx: number) => idx !== i) })} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                  </div>
                ))}
                <button onClick={() => setFooter({ ...footer, about: [...(footer?.about || []), { label: '', href: '' }] })} className="text-sm text-[#1F51C6] font-semibold hover:underline">+ Add Link</button>
              </div>
            </div>
          </div>
          <SaveButton onClick={() => saveSection('footer', footer)} saving={saving} />
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20 focus:border-[#1F51C6]" />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20 focus:border-[#1F51C6]" />
      )}
    </div>
  );
}

function SaveButton({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <button onClick={onClick} disabled={saving}
      className="mt-6 inline-flex items-center gap-2 bg-[#1F51C6] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#1F51C6]/90 transition-colors disabled:opacity-50">
      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
      Save
    </button>
  );
}

function CollapsibleSection({ title, id, isOpen, onToggle, children }: { title: string; id: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-8 py-4 hover:bg-gray-50 transition-colors">
        <h3 className="text-lg font-bold text-[#0B1B40]">{title}</h3>
        {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
      </button>
      {isOpen && <div className="px-8 pb-8 space-y-4">{children}</div>}
    </div>
  );
}
