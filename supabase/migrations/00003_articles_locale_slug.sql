-- 00003_articles_locale_slug.sql
-- FR translations live as sibling rows sharing the same slug
-- (locale='fr', translation_of=<en id>), so /en/guides/<slug> and
-- /fr/guides/<slug> stay aligned for hreflang. This replaces the
-- slug-only unique constraint with a composite one.

ALTER TABLE articles DROP CONSTRAINT articles_slug_unique;
ALTER TABLE articles ADD CONSTRAINT articles_slug_locale_unique UNIQUE (slug, locale);
