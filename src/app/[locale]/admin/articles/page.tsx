'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Eye, FileText } from 'lucide-react';

type Post = { id: string; title: string; slug: string; excerpt: string; category: string; featuredImage: string; isPublished: boolean };

export default function AdminArticlesPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);

  async function load() {
    try {
      const res = await fetch('/api/admin/articles');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch { setPosts([]); }
  }

  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm('Delete this article?')) return;
    await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0B1B40]">Articles</h1>
        <button onClick={() => router.push('/admin/articles/new')} className="bg-[#1F51C6] hover:bg-[#163FA3] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 transition-colors">
          <Plus className="w-4 h-4" /> Create New Article
        </button>
      </div>
      <div className="space-y-3">
        {posts.length === 0 ? (
          <p className="text-gray-500 text-sm bg-white border border-gray-200 rounded-3xl p-6">No articles yet.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white border border-gray-200 rounded-3xl p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                {post.featuredImage ? (
                  <img src={post.featuredImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><FileText className="w-6 h-6 text-gray-400" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[#0B1B40] truncate">{post.title}</div>
                <div className="text-sm text-gray-500 truncate">{post.excerpt || 'No excerpt'}</div>
                <div className="text-xs text-gray-400 mt-0.5">{post.category || 'Uncategorized'}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${post.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {post.isPublished ? 'Published' : 'Draft'}
                </span>
                {post.slug && <a href={`/guides/${post.slug}?preview=true`} target="_blank" className="p-1.5 text-gray-400 hover:text-gray-600"><Eye className="w-4 h-4" /></a>}
                <button onClick={() => router.push(`/admin/articles/${post.id}/edit`)} className="p-1.5 text-gray-400 hover:text-[#1F51C6]"><Edit className="w-4 h-4" /></button>
                <button onClick={() => remove(post.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
