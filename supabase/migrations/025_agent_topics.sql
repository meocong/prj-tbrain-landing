-- ──────────────────────────────────────────────────────────────────────────
-- 025_agent_topics.sql
--
-- Topic ideas the content agent proposes (weekly scout, or on demand) are
-- stored so the admin can show them and anyone can pick one up — from the
-- admin ("Write") or Telegram ("viết #12") — as a background draft job.
--
-- 1. cms_topic_ideas: one row per proposed topic, numbered by `seq` so a
--    short "#12" works in chat. Status follows the job that writes it
--    (new → queued → drafted; back to new if that job fails or is cancelled).
-- 2. cms_agent_requests gains topic_id, via (admin | telegram | schedule) and
--    requested_by_label (who asked in chat — they have no admin row).
--
-- Rollback: supabase/rollbacks/025_rollback.sql
-- ──────────────────────────────────────────────────────────────────────────

BEGIN;

CREATE TABLE IF NOT EXISTS tbrain_landing.cms_topic_ideas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seq         bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
  title       text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 300),
  why_now     text,
  angle       text,
  keyword     text,
  audience    text,
  data_line   text,
  sources     jsonb NOT NULL DEFAULT '[]'::jsonb,
  score       numeric(4,1),
  status      text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'queued', 'drafted', 'dismissed')),
  request_id  uuid REFERENCES tbrain_landing.cms_agent_requests(id) ON DELETE SET NULL,
  post_id     uuid REFERENCES tbrain_landing.cms_posts(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cms_topic_ideas_status_idx
  ON tbrain_landing.cms_topic_ideas (status, created_at DESC);

ALTER TABLE tbrain_landing.cms_topic_ideas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cms_topic_ideas_select ON tbrain_landing.cms_topic_ideas;
CREATE POLICY cms_topic_ideas_select ON tbrain_landing.cms_topic_ideas
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('content.view'));

-- Admins only dismiss or restore an idea; queued/drafted follow the job.
DROP POLICY IF EXISTS cms_topic_ideas_update ON tbrain_landing.cms_topic_ideas;
CREATE POLICY cms_topic_ideas_update ON tbrain_landing.cms_topic_ideas
  FOR UPDATE TO authenticated
  USING (tbrain_landing.admin_has_permission('content.edit') AND status IN ('new', 'dismissed'))
  WITH CHECK (status IN ('new', 'dismissed'));

DROP TRIGGER IF EXISTS cms_topic_ideas_updated_at ON tbrain_landing.cms_topic_ideas;
CREATE TRIGGER cms_topic_ideas_updated_at
  BEFORE UPDATE ON tbrain_landing.cms_topic_ideas
  FOR EACH ROW EXECUTE FUNCTION tbrain_landing.touch_updated_at();

REVOKE ALL ON tbrain_landing.cms_topic_ideas FROM authenticated;
GRANT SELECT ON tbrain_landing.cms_topic_ideas TO authenticated;
GRANT UPDATE (status) ON tbrain_landing.cms_topic_ideas TO authenticated;
GRANT ALL ON tbrain_landing.cms_topic_ideas TO service_role;

-- 2. Request provenance ---------------------------------------------------------
ALTER TABLE tbrain_landing.cms_agent_requests
  ADD COLUMN IF NOT EXISTS topic_id uuid REFERENCES tbrain_landing.cms_topic_ideas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS via text NOT NULL DEFAULT 'admin',
  ADD COLUMN IF NOT EXISTS requested_by_label text;

DO $$ BEGIN
  ALTER TABLE tbrain_landing.cms_agent_requests
    ADD CONSTRAINT cms_agent_requests_via_check CHECK (via IN ('admin', 'telegram', 'schedule'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Admin-queued jobs always come from the admin (column grants already limit
-- what authenticated can write; this pins via/label for those inserts).
DROP POLICY IF EXISTS cms_agent_requests_insert ON tbrain_landing.cms_agent_requests;
CREATE POLICY cms_agent_requests_insert ON tbrain_landing.cms_agent_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    tbrain_landing.admin_has_permission('content.edit')
    AND status = 'queued'
    AND requested_by = tbrain_landing.current_admin_id()
    AND via = 'admin'
    AND requested_by_label IS NULL
  );

-- One active job per topic idea, enforced atomically.
CREATE UNIQUE INDEX IF NOT EXISTS cms_agent_requests_active_topic
  ON tbrain_landing.cms_agent_requests (topic_id)
  WHERE topic_id IS NOT NULL AND status IN ('queued', 'running');

-- New jobs must make sense whoever queues them (admin browser or agent API):
-- a revise targets a draft; a topic draft targets an idea nobody has written.
CREATE OR REPLACE FUNCTION tbrain_landing.cms_agent_requests_validate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = tbrain_landing, public
AS $$
BEGIN
  IF NEW.type = 'revise' AND NOT EXISTS (
       SELECT 1 FROM cms_posts WHERE id = NEW.post_id AND status = 'draft') THEN
    RAISE EXCEPTION 'only drafts can be revised by the agent'
      USING ERRCODE = 'check_violation';
  END IF;
  IF NEW.topic_id IS NOT NULL THEN
    IF NEW.type <> 'draft' THEN
      RAISE EXCEPTION 'topic_id is only for draft jobs' USING ERRCODE = 'check_violation';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM cms_topic_ideas WHERE id = NEW.topic_id AND status IN ('new', 'dismissed')) THEN
      RAISE EXCEPTION 'this topic is already being written or has a draft'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cms_agent_requests_validate ON tbrain_landing.cms_agent_requests;
CREATE TRIGGER cms_agent_requests_validate
  BEFORE INSERT ON tbrain_landing.cms_agent_requests
  FOR EACH ROW EXECUTE FUNCTION tbrain_landing.cms_agent_requests_validate();

-- 3. Keep an idea's status in step with the job writing it ---------------------
CREATE OR REPLACE FUNCTION tbrain_landing.cms_agent_requests_sync_topic()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = tbrain_landing, public
AS $$
BEGIN
  IF NEW.topic_id IS NULL OR NEW.type <> 'draft' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status IN ('queued', 'running') THEN
      UPDATE cms_topic_ideas SET status = 'queued' WHERE id = NEW.topic_id AND status <> 'drafted';
    ELSIF NEW.status = 'done' THEN
      UPDATE cms_topic_ideas
         SET status = 'drafted',
             -- Only link a post that exists; a bad id must not fail the job update.
             post_id = COALESCE(
               (SELECT p.id FROM cms_posts p
                 WHERE p.id::text = NEW.result->>'post_id'),
               post_id)
       WHERE id = NEW.topic_id;
    ELSE -- failed / cancelled: the idea is available again
      UPDATE cms_topic_ideas SET status = 'new'
       WHERE id = NEW.topic_id AND status = 'queued'
         AND NOT EXISTS (SELECT 1 FROM cms_agent_requests r
                          WHERE r.topic_id = NEW.topic_id AND r.id <> NEW.id
                            AND r.status IN ('queued', 'running'));
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cms_agent_requests_sync_topic ON tbrain_landing.cms_agent_requests;
CREATE TRIGGER cms_agent_requests_sync_topic
  AFTER INSERT OR UPDATE OF status ON tbrain_landing.cms_agent_requests
  FOR EACH ROW EXECUTE FUNCTION tbrain_landing.cms_agent_requests_sync_topic();

COMMIT;
