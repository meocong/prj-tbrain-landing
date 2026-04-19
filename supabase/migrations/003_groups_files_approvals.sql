-- ============================================================
-- TBrain Landing v3 — Groups, File Manager, Approval Workflows
-- ============================================================

-- ── 1. Groups (permission-based, users belong to many) ──────

CREATE TABLE IF NOT EXISTS tbrain_landing.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_by uuid REFERENCES tbrain_landing.admin_users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tbrain_landing.group_permissions (
  group_id uuid NOT NULL REFERENCES tbrain_landing.groups(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES tbrain_landing.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, permission_id)
);

CREATE TABLE IF NOT EXISTS tbrain_landing.group_members (
  group_id uuid NOT NULL REFERENCES tbrain_landing.groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES tbrain_landing.admin_users(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS group_members_user_idx ON tbrain_landing.group_members (user_id);

-- ── 2. File Manager ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tbrain_landing.fm_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid REFERENCES tbrain_landing.fm_folders(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES tbrain_landing.admin_users(id),
  visibility text NOT NULL DEFAULT 'private',
  allowed_group_id uuid REFERENCES tbrain_landing.groups(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS fm_folders_parent_idx ON tbrain_landing.fm_folders (parent_id);

CREATE TABLE IF NOT EXISTS tbrain_landing.fm_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  gcs_object text NOT NULL,
  mime_type text,
  size_bytes bigint,
  folder_id uuid REFERENCES tbrain_landing.fm_folders(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES tbrain_landing.admin_users(id),
  visibility text NOT NULL DEFAULT 'private',
  allowed_group_id uuid REFERENCES tbrain_landing.groups(id),
  download_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS fm_files_folder_idx ON tbrain_landing.fm_files (folder_id);
CREATE INDEX IF NOT EXISTS fm_files_owner_idx ON tbrain_landing.fm_files (owner_id);

-- ── 3. Approval Workflow ────────────────────────────────────

CREATE TABLE IF NOT EXISTS tbrain_landing.approval_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  submitted_by uuid REFERENCES tbrain_landing.admin_users(id),
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid REFERENCES tbrain_landing.admin_users(id),
  review_note text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

CREATE INDEX IF NOT EXISTS approval_requests_status_idx
  ON tbrain_landing.approval_requests (status, submitted_at DESC);
CREATE INDEX IF NOT EXISTS approval_requests_resource_idx
  ON tbrain_landing.approval_requests (resource_type, resource_id);

-- ── 4. New permissions ──────────────────────────────────────

INSERT INTO tbrain_landing.permissions (code, name, resource, action) VALUES
  ('groups.view',           'View Groups',           'groups',    'view'),
  ('groups.create',         'Create Groups',         'groups',    'create'),
  ('groups.edit',           'Edit Groups',           'groups',    'edit'),
  ('groups.delete',         'Delete Groups',         'groups',    'delete'),
  ('groups.manage_members', 'Manage Group Members',  'groups',    'manage_members'),
  ('files.view',            'View Files',            'files',     'view'),
  ('files.upload',          'Upload Files',          'files',     'upload'),
  ('files.download',        'Download Files',        'files',     'download'),
  ('files.delete',          'Delete Files',          'files',     'delete'),
  ('files.manage',          'Manage File Settings',  'files',     'manage'),
  ('approvals.view',        'View Approvals',        'approvals', 'view'),
  ('approvals.submit',      'Submit for Approval',   'approvals', 'submit'),
  ('approvals.approve',     'Approve Requests',      'approvals', 'approve'),
  ('approvals.reject',      'Reject Requests',       'approvals', 'reject')
ON CONFLICT (code) DO NOTHING;

-- Grant new permissions to super_admin and admin roles
INSERT INTO tbrain_landing.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM tbrain_landing.roles r
CROSS JOIN tbrain_landing.permissions p
WHERE r.code = 'super_admin'
  AND p.code IN ('groups.view','groups.create','groups.edit','groups.delete','groups.manage_members',
                 'files.view','files.upload','files.download','files.delete','files.manage',
                 'approvals.view','approvals.submit','approvals.approve','approvals.reject')
ON CONFLICT DO NOTHING;

INSERT INTO tbrain_landing.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM tbrain_landing.roles r
CROSS JOIN tbrain_landing.permissions p
WHERE r.code = 'admin'
  AND p.code IN ('groups.view','groups.create','groups.edit','groups.manage_members',
                 'files.view','files.upload','files.download','files.delete','files.manage',
                 'approvals.view','approvals.approve','approvals.reject')
ON CONFLICT DO NOTHING;

-- content_editor gets files + submit approval
INSERT INTO tbrain_landing.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM tbrain_landing.roles r
CROSS JOIN tbrain_landing.permissions p
WHERE r.code = 'content_editor'
  AND p.code IN ('files.view','files.upload','files.download','approvals.submit')
ON CONFLICT DO NOTHING;

-- viewer gets view-only
INSERT INTO tbrain_landing.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM tbrain_landing.roles r
CROSS JOIN tbrain_landing.permissions p
WHERE r.code = 'viewer'
  AND p.code IN ('groups.view','files.view','approvals.view')
ON CONFLICT DO NOTHING;

-- ── 5. RLS + Grants ─────────────────────────────────────────

ALTER TABLE tbrain_landing.groups             ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbrain_landing.group_permissions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbrain_landing.group_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbrain_landing.fm_folders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbrain_landing.fm_files           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbrain_landing.approval_requests  ENABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES IN SCHEMA tbrain_landing TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA tbrain_landing TO service_role;

-- Seed a default "All Files" root folder
INSERT INTO tbrain_landing.fm_folders (name, visibility) VALUES ('Root', 'public')
ON CONFLICT DO NOTHING;
