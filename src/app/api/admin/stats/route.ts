import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';
import { getUsageThisMonth } from '@/lib/cache';

/**
 * GET /api/admin/stats — real catalogue counts for the admin dashboard.
 * Counts everything, FR included. `change` = new rows in the last 7 days.
 * Admin-only, low traffic: no cache (always fresh).
 */
export async function GET() {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  try {
    const [cottages, articles, destinations, messages] = await Promise.all([
      db.execute(sql`
        SELECT COUNT(*)::int AS total,
               COUNT(*) FILTER (WHERE available = true)::int AS available,
               COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS new7
        FROM affiliatecottages`),
      // Unique editorial contents: EN base rows only (FR rows are translations).
      db.execute(sql`
        SELECT COUNT(*)::int AS total,
               COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS new7
        FROM articles WHERE is_published = true AND locale = 'en'`),
      // Canonical province destination pages (cottage-country/*) that
      // actually have available cottages.
      db.execute(sql`
        SELECT COUNT(*)::int AS total FROM (VALUES
          ('ontario'), ('quebec'), ('alberta'), ('british-columbia'),
          ('nova-scotia'), ('new-brunswick'), ('manitoba'),
          ('saskatchewan'), ('pei'), ('newfoundland')
        ) AS p(slug)
        WHERE EXISTS (
          SELECT 1 FROM affiliatecottages c
          WHERE c.available = true AND c.province = p.slug
        )`),
      db.execute(sql`
        SELECT COUNT(*)::int AS total,
               COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS new7
        FROM messages`),
    ]);

    const c = cottages.rows[0] as any;
    const a = articles.rows[0] as any;
    const d = destinations.rows[0] as any;
    const m = messages.rows[0] as any;

    return NextResponse.json({
      stats: [
        { key: 'cottages', value: c.available, total: c.total, change: c.new7 },
        { key: 'articles', value: a.total, change: a.new7 },
        { key: 'destinations', value: d.total, change: null },
        { key: 'messages', value: m.total, change: m.new7 },
      ],
      generatedAt: new Date().toISOString(),
      // Upstash ops this month (best-effort gauge, free tier ≈ 500k/mo).
      redisOpsMonth: await getUsageThisMonth(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
