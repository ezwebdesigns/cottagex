'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Save, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';

export default function AdminSearchPage() {
  const { locale } = useParams<{ locale: string }>();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string>('hero');

  const [hero, setHero] = useState<any>(null);
  const [categories, setCategories] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [cta, setCta] = useState<any>(null);
  const [faq, setFaq] = useState<any>(null);
  const [inspirations, setInspirations] = useState<any>(null);

  const fetchSection = useCallback(async (section: string) => {
    const res = await fetch(`/api/admin/settings?section=${section}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  }, []);

  useEffect(() => {
    fetchSection('search_hero').then(d => setHero(d ?? { title: '', subtitle: '' }));
    fetchSection('search_categories').then(d => setCategories(d ?? { items: [] }));
    fetchSection('search_results').then(d => setResults(d ?? { title: 'Results', subtitle: 'All locations', sort: 'newest' }));
    fetchSection('search_cta').then(d => setCta(d ?? { title: '', description: '', buttonText: '', buttonLink: '', image: '', imageAlt: '' }));
    fetchSection('search_faq').then(d => setFaq(d ?? { items: [], note: '' }));
    fetchSection('search_inspirations').then(d => setInspirations(d ?? { title: '', items: [] }));
  }, [fetchSection]);

  const saveSection = async (section: string, data: any) => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, data }),
      });
      if (res.ok) {
        setSaved(true);
      } else {
        const err = await res.json().catch(() => ({ error: 'Save failed' }));
        setError(err.error || 'Save failed');
      }
    } catch {
      setError('Network error — check console');
    } finally {
      setSaving(false);
    }
  };

  if (!hero) return <div className="p-10 text-slate-400">Loading...</div>;

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

        {/* 1 — Hero */}
        <CollapsibleSection title="1 — Hero" id="hero" isOpen={openSection === 'hero'} onToggle={() => setOpenSection(openSection === 'hero' ? '' : 'hero')}>
          <Field label="Title" value={hero.title} onChange={(v) => setHero({ ...hero, title: v })} />
          <Field label="Subtitle" value={hero.subtitle} onChange={(v) => setHero({ ...hero, subtitle: v })} textarea />
          <SaveButton onClick={() => saveSection('search_hero', hero)} saving={saving} />
        </CollapsibleSection>

        {/* 2 — Categories */}
        {categories && (
          <CollapsibleSection title="2 — Categories" id="categories" isOpen={openSection === 'categories'} onToggle={() => setOpenSection(openSection === 'categories' ? '' : 'categories')}>
            <p className="text-xs text-slate-400">These categories are independent from the homepage categories.</p>
            <div className="space-y-3">
              {categories.items.map((item: any, i: number) => (
                <div key={i} className="p-3 border border-slate-100 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">Category {i + 1}</span>
                    <button onClick={() => {
                      const newItems = categories.items.filter((_: any, idx: number) => idx !== i);
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
                     {['Sailboat', 'Bath', 'Users', 'Gem', 'PawPrint', 'Kayak', 'Mountain', 'Heart', 'Home', 'Trees', 'TreePine', 'Umbrella', 'Building2', 'Snowflake', 'Waves', 'Footprints', 'Compass', 'MapPin', 'Sunrise'].map(icon => (
                       <option key={icon} value={icon}>{icon}</option>
                     ))}
                   </select>
                   <input placeholder="Link (ex: /en/search/lakefront)" value={item.link} onChange={(e) => {
                     const arr = [...categories.items]; arr[i] = { ...arr[i], link: e.target.value };
                     setCategories({ ...categories, items: arr });
                   }} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                </div>
              ))}
              <button onClick={() => setCategories({ ...categories, items: [...categories.items, { id: '', labelEn: '', labelFr: '', icon: 'Compass', link: '' }] })} className="text-sm text-[#0f51ec] font-semibold hover:underline">
                + Add Category
              </button>
            </div>
            <SaveButton onClick={() => saveSection('search_categories', categories)} saving={saving} />
          </CollapsibleSection>
        )}

        {/* 3 — Results */}
        {results && (
          <CollapsibleSection title="3 — Results" id="results" isOpen={openSection === 'results'} onToggle={() => setOpenSection(openSection === 'results' ? '' : 'results')}>
            <p className="text-xs text-slate-400">Configure the header shown above the cottage grid. The cottage data comes from the database.</p>
            <Field label="Title" value={results.title} onChange={(v) => setResults({ ...results, title: v })} />
            <Field label="Subtitle" value={results.subtitle} onChange={(v) => setResults({ ...results, subtitle: v })} />
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Default Sort</label>
              <select value={results.sort} onChange={(e) => setResults({ ...results, sort: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20">
                <option value="newest">Newest</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
            <SaveButton onClick={() => saveSection('search_results', results)} saving={saving} />
          </CollapsibleSection>
        )}

        {/* 4 — CTA */}
        {cta && (
          <CollapsibleSection title="4 — CTA Section" id="cta" isOpen={openSection === 'cta'} onToggle={() => setOpenSection(openSection === 'cta' ? '' : 'cta')}>
            <p className="text-xs text-slate-400">Content is independent from the destination pages. Title supports line breaks with \n.</p>
            <Field label="Title" value={cta.title} onChange={(v) => setCta({ ...cta, title: v })} />
            <Field label="Description" value={cta.description} onChange={(v) => setCta({ ...cta, description: v })} textarea />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Button Text" value={cta.buttonText} onChange={(v) => setCta({ ...cta, buttonText: v })} />
              <Field label="Button Link" value={cta.buttonLink} onChange={(v) => setCta({ ...cta, buttonLink: v })} />
            </div>
            <ImageUploader label="Image" value={cta.image} onChange={(v) => setCta({ ...cta, image: v })} />
            <Field label="Image Alt Text (SEO)" value={cta.imageAlt} onChange={(v) => setCta({ ...cta, imageAlt: v })} maxLength={255} />
            <SaveButton onClick={() => saveSection('search_cta', cta)} saving={saving} />
          </CollapsibleSection>
        )}

        {/* 5 — FAQ */}
        {faq && (
          <CollapsibleSection title="5 — FAQ" id="faq" isOpen={openSection === 'faq'} onToggle={() => setOpenSection(openSection === 'faq' ? '' : 'faq')}>
            <p className="text-xs text-slate-400">Accordion between CTA and Inspirations. Use {'{location}'} and {'{province}'} placeholders — they are filled from the URL at render time. When no location is set, {'{location}'} falls back to Canada.</p>
            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-3">Right Panel (third column)</h4>
              <Field label="Panel Title (H2)" value={faq.noteTitle} onChange={(v) => setFaq({ ...faq, noteTitle: v })} />
              <Field label="Panel Text" value={faq.note} onChange={(v) => setFaq({ ...faq, note: v })} textarea />
              <div className="grid grid-cols-2 gap-4">
                <ImageUploader label="Logo 1 (VRBO)" value={faq.logo1} onChange={(v) => setFaq({ ...faq, logo1: v })} />
                <ImageUploader label="Logo 2 (Expedia)" value={faq.logo2} onChange={(v) => setFaq({ ...faq, logo2: v })} />
              </div>
              <p className="text-xs text-slate-400">Tertiary-colour #77e1fb panel on the right, centred with logos below the text.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-3">FAQ Items</h4>
              <div className="space-y-3">
                {faq.items.map((item: any, i: number) => (
                  <div key={i} className="p-3 border border-slate-100 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400">Question {i + 1}</span>
                      <button onClick={() => {
                        const newItems = faq.items.filter((_: any, idx: number) => idx !== i);
                        setFaq({ ...faq, items: newItems });
                      }} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                    </div>
                    <input placeholder="Question" value={item.q} onChange={(e) => {
                      const arr = [...faq.items]; arr[i] = { ...arr[i], q: e.target.value };
                      setFaq({ ...faq, items: arr });
                    }} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                    <textarea placeholder="Answer" value={item.a} onChange={(e) => {
                      const arr = [...faq.items]; arr[i] = { ...arr[i], a: e.target.value };
                      setFaq({ ...faq, items: arr });
                    }} rows={3} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                  </div>
                ))}
                <button onClick={() => setFaq({ ...faq, items: [...(faq.items || []), { q: '', a: '' }] })} className="text-sm text-[#0f51ec] font-semibold hover:underline">
                  + Add FAQ Item
                </button>
              </div>
            </div>
            <SaveButton onClick={() => saveSection('search_faq', faq)} saving={saving} />
          </CollapsibleSection>
        )}

        {/* 6 — Inspirations */}
        {inspirations && (
          <CollapsibleSection title="6 — Inspirations" id="inspirations" isOpen={openSection === 'inspirations'} onToggle={() => setOpenSection(openSection === 'inspirations' ? '' : 'inspirations')}>
            <Field label="Title" value={inspirations.title} onChange={(v) => setInspirations({ ...inspirations, title: v })} />
            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-3">Inspiration Items</h4>
              <div className="space-y-3">
                {(inspirations.items ?? []).map((item: any, i: number) => (
                  <div key={i} className="p-3 border border-slate-100 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400">Item {i + 1}</span>
                      <button onClick={() => {
                        const newItems = inspirations.items.filter((_: any, idx: number) => idx !== i);
                        setInspirations({ ...inspirations, items: newItems });
                      }} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                    </div>
                    <input placeholder="City (e.g. Muskoka)" value={item.city} onChange={(e) => {
                      const arr = [...inspirations.items]; arr[i] = { ...arr[i], city: e.target.value };
                      setInspirations({ ...inspirations, items: arr });
                    }} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                    <input placeholder="Category (e.g. Lakefront)" value={item.category} onChange={(e) => {
                      const arr = [...inspirations.items]; arr[i] = { ...arr[i], category: e.target.value };
                      setInspirations({ ...inspirations, items: arr });
                    }} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                    <input placeholder="Tab (used to group items, e.g. Ontario)" value={item.tab} onChange={(e) => {
                      const arr = [...inspirations.items]; arr[i] = { ...arr[i], tab: e.target.value };
                      setInspirations({ ...inspirations, items: arr });
                    }} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                    <input placeholder="Link (e.g. /en/search/muskoka)" value={item.link} onChange={(e) => {
                      const arr = [...inspirations.items]; arr[i] = { ...arr[i], link: e.target.value };
                      setInspirations({ ...inspirations, items: arr });
                    }} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f51ec]/20" />
                  </div>
                ))}
                <button onClick={() => setInspirations({ ...inspirations, items: [...(inspirations.items || []), { city: '', category: '', tab: '', link: '' }] })} className="text-sm text-[#0f51ec] font-semibold hover:underline">
                  + Add Item
                </button>
              </div>
            </div>
            <SaveButton onClick={() => saveSection('search_inspirations', inspirations)} saving={saving} />
          </CollapsibleSection>
        )}

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
