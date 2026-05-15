-- ──────────────────────────────────────────────────────────────────────────
-- 004_admin_rls_policies.sql
--
-- Fine-grained RLS policies for the admin surface.
--
-- Model:
--   super_admin    → bypasses every check (admin_has_permission returns true)
--   admin (+ others) → must have the specific permission code via
--                      role_permissions ∪ group_permissions
--   non-admin user  → admin_has_permission returns false for every code
--
-- service_role keeps full bypass via the existing GRANT ALL in previous
-- migrations — this file only opens doors for the `authenticated` role.
-- ──────────────────────────────────────────────────────────────────────────

-- 1. Grants so RLS becomes the gatekeeper for authenticated users.
GRANT USAGE ON SCHEMA tbrain_landing TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA tbrain_landing TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA tbrain_landing TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA tbrain_landing
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA tbrain_landing
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

-- 2. Helper: resolve current admin (by JWT email).
CREATE OR REPLACE FUNCTION tbrain_landing.current_admin_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = tbrain_landing, public
AS $$
  SELECT id
  FROM tbrain_landing.admin_users
  WHERE email = auth.jwt() ->> 'email'
    AND is_active = true
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION tbrain_landing.current_admin_id() TO authenticated;

-- 3. Helper: does the current JWT email have a specific permission code?
--    super_admin → always true. Others → role_permissions ∪ group_permissions.
CREATE OR REPLACE FUNCTION tbrain_landing.admin_has_permission(p_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = tbrain_landing, public
AS $$
  WITH me AS (
    SELECT u.id, u.role_id, r.code AS role_code
    FROM tbrain_landing.admin_users u
    JOIN tbrain_landing.roles r ON r.id = u.role_id
    WHERE u.email = auth.jwt() ->> 'email'
      AND u.is_active = true
    LIMIT 1
  )
  SELECT
    CASE
      WHEN NOT EXISTS (SELECT 1 FROM me) THEN false
      WHEN (SELECT role_code FROM me) = 'super_admin' THEN true
      ELSE (
        EXISTS (
          SELECT 1
          FROM tbrain_landing.role_permissions rp
          JOIN tbrain_landing.permissions p ON p.id = rp.permission_id
          WHERE rp.role_id = (SELECT role_id FROM me)
            AND p.code = p_code
        )
        OR EXISTS (
          SELECT 1
          FROM tbrain_landing.group_members gm
          JOIN tbrain_landing.group_permissions gp ON gp.group_id = gm.group_id
          JOIN tbrain_landing.permissions p ON p.id = gp.permission_id
          WHERE gm.user_id = (SELECT id FROM me)
            AND p.code = p_code
        )
      )
    END;
$$;

GRANT EXECUTE ON FUNCTION tbrain_landing.admin_has_permission(text) TO authenticated;

-- 4. Ensure RLS is on for every admin-relevant table (idempotent).
ALTER TABLE tbrain_landing.clients             ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbrain_landing.batches             ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbrain_landing.samples             ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbrain_landing.files               ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbrain_landing.access_grants       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbrain_landing.batch_passcodes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbrain_landing.access_requests     ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbrain_landing.auth_attempts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbrain_landing.access_events       ENABLE ROW LEVEL SECURITY;

-- 5. Policies. Pattern per table: one SELECT policy + granular write policies.
--    DROP IF EXISTS then CREATE so this migration is re-runnable.

-- ── admin_users / roles / permissions / role_permissions ──
--    Read: users.view. Write: users.manage.
DROP POLICY IF EXISTS admin_users_select ON tbrain_landing.admin_users;
CREATE POLICY admin_users_select ON tbrain_landing.admin_users
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('users.view'));

DROP POLICY IF EXISTS admin_users_write ON tbrain_landing.admin_users;
CREATE POLICY admin_users_write ON tbrain_landing.admin_users
  FOR ALL TO authenticated
  USING (tbrain_landing.admin_has_permission('users.manage'))
  WITH CHECK (tbrain_landing.admin_has_permission('users.manage'));

DROP POLICY IF EXISTS roles_select ON tbrain_landing.roles;
CREATE POLICY roles_select ON tbrain_landing.roles
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('users.view'));

DROP POLICY IF EXISTS roles_write ON tbrain_landing.roles;
CREATE POLICY roles_write ON tbrain_landing.roles
  FOR ALL TO authenticated
  USING (tbrain_landing.admin_has_permission('users.manage'))
  WITH CHECK (tbrain_landing.admin_has_permission('users.manage'));

DROP POLICY IF EXISTS permissions_select ON tbrain_landing.permissions;
CREATE POLICY permissions_select ON tbrain_landing.permissions
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('users.view'));

DROP POLICY IF EXISTS permissions_write ON tbrain_landing.permissions;
CREATE POLICY permissions_write ON tbrain_landing.permissions
  FOR ALL TO authenticated
  USING (tbrain_landing.admin_has_permission('users.manage'))
  WITH CHECK (tbrain_landing.admin_has_permission('users.manage'));

DROP POLICY IF EXISTS role_permissions_select ON tbrain_landing.role_permissions;
CREATE POLICY role_permissions_select ON tbrain_landing.role_permissions
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('users.view'));

DROP POLICY IF EXISTS role_permissions_write ON tbrain_landing.role_permissions;
CREATE POLICY role_permissions_write ON tbrain_landing.role_permissions
  FOR ALL TO authenticated
  USING (tbrain_landing.admin_has_permission('users.manage'))
  WITH CHECK (tbrain_landing.admin_has_permission('users.manage'));

-- ── clients (CRM contacts) ──
DROP POLICY IF EXISTS clients_select ON tbrain_landing.clients;
CREATE POLICY clients_select ON tbrain_landing.clients
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('contacts.view'));

DROP POLICY IF EXISTS clients_insert ON tbrain_landing.clients;
CREATE POLICY clients_insert ON tbrain_landing.clients
  FOR INSERT TO authenticated
  WITH CHECK (tbrain_landing.admin_has_permission('contacts.create'));

DROP POLICY IF EXISTS clients_update ON tbrain_landing.clients;
CREATE POLICY clients_update ON tbrain_landing.clients
  FOR UPDATE TO authenticated
  USING (tbrain_landing.admin_has_permission('contacts.edit'))
  WITH CHECK (tbrain_landing.admin_has_permission('contacts.edit'));

DROP POLICY IF EXISTS clients_delete ON tbrain_landing.clients;
CREATE POLICY clients_delete ON tbrain_landing.clients
  FOR DELETE TO authenticated
  USING (tbrain_landing.admin_has_permission('contacts.delete'));

-- ── contact_submissions ──
DROP POLICY IF EXISTS contact_submissions_select ON tbrain_landing.contact_submissions;
CREATE POLICY contact_submissions_select ON tbrain_landing.contact_submissions
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('contacts.view'));

DROP POLICY IF EXISTS contact_submissions_update ON tbrain_landing.contact_submissions;
CREATE POLICY contact_submissions_update ON tbrain_landing.contact_submissions
  FOR UPDATE TO authenticated
  USING (tbrain_landing.admin_has_permission('contacts.edit'))
  WITH CHECK (tbrain_landing.admin_has_permission('contacts.edit'));

DROP POLICY IF EXISTS contact_submissions_delete ON tbrain_landing.contact_submissions;
CREATE POLICY contact_submissions_delete ON tbrain_landing.contact_submissions
  FOR DELETE TO authenticated
  USING (tbrain_landing.admin_has_permission('contacts.delete'));
-- (INSERT is service_role only — public /api/contact writes rows.)

-- ── newsletter_subscribers ──
DROP POLICY IF EXISTS newsletter_subscribers_select ON tbrain_landing.newsletter_subscribers;
CREATE POLICY newsletter_subscribers_select ON tbrain_landing.newsletter_subscribers
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('contacts.view'));

DROP POLICY IF EXISTS newsletter_subscribers_delete ON tbrain_landing.newsletter_subscribers;
CREATE POLICY newsletter_subscribers_delete ON tbrain_landing.newsletter_subscribers
  FOR DELETE TO authenticated
  USING (tbrain_landing.admin_has_permission('contacts.delete'));
-- (INSERT/UPDATE via service_role only.)

-- ── cms_posts / cms_assets ──
DROP POLICY IF EXISTS cms_posts_select ON tbrain_landing.cms_posts;
CREATE POLICY cms_posts_select ON tbrain_landing.cms_posts
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('content.view'));

DROP POLICY IF EXISTS cms_posts_insert ON tbrain_landing.cms_posts;
CREATE POLICY cms_posts_insert ON tbrain_landing.cms_posts
  FOR INSERT TO authenticated
  WITH CHECK (tbrain_landing.admin_has_permission('content.create'));

DROP POLICY IF EXISTS cms_posts_update ON tbrain_landing.cms_posts;
CREATE POLICY cms_posts_update ON tbrain_landing.cms_posts
  FOR UPDATE TO authenticated
  USING (tbrain_landing.admin_has_permission('content.edit'))
  WITH CHECK (tbrain_landing.admin_has_permission('content.edit'));

DROP POLICY IF EXISTS cms_posts_delete ON tbrain_landing.cms_posts;
CREATE POLICY cms_posts_delete ON tbrain_landing.cms_posts
  FOR DELETE TO authenticated
  USING (tbrain_landing.admin_has_permission('content.delete'));

DROP POLICY IF EXISTS cms_assets_select ON tbrain_landing.cms_assets;
CREATE POLICY cms_assets_select ON tbrain_landing.cms_assets
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('content.view'));

DROP POLICY IF EXISTS cms_assets_write ON tbrain_landing.cms_assets;
CREATE POLICY cms_assets_write ON tbrain_landing.cms_assets
  FOR ALL TO authenticated
  USING (tbrain_landing.admin_has_permission('content.edit'))
  WITH CHECK (tbrain_landing.admin_has_permission('content.edit'));

-- ── access_grants / batch_passcodes ──
DROP POLICY IF EXISTS access_grants_select ON tbrain_landing.access_grants;
CREATE POLICY access_grants_select ON tbrain_landing.access_grants
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('passcodes.view'));

DROP POLICY IF EXISTS access_grants_insert ON tbrain_landing.access_grants;
CREATE POLICY access_grants_insert ON tbrain_landing.access_grants
  FOR INSERT TO authenticated
  WITH CHECK (tbrain_landing.admin_has_permission('passcodes.create'));

DROP POLICY IF EXISTS access_grants_update ON tbrain_landing.access_grants;
CREATE POLICY access_grants_update ON tbrain_landing.access_grants
  FOR UPDATE TO authenticated
  USING (tbrain_landing.admin_has_permission('passcodes.revoke'))
  WITH CHECK (tbrain_landing.admin_has_permission('passcodes.revoke'));

DROP POLICY IF EXISTS access_grants_delete ON tbrain_landing.access_grants;
CREATE POLICY access_grants_delete ON tbrain_landing.access_grants
  FOR DELETE TO authenticated
  USING (tbrain_landing.admin_has_permission('passcodes.revoke'));

DROP POLICY IF EXISTS batch_passcodes_select ON tbrain_landing.batch_passcodes;
CREATE POLICY batch_passcodes_select ON tbrain_landing.batch_passcodes
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('passcodes.view'));

DROP POLICY IF EXISTS batch_passcodes_insert ON tbrain_landing.batch_passcodes;
CREATE POLICY batch_passcodes_insert ON tbrain_landing.batch_passcodes
  FOR INSERT TO authenticated
  WITH CHECK (tbrain_landing.admin_has_permission('passcodes.create'));

DROP POLICY IF EXISTS batch_passcodes_update ON tbrain_landing.batch_passcodes;
CREATE POLICY batch_passcodes_update ON tbrain_landing.batch_passcodes
  FOR UPDATE TO authenticated
  USING (tbrain_landing.admin_has_permission('passcodes.revoke'))
  WITH CHECK (tbrain_landing.admin_has_permission('passcodes.revoke'));

DROP POLICY IF EXISTS batch_passcodes_delete ON tbrain_landing.batch_passcodes;
CREATE POLICY batch_passcodes_delete ON tbrain_landing.batch_passcodes
  FOR DELETE TO authenticated
  USING (tbrain_landing.admin_has_permission('passcodes.revoke'));

-- ── access_requests ──
DROP POLICY IF EXISTS access_requests_select ON tbrain_landing.access_requests;
CREATE POLICY access_requests_select ON tbrain_landing.access_requests
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('requests.view'));

DROP POLICY IF EXISTS access_requests_update ON tbrain_landing.access_requests;
CREATE POLICY access_requests_update ON tbrain_landing.access_requests
  FOR UPDATE TO authenticated
  USING (
    tbrain_landing.admin_has_permission('requests.approve')
    OR tbrain_landing.admin_has_permission('requests.reject')
  )
  WITH CHECK (
    tbrain_landing.admin_has_permission('requests.approve')
    OR tbrain_landing.admin_has_permission('requests.reject')
  );
-- (INSERT/DELETE via service_role — public form inserts, never deletes.)

-- ── access_events / auth_attempts / admin_audit_log (audit tables) ──
--    Read gated by audit.view. Writes are service_role only (no authenticated policy).
DROP POLICY IF EXISTS access_events_select ON tbrain_landing.access_events;
CREATE POLICY access_events_select ON tbrain_landing.access_events
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('audit.view'));

DROP POLICY IF EXISTS auth_attempts_select ON tbrain_landing.auth_attempts;
CREATE POLICY auth_attempts_select ON tbrain_landing.auth_attempts
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('audit.view'));

DROP POLICY IF EXISTS admin_audit_log_select ON tbrain_landing.admin_audit_log;
CREATE POLICY admin_audit_log_select ON tbrain_landing.admin_audit_log
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('audit.view'));

-- ── chat_sessions / chat_messages (chatbot history, admin-view-only) ──
DROP POLICY IF EXISTS chat_sessions_select ON tbrain_landing.chat_sessions;
CREATE POLICY chat_sessions_select ON tbrain_landing.chat_sessions
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('audit.view'));

DROP POLICY IF EXISTS chat_messages_select ON tbrain_landing.chat_messages;
CREATE POLICY chat_messages_select ON tbrain_landing.chat_messages
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('audit.view'));

-- ── groups / group_members / group_permissions ──
DROP POLICY IF EXISTS groups_select ON tbrain_landing.groups;
CREATE POLICY groups_select ON tbrain_landing.groups
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('groups.view'));

DROP POLICY IF EXISTS groups_insert ON tbrain_landing.groups;
CREATE POLICY groups_insert ON tbrain_landing.groups
  FOR INSERT TO authenticated
  WITH CHECK (tbrain_landing.admin_has_permission('groups.create'));

DROP POLICY IF EXISTS groups_update ON tbrain_landing.groups;
CREATE POLICY groups_update ON tbrain_landing.groups
  FOR UPDATE TO authenticated
  USING (tbrain_landing.admin_has_permission('groups.edit'))
  WITH CHECK (tbrain_landing.admin_has_permission('groups.edit'));

DROP POLICY IF EXISTS groups_delete ON tbrain_landing.groups;
CREATE POLICY groups_delete ON tbrain_landing.groups
  FOR DELETE TO authenticated
  USING (tbrain_landing.admin_has_permission('groups.delete'));

DROP POLICY IF EXISTS group_members_select ON tbrain_landing.group_members;
CREATE POLICY group_members_select ON tbrain_landing.group_members
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('groups.view'));

DROP POLICY IF EXISTS group_members_write ON tbrain_landing.group_members;
CREATE POLICY group_members_write ON tbrain_landing.group_members
  FOR ALL TO authenticated
  USING (tbrain_landing.admin_has_permission('groups.manage_members'))
  WITH CHECK (tbrain_landing.admin_has_permission('groups.manage_members'));

DROP POLICY IF EXISTS group_permissions_select ON tbrain_landing.group_permissions;
CREATE POLICY group_permissions_select ON tbrain_landing.group_permissions
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('groups.view'));

DROP POLICY IF EXISTS group_permissions_write ON tbrain_landing.group_permissions;
CREATE POLICY group_permissions_write ON tbrain_landing.group_permissions
  FOR ALL TO authenticated
  USING (tbrain_landing.admin_has_permission('groups.edit'))
  WITH CHECK (tbrain_landing.admin_has_permission('groups.edit'));

-- ── fm_folders / fm_files ──
DROP POLICY IF EXISTS fm_folders_select ON tbrain_landing.fm_folders;
CREATE POLICY fm_folders_select ON tbrain_landing.fm_folders
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('files.view'));

DROP POLICY IF EXISTS fm_folders_write ON tbrain_landing.fm_folders;
CREATE POLICY fm_folders_write ON tbrain_landing.fm_folders
  FOR ALL TO authenticated
  USING (tbrain_landing.admin_has_permission('files.manage'))
  WITH CHECK (tbrain_landing.admin_has_permission('files.manage'));

DROP POLICY IF EXISTS fm_files_select ON tbrain_landing.fm_files;
CREATE POLICY fm_files_select ON tbrain_landing.fm_files
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('files.view'));

DROP POLICY IF EXISTS fm_files_insert ON tbrain_landing.fm_files;
CREATE POLICY fm_files_insert ON tbrain_landing.fm_files
  FOR INSERT TO authenticated
  WITH CHECK (tbrain_landing.admin_has_permission('files.upload'));

DROP POLICY IF EXISTS fm_files_update ON tbrain_landing.fm_files;
CREATE POLICY fm_files_update ON tbrain_landing.fm_files
  FOR UPDATE TO authenticated
  USING (tbrain_landing.admin_has_permission('files.manage'))
  WITH CHECK (tbrain_landing.admin_has_permission('files.manage'));

DROP POLICY IF EXISTS fm_files_delete ON tbrain_landing.fm_files;
CREATE POLICY fm_files_delete ON tbrain_landing.fm_files
  FOR DELETE TO authenticated
  USING (tbrain_landing.admin_has_permission('files.delete'));

-- ── approval_requests ──
DROP POLICY IF EXISTS approval_requests_select ON tbrain_landing.approval_requests;
CREATE POLICY approval_requests_select ON tbrain_landing.approval_requests
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('approvals.view'));

DROP POLICY IF EXISTS approval_requests_insert ON tbrain_landing.approval_requests;
CREATE POLICY approval_requests_insert ON tbrain_landing.approval_requests
  FOR INSERT TO authenticated
  WITH CHECK (tbrain_landing.admin_has_permission('approvals.submit'));

DROP POLICY IF EXISTS approval_requests_update ON tbrain_landing.approval_requests;
CREATE POLICY approval_requests_update ON tbrain_landing.approval_requests
  FOR UPDATE TO authenticated
  USING (
    tbrain_landing.admin_has_permission('approvals.approve')
    OR tbrain_landing.admin_has_permission('approvals.reject')
  )
  WITH CHECK (
    tbrain_landing.admin_has_permission('approvals.approve')
    OR tbrain_landing.admin_has_permission('approvals.reject')
  );

DROP POLICY IF EXISTS approval_requests_delete ON tbrain_landing.approval_requests;
CREATE POLICY approval_requests_delete ON tbrain_landing.approval_requests
  FOR DELETE TO authenticated
  USING (tbrain_landing.admin_has_permission('approvals.submit'));

-- ── batches / samples / files (data projects) ──
DROP POLICY IF EXISTS batches_select ON tbrain_landing.batches;
CREATE POLICY batches_select ON tbrain_landing.batches
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('data.view'));

DROP POLICY IF EXISTS batches_write ON tbrain_landing.batches;
CREATE POLICY batches_write ON tbrain_landing.batches
  FOR ALL TO authenticated
  USING (tbrain_landing.admin_has_permission('data.manage'))
  WITH CHECK (tbrain_landing.admin_has_permission('data.manage'));

DROP POLICY IF EXISTS samples_select ON tbrain_landing.samples;
CREATE POLICY samples_select ON tbrain_landing.samples
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('data.view'));

DROP POLICY IF EXISTS samples_insert ON tbrain_landing.samples;
CREATE POLICY samples_insert ON tbrain_landing.samples
  FOR INSERT TO authenticated
  WITH CHECK (
    tbrain_landing.admin_has_permission('data.ingest')
    OR tbrain_landing.admin_has_permission('data.manage')
  );

DROP POLICY IF EXISTS samples_update ON tbrain_landing.samples;
CREATE POLICY samples_update ON tbrain_landing.samples
  FOR UPDATE TO authenticated
  USING (tbrain_landing.admin_has_permission('data.manage'))
  WITH CHECK (tbrain_landing.admin_has_permission('data.manage'));

DROP POLICY IF EXISTS samples_delete ON tbrain_landing.samples;
CREATE POLICY samples_delete ON tbrain_landing.samples
  FOR DELETE TO authenticated
  USING (tbrain_landing.admin_has_permission('data.manage'));

DROP POLICY IF EXISTS files_select ON tbrain_landing.files;
CREATE POLICY files_select ON tbrain_landing.files
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('data.view'));

DROP POLICY IF EXISTS files_write ON tbrain_landing.files;
CREATE POLICY files_write ON tbrain_landing.files
  FOR ALL TO authenticated
  USING (tbrain_landing.admin_has_permission('data.manage'))
  WITH CHECK (tbrain_landing.admin_has_permission('data.manage'));
