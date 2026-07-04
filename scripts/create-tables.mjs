import pkg from 'pg';
const { Pool } = pkg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('DATABASE_URL manquante'); process.exit(1); }

const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false, require: true } });

const sql = `

-- Ajout de la colonne manquante image_alt
ALTER TABLE affiliatecottages ADD COLUMN IF NOT EXISTS image_alt TEXT;

-- users (admin)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  hashed_password TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'admin' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- properties (legacy)
CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  location VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  rating VARCHAR(10),
  reviews INTEGER DEFAULT 0,
  image TEXT,
  tag VARCHAR(100),
  description TEXT,
  vrbo_link TEXT,
  is_liked BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- pages (CMS + destination)
CREATE TABLE IF NOT EXISTS pages (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  template VARCHAR(50) DEFAULT 'standard' NOT NULL,
  content TEXT DEFAULT '',
  seo_title VARCHAR(255),
  meta_description TEXT,
  featured_image TEXT,
  faq JSONB DEFAULT '[]',
  cta_title VARCHAR(255),
  cta_button VARCHAR(255),
  cta_link TEXT,
  cta_description TEXT,
  explore_title VARCHAR(255),
  explore_subtitle VARCHAR(255),
  explore_description TEXT,
  explore_items JSONB DEFAULT '[]',
  location_data JSONB DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- articles (guides + listicles)
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(50) DEFAULT 'standard' NOT NULL,
  content TEXT DEFAULT '',
  excerpt TEXT,
  category VARCHAR(100),
  author VARCHAR(255) DEFAULT 'Editorial Team',
  featured_image TEXT,
  image_alt VARCHAR(255),
  seo_title VARCHAR(255),
  faq JSONB DEFAULT '[]',
  cta_title VARCHAR(255),
  cta_button VARCHAR(255),
  cta_link TEXT,
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- listicle_items
CREATE TABLE IF NOT EXISTS listicle_items (
  id SERIAL PRIMARY KEY,
  article_id INTEGER REFERENCES articles(id),
  rank INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  rating VARCHAR(10),
  price DECIMAL(10,2),
  image TEXT,
  vibe VARCHAR(100),
  vrbo_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- messages (contact form)
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- subscribers
CREATE TABLE IF NOT EXISTS subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  subscribed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- library_images (media)
CREATE TABLE IF NOT EXISTS library_images (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  url TEXT NOT NULL,
  mimetype VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- site_settings (CMS config)
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  section VARCHAR(100) NOT NULL UNIQUE,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- search_links (VRBO affiliate links)
CREATE TABLE IF NOT EXISTS search_links (
  id SERIAL PRIMARY KEY,
  city TEXT NOT NULL,
  category TEXT NOT NULL,
  category_fr TEXT,
  affiliate_url TEXT NOT NULL,
  platform VARCHAR(50) DEFAULT 'vrbo',
  type VARCHAR(20) DEFAULT 'city' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

`;

async function main() {
  await pool.query(sql);
  console.log('✅ Toutes les tables créées avec succès');
  await pool.end();
}

main().catch(err => { console.error('Erreur:', err.message); process.exit(1); });
