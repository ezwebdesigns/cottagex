// AdminSidebar - paste from Base44
// Paste your Base44 code here.
import React from 'react';
import { LayoutDashboard, Home, FileText, MapPin, Layout, Mail, Settings, ArrowLeft, Mountain } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

export default function AdminSidebar({ activeSection, onNavigate, onBackToSite }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'cottages', label: 'Cottages', icon: Home },
    { id: 'articles', label: 'Articles', icon: FileText },
    { id: 'destinations', label: 'Destinations', icon: MapPin },
    { id: 'pages', label: 'Pages', icon: FileText },
    { id: 'homepage', label: 'Homepage', icon: Layout },
    { id: 'messages', label: 'Messages', icon: Mail },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="flex flex-col sticky top-0 h-screen bg-white border-r border-slate-100 flex-shrink-0 w-60 z-40">
      {/* Logo */}
      <div className="border-b border-slate-100 flex items-center h-16 sm:h-20 px-5 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#0f51ec] flex items-center justify-center">
            <Mountain className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-[#191e3b]" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
            Cottage<span className="text-[#0f51ec]">x</span>
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Admin</p>
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl font-medium text-sm transition-colors min-h-[44px] ${
                  isActive ? 'bg-[#0f51ec]/10 text-[#0f51ec]' : 'text-[#191e3b] hover:bg-slate-50'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Back to site */}
      <div className="border-t border-slate-100 px-3 py-3 flex-shrink-0">
        <button
          onClick={onBackToSite}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors min-h-[44px] text-sm font-medium text-[#191e3b]"
        >
          <ArrowLeft className="w-5 h-5 flex-shrink-0" />
          Back to site
        </button>
      </div>
    </aside>
  );
}