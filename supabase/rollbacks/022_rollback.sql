-- Rollback for 022_samples_batch.sql
--
-- Removes the sample library's batch row. Guarded rather than a plain DELETE:
-- passcodes hang off `batch_id`, so dropping a batch that has live codes would
-- either cascade a customer's access away or fail on the foreign key, and
-- neither is something a rollback should decide on its own. Revoke or move the
-- passcodes first, then run this.
--
-- Nothing else to undo: 022 only inserts, and the passcode machinery it uses
-- is created by 005.

BEGIN;

DELETE FROM tbrain_landing.batches b
WHERE b.project = 'samples'
  AND b.slug = 'library'
  AND NOT EXISTS (
    SELECT 1 FROM tbrain_landing.passcodes p WHERE p.batch_id = b.id
  );

COMMIT;
