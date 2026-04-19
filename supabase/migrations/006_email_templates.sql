-- ──────────────────────────────────────────────────────────────────────────
-- 006_email_templates.sql
--
-- Phase 2: email templates system.
--
-- Keys (conventional):
--   passcode_granted   — sales issues a passcode or request approved
--   request_approved   — (alternate rendering of approval)
--   request_rejected   — request rejected
--   welcome            — first-time welcome
--
-- Scope:
--   product_id NULL = global template (fallback)
--   product_id set  = product-specific override
-- ──────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tbrain_landing.email_templates (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     uuid REFERENCES tbrain_landing.products(id) ON DELETE CASCADE,
  key            text NOT NULL,
  name           text NOT NULL,
  subject        text NOT NULL,
  body_html      text NOT NULL,
  body_text      text,
  variables      jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active      boolean NOT NULL DEFAULT true,
  created_by     uuid REFERENCES tbrain_landing.admin_users(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- One active template per (product, key). NULL product_id means global.
CREATE UNIQUE INDEX IF NOT EXISTS email_templates_product_key_uniq
  ON tbrain_landing.email_templates (coalesce(product_id::text, ''), key)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS email_templates_product_idx
  ON tbrain_landing.email_templates (product_id);

ALTER TABLE tbrain_landing.email_templates ENABLE ROW LEVEL SECURITY;

-- Permissions: reuse content.view / content.edit for now (will move to
-- `templates.view` / `templates.edit` in a later pass if needed).
DROP POLICY IF EXISTS email_templates_select ON tbrain_landing.email_templates;
CREATE POLICY email_templates_select ON tbrain_landing.email_templates
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('content.view'));

DROP POLICY IF EXISTS email_templates_write ON tbrain_landing.email_templates;
CREATE POLICY email_templates_write ON tbrain_landing.email_templates
  FOR ALL TO authenticated
  USING (tbrain_landing.admin_has_permission('content.edit'))
  WITH CHECK (tbrain_landing.admin_has_permission('content.edit'));

GRANT SELECT, INSERT, UPDATE, DELETE ON tbrain_landing.email_templates TO authenticated;

-- Seed global defaults (product_id NULL)
INSERT INTO tbrain_landing.email_templates (product_id, key, name, subject, body_html, body_text, variables) VALUES
  (NULL, 'passcode_granted',
   'Passcode granted',
   'Your {{product_name}} access is ready',
   $html$
<p>Hi {{client_name}},</p>
<p>Here is your access to <strong>{{product_name}}</strong>:</p>
<p style="font-family: ui-monospace, monospace; background:#f5f5f5; padding:12px 16px; border-radius:8px; display:inline-block; font-size:16px;"><strong>{{passcode}}</strong></p>
<p>Enter it at <a href="{{site_url}}">{{site_url}}</a>. The code expires on <strong>{{expires_at}}</strong>.</p>
<p>If you have questions, just reply to this email.</p>
<p>— Tbrain</p>
   $html$,
   'Hi {{client_name}},

Your access to {{product_name}} is ready. Passcode: {{passcode}}
Enter it at {{site_url}}. It expires on {{expires_at}}.

— Tbrain',
   '["client_name","product_name","passcode","site_url","expires_at"]'::jsonb),

  (NULL, 'request_approved',
   'Access request approved',
   'Your access request has been approved',
   $html$
<p>Hi {{client_name}},</p>
<p>Good news — your request to access <strong>{{product_name}}</strong> has been approved.</p>
<p>Passcode: <strong style="font-family: ui-monospace, monospace;">{{passcode}}</strong></p>
<p>Use it at <a href="{{site_url}}">{{site_url}}</a> (expires {{expires_at}}).</p>
<p>— Tbrain</p>
   $html$,
   NULL,
   '["client_name","product_name","passcode","site_url","expires_at"]'::jsonb),

  (NULL, 'request_rejected',
   'Access request declined',
   'Update on your access request',
   $html$
<p>Hi {{client_name}},</p>
<p>Thanks for your interest in <strong>{{product_name}}</strong>. Unfortunately, we are unable to grant access at this time.</p>
{{#reason}}<p><em>{{reason}}</em></p>{{/reason}}
<p>Feel free to reply if you'd like to discuss further.</p>
<p>— Tbrain</p>
   $html$,
   NULL,
   '["client_name","product_name","reason"]'::jsonb),

  (NULL, 'welcome',
   'Welcome',
   'Welcome to Tbrain',
   $html$
<p>Hi {{client_name}},</p>
<p>Welcome! We'll reach out soon with next steps for <strong>{{product_name}}</strong>.</p>
<p>— Tbrain</p>
   $html$,
   NULL,
   '["client_name","product_name"]'::jsonb)
ON CONFLICT DO NOTHING;
