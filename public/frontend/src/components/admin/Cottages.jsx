// Cottages - paste from Base44
// Paste your Base44 code here.
import React, { useState } from 'react';
import { Plus, Search, Star, ExternalLink, Pencil, Trash2, X, Upload } from 'lucide-react';

const initialCottages = [
  { id: 1, name: 'Pinewood Haven', slug: 'pinewood-haven', photo: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=200&q=80', googleLink: 'https://maps.google.com/?q=Muskoka', source: 'VRBO', affiliateUrl: 'https://www.vrbo.com/search?destination=Muskoka', featured: true },
  { id: 2, name: 'Lac Bleu Retreat', slug: 'lac-bleu-retreat', photo: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=200&q=80', googleLink: 'https://maps.google.com/?q=Tremblant', source: 'VRBO', affiliateUrl: 'https://www.vrbo.com/search?destination=Tremblant', featured: false },
  { id: 3, name: 'Eagle Cliff Lodge', slug: 'eagle-cliff-lodge', photo: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=200&q=80', googleLink: 'https://maps.google.com/?q=Banff', source: 'VRBO', affiliateUrl: 'https://www.vrbo.com/search?destination=Banff', featured: true },
  { id: 4, name: 'Cedar Shores Cabin', slug: 'cedar-shores-cabin', photo: 'https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?auto=format&fit=crop&w=200&q=80', googleLink: 'https://maps.google.com/?q=Algonquin', source: 'VRBO', affiliateUrl: 'https://www.vrbo.com/search?destination=Algonquin', featured: false },
  { id: 5, name: 'Northern Lights Chalet', slug: 'northern-lights-chalet', photo: 'https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?auto=format&fit=crop&w=200&q=80', googleLink: 'https://maps.google.com/?q=Whistler', source: 'VRBO', affiliateUrl: 'https://www.vrbo.com/search?destination=Whistler', featured: true },
  { id: 6, name: 'Maple Ridge Lodge', slug: 'maple-ridge-lodge', photo: 'https://images.unsplash.com/photo-1469768411273-917c5c855b87?auto=format&fit=crop&w=200&q=80', googleLink: 'https://maps.google.com/?q=Gatineau', source: 'VRBO', affiliateUrl: 'https://www.vrbo.com/search?destination=Gatineau', featured: false }
];

const emptyForm = { id: null, name: '', slug: '', photo: '', googleLink: '', source: 'VRBO', affiliateUrl: '', featured: false };

export default function Cottages() {
  const [cottages, setCottages] = useState(initialCottages);
  const [search, setSearch] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filtered = cottages.filter(c =>
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.includes(search.toLowerCase())) &&
    (filterFeatured === 'all' || (filterFeatured === 'featured' ? c.featured : !c.featured))
  );

  const openAdd = () => { setForm(emptyForm); setShowModal(true); };
  const openEdit = (c) => { setForm(c); setShowModal(true); };
  const handleSave = (e) => {
    e.preventDefault();
    if (form.id) {
      setCottages(prev => prev.map(c => c.id === form.id ? form : c));
    } else {
      setCottages(prev => [...prev, { ...form, id: Date.now() }]);
    }
    setShowModal(false);
  };
  const handleDelete = (id) => setCottages(prev => prev.filter(c => c.id !== id));
  const slugify = (val) => val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

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
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Source</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Links</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Featured</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <img src={c.photo} alt={c.name} className="w-10 h-10 rounded-xl object-cover" />
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold text-[#191e3b]">{c.name}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <code className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">{c.slug}</code>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="px-2 py-0.5 rounded-full bg-[#77e1fb]/20 text-[#191e3b] text-xs font-semibold">{c.source}</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <div className="flex items-center gap-2">
                    <a href={c.googleLink} target="_blank" rel="noopener noreferrer" className="text-[#0f51ec] hover:underline text-xs">Google</a>
                    <span className="text-slate-300">·</span>
                    <a href={c.affiliateUrl} target="_blank" rel="noopener noreferrer" className="text-[#0f51ec] hover:underline text-xs flex items-center gap-0.5">VRBO <ExternalLink className="w-3 h-3" /></a>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setCottages(prev => prev.map(x => x.id === c.id ? { ...x, featured: !x.featured } : x))}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${c.featured ? 'bg-amber-100' : 'bg-slate-100'}`}
                  >
                    <Star className={`w-4 h-4 ${c.featured ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(c)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                      <Pencil className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
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
              <h2 className="text-lg font-bold text-[#191e3b]">{form.id ? 'Edit Cottage' : 'Add Cottage'}</h2>
              <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center">
                <X className="w-5 h-5 text-[#191e3b]" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Photo */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Photo</label>
                <div className="flex items-center gap-3">
                  {form.photo && <img src={form.photo} alt="" className="w-16 h-16 rounded-2xl object-cover" />}
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
                    onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) || form.slug })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f51ec]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Slug</label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
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
              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-full border border-slate-200 text-sm font-semibold text-[#191e3b] hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-full bg-[#0f51ec] text-white text-sm font-semibold hover:bg-[#0d44c9] transition-colors">
                  {form.id ? 'Save Changes' : 'Add Cottage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}