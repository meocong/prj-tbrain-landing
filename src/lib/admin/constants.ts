import {
  LayoutDashboard,
  FileText,
  Users,
  KeyRound,
  ScrollText,
  Inbox,
  Settings,
  Database,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: string; // Required permission code
}

export const ADMIN_NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    permission: "admin.access",
  },
  {
    label: "Content",
    href: "/admin/content",
    icon: FileText,
    permission: "content.view",
  },
  {
    label: "Contacts",
    href: "/admin/contacts",
    icon: Users,
    permission: "contacts.view",
  },
  {
    label: "Data Access",
    href: "/admin/passcodes",
    icon: KeyRound,
    permission: "passcodes.view",
  },
  {
    label: "Requests",
    href: "/admin/requests",
    icon: Inbox,
    permission: "requests.view",
  },
  {
    label: "Audit Log",
    href: "/admin/audit",
    icon: ScrollText,
    permission: "audit.view",
  },
  {
    label: "Data Projects",
    href: "/admin/data",
    icon: Database,
    permission: "data.view",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    permission: "settings.view",
  },
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
