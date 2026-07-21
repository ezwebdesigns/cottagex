'use client';

import { useParams } from 'next/navigation';

export default function AdminSearchPage() {
  const { locale } = useParams<{ locale: string }>();

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#191e3b]">Search</h1>
          <p className="text-sm text-slate-400 mt-1">Configure the search results page content</p>
        </div>
      </div>
    </div>
  );
}
