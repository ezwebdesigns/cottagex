-- 00004_pages_locale_slug.sql
-- Same i18n pattern as articles (00003): FR translations live as sibling
-- rows sharing the slug (locale='fr', translation_of=<en id>), so
-- /en/<slug> and /fr/<slug> stay aligned. Replaces the slug-only unique
-- constraint with a composite one. Note: pages.id is uuid, hence
-- translation_of is uuid too (articles uses integer — different PK type).

ALTER TABLE pages ADD COLUMN locale varchar(10) DEFAULT 'en' NOT NULL;
ALTER TABLE pages ADD COLUMN translation_of uuid;
ALTER TABLE pages DROP CONSTRAINT pages_slug_unique;
ALTER TABLE pages ADD CONSTRAINT pages_slug_locale_unique UNIQUE (slug, locale);
