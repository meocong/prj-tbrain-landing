import { NextResponse } from "next/server";
import { createAdminServerClient } from "@/lib/admin/supabase-server";
import { getAdminUser, getPermissionCodes } from "@/lib/admin/permissions";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createAdminServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    console.error("[auth/me] no email on session", { user });
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const adminUser = await getAdminUser(user.email);
  if (!adminUser) {
    console.error("[auth/me] not_admin — Supabase email not in admin_users", {
      email: user.email,
      providers: user.app_metadata?.providers,
      identityEmail: user.identities?.[0]?.identity_data?.email,
    });
    return NextResponse.json(
      { error: "not_admin", email: user.email },
      { status: 403 }
    );
  }

  return NextResponse.json({
    adminUser,
    permissions: getPermissionCodes(adminUser),
  });
}
