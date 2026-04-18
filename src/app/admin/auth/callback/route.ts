import { NextResponse, type NextRequest } from "next/server";
import { createAdminServerClient } from "@/lib/admin/supabase-server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") || "/admin";

  if (code) {
    const supabase = await createAdminServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(redirect, req.url));
}
