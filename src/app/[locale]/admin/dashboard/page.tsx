'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home, FileText, MapPin, Mail, Eye, Users, Activity, TrendingDown,
} from 'lucide-react';

type StatItem = { key: string; value: number; total?: number; change: number | null };
type Analytics = {
  pageViews: { value: number; change: number | null };
  visitors: { value: number; change: number | null };
  sessions: { value: number; change: number | null };
  bounceRate: { value: number; change: number | null };
};

const STAT_META: Record<string, { label: string; icon: any; color: string }> = {
  cottages: { label: 'Total Cottages', icon: Home, color: 'bg-[#0f51ec]/10 text-[#0f51ec]' },
  articles: { label: 'Articles', icon: FileText, color: 'bg-amber-100 text-amber-600' },
  destinations: { label: 'Destinations', icon: MapPin, color: 'bg-green-100 text-green-600' },
  messages: { label: 'Messages', icon: Mail, color: 'bg-purple-100 text-purple-600' },
};

function ChangeBadge({ change, invert }: { change: number | null; invert?: boolean }) {
  if (change == null) return null;
  const good = invert ? change <= 0 : change >= 0;
  return (
    <span className={`text-xs font-semibold ${good ? 'text-green-500' : 'text-red-500'}`}>
      {change > 0 ? `+${change}` : change}{typeof change === 'number' && Number.isInteger(change) ? '' : '%'}
    </span>
  );
}

function SkeletonCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-slate-100 mb-3" />
          <div className="h-7 w-16 bg-slate-100 rounded mb-2" />
          <div className="h-3 w-24 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StatItem[] | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [redisOps, setRedisOps] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'Failed to load stats');
        setStats(j.stats);
        if (typeof j.redisOpsMonth === 'number') setRedisOps(j.redisOpsMonth);
      })
      .catch((e) => setStatsError(e.message));
    fetch('/api/admin/analytics')
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'Analytics unavailable');
        setAnalytics(j);
      })
      .catch((e) => setAnalyticsError(e.message));
  }, []);

  const activity = analytics
    ? [
        { label: 'Page Views', value: analytics.pageViews.value.toLocaleString(), change: analytics.pageViews.change, icon: Eye, invert: false },
        { label: 'Visitors', value: analytics.visitors.value.toLocaleString(), change: analytics.visitors.change, icon: Users, invert: false },
        { label: 'Sessions', value: analytics.sessions.value.toLocaleString(), change: analytics.sessions.change, icon: Activity, invert: false },
        { label: 'Bounce Rate', value: `${analytics.bounceRate.value}%`, change: analytics.bounceRate.change, icon: TrendingDown, invert: true },
      ]
    : [];

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#191e3b]">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Welcome back — here&apos;s what&apos;s happening</p>
      </div>

      {/* Stats grid — real catalogue counts */}
      {statsError ? (
        <p className="text-sm text-red-500 mb-6">Stats unavailable: {statsError}</p>
      ) : !stats ? (
        <SkeletonCards />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {stats.map((stat) => {
            const meta = STAT_META[stat.key] || STAT_META.cottages;
            const Icon = meta.icon;
            return (
              <div key={stat.key} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100">
                <div className={`w-10 h-10 rounded-xl ${meta.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-[#191e3b]">{stat.value.toLocaleString()}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-slate-400">{meta.label}</p>
                  <ChangeBadge change={stat.change} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upstash usage gauge (best-effort, free tier ≈ 500k ops/mo) */}
      {redisOps != null && (
        <p className="text-xs text-slate-400 mb-6 -mt-3">
          Redis ops this month: {redisOps.toLocaleString()} (~{Math.round((redisOps / 500000) * 1000) / 10}% of free tier)
        </p>
      )}

      {/* Performance — real GA4 traffic, 30d vs previous 30d */}
      <div className="p-5 rounded-2xl bg-white border border-slate-100 mb-6">
        <h3 className="text-sm font-bold text-[#191e3b] mb-4">Performance (30 days)</h3>
        {analyticsError ? (
          <p className="text-sm text-slate-400">
            Analytics unavailable{analyticsError ? `: ${analyticsError}` : ''}. Check GA setup to enable traffic stats.
          </p>
        ) : !analytics ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100" />
                <div>
                  <div className="h-5 w-16 bg-slate-100 rounded mb-1" />
                  <div className="h-3 w-20 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {activity.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#191e3b]">
                      {item.value}{' '}
                      <ChangeBadge change={item.change} invert={item.invert} />
                    </p>
                    <p className="text-xs text-slate-400">{item.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
