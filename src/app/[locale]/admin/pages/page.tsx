'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Globe, Eye } from 'lucide-react';

export default function AdminPagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/pages').then(r => r.json()).then(d => setPages((d.pages || []).filter((p: any) => p.template !== 'location')));
  }, []);

  async function remove(id: string) {
    if (!confirm('Delete this page?')) return;
    await fetch(`/api/admin/pages/${id}`, { method: 'DELETE' });
    setPages(pages.filter(p => p.id !== id));
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#191e3b]">Pages</h1>
        <button onClick={() => router.push('/admin/pages/new')} className="bg-[#0f51ec] hover:bg-[#0d44c9] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Create New Page
        </button>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {pages.length === 0 ? (
          <p className="p-6 text-slate-500 text-sm">No pages yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500 font-medium">
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-4 font-medium text-[#191e3b]">{page.title}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${page.isPublished ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {page.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => window.open(`/${page.slug}?preview=true`, '_blank')} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><Eye className="w-4 h-4 text-slate-400" /></button>
                      <button onClick={() => router.push(`/admin/pages/${page.id}/edit`)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><Edit className="w-4 h-4 text-slate-500" /></button>
                      <button onClick={() => remove(page.id)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
