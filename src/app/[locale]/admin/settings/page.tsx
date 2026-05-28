'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Save, Loader2, Settings as SettingsIcon, Home, Image, Search, Megaphone } from 'lucide-react';
import type { HomepageHero, HomepageDestinations, HomepageGallery, HomepageSearch, HomepageCTA } from '@/lib/settings-defaults';

const tabs = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'homepage_hero', label: 'Hero', icon: Home },
  { id: 'homepage_destinations', label: 'Destinations', icon: Image },
  { id: 'homepage_gallery', label: 'Gallery', icon: Image },
  { id: 'homepage_search', label: 'Search', icon: Search },
  { id: 'homepage_cta', label: 'CTA', icon: Megaphone },
];

export default function AdminSettingsPage() {
  const { locale } = useParams<{ locale: string }>();
  const [activeTab, setActiveTab] = useState('general');
  const [hero, setHero] = useState<HomepageHero | null>(null);
  const [destinations, setDestinations] = useState<HomepageDestinations | null>(null);
  const [gallery, setGallery] = useState<HomepageGallery | null>(null);
  const [search, setSearch] = useState<HomepageSearch | null>(null);
  const [cta, setCta] = useState<HomepageCTA | null>(null);
  const [general, setGeneral] = useState({ siteName: 'Cottage Escape', siteDescription: 'Find your perfect Canadian cottage rental.', logo: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchSection = useCallback(async (section: string) => {
    const res = await fetch(`/api/admin/settings?section=${section}`);
    if (!res.ok) return;
    const json = await res.json();
    return json.data;
  }, []);

  useEffect(() => {
    fetchSection('homepage_hero').then(setHero);
    fetchSection('homepage_destinations').then(setDestinations);
    fetchSection('homepage_gallery').then(setGallery);
    fetchSection('homepage_search').then(setSearch);
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
          <h2 className="text-lg font-bold text-[#0B1B40] mb-6">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input
                type="text"
                value={general.siteName}
                onChange={(e) => setGeneral({ ...general, siteName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20 focus:border-[#1F51C6]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
              <textarea
                value={general.siteDescription}
                onChange={(e) => setGeneral({ ...general, siteDescription: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20 focus:border-[#1F51C6]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input
                type="text"
                value={general.logo}
                onChange={(e) => setGeneral({ ...general, logo: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20 focus:border-[#1F51C6]"
              />
            </div>
          </div>
          <button
            onClick={() => saveSection('general', general)}
            disabled={saving}
            className="mt-6 inline-flex items-center gap-2 bg-[#1F51C6] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#1F51C6]/90 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save
          </button>
        </div>
      )}

      {activeTab === 'homepage_hero' && hero && (
        <SectionForm
          title="Hero Section"
          saving={saving}
          onSave={(data) => saveSection('homepage_hero', data)}
          fields={[
            { key: 'tag', label: 'Tag', type: 'text', value: hero.tag },
            { key: 'title', label: 'Title', type: 'text', value: hero.title },
            { key: 'description', label: 'Description', type: 'textarea', value: hero.description },
          ]}
          data={hero}
          onChange={setHero}
          interpolate
        />
      )}

      {activeTab === 'homepage_destinations' && destinations && (
        <div className="space-y-6 max-w-3xl">
          <SectionForm
            title="Destinations Section"
            saving={saving}
            onSave={(data) => saveSection('homepage_destinations', data)}
            fields={[
              { key: 'title', label: 'Title', type: 'text', value: destinations.title },
              { key: 'description', label: 'Description', type: 'textarea', value: destinations.description },
              { key: 'ctaText', label: 'CTA Text', type: 'text', value: destinations.ctaText },
              { key: 'ctaLink', label: 'CTA Link', type: 'text', value: destinations.ctaLink },
            ]}
            data={destinations}
            onChange={setDestinations}
            interpolate
          />
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#0B1B40] mb-4">Destination Items</h3>
            <div className="space-y-4">
              {destinations.items.map((item, i) => (
                <div key={i} className="p-4 border border-gray-100 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-400">Item {i + 1}</span>
                    <button
                      onClick={() => {
                        const newItems = destinations.items.filter((_, idx) => idx !== i);
                        setDestinations({ ...destinations, items: newItems });
                      }}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    placeholder="Name"
                    value={item.name}
                    onChange={(e) => {
                      const newItems = [...destinations.items];
                      newItems[i] = { ...newItems[i], name: e.target.value };
                      setDestinations({ ...destinations, items: newItems });
                    }}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20"
                  />
                  <input
                    placeholder="Properties (e.g. 320+ cottages)"
                    value={item.properties}
                    onChange={(e) => {
                      const newItems = [...destinations.items];
                      newItems[i] = { ...newItems[i], properties: e.target.value };
                      setDestinations({ ...destinations, items: newItems });
                    }}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20"
                  />
                  <input
                    placeholder="Image URL"
                    value={item.image}
                    onChange={(e) => {
                      const newItems = [...destinations.items];
                      newItems[i] = { ...newItems[i], image: e.target.value };
                      setDestinations({ ...destinations, items: newItems });
                    }}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20"
                  />
                </div>
              ))}
              <button
                onClick={() =>
                  setDestinations({
                    ...destinations,
                    items: [...destinations.items, { name: '', properties: '', image: '' }],
                  })
                }
                className="text-sm text-[#1F51C6] font-semibold hover:underline"
              >
                + Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'homepage_gallery' && gallery && (
        <div className="space-y-6 max-w-3xl">
          <SectionForm
            title="Gallery Section"
            saving={saving}
            onSave={(data) => saveSection('homepage_gallery', data)}
            fields={[
              { key: 'title', label: 'Title', type: 'text', value: gallery.title },
              { key: 'description', label: 'Description', type: 'textarea', value: gallery.description },
            ]}
            data={gallery}
            onChange={setGallery}
            interpolate
          />
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#0B1B40] mb-4">Gallery Tabs</h3>
            <div className="space-y-3">
              {gallery.tabs.map((tab, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <input
                    placeholder="Name (English)"
                    value={tab.name}
                    onChange={(e) => {
                      const newTabs = [...gallery.tabs];
                      newTabs[i] = { ...newTabs[i], name: e.target.value };
                      setGallery({ ...gallery, tabs: newTabs });
                    }}
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20"
                  />
                  <input
                    placeholder="Category (French)"
                    value={tab.category}
                    onChange={(e) => {
                      const newTabs = [...gallery.tabs];
                      newTabs[i] = { ...newTabs[i], category: e.target.value };
                      setGallery({ ...gallery, tabs: newTabs });
                    }}
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20"
                  />
                  <button
                    onClick={() => {
                      const newTabs = gallery.tabs.filter((_, idx) => idx !== i);
                      setGallery({ ...gallery, tabs: newTabs });
                    }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => setGallery({ ...gallery, tabs: [...gallery.tabs, { name: '', category: '' }] })}
                className="text-sm text-[#1F51C6] font-semibold hover:underline"
              >
                + Add Tab
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'homepage_search' && search && (
        <SectionForm
          title="Search Section"
          saving={saving}
          onSave={(data) => saveSection('homepage_search', data)}
          fields={[
            { key: 'title', label: 'Title', type: 'text', value: search.title },
            { key: 'description', label: 'Description', type: 'textarea', value: search.description },
          ]}
          data={search}
          onChange={setSearch}
          interpolate
        />
      )}

      {activeTab === 'homepage_cta' && cta && (
        <SectionForm
          title="CTA Section"
          saving={saving}
          onSave={(data) => saveSection('homepage_cta', data)}
          fields={[
            { key: 'title', label: 'Title', type: 'text', value: cta.title },
            { key: 'description', label: 'Description', type: 'textarea', value: cta.description },
            { key: 'buttonText', label: 'Button Text', type: 'text', value: cta.buttonText },
            { key: 'buttonLink', label: 'Button Link', type: 'text', value: cta.buttonLink },
            { key: 'image', label: 'Image URL', type: 'text', value: cta.image },
          ]}
          data={cta}
          onChange={setCta}
          interpolate
        />
      )}
    </div>
  );
}

type Field = { key: string; label: string; type: 'text' | 'textarea'; value: string };

function SectionForm({
  title,
  saving,
  onSave,
  fields,
  data,
  onChange,
  interpolate,
}: {
  title: string;
  saving: boolean;
  onSave: (data: any) => void;
  fields: Field[];
  data: Record<string, any>;
  onChange: (data: any) => void;
  interpolate?: boolean;
}) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm max-w-2xl">
      <h2 className="text-lg font-bold text-[#0B1B40] mb-6">{title}</h2>
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                value={field.value}
                onChange={(e) => onChange({ ...data, [field.key]: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20 focus:border-[#1F51C6]"
              />
            ) : (
              <input
                type="text"
                value={field.value}
                onChange={(e) => onChange({ ...data, [field.key]: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20 focus:border-[#1F51C6]"
              />
            )}
          </div>
        ))}
      </div>
      <button
        onClick={() => onSave(data)}
        disabled={saving}
        className="mt-6 inline-flex items-center gap-2 bg-[#1F51C6] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#1F51C6]/90 transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Save
      </button>
    </div>
  );
}
