'use client';

import { useState, useEffect } from 'react';
import { Upload, Trash2 } from 'lucide-react';

export default function AdminLibraryPage() {
  const [images, setImages] = useState<{ id: string; name: string; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/library')
      .then(r => r.json())
      .then(data => setImages(data.files || []))
      .catch(() => {});
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/admin/library', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        setImages(prev => [{ id: data.image?.id || Date.now().toString(), name: file.name, url: data.image?.url || '' }, ...prev]);
      }
    } finally { setUploading(false); }
  }

  async function remove(id: string) {
    await fetch('/api/admin/library', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setImages(prev => prev.filter(img => img.id !== id));
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 animate-in fade-in duration-200">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0B1B40]">Media Library</h1>
        <label className="bg-[#1F51C6] hover:bg-[#163FA3] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 cursor-pointer transition-colors">
          <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload Image'}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
        {images.map((img) => (
          <div key={img.id} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-200">
            <img src={img.url} alt={img.name} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <button onClick={() => remove(img.id)} className="p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {images.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium mb-2">No images yet</p>
          <p className="text-sm">Upload your first image to get started.</p>
        </div>
      )}
    </div>
  );
}
