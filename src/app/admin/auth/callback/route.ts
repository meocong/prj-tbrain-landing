import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { ensureBootstrapAdmin } from "@/lib/admin/bootstrap";

/**
 * OAuth Callback — exchanges PKCE code for session server-side.
 * Mirrors management project's auth callback pattern.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("redirect") ?? "/admin";

  // Resolve real origin — inside Docker, request.url is http://0.0.0.0:3000
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  const isLocalEnv = process.env.NODE_ENV === "development";
  const baseUrl = isLocalEnv
    ? new URL(request.url).origin
    : forwardedHost
      ? `${forwardedProto}://${forwardedHost}`
      : new URL(request.url).origin;

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: {
          name: "landing-admin-auth-token",
        },
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server component can't set cookies — no-op
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Bootstrap allowlisted admins on first login. Failures are logged but
      // must not block the redirect — pre-existing admins still pass through.
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

      return NextResponse.redirect(`${baseUrl}${next}`);
    }

    console.error("[landing] OAuth code exchange failed:", error.message);
  }

  return NextResponse.redirect(`${baseUrl}/admin/login?error=auth_callback_failed`);
}
