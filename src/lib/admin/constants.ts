import {
  LayoutDashboard,
  FileText,
  Users,
  UsersRound,
  KeyRound,
  ScrollText,
  Inbox,
  Settings,
  Package,
  FolderOpen,
  CheckSquare,
  Images,
  Mail,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: string; // Required permission code
  section?: string;
}

export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, permission: "admin.access" },

  // Products (top-level product-centric surface — each product owns its
  // batches, passcodes, requests, events, etc.)
  { label: "Products", href: "/admin/products", icon: Package, permission: "data.view", section: "Products" },

  // Content
  { label: "Posts", href: "/admin/content", icon: FileText, permission: "content.view", section: "Content" },
  { label: "Gallery", href: "/admin/gallery", icon: Images, permission: "files.view", section: "Content" },

  // CRM — unified. Forms / Newsletter surface as tags inside Contacts.
  { label: "Contacts", href: "/admin/contacts", icon: Users, permission: "contacts.view", section: "CRM" },
  { label: "Inbox (form submissions)", href: "/admin/contacts/forms", icon: Inbox, permission: "contacts.view", section: "CRM" },
  { label: "Approvals", href: "/admin/approvals", icon: CheckSquare, permission: "approvals.view", section: "CRM" },

  // Communications
  { label: "Email Templates", href: "/admin/email-templates", icon: Mail, permission: "content.view", section: "Comms" },

  // Access Control (Django-style Auth) — My Profile is reached from the avatar dropdown, not here
  { label: "Users", href: "/admin/users", icon: Users, permission: "users.view", section: "Access Control" },
  { label: "Groups", href: "/admin/groups", icon: UsersRound, permission: "groups.view", section: "Access Control" },

  // System
  { label: "Audit Log", href: "/admin/audit", icon: ScrollText, permission: "audit.view", section: "System" },
  { label: "Settings", href: "/admin/settings", icon: Settings, permission: "settings.view", section: "System" },
];

// Legacy — kept for deep-link/bookmark compatibility; these routes still work,
// but top-level sidebar now scopes them under Products.
export const LEGACY_NAV: NavItem[] = [
  { label: "Passcodes (all)", href: "/admin/passcodes", icon: KeyRound, permission: "passcodes.view" },
  { label: "Requests (all)", href: "/admin/requests", icon: Inbox, permission: "requests.view" },
  { label: "Files (old)", href: "/admin/files", icon: FolderOpen, permission: "files.view" },
];


// Badge color maps
export const CONTACT_STATUS_BADGE: Record<string, string> = {
  new: "badge-info",
  contacted: "badge-warning",
  qualified: "badge-success",
  converted: "badge-success",
};

export const POST_STATUS_BADGE: Record<string, string> = {
  draft: "badge-muted",
  published: "badge-success",
  archived: "badge-warning",
};

export const REQUEST_STATUS_BADGE: Record<string, string> = {
  pending: "badge-warning",
  approved: "badge-success",
  rejected: "badge-error",
};

export const GRANT_STATUS_BADGE: Record<string, string> = {
  active: "badge-success",
  expired: "badge-muted",
  revoked: "badge-error",
};
