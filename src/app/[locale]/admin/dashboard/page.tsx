'use client';

import { useRouter } from 'next/navigation';
import { Home, FileText, MapPin, Mail, TrendingUp, Eye, Heart, MousePointerClick } from 'lucide-react';

const stats = [
  { label: 'Total Cottages', value: '8', change: '+2', icon: Home, color: 'bg-[#0f51ec]/10 text-[#0f51ec]' },
  { label: 'Articles', value: '4', change: '+1', icon: FileText, color: 'bg-amber-100 text-amber-600' },
  { label: 'Destinations', value: '4', change: '0', icon: MapPin, color: 'bg-green-100 text-green-600' },
  { label: 'Messages', value: '12', change: '+5', icon: Mail, color: 'bg-purple-100 text-purple-600' },
];

const activity = [
  { label: 'Page Views', value: '24.5K', icon: Eye },
  { label: 'Favorites', value: '1,203', icon: Heart },
  { label: 'VRBO Clicks', value: '892', icon: MousePointerClick },
  { label: 'Conversion', value: '3.2%', icon: TrendingUp },
];

export default function AdminDashboardPage() {
  const router = useRouter();

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#191e3b]">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Welcome back — here&apos;s what&apos;s happening</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-[#191e3b]">{stat.value}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-slate-400">{stat.label}</p>
              <span className="text-xs font-semibold text-green-500">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Performance */}
      <div className="p-5 rounded-2xl bg-white border border-slate-100 mb-6">
        <h3 className="text-sm font-bold text-[#191e3b] mb-4">Performance (30 days)</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {activity.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center">
                <item.icon className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#191e3b]">{item.value}</p>
                <p className="text-xs text-slate-400">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { label: 'Add Cottage', href: '/admin/cottages', icon: Home },
          { label: 'Write Article', href: '/admin/articles/new', icon: FileText },
          { label: 'View Messages', href: '/admin/messages', icon: Mail },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => router.push(action.href)}
            className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 hover:border-[#0f51ec] hover:shadow-sm transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0f51ec]/10 flex items-center justify-center">
              <action.icon className="w-5 h-5 text-[#0f51ec]" />
            </div>
            <span className="text-sm font-semibold text-[#191e3b]">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
