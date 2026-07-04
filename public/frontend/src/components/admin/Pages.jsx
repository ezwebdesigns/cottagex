// Pages - paste from Base44
// Paste your Base44 code here.
import React from 'react';
import { Pencil, Eye, FileText } from 'lucide-react';

const pages = [
  { id: 1, title: 'Terms & Affiliate Disclosure', slug: '/terms', status: 'Published', updated: 'Jul 01, 2026' },
  { id: 2, title: 'Privacy Policy', slug: '/privacy', status: 'Published', updated: 'Jul 01, 2026' },
  { id: 3, title: 'About Cottagex', slug: '/about', status: 'Draft', updated: 'Jun 20, 2026' },
  { id: 4, title: 'Cookie Policy', slug: '/cookies', status: 'Draft', updated: 'Jun 15, 2026' }
];

export default function Pages() {
  return (
    <div>
      <div className="space-y-3">
        {pages.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#0f51ec]/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-[#0f51ec]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-[#191e3b] truncate" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{p.title}</h3>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <code className="bg-slate-50 px-1.5 py-0.5 rounded">{p.slug}</code>
                <span>Updated {p.updated}</span>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.status === 'Published' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{p.status}</span>
            <div className="flex items-center gap-1">
              <button className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                <Eye className="w-4 h-4 text-slate-500" />
              </button>
              <button className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                <Pencil className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}