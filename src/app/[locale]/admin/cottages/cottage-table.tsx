'use client';

import { useState } from 'react';
import { updateCottage } from '@/lib/actions/cottages';
import type { Cottage } from './page';

export function CottageTable({ cottages: initial }: { cottages: Cottage[] }) {
  const [cottages, setCottages] = useState(initial);
  const [saving, setSaving] = useState<string | null>(null);

  const save = async (c: Cottage) => {
    setSaving(c.property_token);
    const res = await updateCottage(c.property_token, {
      affiliate_url: c.affiliate_url,
      is_featured: c.is_featured,
    });
    setSaving(null);
    if (!res.success) alert('Error: ' + res.error);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
            <th className="p-4">Photo</th>
            <th className="p-4">Name</th>
            <th className="p-4">Slug</th>
            <th className="p-4">Google Link</th>
            <th className="p-4">Source</th>
            <th className="p-4">Affiliate URL</th>
            <th className="p-4 text-center">Featured</th>
            <th className="p-4"></th>
          </tr>
        </thead>
        <tbody>
          {cottages.map((c) => (
            <tr key={c.property_token} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td className="p-4">
                {c.thumbnail ? (
                  <img src={c.thumbnail} alt="" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gray-100" />
                )}
              </td>
              <td className="p-4 font-medium text-[#0B1B40] max-w-[220px] truncate">{c.name}</td>
              <td className="p-4 text-gray-500">{c.slug}</td>
              <td className="p-4">
                {c.google_link ? (
                  <a href={c.google_link} target="_blank" rel="noopener noreferrer" className="text-[#1F51C6] hover:underline text-xs">
                    Open
                  </a>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
              <td className="p-4">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-600">{c.source}</span>
              </td>
              <td className="p-4">
                <input
                  type="text"
                  value={c.affiliate_url || ''}
                  onChange={(e) =>
                    setCottages((prev) =>
                      prev.map((x) =>
                        x.property_token === c.property_token ? { ...x, affiliate_url: e.target.value || null } : x
                      )
                    )
                  }
                  placeholder="https://..."
                  className="w-44 px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1F51C6]/20"
                />
              </td>
              <td className="p-4 text-center">
                <button
                  onClick={() =>
                    setCottages((prev) =>
                      prev.map((x) =>
                        x.property_token === c.property_token ? { ...x, is_featured: !x.is_featured } : x
                      )
                    )
                  }
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    c.is_featured ? 'bg-[#1F51C6]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      c.is_featured ? 'translate-x-[18px]' : 'translate-x-[2px]'
                    }`}
                  />
                </button>
              </td>
              <td className="p-4">
                <button
                  onClick={() => save(c)}
                  disabled={saving === c.property_token}
                  className="bg-[#1F51C6] hover:bg-[#163FA3] disabled:opacity-50 text-white px-4 py-1.5 rounded-full text-xs font-semibold transition-colors"
                >
                  {saving === c.property_token ? '...' : 'Save'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
