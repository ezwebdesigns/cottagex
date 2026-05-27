'use client';

import { Eye, ExternalLink, TrendingUp, Star, Mail, Lock } from 'lucide-react';
import { initialProperties, initialArticles } from '@/lib/mock-data';

export default function AdminDashboardPage() {
  const properties = initialProperties;
  const articles = initialArticles;

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0B1B40] flex items-center gap-2">
            <Lock size={24} className="text-[#1F51C6]" /> Performance & Affiliate Analytics
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs px-3 py-1.5 rounded-full font-bold">
          <TrendingUp size={16} /> Estimated Earnings: +$1,420 USD
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Traffic</p>
              <h3 className="text-2xl font-black text-[#0B1B40] mt-1">14,280</h3>
              <span className="text-xs text-emerald-600 font-bold">↑ 12% vs last month</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1F51C6]">
              <Eye size={22} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">VRBO Affiliate Leads</p>
              <h3 className="text-2xl font-black text-[#0B1B40] mt-1">3,890</h3>
              <span className="text-xs text-emerald-600 font-bold">↑ 8.3% click conversion</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1F51C6]">
              <ExternalLink size={22} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Listicle Engagements</p>
              <h3 className="text-2xl font-black text-[#0B1B40] mt-1">1,120</h3>
              <span className="text-xs text-[#1F51C6] font-bold">60% of all clicks</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-600">
              <Star size={22} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Properties</p>
              <h3 className="text-2xl font-black text-[#0B1B40] mt-1">{properties.length}</h3>
              <span className="text-xs text-slate-400">Active listings</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
              <Mail size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="font-bold text-[#0B1B40] text-lg mb-4">Affiliate Click Trend Volume</h3>
          <div className="h-48 flex items-end gap-2 pt-6">
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-[#1F51C6]/10 h-16 rounded-t-lg relative hover:bg-[#1F51C6]/20 transition-all"></div>
              <span className="text-xs text-slate-400">Feb</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-[#1F51C6]/10 h-24 rounded-t-lg relative hover:bg-[#1F51C6]/20 transition-all"></div>
              <span className="text-xs text-slate-400">Mar</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-[#1F51C6]/10 h-32 rounded-t-lg relative hover:bg-[#1F51C6]/20 transition-all"></div>
              <span className="text-xs text-slate-400">Apr</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-[#1F51C6] h-44 rounded-t-lg relative"></div>
              <span className="text-xs font-bold text-[#1F51C6]">May</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
