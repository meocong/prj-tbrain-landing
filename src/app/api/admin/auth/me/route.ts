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
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const adminUser = await getAdminUser(user.email);
  if (!adminUser) {
    return NextResponse.json({ error: "not_admin" }, { status: 403 });
  }

  return NextResponse.json({
    adminUser,
    permissions: getPermissionCodes(adminUser),
  });
}
