-- ──────────────────────────────────────────────────────────────────────────
-- 007_role_simplify.sql
--
-- Phase 4: Django-style role simplification.
--
-- Before: super_admin, admin, content_editor, data_manager, viewer (5 roles)
-- After:  super_admin, admin                                   (2 roles)
--         (non-admins don't have an admin_users row at all — they're
--          "user" at the auth layer only)
--
-- Permissions that used to be tied to the 3 legacy roles are moved into
-- seeded groups of the same spirit:
--   'Content Editors'  → content.*, files.view/upload/download, approvals.submit
--   'Data Managers'    → data.*, passcodes.*, requests.*, files.manage,
--                         approvals.approve/reject
--   'Viewers'          → *.view only
--
-- Any admin_users row currently holding a legacy role is rewritten to
-- role='admin' and inserted into the matching group. Only after no row
-- references them do we DELETE the legacy role records.
-- ──────────────────────────────────────────────────────────────────────────

-- 1. Seed groups (idempotent)
INSERT INTO tbrain_landing.groups (name, description)
VALUES
  ('Content Editors', 'Create, edit, publish content. Upload files. Submit for approval.'),
  ('Data Managers',   'Manage batches, passcodes, access requests. Approve/reject.'),
  ('Viewers',         'Read-only access to everything they are allowed to see.')
ON CONFLICT DO NOTHING;

-- 2. Give each seeded group the same permissions the old role had.
--    We re-derive from role_permissions for the role that matches by name.

-- Content Editors ← content_editor role
INSERT INTO tbrain_landing.group_permissions (group_id, permission_id)
SELECT g.id, rp.permission_id
FROM tbrain_landing.groups g
JOIN tbrain_landing.roles r ON r.code = 'content_editor'
JOIN tbrain_landing.role_permissions rp ON rp.role_id = r.id
WHERE g.name = 'Content Editors'
ON CONFLICT DO NOTHING;

-- Data Managers ← data_manager role
INSERT INTO tbrain_landing.group_permissions (group_id, permission_id)
SELECT g.id, rp.permission_id
FROM tbrain_landing.groups g
JOIN tbrain_landing.roles r ON r.code = 'data_manager'
JOIN tbrain_landing.role_permissions rp ON rp.role_id = r.id
WHERE g.name = 'Data Managers'
ON CONFLICT DO NOTHING;

-- Viewers ← viewer role
INSERT INTO tbrain_landing.group_permissions (group_id, permission_id)
SELECT g.id, rp.permission_id
FROM tbrain_landing.groups g
JOIN tbrain_landing.roles r ON r.code = 'viewer'
JOIN tbrain_landing.role_permissions rp ON rp.role_id = r.id
WHERE g.name = 'Viewers'
ON CONFLICT DO NOTHING;

-- 3. Migrate admin_users still on a legacy role:
--    a) Join them to the equivalent group
INSERT INTO tbrain_landing.group_members (group_id, user_id)
SELECT g.id, u.id
FROM tbrain_landing.admin_users u
JOIN tbrain_landing.roles r ON r.id = u.role_id
JOIN tbrain_landing.groups g
     ON (r.code = 'content_editor' AND g.name = 'Content Editors')
     OR (r.code = 'data_manager'   AND g.name = 'Data Managers')
     OR (r.code = 'viewer'         AND g.name = 'Viewers')
ON CONFLICT DO NOTHING;

--    b) Point their role_id at 'admin'
UPDATE tbrain_landing.admin_users u
   SET role_id = (SELECT id FROM tbrain_landing.roles WHERE code = 'admin'),
       updated_at = now()
 WHERE EXISTS (
   SELECT 1 FROM tbrain_landing.roles r
    WHERE r.id = u.role_id
      AND r.code IN ('content_editor', 'data_manager', 'viewer')
 );

-- 4. Drop the legacy role rows — safe now that nobody references them.
DELETE FROM tbrain_landing.role_permissions
 WHERE role_id IN (SELECT id FROM tbrain_landing.roles WHERE code IN ('content_editor','data_manager','viewer'));

DELETE FROM tbrain_landing.roles WHERE code IN ('content_editor','data_manager','viewer');
