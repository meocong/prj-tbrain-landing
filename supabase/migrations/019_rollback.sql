-- Rollback for 019_samples_batch.sql.
-- Deletes the samples batch. Passcodes issued against it cascade away with it,
-- so revoke or re-issue before running this on an environment in use.

BEGIN;

DELETE FROM tbrain_landing.batches
 WHERE project = 'samples' AND slug = 'library';

COMMIT;
