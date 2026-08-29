-- ============================================================
-- Canada Cottage Rentals — Supabase PostgreSQL Schema
-- Table: affiliatecottages
-- ============================================================

CREATE TABLE IF NOT EXISTS affiliatecottages (

  -- ── Identifiants ──────────────────────────────────────────
  id                    TEXT PRIMARY KEY,     -- "{slug}-{property_token}"
  property_token        TEXT UNIQUE NOT NULL, -- token Google unique (sert au matching sync)

  -- ── Localisation ──────────────────────────────────────────
  slug                  TEXT NOT NULL,        -- 'muskoka', 'kawarthas', etc.
  province              TEXT NOT NULL,        -- 'ontario', 'quebec', etc.

  -- ── Infos principales ─────────────────────────────────────
  name                  TEXT NOT NULL,
  type                  TEXT,                 -- 'cottage', 'chalet', 'cabin'
  source                TEXT,                 -- 'Vrbo.com', 'Expedia.com'

  -- ── Médias ────────────────────────────────────────────────
  thumbnail             TEXT,                 -- URL photo principale
  photos                JSONB DEFAULT '[]',   -- tableau d'URLs

  -- ── Localisation GPS ──────────────────────────────────────
  lat                   NUMERIC(10, 7),
  lng                   NUMERIC(10, 7),

  -- ── Prix ──────────────────────────────────────────────────
  price_cad             INTEGER,              -- prix/nuit toutes taxes
  price_before_taxes    INTEGER,              -- prix/nuit avant taxes

  -- ── Évaluations ───────────────────────────────────────────
  rating                NUMERIC(4, 1),        -- ex: 4.9
  reviews               INTEGER,              -- nb d'avis

  -- ── Capacité ──────────────────────────────────────────────
  sleeps                SMALLINT,
  bedrooms              SMALLINT,
  bathrooms             SMALLINT,
  sqm                   SMALLINT,

  -- ── Commodités ────────────────────────────────────────────
  amenities             JSONB DEFAULT '[]',   -- ["Hot tub", "Pet-friendly", ...]
  excluded_amenities    JSONB DEFAULT '[]',

  -- ── Check-in / Check-out ──────────────────────────────────
  check_in_time         TEXT,                 -- ex: "4:00 PM"
  check_out_time        TEXT,                 -- ex: "11:00 AM"

  -- ── Liens ─────────────────────────────────────────────────
  google_link           TEXT,                 -- URL propriété Google/VRBO directe
  affiliate_url         TEXT,                 -- Ton deep link VRBO affilié (à remplir)

  -- ── Disponibilité & Sync ──────────────────────────────────
  available             BOOLEAN DEFAULT true,
  is_featured           BOOLEAN DEFAULT false, -- affiché sur le site → pingé quotidiennement
  last_synced           DATE DEFAULT CURRENT_DATE,
  last_pinged           TIMESTAMPTZ,           -- dernier ping HTTP (quotidien, featured only)
  ping_status           SMALLINT,              -- code HTTP du dernier ping (200, 404...)

  -- ── Timestamps ────────────────────────────────────────────
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()

);

-- ============================================================
-- INDEX — pour les requêtes les plus fréquentes
-- ============================================================

-- Pages de destination : /destinations/muskoka
CREATE INDEX IF NOT EXISTS idx_slug
  ON affiliatecottages (slug);

-- Pages province : /ontario
CREATE INDEX IF NOT EXISTS idx_province
  ON affiliatecottages (province);

-- Filtrage disponibilité (le plus utilisé dans l'app)
CREATE INDEX IF NOT EXISTS idx_available
  ON affiliatecottages (available);

-- Combiné : destination + disponible (requête principale des pages)
CREATE INDEX IF NOT EXISTS idx_slug_available
  ON affiliatecottages (slug, available);

-- Cottages affichés sur le site (ping quotidien)
CREATE INDEX IF NOT EXISTS idx_featured
  ON affiliatecottages (is_featured)
  WHERE is_featured = true;

-- Tri par prix
CREATE INDEX IF NOT EXISTS idx_price
  ON affiliatecottages (price_cad);

-- Tri par rating
CREATE INDEX IF NOT EXISTS idx_rating
  ON affiliatecottages (rating DESC);

-- Matching sync mensuel via property_token
CREATE INDEX IF NOT EXISTS idx_property_token
  ON affiliatecottages (property_token);

-- Recherche géographique (pour une carte éventuelle)
CREATE INDEX IF NOT EXISTS idx_gps
  ON affiliatecottages (lat, lng);

-- ============================================================
-- TRIGGER — updated_at automatique
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_updated_at
  BEFORE UPDATE ON affiliatecottages
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- VUES UTILES
-- ============================================================

-- Vue : cottages disponibles par destination (usage Next.js)
CREATE OR REPLACE VIEW v_available_cottages AS
SELECT *
FROM affiliatecottages
WHERE available = true
ORDER BY rating DESC NULLS LAST;

-- Vue : cottages featured disponibles (usage cron ping quotidien)
CREATE OR REPLACE VIEW v_featured_cottages AS
SELECT id, slug, name, google_link, affiliate_url, available, last_pinged, ping_status
FROM affiliatecottages
WHERE is_featured = true
ORDER BY slug, rating DESC NULLS LAST;

-- Vue : stats par destination (usage dashboard admin)
CREATE OR REPLACE VIEW v_destination_stats AS
SELECT
  slug,
  province,
  COUNT(*)                                        AS total,
  COUNT(*) FILTER (WHERE available = true)        AS available,
  COUNT(*) FILTER (WHERE available = false)       AS unavailable,
  COUNT(*) FILTER (WHERE is_featured = true)      AS featured,
  COUNT(*) FILTER (WHERE affiliate_url IS NULL)   AS missing_affiliate_url,
  ROUND(AVG(price_cad))                           AS avg_price_cad,
  ROUND(AVG(rating)::numeric, 1)                  AS avg_rating,
  MAX(last_synced)                                AS last_synced,
  MAX(last_pinged)                                AS last_pinged
FROM affiliatecottages
GROUP BY slug, province
ORDER BY province, slug;

-- Vue : cottages sans affiliate_url (à remplir manuellement)
CREATE OR REPLACE VIEW v_missing_affiliate AS
SELECT id, slug, name, google_link, source
FROM affiliatecottages
WHERE affiliate_url IS NULL
ORDER BY slug, name;

-- ============================================================
-- COMMENTAIRES
-- ============================================================

COMMENT ON TABLE affiliatecottages IS
  'Catalogue de cottages canadiens fetché via SerpApi Google Hotels.
   Filtré sur VRBO et Expedia uniquement.
   Sync mensuelle via Netlify Scheduled Functions (toute la base).
   Ping quotidien via Netlify Scheduled Functions (is_featured = true uniquement).';

COMMENT ON COLUMN affiliatecottages.property_token IS
  'Identifiant unique Google Hotels. Utilisé pour matcher les résultats
   lors de la sync mensuelle sans recréer les entrées.';

COMMENT ON COLUMN affiliatecottages.affiliate_url IS
  'Deep link VRBO affilié généré manuellement depuis le dashboard VRBO.
   NULL tant que non rempli. Le site affiche google_link en fallback.';

COMMENT ON COLUMN affiliatecottages.is_featured IS
  'true = ce cottage est affiché sur le site.
   Ces cottages sont pingés quotidiennement pour garantir zéro 404.
   Les autres sont uniquement vérifiés lors de la sync mensuelle.';

COMMENT ON COLUMN affiliatecottages.ping_status IS
  'Code HTTP du dernier ping HEAD sur google_link.
   200 = OK, 404 = disparu, 301 = redirigé, NULL = jamais pingé.';
