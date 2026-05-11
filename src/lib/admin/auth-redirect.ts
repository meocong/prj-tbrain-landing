const ADMIN_FALLBACK_PATH = "/admin";

export function sanitizeAdminRedirect(value: string | null | undefined): string {
  if (!value) return ADMIN_FALLBACK_PATH;

  let decoded = value.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    return ADMIN_FALLBACK_PATH;
  }

  if (!decoded.startsWith("/") || decoded.startsWith("//")) {
    return ADMIN_FALLBACK_PATH;
  }

  try {
    const parsed = new URL(decoded, "https://landing-admin.local");
    if (parsed.origin !== "https://landing-admin.local") {
      return ADMIN_FALLBACK_PATH;
    }
    if (!parsed.pathname.startsWith("/admin")) {
      return ADMIN_FALLBACK_PATH;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return ADMIN_FALLBACK_PATH;
  }
}

export function getAdminAuthCallbackUrl(origin: string, redirect: string): string {
  const safeRedirect = sanitizeAdminRedirect(redirect);
  const url = new URL("/admin/auth/callback", origin);
  url.searchParams.set("redirect", safeRedirect);
  return url.toString();
}
