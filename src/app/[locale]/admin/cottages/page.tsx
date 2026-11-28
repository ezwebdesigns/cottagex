import { Pool } from 'pg';
import { CottageTable } from './cottage-table';

const connectionString = process.env.DATABASE_URL;
// Local Supabase has no SSL; remote DBs require it.
const isLocalDb = /localhost|127\.0\.0\.1/.test(connectionString || '');
const pool = new Pool({
  connectionString,
  ...(isLocalDb ? {} : { ssl: { rejectUnauthorized: false } }),
});

export type Cottage = {
  property_token: string;
  name: string;
  slug: string;
  province: string;
  source: string;
  google_link: string | null;
  affiliate_url: string | null;
  is_featured: boolean;
  is_hidden: boolean;
  available: boolean;
  last_synced: string | null;
  last_pinged: string | null;
  last_ping_status: number | null;
  absence_count: number;
  availability_reason: string | null;
  thumbnail: string | null;
  ota_links: unknown;
  amenities: string[];
};

async function getCottages(): Promise<Cottage[]> {
  try {
    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `SELECT property_token, name, slug, province, source, google_link, affiliate_url, is_featured, is_hidden, available, last_synced, last_pinged, last_ping_status, absence_count, availability_reason, thumbnail, ota_links, amenities
         FROM affiliatecottages ORDER BY is_featured DESC, name ASC`
      );
      return rows;
    } finally {
      client.release();
    }
  } catch (e) {
    console.error('Admin cottages query failed:', e);
    return [];
  }
}

export default async function AdminCottagesPage() {
  const cottages = await getCottages();

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-200">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0B1B40]">Cottages</h1>
        <p className="mt-1 text-sm text-gray-500">Manage catalogue, availability and featured listings</p>
      </div>
      <CottageTable cottages={cottages} />
    </div>
  );
}
