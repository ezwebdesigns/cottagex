-- 00001_affiliatecottages.sql
-- Production catalogue table (queried by src/lib/cottages.js, admin cottages
-- page, and cron routes). Columns derived from code usage:
--   - SELECT list in cottages.js (fetchCottagesFromDB)
--   - INSERT column list in api/cron/sync/route.js (upsert)
--   - SELECT list in [locale]/admin/cottages/page.tsx
-- Notes:
--   - id is TEXT in prod: `${dest.slug}-${property_token}` (see sync route).
--   - photos / amenities / excluded_amenities are JSONB
--     (amenities @> '["..."]' filters in cottages.js).
--   - is_featured / is_hidden / available default so the sync INSERT
--     (which omits them) works unchanged.

CREATE TABLE affiliatecottages (
  id text PRIMARY KEY,
  property_token text NOT NULL,
  slug text,
  province text,
  name text NOT NULL,
  type text,
  source text,
  thumbnail text,
  photos jsonb DEFAULT '[]'::jsonb,
  lat numeric,
  lng numeric,
  price_cad numeric,
  price_before_taxes numeric,
  rating numeric,
  reviews integer,
  sleeps integer,
  bedrooms integer,
  bathrooms integer,
  sqm integer,
  amenities jsonb DEFAULT '[]'::jsonb,
  excluded_amenities jsonb DEFAULT '[]'::jsonb,
  check_in_time text,
  check_out_time text,
  google_link text,
  affiliate_url text,
  is_featured boolean DEFAULT false NOT NULL,
  is_hidden boolean DEFAULT false NOT NULL,
  available boolean DEFAULT true NOT NULL,
  image_alt text,
  last_synced date,
  created_at timestamp DEFAULT now() NOT NULL,
  CONSTRAINT affiliatecottages_property_token_unique UNIQUE (property_token)
);

CREATE INDEX affiliatecottages_slug_idx ON affiliatecottages (slug);
CREATE INDEX affiliatecottages_province_idx ON affiliatecottages (province);
CREATE INDEX affiliatecottages_featured_idx ON affiliatecottages (is_featured) WHERE is_featured = true;
