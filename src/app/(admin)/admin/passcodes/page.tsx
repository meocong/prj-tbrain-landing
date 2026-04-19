import { getGlobalPasscodesStats } from "@/lib/admin/server/stats";
import { PasscodesClient } from "./passcodes-client";
import { KpiStrip } from "@/components/admin/ui/kpi-strip";
import { KeyRound, User, Clock, Ban } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PasscodesPage() {
  const stats = await getGlobalPasscodesStats();

  return (
    <>
      <KpiStrip
        items={[
          { label: "Active", value: stats.active, icon: KeyRound, accent: "success" },
          { label: "Shared codes", value: stats.shared, icon: User, accent: "primary" },
          { label: "Expiring ≤ 7d", value: stats.expiring_7d, icon: Clock, accent: "warning" },
          { label: "Revoked", value: stats.revoked, icon: Ban, accent: "error" },
        ]}
      />
      <PasscodesClient />
    </>
  );
}
