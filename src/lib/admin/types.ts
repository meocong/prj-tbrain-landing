// ── Product / Batch Types ──

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  site_url: string | null;
  sample_type: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Passcode {
  id: string;
  batch_id: string;
  product_id: string | null;
  client_id: string | null;
  passcode_prefix: string;
  label: string | null;
  issued_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  max_uses: number | null;
  use_count: number;
  last_used_at: string | null;
  note: string | null;
  client?: { email: string; full_name: string | null; company: string | null } | null;
  batch?: { slug: string; name: string } | null;
}

// ── RBAC Types ──

export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role_id: string;
  sso_profile_id: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  role?: Role;
}

export interface AdminUserWithPermissions extends AdminUser {
  role: RoleWithPermissions;
}

// ── CMS Types ──

export type PostStatus = "draft" | "published" | "archived";

export interface CmsPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_md: string | null;
  content_html: string | null;
  cover_image_url: string | null;
  category: string | null;
  tags: string[] | null;
  author_id: string | null;
  author_name: string | null;
  status: PostStatus;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  view_count: number;
  version: number;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface CmsAsset {
  id: string;
  filename: string;
  gcs_object: string;
  mime_type: string;
  size_bytes: number | null;
  alt_text: string | null;
  uploaded_by: string | null;
  created_at: string;
}

// ── CRM Types ──

export type ContactStatus = "new" | "contacted" | "qualified" | "converted";
export type ContactSource = "contact_form" | "newsletter" | "data_request" | "manual";

export interface Client {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  role: string | null;
  team_size: string | null;
  use_case: string | null;
  target_use: string[] | null;
  phone: string | null;
  source: string | null;
  status: string | null;
  tags: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ContactSubmission {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  role: string | null;
  phone: string | null;
  message: string;
  source: string;
  client_id: string | null;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  full_name: string | null;
  subscribed_at: string;
  unsubscribed_at: string | null;
  source: string | null;
}

// ── Group Types ──

export interface Group {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ── File Manager Types ──

export type FileVisibility = "public" | "private" | "group";

export interface FmFolder {
  id: string;
  name: string;
  parent_id: string | null;
  owner_id: string | null;
  visibility: FileVisibility;
  allowed_group_id: string | null;
  created_at: string;
}

export interface FmFile {
  id: string;
  name: string;
  gcs_object: string;
  mime_type: string | null;
  size_bytes: number | null;
  folder_id: string | null;
  owner_id: string | null;
  visibility: FileVisibility;
  allowed_group_id: string | null;
  download_count: number;
  created_at: string;
}

// ── Approval Types ──

export type ApprovalStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface ApprovalRequest {
  id: string;
  resource_type: string;
  resource_id: string;
  submitted_by: string | null;
  status: ApprovalStatus;
  reviewed_by: string | null;
  review_note: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

// ── Audit Types ──

export type AuditAction = "create" | "update" | "delete" | "approve" | "reject" | "revoke" | "login" | "export";
export type AuditResource = "post" | "contact" | "passcode" | "request" | "role" | "user" | "setting" | "asset" | "group" | "file" | "folder" | "approval";

export interface AdminAuditLog {
  id: number;
  admin_user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip: string | null;
  user_agent: string | null;
  occurred_at: string;
  // Joined
  admin_user?: Pick<AdminUser, "email" | "full_name">;
}
