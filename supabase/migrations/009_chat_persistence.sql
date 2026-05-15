-- ──────────────────────────────────────────────────────────────────────────
-- 009_chat_persistence.sql
--
-- Wire up chatbot persistence: chat_sessions / chat_messages were created in
-- migration 001 but never used. This migration only adds the permission codes
-- so admins can view chat history. Schema for the two tables is unchanged.
--
-- Rollback: 009_rollback.sql
-- ──────────────────────────────────────────────────────────────────────────

BEGIN;

-- 1. Add chats.* permissions
INSERT INTO tbrain_landing.permissions (code, name, resource, action) VALUES
  ('chats.view',   'View Chat Sessions',   'chats', 'view'),
  ('chats.delete', 'Delete Chat Sessions', 'chats', 'delete')
ON CONFLICT (code) DO NOTHING;

-- 2. Grant view+delete to super_admin (cross-join pattern)
INSERT INTO tbrain_landing.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM tbrain_landing.roles r
CROSS JOIN tbrain_landing.permissions p
WHERE r.code = 'super_admin' AND p.code IN ('chats.view', 'chats.delete')
ON CONFLICT DO NOTHING;

-- 3. Grant view to admin (no delete for admin)
INSERT INTO tbrain_landing.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM tbrain_landing.roles r
CROSS JOIN tbrain_landing.permissions p
WHERE r.code = 'admin' AND p.code = 'chats.view'
ON CONFLICT DO NOTHING;

-- 4. Grant view to viewer (read-only role)
INSERT INTO tbrain_landing.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM tbrain_landing.roles r
CROSS JOIN tbrain_landing.permissions p
WHERE r.code = 'viewer' AND p.code = 'chats.view'
ON CONFLICT DO NOTHING;

-- 5. Helpful index for the admin chat list (most recent first)
CREATE INDEX IF NOT EXISTS chat_sessions_last_message_idx
  ON tbrain_landing.chat_sessions (last_message_at DESC NULLS LAST);

COMMIT;
