import { Pool } from 'pg';
import { CottageTable } from './cottage-table';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export type Cottage = {
  property_token: string;
  name: string;
  slug: string;
  source: string;
  google_link: string | null;
  affiliate_url: string | null;
  is_featured: boolean;
  thumbnail: string | null;
};

async function getCottages(): Promise<Cottage[]> {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT property_token, name, slug, source, google_link, affiliate_url, is_featured, thumbnail
       FROM affiliatecottages ORDER BY is_featured DESC, name ASC`
    );
    return rows;
  } finally {
    client.release();
  }
}

export default async function AdminCottagesPage() {
  const cottages = await getCottages();

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-200">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0B1B40]">Cottages</h1>
        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-semibold">
          {cottages.length} total
        </span>
      </div>
      <CottageTable cottages={cottages} />
    </div>
  );
}
