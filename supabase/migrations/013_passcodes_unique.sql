-- ──────────────────────────────────────────────────────────────────────────
-- 013_passcodes_unique.sql
--
-- Restore the (client_id, batch_id) unique constraint on passcodes that was
-- dropped during the migration 005 merge of access_grants → batch_passcodes
-- → passcodes. Without it, the request-approval flow's upsert(onConflict)
-- fails with "no unique or exclusion constraint matching the ON CONFLICT
-- specification".
--
-- Postgres treats NULL as distinct in UNIQUE constraints by default, so
-- shared/labelled passcodes (client_id IS NULL) can still have multiple
-- rows per batch. Only client-tied passcodes are gated to one-per-batch.
--
-- Rollback: 013_rollback.sql
-- ──────────────────────────────────────────────────────────────────────────

BEGIN;

-- Postgres has no `ADD CONSTRAINT IF NOT EXISTS` — guard via DO block.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'passcodes_client_batch_unique'
       AND conrelid = 'tbrain_landing.passcodes'::regclass
  ) THEN
    ALTER TABLE tbrain_landing.passcodes
      ADD CONSTRAINT passcodes_client_batch_unique UNIQUE (client_id, batch_id);
  END IF;
END $$;

COMMIT;
