// Homepage - paste from Base44
// Paste your Base44 code here.
import React, { useState } from 'react';
import { Save, Eye } from 'lucide-react';

export default function Homepage() {
  const [hero, setHero] = useState({
    title: 'Your Wild Canadian Sanctuary',
    subtitle: 'Discover handpicked chalets across Canada\'s most breathtaking landscapes — from misty Laurentian lakes to the rugged peaks of the Rockies.',
    bgImage: 'https://images.unsplash.com/photo-1469768411273-917c5c855b87?auto=format&fit=crop&w=1920&q=80'
  });
  const [sectionTitle, setSectionTitle] = useState('Featured Chalets');
  const [sectionSubtitle, setSectionSubtitle] = useState('Handpicked escapes across the Canadian wilderness');

  return (
    <div className="max-w-2xl space-y-6">
      {/* Hero Section */}
      <div className="p-5 rounded-2xl bg-white border border-slate-100">
        <h3 className="text-sm font-bold text-[#191e3b] mb-4">Hero Section</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Title</label>
            <input
              type="text"
              value={hero.title}
              onChange={(e) => setHero({ ...hero, title: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f51ec]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Subtitle</label>
            <textarea
              value={hero.subtitle}
              onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f51ec] resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Background Image URL</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <img src={hero.bgImage} alt="" className="w-full h-full object-cover" />
              </div>
              <input
                type="url"
                value={hero.bgImage}
                onChange={(e) => setHero({ ...hero, bgImage: e.target.value })}
                className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f51ec]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Properties Section */}
      <div className="p-5 rounded-2xl bg-white border border-slate-100">
        <h3 className="text-sm font-bold text-[#191e3b] mb-4">Properties Section</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Section Title</label>
            <input
              type="text"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f51ec]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Section Subtitle</label>
            <input
              type="text"
              value={sectionSubtitle}
              onChange={(e) => setSectionSubtitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f51ec]"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 text-sm font-semibold text-[#191e3b] hover:bg-slate-50 transition-colors">
          <Eye className="w-4 h-4" /> Preview
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0f51ec] text-white text-sm font-semibold hover:bg-[#0d44c9] transition-colors">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>
    </div>
  );
}