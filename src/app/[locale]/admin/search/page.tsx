'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Save, Loader2, Plus, Trash2, Search as SearchIcon, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';

type SearchData = {
  hero: { title: string; subtitle: string; image: string; imageAlt: string };
  intro: { description: string; highlights: { icon: string; title: string; description: string }[] };
  learnMore: { title: string; subtitle: string; description: string; faq: { q: string; a: string }[]; image: string; imageAlt: string };
  cta: { title: string; description: string; buttonText: string; buttonLink: string; image: string; imageAlt: string };
  search: { title: string; description: string; columns: { title: string; links: { text: string; url: string }[] }[] };
};

const defaultData: SearchData = {
  hero: { title: '', subtitle: '', image: '', imageAlt: '' },
  intro: { description: '', highlights: [] },
  learnMore: { title: '', subtitle: '', description: '', faq: [], image: '', imageAlt: '' },
  cta: { title: '', description: '', buttonText: '', buttonLink: '', image: '', imageAlt: '' },
  search: { title: '', description: '', columns: [] },
};

export default function AdminSearchPage() {
  const { locale } = useParams<{ locale: string }>();
  const [data, setData] = useState<SearchData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string>('hero');

  useEffect(() => {
    fetch('/api/admin/settings?section=search').then(r => r.json()).then(d => {
      setData(d.data || defaultData);
    }).catch(() => setData(defaultData));
  }, []);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'search', data }),
      });
      if (res.ok) {
        setSaved(true);
      } else {
        const err = await res.json().catch(() => ({ error: 'Save failed' }));
        setError(err.error || 'Save failed');
      }
    } catch (e) {
      setError('Network error — check console');
    } finally {
      setSaving(false);
    }
  };

  if (!data) return <div className="p-10 text-slate-400">Loading...</div>;

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#191e3b]">Search</h1>
          <p className="text-sm text-slate-400 mt-1">Configure the search results page content</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-full">Saved</span>}
          {error && <span className="text-xs text-red-600 font-bold bg-red-50 px-3 py-1.5 rounded-full">{error}</span>}
        </div>
      </div>

      <div className="space-y-4">
        {/* Hero Section */}
        <CollapsibleSection title="1 — Hero Section" id="hero" isOpen={openSection === 'hero'} onToggle={() => setOpenSection(openSection === 'hero' ? '' : 'hero')}>
          <Field label="Title" value={data.hero.title} onChange={(v) => setData({ ...data, hero: { ...data.hero, title: v } })} />
          <Field label="Subtitle" value={data.hero.subtitle} onChange={(v) => setData({ ...data, hero: { ...data.hero, subtitle: v } })} />
          <ImageUploader label="Background Image" value={data.hero.image} onChange={(v) => setData({ ...data, hero: { ...data.hero, image: v } })} />
          <Field label="Image Alt Text (SEO)" value={data.hero.imageAlt} onChange={(v) => setData({ ...data, hero: { ...data.hero, imageAlt: v } })} maxLength={255} />
        </CollapsibleSection>

        {/* Intro Section */}
        <CollapsibleSection title="2 — Intro Section" id="intro" isOpen={openSection === 'intro'} onToggle={() => setOpenSection(openSection === 'intro' ? '' : 'intro')}>
          <Field label="Description" value={data.intro.description} onChange={(v) => setData({ ...data, intro: { ...data.intro, description: v } })} textarea />
          <div>
            <h4 className="text-sm font-semibold text-slate-600 mb-3">Highlights</h4>
            {data.intro.highlights.map((item, i) => (
              <div key={i} className="border border-slate-200 rounded-xl p-4 mb-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">Highlight {i + 1}</span>
                  <button onClick={() => {
                    const arr = [...data.intro.highlights];
                    arr.splice(i, 1);
                    setData({ ...data, intro: { ...data.intro, highlights: arr } });
                  }} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                </div>
                <select value={item.icon} onChange={(e) => {
                  const arr = [...data.intro.highlights];
                  arr[i] = { ...arr[i], icon: e.target.value };
                  setData({ ...data, intro: { ...data.intro, highlights: arr } });
                }} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20">
                  {['Waves', 'Trees', 'Compass', 'MapPin', 'Mountain', 'TreePine', 'Sunrise', 'Leaf', 'Snowflake', 'Star'].map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
                <input placeholder="Title" value={item.title} onChange={(e) => {
                  const arr = [...data.intro.highlights];
                  arr[i] = { ...arr[i], title: e.target.value };
                  setData({ ...data, intro: { ...data.intro, highlights: arr } });
                }} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                <textarea placeholder="Description" value={item.description} onChange={(e) => {
                  const arr = [...data.intro.highlights];
                  arr[i] = { ...arr[i], description: e.target.value };
                  setData({ ...data, intro: { ...data.intro, highlights: arr } });
                }} rows={2} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
              </div>
            ))}
            <button onClick={() => setData({ ...data, intro: { ...data.intro, highlights: [...data.intro.highlights, { icon: 'Compass', title: '', description: '' }] } })} className="text-sm text-[#0f51ec] font-semibold hover:underline">
              <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Highlight
            </button>
          </div>
        </CollapsibleSection>

        {/* Learn More / FAQ */}
        <CollapsibleSection title="3 — Learn More / FAQ Section" id="learnMore" isOpen={openSection === 'learnMore'} onToggle={() => setOpenSection(openSection === 'learnMore' ? '' : 'learnMore')}>
          <Field label="Subtitle" value={data.learnMore.subtitle} onChange={(v) => setData({ ...data, learnMore: { ...data.learnMore, subtitle: v } })} />
          <Field label="Title" value={data.learnMore.title} onChange={(v) => setData({ ...data, learnMore: { ...data.learnMore, title: v } })} />
          <Field label="Description" value={data.learnMore.description} onChange={(v) => setData({ ...data, learnMore: { ...data.learnMore, description: v } })} textarea />
          <ImageUploader label="Image" value={data.learnMore.image} onChange={(v) => setData({ ...data, learnMore: { ...data.learnMore, image: v } })} />
          <Field label="Image Alt Text" value={data.learnMore.imageAlt} onChange={(v) => setData({ ...data, learnMore: { ...data.learnMore, imageAlt: v } })} maxLength={255} />
          <div>
            <h4 className="text-sm font-semibold text-slate-600 mb-3">FAQ Items</h4>
            {data.learnMore.faq.map((item, i) => (
              <div key={i} className="border border-slate-200 rounded-xl p-4 mb-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">FAQ {i + 1}</span>
                  <button onClick={() => {
                    const arr = [...data.learnMore.faq];
                    arr.splice(i, 1);
                    setData({ ...data, learnMore: { ...data.learnMore, faq: arr } });
                  }} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                </div>
                <input placeholder="Question" value={item.q} onChange={(e) => {
                  const arr = [...data.learnMore.faq];
                  arr[i] = { ...arr[i], q: e.target.value };
                  setData({ ...data, learnMore: { ...data.learnMore, faq: arr } });
                }} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                <textarea placeholder="Answer" value={item.a} onChange={(e) => {
                  const arr = [...data.learnMore.faq];
                  arr[i] = { ...arr[i], a: e.target.value };
                  setData({ ...data, learnMore: { ...data.learnMore, faq: arr } });
                }} rows={2} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
              </div>
            ))}
            <button onClick={() => setData({ ...data, learnMore: { ...data.learnMore, faq: [...data.learnMore.faq, { q: '', a: '' }] } })} className="text-sm text-[#0f51ec] font-semibold hover:underline">
              <Plus className="w-3.5 h-3.5 inline mr-1" /> Add FAQ
            </button>
          </div>
        </CollapsibleSection>

        {/* CTA Section */}
        <CollapsibleSection title="4 — CTA Section" id="cta" isOpen={openSection === 'cta'} onToggle={() => setOpenSection(openSection === 'cta' ? '' : 'cta')}>
          <Field label="Title" value={data.cta.title} onChange={(v) => setData({ ...data, cta: { ...data.cta, title: v } })} />
          <Field label="Description" value={data.cta.description} onChange={(v) => setData({ ...data, cta: { ...data.cta, description: v } })} textarea />
          <Field label="Button Text" value={data.cta.buttonText} onChange={(v) => setData({ ...data, cta: { ...data.cta, buttonText: v } })} />
          <Field label="Button Link" value={data.cta.buttonLink} onChange={(v) => setData({ ...data, cta: { ...data.cta, buttonLink: v } })} />
          <ImageUploader label="Background Image" value={data.cta.image} onChange={(v) => setData({ ...data, cta: { ...data.cta, image: v } })} />
          <Field label="Image Alt Text (SEO)" value={data.cta.imageAlt} onChange={(v) => setData({ ...data, cta: { ...data.cta, imageAlt: v } })} maxLength={255} />
        </CollapsibleSection>

        {/* Search Links Section */}
        <CollapsibleSection title="5 — Search Links Section" id="search" isOpen={openSection === 'search'} onToggle={() => setOpenSection(openSection === 'search' ? '' : 'search')}>
          <Field label="Title" value={data.search.title} onChange={(v) => setData({ ...data, search: { ...data.search, title: v } })} />
          <Field label="Description" value={data.search.description} onChange={(v) => setData({ ...data, search: { ...data.search, description: v } })} textarea />
          <div>
            <h4 className="text-sm font-semibold text-slate-600 mb-3">Columns</h4>
            {data.search.columns.map((col, ci) => (
              <div key={ci} className="border border-slate-200 rounded-xl p-4 mb-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">Column {ci + 1}</span>
                  <button onClick={() => {
                    const arr = [...data.search.columns];
                    arr.splice(ci, 1);
                    setData({ ...data, search: { ...data.search, columns: arr } });
                  }} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                </div>
                <input placeholder="Column Title" value={col.title} onChange={(e) => {
                  const arr = [...data.search.columns];
                  arr[ci] = { ...arr[ci], title: e.target.value };
                  setData({ ...data, search: { ...data.search, columns: arr } });
                }} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                <div>
                  <h5 className="text-xs font-semibold text-slate-500 mb-2">Links</h5>
                  {col.links.map((link, li) => (
                    <div key={li} className="flex gap-2 mb-2">
                      <input placeholder="Text" value={link.text} onChange={(e) => {
                        const arr = [...data.search.columns];
                        arr[ci] = { ...arr[ci], links: arr[ci].links.map((l, idx) => idx === li ? { ...l, text: e.target.value } : l) };
                        setData({ ...data, search: { ...data.search, columns: arr } });
                      }} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                      <input placeholder="URL" value={link.url} onChange={(e) => {
                        const arr = [...data.search.columns];
                        arr[ci] = { ...arr[ci], links: arr[ci].links.map((l, idx) => idx === li ? { ...l, url: e.target.value } : l) };
                        setData({ ...data, search: { ...data.search, columns: arr } });
                      }} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                      <button onClick={() => {
                        const arr = [...data.search.columns];
                        arr[ci] = { ...arr[ci], links: arr[ci].links.filter((_, idx) => idx !== li) };
                        setData({ ...data, search: { ...data.search, columns: arr } });
                      }} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </div>
                  ))}
                  <button onClick={() => {
                    const arr = [...data.search.columns];
                    arr[ci] = { ...arr[ci], links: [...arr[ci].links, { text: '', url: '' }] };
                    setData({ ...data, search: { ...data.search, columns: arr } });
                  }} className="text-sm text-[#0f51ec] font-semibold hover:underline">+ Add Link</button>
                </div>
              </div>
            ))}
            <button onClick={() => setData({ ...data, search: { ...data.search, columns: [...data.search.columns, { title: '', links: [{ text: '', url: '' }] }] } })} className="text-sm text-[#0f51ec] font-semibold hover:underline">
              <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Column
            </button>
          </div>
        </CollapsibleSection>
      </div>

      <div className="mt-8">
        <SaveButton onClick={save} saving={saving} />
      </div>
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
      className="inline-flex items-center gap-2 bg-[#0f51ec] text-white px-6 py-2.5 rounded-full font-semibold hover:bg-[#0d44c9] transition-colors disabled:opacity-50">
      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
      Save Search Settings
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
