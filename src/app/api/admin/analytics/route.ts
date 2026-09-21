import { NextResponse } from 'next/server';
import { JWT } from 'google-auth-library';
import { requireAuth } from '@/lib/api-auth';

/**
 * GET /api/admin/analytics — GA4 traffic for the admin dashboard (30 days
 * vs previous 30 days). Requires:
 *   GA_PROPERTY_ID, GA_CLIENT_EMAIL (the SERVICE ACCOUNT email),
 *   GA_PRIVATE_KEY (\\n-escaped, set by the operator — never committed).
 * The service account must be added as Viewer on the GA4 property, or the
 * API returns 403 (surfaced as a clear message, not a crash).
 */
export async function GET() {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const propertyId = process.env.GA_PROPERTY_ID;
  const clientEmail = process.env.GA_CLIENT_EMAIL;
  const privateKey = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const missing = [
    !propertyId && 'GA_PROPERTY_ID',
    !clientEmail && 'GA_CLIENT_EMAIL',
    !privateKey && 'GA_PRIVATE_KEY',
  ].filter(Boolean);
  if (missing.length) {
    return NextResponse.json(
      { error: `Analytics not configured (missing: ${missing.join(', ')})` },
      { status: 503 },
    );
  }
  if (!clientEmail!.includes('gserviceaccount.com')) {
    return NextResponse.json(
      { error: 'GA_CLIENT_EMAIL must be the service-account email (…@….iam.gserviceaccount.com)' },
      { status: 503 },
    );
  }

  try {
    const jwt = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });
    const { token } = await jwt.getAccessToken();
    if (!token) throw new Error('Could not obtain Google access token');

    const res = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateRanges: [
            { startDate: '30daysAgo', endDate: 'today' },
            { startDate: '60daysAgo', endDate: '30daysAgo' },
          ],
          metrics: [
            { name: 'screenPageViews' },
            { name: 'activeUsers' },
            { name: 'sessions' },
            { name: 'bounceRate' },
          ],
        }),
      },
    );
    if (!res.ok) {
      const text = await res.text();
      let detail = text.slice(0, 300);
      try {
        const j = JSON.parse(text);
        const msg = j?.error?.message;
        if (typeof msg === 'string' && msg.length) detail = msg.slice(0, 300);
      } catch {}
      if (res.status === 403 && /SERVICE_DISABLED|has not been used/i.test(text)) {
        throw new Error(
          'Google Analytics Data API is DISABLED on the GCP project. Enable it in Google Cloud Console → APIs & Services → "Google Analytics Data API", wait a few minutes, then retry.',
        );
      }
      if (res.status === 403) {
        throw new Error(
          'GA4 access denied (403): add this service account as Viewer in GA Admin → Property Access Management.',
        );
      }
      throw new Error(`GA Data API HTTP ${res.status}: ${detail}`);
    }
    const data = await res.json();
    const [cur, prev] = data.rows || [];
    const num = (row: any, i: number) => parseFloat(row?.metricValues?.[i]?.value ?? '0') || 0;
    const pct = (c: number, p: number) =>
      p === 0 ? null : Math.round(((c - p) / p) * 1000) / 10;

    const pageViews = num(cur, 0);
    const visitors = num(cur, 1);
    const sessions = num(cur, 2);
    const bounceRate = num(cur, 3);

    return NextResponse.json({
      pageViews: { value: Math.round(pageViews), change: pct(pageViews, num(prev, 0)) },
      visitors: { value: Math.round(visitors), change: pct(visitors, num(prev, 1)) },
      sessions: { value: Math.round(sessions), change: pct(sessions, num(prev, 2)) },
      bounceRate: { value: Math.round(bounceRate * 10) / 10, change: pct(bounceRate, num(prev, 3)) },
      period: '30d vs previous 30d',
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
