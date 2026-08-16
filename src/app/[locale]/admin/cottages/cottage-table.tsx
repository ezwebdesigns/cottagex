'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Star, ExternalLink, Pencil, Trash2, X, Upload, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { updateCottage } from '@/lib/actions/cottages';
import type { Cottage } from './page';

const emptyForm = { property_token: '', name: '', slug: '', photo: '', googleLink: '', source: 'VRBO', affiliateUrl: '', featured: false, hidden: false };

export function CottageTable({ cottages: initial }: { cottages: Cottage[] }) {
  const [cottages, setCottages] = useState(initial);
  const [search, setSearch] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('all');
  const [filterProvince, setFilterProvince] = useState('all');
  const [filterDestination, setFilterDestination] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState<string | null>(null);
  const [sortProvince, setSortProvince] = useState<'asc' | 'desc' | null>(null);

  const provinceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of cottages) counts[c.province || '(none)'] = (counts[c.province || '(none)'] || 0) + 1;
    return counts;
  }, [cottages]);

  const provinces = useMemo(() => Object.keys(provinceCounts).sort(), [provinceCounts]);

  const destinationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of cottages) {
      if (filterProvince !== 'all' && c.province !== filterProvince) continue;
      counts[c.slug || '(none)'] = (counts[c.slug || '(none)'] || 0) + 1;
    }
    return counts;
  }, [cottages, filterProvince]);

  const destinations = useMemo(() => Object.keys(destinationCounts).sort(), [destinationCounts]);

  const filtered = cottages.filter(c =>
    (c.name?.toLowerCase()?.includes(search.toLowerCase()) ||
     c.slug?.includes(search.toLowerCase()) ||
     (Array.isArray(c.amenities) && c.amenities.some(a => a.toLowerCase().includes(search.toLowerCase())))) &&
    (filterFeatured === 'all' || (filterFeatured === 'featured' ? c.is_featured : !c.is_featured)) &&
    (filterProvince === 'all' || c.province === filterProvince) &&
    (filterDestination === 'all' || c.slug === filterDestination)
  );

  const sorted = sortProvince
    ? [...filtered].sort((a, b) =>
        sortProvince === 'asc'
          ? a.province.localeCompare(b.province)
          : b.province.localeCompare(a.province))
    : filtered;

  const openAdd = () => { setForm(emptyForm); setShowModal(true); };
  const openEdit = (c: Cottage) => {
    setForm({
      property_token: c.property_token,
      name: c.name || '',
      slug: c.slug || '',
      photo: c.thumbnail || '',
      googleLink: c.google_link || '',
      source: c.source || 'VRBO',
      affiliateUrl: c.affiliate_url || '',
      featured: c.is_featured,
      hidden: c.is_hidden,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.property_token) return;
    setSaving(form.property_token);
    const res = await updateCottage(form.property_token, {
      affiliate_url: form.affiliateUrl || null,
      is_featured: form.featured,
      is_hidden: form.hidden,
    });
    setSaving(null);
    if (!res.success) alert('Error: ' + res.error);
    setCottages(prev => prev.map(c => c.property_token === form.property_token ? {
      ...c,
      affiliate_url: form.affiliateUrl || null,
      is_featured: form.featured,
      is_hidden: form.hidden,
      thumbnail: form.photo || c.thumbnail,
      google_link: form.googleLink || c.google_link,
    } : c));
    setShowModal(false);
  };

  const toggleFeatured = async (c: Cottage) => {
    setCottages(prev => prev.map(x => x.property_token === c.property_token ? { ...x, is_featured: !x.is_featured } : x));
    await updateCottage(c.property_token, { is_featured: !c.is_featured, affiliate_url: c.affiliate_url });
  };

  const toggleHidden = async (c: Cottage) => {
    setCottages(prev => prev.map(x => x.property_token === c.property_token ? { ...x, is_hidden: !x.is_hidden } : x));
    await updateCottage(c.property_token, { is_hidden: !c.is_hidden });
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cottages..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0f51ec]"
          />
        </div>
        <select
          value={filterFeatured}
          onChange={(e) => setFilterFeatured(e.target.value)}
          className="px-4 py-2.5 rounded-full border border-slate-200 bg-white text-sm font-medium text-[#191e3b] focus:outline-none focus:ring-2 focus:ring-[#0f51ec]"
        >
          <option value="all">All</option>
          <option value="featured">Featured</option>
          <option value="standard">Standard</option>
        </select>
        <select
          value={filterProvince}
          onChange={(e) => { setFilterProvince(e.target.value); setFilterDestination('all'); }}
          className="px-4 py-2.5 rounded-full border border-slate-200 bg-white text-sm font-medium text-[#191e3b] focus:outline-none focus:ring-2 focus:ring-[#0f51ec]"
        >
          <option value="all">All Provinces ({cottages.length})</option>
          {provinces.map(p => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)} ({provinceCounts[p]})</option>
          ))}
        </select>
        <select
          value={filterDestination}
          onChange={(e) => setFilterDestination(e.target.value)}
          className="px-4 py-2.5 rounded-full border border-slate-200 bg-white text-sm font-medium text-[#191e3b] focus:outline-none focus:ring-2 focus:ring-[#0f51ec]"
        >
          <option value="all">All Destinations ({destinations.length})</option>
          {destinations.map(d => (
            <option key={d} value={d}>{d} ({destinationCounts[d]})</option>
          ))}
        </select>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0f51ec] text-white text-sm font-semibold hover:bg-[#0d44c9] transition-colors min-h-[44px]">
          <Plus className="w-4 h-4" /> Add Cottage
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Photo</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Slug</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell cursor-pointer select-none" onClick={() => setSortProvince(sp => sp === 'asc' ? 'desc' : sp === 'desc' ? null : 'asc')}>
                <span className="flex items-center gap-1">Province {sortProvince === 'asc' ? <ChevronUp className="w-3 h-3" /> : sortProvince === 'desc' ? <ChevronDown className="w-3 h-3" /> : null}</span>
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Source</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Links</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Featured</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => (
              <tr key={c.property_token} className={`border-b border-slate-50 transition-colors ${c.is_hidden ? 'opacity-50 hover:opacity-70' : 'hover:bg-slate-50/50'}`}>
                <td className="px-4 py-3">
                  {c.thumbnail ? (
                    <img src={c.thumbnail} alt={c.name || ''} className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-slate-100" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#191e3b]">{c.name}</span>
                    {c.is_hidden && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wide">Hidden</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <code className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">{c.slug}</code>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-xs text-slate-600 capitalize">{c.province}</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="px-2 py-0.5 rounded-full bg-[#77e1fb]/20 text-[#191e3b] text-xs font-semibold">{c.source}</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <div className="flex items-center gap-2">
                    {c.google_link ? (
                      <a href={c.google_link} target="_blank" rel="noopener noreferrer" className="text-[#0f51ec] hover:underline text-xs">Google</a>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                    <span className="text-slate-300">·</span>
                    {c.affiliate_url ? (
                      <a href={c.affiliate_url} target="_blank" rel="noopener noreferrer" className="text-[#0f51ec] hover:underline text-xs flex items-center gap-0.5">
                        VRBO <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleFeatured(c)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${c.is_featured ? 'bg-amber-100' : 'bg-slate-100'}`}
                  >
                    <Star className={`w-4 h-4 ${c.is_featured ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleHidden(c)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${c.is_hidden ? 'bg-slate-200' : 'bg-slate-100'}`}
                    title={c.is_hidden ? 'Show on website' : 'Hide from website'}
                  >
                    {c.is_hidden ? (
                      <EyeOff className="w-4 h-4 text-slate-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(c)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                      <Pencil className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-[2rem] w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-[2rem]">
              <h2 className="text-lg font-bold text-[#191e3b]">Edit Cottage</h2>
              <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center">
                <X className="w-5 h-5 text-[#191e3b]" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Photo */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Photo</label>
                <div className="flex items-center gap-3">
                  {form.photo ? (
                    <img src={form.photo} alt="" className="w-16 h-16 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-100" />
                  )}
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="url"
                      value={form.photo}
                      onChange={(e) => setForm({ ...form, photo: e.target.value })}
                      placeholder="https://..."
                      className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f51ec]"
                    />
                    <button type="button" className="px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm flex items-center gap-1">
                      <Upload className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>
              </div>
              {/* Name + Slug */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f51ec]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Slug</label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f51ec]"
                  />
                </div>
              </div>
              {/* Google Link */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Google Link</label>
                <input
                  type="url"
                  value={form.googleLink}
                  onChange={(e) => setForm({ ...form, googleLink: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f51ec]"
                />
              </div>
              {/* Source + Affiliate URL */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Source</label>
                  <select
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f51ec]"
                  >
                    <option>VRBO</option>
                    <option>Booking.com</option>
                    <option>Airbnb</option>
                    <option>Direct</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Affiliate URL</label>
                  <input
                    type="url"
                    value={form.affiliateUrl}
                    onChange={(e) => setForm({ ...form, affiliateUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f51ec]"
                  />
                </div>
              </div>
              {/* Featured */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#0f51ec]"
                />
                <span className="text-sm text-[#191e3b]">Featured cottage</span>
              </label>
              {/* Hidden */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hidden}
                  onChange={(e) => setForm({ ...form, hidden: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#0f51ec]"
                />
                <span className="text-sm text-[#191e3b]">Hide from website</span>
              </label>
              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-full border border-slate-200 text-sm font-semibold text-[#191e3b] hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving === form.property_token} className="flex-1 py-2.5 rounded-full bg-[#0f51ec] text-white text-sm font-semibold hover:bg-[#0d44c9] transition-colors disabled:opacity-50">
                  {saving === form.property_token ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
