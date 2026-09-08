-- ──────────────────────────────────────────────────────────────────────────
-- 013_passcodes_unique.sql
--
-- Guarantee one live passcode per (client, batch).
--
-- This migration previously read:
--
--   ALTER TABLE tbrain_landing.passcodes
--     ADD CONSTRAINT IF NOT EXISTS passcodes_client_batch_unique UNIQUE (client_id, batch_id);
--
-- which is not valid Postgres — `IF NOT EXISTS` is supported on ADD COLUMN,
-- never on ADD CONSTRAINT — so the statement raised a syntax error and the
-- whole migration aborted. Anyone who had already applied it had in fact not.
--
-- The premise was wrong too. 013's header said the uniqueness was "dropped
-- during the migration 005 merge"; 005 actually *creates* it, as the partial
-- unique index `passcodes_client_batch_uniq`. A plain UNIQUE constraint would
-- also have been the wrong shape: Postgres treats NULLs as distinct, so it
-- would appear to permit many shared codes per batch by accident rather than
-- by intent, and it would have sat alongside 005's index enforcing the same
-- rule twice.
--
-- So this now asserts 005's index idempotently and drops the stray constraint
-- if some database somewhere did acquire one. Safe to run on a database that
-- already has 005, and safe to run twice.
--
-- Rollback: 013_rollback.sql
-- ──────────────────────────────────────────────────────────────────────────

BEGIN;

-- Only per-client rows are gated. Shared codes (client_id IS NULL) may have
-- many rows per batch, which is what lets Tam hand out several labelled codes
-- for the same sample batch.
CREATE UNIQUE INDEX IF NOT EXISTS passcodes_client_batch_uniq
  ON tbrain_landing.passcodes (client_id, batch_id) WHERE client_id IS NOT NULL;

ALTER TABLE tbrain_landing.passcodes
  DROP CONSTRAINT IF EXISTS passcodes_client_batch_unique;

COMMIT;
