-- Phase 2 cleanup — drop the deprecated legacy ping_status column.
-- Must run AFTER 00003_phase2_availability.sql.
-- The two views that select the old column are recreated without it.

DROP VIEW IF EXISTS public.v_available_cottages;
DROP VIEW IF EXISTS public.v_featured_cottages;

ALTER TABLE affiliatecottages DROP COLUMN IF EXISTS ping_status;

CREATE OR REPLACE VIEW public.v_available_cottages AS
SELECT * FROM affiliatecottages
WHERE available = true
ORDER BY rating DESC NULLS LAST;

CREATE OR REPLACE VIEW public.v_featured_cottages AS
SELECT id, slug, name, google_link, affiliate_url, available, last_pinged,
       last_ping_status, absence_count, availability_reason
FROM affiliatecottages
WHERE is_featured = true
ORDER BY slug, rating DESC NULLS LAST;
