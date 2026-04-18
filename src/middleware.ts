import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "tb_session";

function secret(): Uint8Array {
  const value = process.env.TB_AUTH_SECRET;
  if (!value) throw new Error("Missing TB_AUTH_SECRET");
  return new TextEncoder().encode(value);
}

async function isAuthenticated(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // The passcode/request/approve/reject auth routes are always public; the
  // `enter`, `request-access`, and `request-sent` pages are also public so
  // the user can sign in or request access without a session.
  const isPublic =
    pathname.startsWith("/data/terminal-bench/api/auth/") ||
    pathname === "/data/terminal-bench" ||
    pathname === "/data/terminal-bench/enter" ||
    pathname === "/data/terminal-bench/request-access" ||
    pathname === "/data/terminal-bench/request-sent";

  if (isPublic) return NextResponse.next();

  const ok = await isAuthenticated(req);
  if (ok) return NextResponse.next();

  // API: reject with 401 rather than redirect (so fetch() callers see the error clearly).
  if (pathname.startsWith("/data/terminal-bench/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Page: redirect to /enter with a ?redirect= hint.
  const url = req.nextUrl.clone();
  url.pathname = "/data/terminal-bench/enter";
  url.search = `?redirect=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/data/terminal-bench/s/:path*",
    "/data/terminal-bench/api/:path*",
  ],
};
