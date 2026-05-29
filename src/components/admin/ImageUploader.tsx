'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

type ImageUploaderProps = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
};

export default function ImageUploader({ value, onChange, label }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
        onChange(data.image?.url || '');
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="flex items-start gap-4">
        <div className="w-24 h-24 rounded-2xl border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
          {value ? (
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-300 text-xs text-center px-2">No image</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="inline-flex items-center gap-1.5 bg-[#1F51C6] hover:bg-[#163FA3] text-white px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-colors">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? 'Uploading...' : 'Upload'}
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
          {value && (
            <button onClick={() => onChange('')} className="text-xs text-red-500 hover:text-red-700 font-medium text-left">
              Remove image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
