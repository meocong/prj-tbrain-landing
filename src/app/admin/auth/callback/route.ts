import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { sanitizeAdminRedirect } from "@/lib/admin/auth-redirect";
import { ensureBootstrapAdmin } from "@/lib/admin/bootstrap";

/**
 * OAuth Callback — exchanges PKCE code for session server-side.
 *
 * Cookies set by exchangeCodeForSession must be attached to THIS handler's
 * NextResponse.redirect(). The cookies() helper from next/headers writes to
 * an implicit response that gets discarded when we return our own — so we
 * buffer them and copy onto response.cookies before returning.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeAdminRedirect(searchParams.get("redirect"));

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  const isLocalEnv = process.env.NODE_ENV === "development";
  const baseUrl = isLocalEnv
    ? new URL(request.url).origin
    : forwardedHost
      ? `${forwardedProto}://${forwardedHost}`
      : new URL(request.url).origin;

  const failureResponse = NextResponse.redirect(
    new URL("/admin/login?error=auth_callback_failed", baseUrl)
  );

  if (!code) return failureResponse;

  const successResponse = NextResponse.redirect(new URL(next, baseUrl));
  const pendingCookies: Array<{ name: string; value: string; options: CookieOptions }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: "landing-admin-auth-token" },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          pendingCookies.push(...cookiesToSet);
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[landing] OAuth code exchange failed:", error.message);
    return failureResponse;
  }

  for (const { name, value, options } of pendingCookies) {
    successResponse.cookies.set(name, value, options);
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.email) {
      await ensureBootstrapAdmin(
        user.email,
        (user.user_metadata?.full_name as string | undefined) ??
          (user.user_metadata?.name as string | undefined) ??
          null,
        (user.user_metadata?.avatar_url as string | undefined) ??
          (user.user_metadata?.picture as string | undefined) ??
          null
      );
    }
  } catch (bootstrapErr) {
    console.error("[landing] admin bootstrap error:", bootstrapErr);
  }

  return successResponse;
}
