import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@/db/schema';

const connectionString = process.env.DATABASE_URL!;
// Local Supabase (127.0.0.1 / localhost) has no SSL; remote DBs (Supabase
// Cloud, Neon) require it. Forcing SSL unconditionally breaks `npm run dev`
// against the local stack.
const isLocalDb = /localhost|127\.0\.0\.1/.test(connectionString);

const pool = new Pool({
  connectionString,
  ...(isLocalDb ? {} : { ssl: { rejectUnauthorized: false } }),
  max: 10,
});

export const db = drizzle({ client: pool, schema });
