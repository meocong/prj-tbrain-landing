import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { createServerClient } from "@supabase/ssr";

const SESSION_COOKIE = "tb_session";

function secret(): Uint8Array {
  const value = process.env.TB_AUTH_SECRET;
  if (!value) throw new Error("Missing TB_AUTH_SECRET");
  return new TextEncoder().encode(value);
}

async function isTbAuthenticated(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret());
    return true;
  } catch {
    return false;
  }
}

async function isAdminAuthenticated(req: NextRequest): Promise<boolean> {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: { name: "landing-admin-auth-token" },
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll() {
            // Middleware can't set cookies in the response this way; handled by NextResponse
          },
        },
      }
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return !!user;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // ── Admin routes ──
  if (pathname.startsWith("/admin")) {
    // Admin login page is always public
    if (pathname === "/admin/login") return NextResponse.next();

    const ok = await isAdminAuthenticated(req);
    if (ok) return NextResponse.next();

    // Redirect to admin login
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = `?redirect=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  // ── Terminal Bench data routes ──
  // Public auth routes and pages
  const isPublic =
    pathname.startsWith("/data/terminal-bench/api/auth/") ||
    pathname === "/data/terminal-bench" ||
    pathname === "/data/terminal-bench/enter" ||
    pathname === "/data/terminal-bench/request-access" ||
    pathname === "/data/terminal-bench/request-sent";

  if (isPublic) return NextResponse.next();

  // Check TB session for protected data routes
  if (
    pathname.startsWith("/data/terminal-bench/s/") ||
    pathname.startsWith("/data/terminal-bench/api/")
  ) {
    const ok = await isTbAuthenticated(req);
    if (ok) return NextResponse.next();

    // API: 401
    if (pathname.startsWith("/data/terminal-bench/api/")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Page: redirect to enter
    const url = req.nextUrl.clone();
    url.pathname = "/data/terminal-bench/enter";
    url.search = `?redirect=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/data/terminal-bench/s/:path*",
    "/data/terminal-bench/api/:path*",
  ],
};
