-- 00000_initial.sql
-- ChaletExpress local schema — written manually to mirror src/db/schema.ts
-- (Drizzle schema is the source of truth; this file is what `supabase db reset` applies.)

-- users ---------------------------------------------------------------
CREATE TABLE users (
  id serial PRIMARY KEY,
  name varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  hashed_password text NOT NULL,
  role varchar(50) DEFAULT 'admin' NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL,
  CONSTRAINT users_email_unique UNIQUE (email)
);

-- properties ----------------------------------------------------------
CREATE TABLE properties (
  id serial PRIMARY KEY,
  title varchar(255) NOT NULL,
  slug varchar(255),
  location varchar(255) NOT NULL,
  province varchar(255) NOT NULL,
  price numeric(10, 2) NOT NULL,
  rating varchar(10),
  reviews integer DEFAULT 0,
  image text,
  tag varchar(100),
  description text,
  vrbo_link text,
  is_liked boolean DEFAULT false,
  is_published boolean DEFAULT true,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

-- pages ---------------------------------------------------------------
CREATE TABLE pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(255) NOT NULL,
  slug varchar(255) NOT NULL,
  template varchar(50) DEFAULT 'standard' NOT NULL,
  content text DEFAULT '',
  seo_title varchar(255),
  meta_description text,
  featured_image text,
  faq json DEFAULT '[]'::json,
  cta_title varchar(255),
  cta_button varchar(255),
  cta_link text,
  cta_description text,
  explore_title varchar(255),
  explore_subtitle varchar(255),
  explore_description text,
  explore_items json DEFAULT '[]'::json,
  location_data json DEFAULT '{}'::json,
  is_published boolean DEFAULT true,
  published_at timestamp,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL,
  CONSTRAINT pages_slug_unique UNIQUE (slug)
);

-- articles ------------------------------------------------------------
CREATE TABLE articles (
  id serial PRIMARY KEY,
  title varchar(255) NOT NULL,
  slug varchar(255) NOT NULL,
  type varchar(50) DEFAULT 'standard' NOT NULL,
  content text DEFAULT '',
  excerpt text,
  category varchar(100),
  author varchar(255) DEFAULT 'Editorial Team',
  featured_image text,
  image_alt varchar(255),
  seo_title varchar(255),
  seo_keywords text,
  faq json DEFAULT '[]'::json,
  cta_title varchar(255),
  cta_button varchar(255),
  cta_link text,
  is_published boolean DEFAULT true,
  published_at timestamp,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL,
  CONSTRAINT articles_slug_unique UNIQUE (slug)
);

-- listicle_items ------------------------------------------------------
CREATE TABLE listicle_items (
  id serial PRIMARY KEY,
  article_id integer NOT NULL REFERENCES articles (id),
  rank integer NOT NULL,
  title varchar(255) NOT NULL,
  description text,
  rating varchar(10),
  price numeric(10, 2),
  image text,
  vibe varchar(100),
  vrbo_link text,
  created_at timestamp DEFAULT now() NOT NULL
);

-- messages ------------------------------------------------------------
CREATE TABLE messages (
  id serial PRIMARY KEY,
  name varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  text text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamp DEFAULT now() NOT NULL
);

-- subscribers ---------------------------------------------------------
CREATE TABLE subscribers (
  id serial PRIMARY KEY,
  email varchar(255) NOT NULL,
  subscribed boolean DEFAULT true,
  created_at timestamp DEFAULT now() NOT NULL,
  CONSTRAINT subscribers_email_unique UNIQUE (email)
);

-- library_images ------------------------------------------------------
CREATE TABLE library_images (
  id serial PRIMARY KEY,
  name varchar(255),
  url text NOT NULL,
  mimetype varchar(100),
  created_at timestamp DEFAULT now() NOT NULL
);

-- site_settings -------------------------------------------------------
CREATE TABLE site_settings (
  id serial PRIMARY KEY,
  section varchar(100) NOT NULL,
  data json DEFAULT '{}'::json NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL,
  CONSTRAINT site_settings_section_unique UNIQUE (section)
);

-- search_links --------------------------------------------------------
CREATE TABLE search_links (
  id serial PRIMARY KEY,
  city text NOT NULL,
  category text NOT NULL,
  category_fr text,
  affiliate_url text NOT NULL,
  platform varchar(50) DEFAULT 'vrbo',
  type varchar(20) DEFAULT 'city' NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL
);
