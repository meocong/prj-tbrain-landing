-- Rollback for 013_passcodes_unique.sql

BEGIN;

ALTER TABLE tbrain_landing.passcodes
  DROP CONSTRAINT IF EXISTS passcodes_client_batch_unique;

COMMIT;
