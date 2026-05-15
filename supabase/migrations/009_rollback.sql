-- Rollback for 009_chat_persistence.sql
-- Removes chats.* permissions. Tables and data are preserved.

BEGIN;

DELETE FROM tbrain_landing.role_permissions
WHERE permission_id IN (
  SELECT id FROM tbrain_landing.permissions WHERE code IN ('chats.view', 'chats.delete')
);

DELETE FROM tbrain_landing.permissions WHERE code IN ('chats.view', 'chats.delete');

DROP INDEX IF EXISTS tbrain_landing.chat_sessions_last_message_idx;

COMMIT;
