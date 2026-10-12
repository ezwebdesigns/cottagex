-- 00005_missed_syncs.sql
-- Purge automatique : compteur d'absences consécutives aux syncs mensuels.
-- À missed_syncs >= 3, le cron passe available = false (jamais de DELETE).

ALTER TABLE affiliatecottages
  ADD COLUMN IF NOT EXISTS missed_syncs integer DEFAULT 0 NOT NULL;

CREATE INDEX IF NOT EXISTS affiliatecottages_missed_idx
  ON affiliatecottages (missed_syncs);
