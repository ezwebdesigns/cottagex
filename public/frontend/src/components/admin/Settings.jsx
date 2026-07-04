// Settings - paste from Base44
// Paste your Base44 code here.
import React, { useState } from 'react';
import { Save, Upload, Plus, Trash2, Mountain } from 'lucide-react';

const navItems = ['Explore', 'Ontario', 'Guides', 'Destinations', 'About', 'Contact'];
const footerLinks = ['Terms', 'Privacy', 'Cookies', 'About', 'Contact'];

export default function Settings() {
  const [nav, setNav] = useState(navItems);
  const [footer, setFooter] = useState(footerLinks);
  const [newNavItem, setNewNavItem] = useState('');
  const [newFooterItem, setNewFooterItem] = useState('');

  return (
    <div className="max-w-2xl space-y-6">
      {/* Logo & Favicon */}
      <div className="p-5 rounded-2xl bg-white border border-slate-100">
        <h3 className="text-sm font-bold text-[#191e3b] mb-4">Branding</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 block">Logo</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-[#0f51ec] flex items-center justify-center">
                <Mountain className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-200 text-xs font-semibold text-[#191e3b] hover:bg-slate-50 transition-colors">
                <Upload className="w-3.5 h-3.5" /> Upload
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 block">Favicon</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                <img src="https://base44.com/logo_v2.svg" alt="favicon" className="w-8 h-8" />
              </div>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-200 text-xs font-semibold text-[#191e3b] hover:bg-slate-50 transition-colors">
                <Upload className="w-3.5 h-3.5" /> Upload
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-5 rounded-2xl bg-white border border-slate-100">
        <h3 className="text-sm font-bold text-[#191e3b] mb-4">Navigation Menu</h3>
        <div className="space-y-2 mb-3">
          {nav.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="flex-1 px-3 py-2 rounded-xl bg-slate-50 text-sm font-medium text-[#191e3b]">{item}</span>
              <button onClick={() => setNav(prev => prev.filter((_, idx) => idx !== i))} className="w-9 h-9 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors">
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newNavItem}
            onChange={(e) => setNewNavItem(e.target.value)}
            placeholder="Add nav item..."
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f51ec]"
            onKeyDown={(e) => { if (e.key === 'Enter' && newNavItem.trim()) { setNav(prev => [...prev, newNavItem.trim()]); setNewNavItem(''); } }}
          />
          <button onClick={() => { if (newNavItem.trim()) { setNav(prev => [...prev, newNavItem.trim()]); setNewNavItem(''); } }} className="w-9 h-9 rounded-full bg-[#0f51ec] text-white flex items-center justify-center hover:bg-[#0d44c9] transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-5 rounded-2xl bg-white border border-slate-100">
        <h3 className="text-sm font-bold text-[#191e3b] mb-4">Footer Links</h3>
        <div className="space-y-2 mb-3">
          {footer.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="flex-1 px-3 py-2 rounded-xl bg-slate-50 text-sm font-medium text-[#191e3b]">{item}</span>
              <button onClick={() => setFooter(prev => prev.filter((_, idx) => idx !== i))} className="w-9 h-9 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors">
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newFooterItem}
            onChange={(e) => setNewFooterItem(e.target.value)}
            placeholder="Add footer link..."
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f51ec]"
            onKeyDown={(e) => { if (e.key === 'Enter' && newFooterItem.trim()) { setFooter(prev => [...prev, newFooterItem.trim()]); setNewFooterItem(''); } }}
          />
          <button onClick={() => { if (newFooterItem.trim()) { setFooter(prev => [...prev, newFooterItem.trim()]); setNewFooterItem(''); } }} className="w-9 h-9 rounded-full bg-[#0f51ec] text-white flex items-center justify-center hover:bg-[#0d44c9] transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Save */}
      <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0f51ec] text-white text-sm font-semibold hover:bg-[#0d44c9] transition-colors">
        <Save className="w-4 h-4" /> Save Settings
      </button>
    </div>
  );
}