'use server';

import { revalidatePath } from 'next/cache';
import { Pool } from 'pg';
import { invalidateCottages } from '@/lib/cache';

const connectionString = process.env.DATABASE_URL;
// Local Supabase has no SSL; remote DBs (Supabase Cloud/Neon) require it.
const isLocalDb = /localhost|127\.0\.0\.1/.test(connectionString || '');
const pool = new Pool({
  connectionString,
  ...(isLocalDb ? {} : { ssl: { rejectUnauthorized: false } }),
});

export async function updateCottage(
  propertyToken: string,
  data: { affiliate_url?: string | null; is_featured?: boolean; is_hidden?: boolean }
) {
  const client = await pool.connect();
  try {
    const sets: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (data.affiliate_url !== undefined) {
      sets.push(`affiliate_url = $${i++}`);
      values.push(data.affiliate_url);
    }
    if (data.is_featured !== undefined) {
      sets.push(`is_featured = $${i++}`);
      values.push(data.is_featured);
    }
    if (data.is_hidden !== undefined) {
      sets.push(`is_hidden = $${i++}`);
      values.push(data.is_hidden);
    }

    if (sets.length === 0) return { success: false, error: 'No fields to update' };

    values.push(propertyToken);
    await client.query(
      `UPDATE affiliatecottages SET ${sets.join(', ')} WHERE property_token = $${i}`,
      values
    );

    try { await invalidateCottages(); } catch {}
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('updateCottage error:', error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}
