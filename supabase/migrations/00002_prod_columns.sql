-- 00002_prod_columns.sql
-- Columns present in production (see public/sql/*.sql dumps) but missing
-- from the initial local schema:
--   - affiliatecottages: last_pinged, ping_status, updated_at
--     (all referenced by the dump INSERT column list)
--   - articles: locale, translation_of (trailing dump columns)
--   - site_settings: locale (trailing dump column). The old
--     UNIQUE(section) is replaced by UNIQUE(section, locale) so that
--     localised rows (en/fr/...) can coexist.

-- affiliatecottages ---------------------------------------------------
ALTER TABLE affiliatecottages ADD COLUMN last_pinged timestamptz;
ALTER TABLE affiliatecottages ADD COLUMN ping_status integer;
ALTER TABLE affiliatecottages ADD COLUMN updated_at timestamptz DEFAULT now() NOT NULL;

-- articles -------------------------------------------------------------
ALTER TABLE articles ADD COLUMN locale varchar(10) DEFAULT 'en' NOT NULL;
ALTER TABLE articles ADD COLUMN translation_of integer;

-- site_settings ---------------------------------------------------------
ALTER TABLE site_settings ADD COLUMN locale varchar(10) DEFAULT 'en' NOT NULL;
ALTER TABLE site_settings DROP CONSTRAINT site_settings_section_unique;
ALTER TABLE site_settings ADD CONSTRAINT site_settings_section_locale_unique UNIQUE (section, locale);
