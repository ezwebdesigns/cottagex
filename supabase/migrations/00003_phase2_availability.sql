-- Phase 2 — split overloaded ping_status into dedicated availability columns.
-- Idempotent; no DROP, no DELETE.

ALTER TABLE affiliatecottages ADD COLUMN IF NOT EXISTS last_ping_status integer;
ALTER TABLE affiliatecottages ADD COLUMN IF NOT EXISTS absence_count integer NOT NULL DEFAULT 0;
ALTER TABLE affiliatecottages ADD COLUMN IF NOT EXISTS availability_reason text;

COMMENT ON COLUMN affiliatecottages.ping_status IS
  'DEPRECATED (Phase 2). Kept for compatibility only; use last_ping_status.';

COMMENT ON COLUMN affiliatecottages.last_ping_status IS
  'HTTP status of the last ping HEAD on google_link (200, 404, 429, ...).';

COMMENT ON COLUMN affiliatecottages.absence_count IS
  'Consecutive monthly DataForSEO sync absences. Reset to 0 when the token reappears.';

COMMENT ON COLUMN affiliatecottages.availability_reason IS
  'NULL | manual | ping_404 | sync_3_absences. manual is never overwritten by crons.';

-- Backfill from legacy values. HTTP-range ping_status values become last_ping_status;
-- unavailable rows get an explicit reason. absence_count starts at 0 (legacy counter
-- held HTTP codes, not absence counts, so it is not recoverable).
UPDATE affiliatecottages
SET last_ping_status = CASE WHEN ping_status BETWEEN 100 AND 599 THEN ping_status END,
    absence_count = 0,
    availability_reason = CASE
      WHEN available = false AND ping_status BETWEEN 100 AND 599 THEN 'ping_404'
      WHEN available = false THEN 'manual'
      ELSE NULL
    END
WHERE availability_reason IS NULL AND (ping_status IS NOT NULL OR available = false);
