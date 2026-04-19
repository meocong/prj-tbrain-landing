-- ──────────────────────────────────────────────────────────────────────────
-- 005_product_centric.sql
--
-- Phase 1 of the product-centric reorg:
--   1. New `products` table (TB, Physical AI, …) — top-level site/product.
--   2. `batches` + `access_requests` get `product_id` FK.
--   3. Unify `access_grants` + `batch_passcodes` into one table `passcodes`:
--        - adds client_id / max_uses / use_count / last_used_at / note columns
--        - preserves ids so access_events.grant_id still points to valid rows
--        - renames to `passcodes`
-- ──────────────────────────────────────────────────────────────────────────

-- 1. Products
CREATE TABLE IF NOT EXISTS tbrain_landing.products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  description text,
  site_url    text,
  sample_type text,              -- terminal_bench | physical_ai | video_annotation | image_labeling | text_qc (informational)
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

INSERT INTO tbrain_landing.products (slug, name, description, site_url, sample_type) VALUES
  ('terminal-bench', 'Terminal-Bench',
   'High-quality terminal agent benchmark data — task specs, instructions, tests.',
   '/data/terminal-bench', 'terminal_bench'),
  ('physical-ai', 'Physical AI',
   'Ground-truth motion capture data for humanoid control, imitation, sim-to-real.',
   '/data/physical-ai', 'physical_ai')
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      site_url = EXCLUDED.site_url,
      sample_type = EXCLUDED.sample_type;

ALTER TABLE tbrain_landing.products ENABLE ROW LEVEL SECURITY;

-- 2. product_id on batches
ALTER TABLE tbrain_landing.batches
  ADD COLUMN IF NOT EXISTS product_id uuid
    REFERENCES tbrain_landing.products(id) ON DELETE SET NULL;

-- Backfill: existing batches.project = 'terminal-bench' maps to that product
UPDATE tbrain_landing.batches b
   SET product_id = p.id
  FROM tbrain_landing.products p
 WHERE b.product_id IS NULL
   AND p.slug = b.project;

CREATE INDEX IF NOT EXISTS batches_product_idx
  ON tbrain_landing.batches (product_id);

-- 3. product_id on access_requests
ALTER TABLE tbrain_landing.access_requests
  ADD COLUMN IF NOT EXISTS product_id uuid
    REFERENCES tbrain_landing.products(id) ON DELETE SET NULL;

-- Inherit from the batch of the request (if any)
UPDATE tbrain_landing.access_requests r
   SET product_id = b.product_id
  FROM tbrain_landing.batches b
 WHERE r.product_id IS NULL
   AND r.batch_id = b.id;

CREATE INDEX IF NOT EXISTS access_requests_product_idx
  ON tbrain_landing.access_requests (product_id);

-- 4. Unify passcodes
--    Step A: add missing cols to batch_passcodes
ALTER TABLE tbrain_landing.batch_passcodes
  ADD COLUMN IF NOT EXISTS client_id     uuid REFERENCES tbrain_landing.clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS max_uses      integer,
  ADD COLUMN IF NOT EXISTS use_count     integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_used_at  timestamptz,
  ADD COLUMN IF NOT EXISTS note          text,
  ADD COLUMN IF NOT EXISTS product_id    uuid REFERENCES tbrain_landing.products(id) ON DELETE SET NULL;

-- Inherit product_id from batch
UPDATE tbrain_landing.batch_passcodes bp
   SET product_id = b.product_id
  FROM tbrain_landing.batches b
 WHERE bp.product_id IS NULL
   AND bp.batch_id = b.id;

--    Step B: copy access_grants rows (preserve id so access_events.grant_id stays valid)
INSERT INTO tbrain_landing.batch_passcodes
  (id, batch_id, label, passcode_hash, passcode_prefix,
   issued_at, expires_at, revoked_at,
   client_id, max_uses, use_count, last_used_at, note, product_id)
SELECT
  g.id, g.batch_id,
  NULLIF(g.note, '') AS label,               -- grants had no label; use note if present
  g.passcode_hash, g.passcode_prefix,
  g.issued_at, g.expires_at, g.revoked_at,
  g.client_id, g.max_uses, g.use_count, g.last_used_at, g.note,
  b.product_id
FROM tbrain_landing.access_grants g
LEFT JOIN tbrain_landing.batches b ON b.id = g.batch_id
ON CONFLICT (id) DO NOTHING;

--    Step C: repoint access_events.grant_id FK to batch_passcodes
ALTER TABLE tbrain_landing.access_events
  DROP CONSTRAINT IF EXISTS access_events_grant_id_fkey;

ALTER TABLE tbrain_landing.access_events
  ADD CONSTRAINT access_events_grant_id_fkey
    FOREIGN KEY (grant_id) REFERENCES tbrain_landing.batch_passcodes(id) ON DELETE SET NULL;

--    Step D: drop access_grants
DROP TABLE IF EXISTS tbrain_landing.access_grants CASCADE;

--    Step E: rename to `passcodes` (policies + indexes follow automatically)
ALTER TABLE tbrain_landing.batch_passcodes RENAME TO passcodes;

--    Rename indexes for consistency
ALTER INDEX IF EXISTS tbrain_landing.batch_passcodes_pkey     RENAME TO passcodes_pkey;
ALTER INDEX IF EXISTS tbrain_landing.batch_passcodes_prefix_idx RENAME TO passcodes_prefix_idx;

--    Rename FK for clarity (optional)
ALTER TABLE tbrain_landing.passcodes
  RENAME CONSTRAINT batch_passcodes_batch_id_fkey TO passcodes_batch_id_fkey;

-- Useful indexes on the new shape
CREATE INDEX IF NOT EXISTS passcodes_product_idx
  ON tbrain_landing.passcodes (product_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS passcodes_client_idx
  ON tbrain_landing.passcodes (client_id) WHERE client_id IS NOT NULL AND revoked_at IS NULL;

-- Upsert key for per-client grants (ported from access_grants.UNIQUE(client_id, batch_id))
-- Partial: only enforces for per-client rows; shared batch codes ignore this.
CREATE UNIQUE INDEX IF NOT EXISTS passcodes_client_batch_uniq
  ON tbrain_landing.passcodes (client_id, batch_id) WHERE client_id IS NOT NULL;

-- 5. RLS for products (reuse existing admin_has_permission model)
DROP POLICY IF EXISTS products_select ON tbrain_landing.products;
CREATE POLICY products_select ON tbrain_landing.products
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('data.view'));

DROP POLICY IF EXISTS products_write ON tbrain_landing.products;
CREATE POLICY products_write ON tbrain_landing.products
  FOR ALL TO authenticated
  USING (tbrain_landing.admin_has_permission('data.manage'))
  WITH CHECK (tbrain_landing.admin_has_permission('data.manage'));

GRANT SELECT, INSERT, UPDATE, DELETE ON tbrain_landing.products TO authenticated;

-- 6. Re-assert RLS policies on `passcodes` (names may still say batch_passcodes_*)
--    Drop any old per-name duplicates and create canonical set.
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT polname FROM pg_policy WHERE polrelid = 'tbrain_landing.passcodes'::regclass
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON tbrain_landing.passcodes', pol.polname);
  END LOOP;
END $$;

CREATE POLICY passcodes_select ON tbrain_landing.passcodes
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('passcodes.view'));

CREATE POLICY passcodes_insert ON tbrain_landing.passcodes
  FOR INSERT TO authenticated
  WITH CHECK (tbrain_landing.admin_has_permission('passcodes.create'));

CREATE POLICY passcodes_update ON tbrain_landing.passcodes
  FOR UPDATE TO authenticated
  USING (tbrain_landing.admin_has_permission('passcodes.revoke'))
  WITH CHECK (tbrain_landing.admin_has_permission('passcodes.revoke'));

CREATE POLICY passcodes_delete ON tbrain_landing.passcodes
  FOR DELETE TO authenticated
  USING (tbrain_landing.admin_has_permission('passcodes.revoke'));
