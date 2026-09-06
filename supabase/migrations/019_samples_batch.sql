-- ──────────────────────────────────────────────────────────────────────────
-- 019_samples_batch.sql
--
-- Give the sample library its own batch so passcodes can be scoped to it.
--
-- The passcode machinery (passcodes, auth_attempts, access_events) is shared
-- with the terminal-bench showcase and needs no change: a passcode hangs off a
-- batch_id, and batches are namespaced by `project`. This adds the samples
-- namespace so `pnpm issue:passcode` and /admin/passcodes can target it, which
-- is what lets a VIP customer be handed a working code before a call.
--
-- Rollback: 019_rollback.sql
-- ──────────────────────────────────────────────────────────────────────────

BEGIN;

INSERT INTO tbrain_landing.batches (project, slug, name, description)
VALUES (
  'samples',
  'library',
  'Sample library',
  'Public preview tier is open. This batch gates the full resolution files, every camera and the accompanying telemetry.'
)
ON CONFLICT (project, slug) DO NOTHING;

COMMIT;
