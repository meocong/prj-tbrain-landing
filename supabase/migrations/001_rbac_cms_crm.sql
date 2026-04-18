-- ============================================================
-- TBrain Landing v2 — RBAC, CMS, CRM, Chat, Newsletter
-- Namespace: tbrain_landing (extends existing schema)
-- Run via: psql "$DATABASE_URL" < supabase/migrations/001_rbac_cms_crm.sql
-- ============================================================

-- ── 1. Dynamic RBAC System ──────────────────────────────────

-- Permission definitions (granular actions)
CREATE TABLE IF NOT EXISTS tbrain_landing.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,               -- e.g. 'admin.access', 'content.edit', 'contacts.view'
  name text NOT NULL,                       -- Human-readable: "Access Admin Panel"
  description text,
  resource text NOT NULL,                   -- e.g. 'admin', 'content', 'contacts', 'passcodes', 'audit', 'data', 'chat'
  action text NOT NULL,                     -- e.g. 'access', 'view', 'create', 'edit', 'delete', 'export'
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Dynamic roles
CREATE TABLE IF NOT EXISTS tbrain_landing.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,               -- e.g. 'super_admin', 'admin', 'content_editor', 'viewer'
  name text NOT NULL,                       -- "Super Admin", "Content Editor"
  description text,
  is_system boolean NOT NULL DEFAULT false, -- System roles cannot be deleted
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Role -> Permission mapping (many-to-many)
CREATE TABLE IF NOT EXISTS tbrain_landing.role_permissions (
  role_id uuid NOT NULL REFERENCES tbrain_landing.roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES tbrain_landing.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Admin users — links to sso.profiles or standalone
CREATE TABLE IF NOT EXISTS tbrain_landing.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  role_id uuid NOT NULL REFERENCES tbrain_landing.roles(id),
  sso_profile_id uuid,                     -- Optional link to sso.profiles
  is_active boolean NOT NULL DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_users_email_idx ON tbrain_landing.admin_users (email) WHERE is_active = true;

-- Seed: default permissions
INSERT INTO tbrain_landing.permissions (code, name, resource, action) VALUES
  ('admin.access',      'Access Admin Panel',     'admin',     'access'),
  ('content.view',      'View Content',           'content',   'view'),
  ('content.create',    'Create Content',         'content',   'create'),
  ('content.edit',      'Edit Content',           'content',   'edit'),
  ('content.delete',    'Delete Content',         'content',   'delete'),
  ('content.publish',   'Publish Content',        'content',   'publish'),
  ('contacts.view',     'View Contacts',          'contacts',  'view'),
  ('contacts.create',   'Create Contacts',        'contacts',  'create'),
  ('contacts.edit',     'Edit Contacts',          'contacts',  'edit'),
  ('contacts.delete',   'Delete Contacts',        'contacts',  'delete'),
  ('contacts.export',   'Export Contacts',        'contacts',  'export'),
  ('passcodes.view',    'View Passcodes',         'passcodes', 'view'),
  ('passcodes.create',  'Create Passcodes',       'passcodes', 'create'),
  ('passcodes.revoke',  'Revoke Passcodes',       'passcodes', 'revoke'),
  ('audit.view',        'View Audit Logs',        'audit',     'view'),
  ('audit.export',      'Export Audit Logs',      'audit',     'export'),
  ('data.view',         'View Data Projects',     'data',      'view'),
  ('data.manage',       'Manage Data Projects',   'data',      'manage'),
  ('data.ingest',       'Ingest Data',            'data',      'ingest'),
  ('requests.view',     'View Access Requests',   'requests',  'view'),
  ('requests.approve',  'Approve Access Requests','requests',  'approve'),
  ('requests.reject',   'Reject Access Requests', 'requests',  'reject'),
  ('settings.view',     'View Settings',          'settings',  'view'),
  ('settings.edit',     'Edit Settings',          'settings',  'edit'),
  ('users.view',        'View Admin Users',       'users',     'view'),
  ('users.manage',      'Manage Admin Users',     'users',     'manage')
ON CONFLICT (code) DO NOTHING;

-- Seed: default roles
INSERT INTO tbrain_landing.roles (code, name, description, is_system) VALUES
  ('super_admin',    'Super Admin',    'Full access to all features. Cannot be deleted.', true),
  ('admin',          'Admin',          'Full access except user management.',              true),
  ('content_editor', 'Content Editor', 'Can create, edit, and publish content.',           true),
  ('data_manager',   'Data Manager',   'Can manage data projects, passcodes, requests.',   true),
  ('viewer',         'Viewer',         'Read-only access to admin panel.',                 true)
ON CONFLICT (code) DO NOTHING;

-- Seed: role-permission mappings
-- super_admin gets ALL permissions
INSERT INTO tbrain_landing.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM tbrain_landing.roles r
CROSS JOIN tbrain_landing.permissions p
WHERE r.code = 'super_admin'
ON CONFLICT DO NOTHING;

-- admin gets all except users.manage
INSERT INTO tbrain_landing.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM tbrain_landing.roles r
CROSS JOIN tbrain_landing.permissions p
WHERE r.code = 'admin' AND p.code != 'users.manage'
ON CONFLICT DO NOTHING;

-- content_editor
INSERT INTO tbrain_landing.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM tbrain_landing.roles r
CROSS JOIN tbrain_landing.permissions p
WHERE r.code = 'content_editor' AND p.code IN (
  'admin.access', 'content.view', 'content.create', 'content.edit', 'content.publish'
)
ON CONFLICT DO NOTHING;

-- data_manager
INSERT INTO tbrain_landing.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM tbrain_landing.roles r
CROSS JOIN tbrain_landing.permissions p
WHERE r.code = 'data_manager' AND p.code IN (
  'admin.access', 'data.view', 'data.manage', 'data.ingest',
  'passcodes.view', 'passcodes.create', 'passcodes.revoke',
  'requests.view', 'requests.approve', 'requests.reject',
  'contacts.view', 'audit.view'
)
ON CONFLICT DO NOTHING;

-- viewer
INSERT INTO tbrain_landing.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM tbrain_landing.roles r
CROSS JOIN tbrain_landing.permissions p
WHERE r.code = 'viewer' AND p.code IN (
  'admin.access', 'content.view', 'contacts.view', 'passcodes.view',
  'audit.view', 'data.view', 'requests.view', 'settings.view'
)
ON CONFLICT DO NOTHING;


-- ── 2. CRM Extensions (extend existing clients table) ──────

ALTER TABLE tbrain_landing.clients ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE tbrain_landing.clients ADD COLUMN IF NOT EXISTS source text DEFAULT 'data_request';
ALTER TABLE tbrain_landing.clients ADD COLUMN IF NOT EXISTS status text DEFAULT 'new';
ALTER TABLE tbrain_landing.clients ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE tbrain_landing.clients ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE tbrain_landing.clients ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Contact form submissions (linked to clients)
CREATE TABLE IF NOT EXISTS tbrain_landing.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text,
  company text,
  role text,
  phone text,
  message text NOT NULL,
  source text NOT NULL DEFAULT 'contact_form',
  client_id uuid REFERENCES tbrain_landing.clients(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contact_submissions_email_idx
  ON tbrain_landing.contact_submissions (email, created_at DESC);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS tbrain_landing.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at timestamptz,
  source text DEFAULT 'website'
);


-- ── 3. CMS System ──────────────────────────────────────────

-- Blog posts (self-hosted, replaces/supplements WordPress)
CREATE TABLE IF NOT EXISTS tbrain_landing.cms_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content_md text,                         -- Markdown content
  cover_image_url text,                    -- GCS path or full URL
  category text,
  tags text[],
  author_id uuid REFERENCES tbrain_landing.admin_users(id),
  author_name text,
  status text NOT NULL DEFAULT 'draft',    -- draft, published, archived
  published_at timestamptz,
  seo_title text,
  seo_description text,
  og_image_url text,
  view_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cms_posts_status_idx
  ON tbrain_landing.cms_posts (status, published_at DESC);
CREATE INDEX IF NOT EXISTS cms_posts_slug_idx
  ON tbrain_landing.cms_posts (slug) WHERE status = 'published';

-- CMS assets / media library
CREATE TABLE IF NOT EXISTS tbrain_landing.cms_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  gcs_object text NOT NULL,                -- GCS path: cms/{year}/{month}/{uuid}_{filename}
  mime_type text NOT NULL,
  size_bytes bigint,
  alt_text text,
  uploaded_by uuid REFERENCES tbrain_landing.admin_users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ── 4. AI Chat ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tbrain_landing.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text,                         -- Anonymous fingerprint or client_id
  ip inet,
  user_agent text,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz,
  message_count int NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tbrain_landing.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES tbrain_landing.chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL,                      -- 'user' or 'assistant'
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_messages_session_idx
  ON tbrain_landing.chat_messages (session_id, created_at);


-- ── 5. Admin audit log ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS tbrain_landing.admin_audit_log (
  id bigserial PRIMARY KEY,
  admin_user_id uuid REFERENCES tbrain_landing.admin_users(id),
  action text NOT NULL,                    -- 'create', 'update', 'delete', 'approve', 'reject', 'revoke', 'login'
  resource_type text NOT NULL,             -- 'post', 'contact', 'passcode', 'request', 'role', 'user', 'setting'
  resource_id text,
  details jsonb,                           -- { before: {...}, after: {...} } or extra context
  ip inet,
  user_agent text,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_audit_log_admin_idx
  ON tbrain_landing.admin_audit_log (admin_user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_log_resource_idx
  ON tbrain_landing.admin_audit_log (resource_type, resource_id, occurred_at DESC);


-- ── 6. RLS on new tables ───────────────────────────────────

ALTER TABLE tbrain_landing.permissions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbrain_landing.roles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbrain_landing.role_permissions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbrain_landing.admin_users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbrain_landing.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbrain_landing.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbrain_landing.cms_posts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbrain_landing.cms_assets         ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbrain_landing.chat_sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbrain_landing.chat_messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbrain_landing.admin_audit_log    ENABLE ROW LEVEL SECURITY;

-- Grant service_role access to new tables
GRANT ALL ON ALL TABLES IN SCHEMA tbrain_landing TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA tbrain_landing TO service_role;
