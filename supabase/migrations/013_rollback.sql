-- Rollback for 013_passcodes_unique.sql
--
-- Deliberately does not drop `passcodes_client_batch_uniq`: that index is
-- created by 005, not by 013, and dropping it here would silently undo an
-- earlier migration and let a client hold two live passcodes for one batch.
-- 013 only asserts the index and clears the stray constraint, so there is
-- nothing of its own to undo.

BEGIN;

ALTER TABLE tbrain_landing.passcodes
  DROP CONSTRAINT IF EXISTS passcodes_client_batch_unique;

COMMIT;
