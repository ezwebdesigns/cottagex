// Articles - paste from Base44
// Paste your Base44 code here.
import React, { useState } from 'react';
import { Plus, Search, Pencil, Trash2, Eye } from 'lucide-react';

const initialArticles = [
  { id: 1, title: '10 Best Waterfront Chalets in Ontario', category: 'Ontario', author: 'Émilie Laurent', date: 'Jun 15, 2026', status: 'Published' },
  { id: 2, title: 'The Ultimate Quebec Cottage Guide', category: 'Quebec', author: 'Marc Tremblay', date: 'May 28, 2026', status: 'Published' },
  { id: 3, title: 'Winter Escapes: Alberta\'s Hidden Gems', category: 'Alberta', author: 'Sarah Nakai', date: 'Jun 02, 2026', status: 'Published' },
  { id: 4, title: 'BC\'s Most Secluded A-Frame Cabins', category: 'British Columbia', author: 'Jordan Pike', date: 'Apr 19, 2026', status: 'Draft' }
];

export default function Articles() {
  const [articles, setArticles] = useState(initialArticles);
  const [search, setSearch] = useState('');

  const filtered = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles..." className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0f51ec]" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0f51ec] text-white text-sm font-semibold hover:bg-[#0d44c9] transition-colors min-h-[44px]">
          <Plus className="w-4 h-4" /> New Article
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((a) => (
          <div key={a.id} className="p-5 rounded-2xl bg-white border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 rounded-full bg-[#77e1fb]/20 text-[#191e3b] text-xs font-semibold">{a.category}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${a.status === 'Published' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{a.status}</span>
            </div>
            <h3 className="font-bold text-[#191e3b] text-sm leading-tight mb-2" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{a.title}</h3>
            <p className="text-xs text-slate-400 mb-4">by {a.author} · {a.date}</p>
            <div className="flex items-center gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-[#191e3b] transition-colors">
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
              <button className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                <Pencil className="w-3.5 h-3.5 text-slate-500" />
              </button>
              <button onClick={() => setArticles(prev => prev.filter(x => x.id !== a.id))} className="w-9 h-9 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors">
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}