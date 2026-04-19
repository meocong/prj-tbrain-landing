import { getGlobalRequestsStats } from "@/lib/admin/server/stats";
import { RequestsClient } from "./requests-client";
import { KpiStrip } from "@/components/admin/ui/kpi-strip";
import { Clock, CheckCircle2, XCircle, CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const stats = await getGlobalRequestsStats();

  return (
    <>
      <KpiStrip
        items={[
          { label: "Pending", value: stats.pending, icon: Clock, accent: "warning" },
          { label: "Approved", value: stats.approved, icon: CheckCircle2, accent: "success" },
          { label: "Rejected", value: stats.rejected, icon: XCircle, accent: "error" },
          { label: "Last 7d", value: stats.last_7d, icon: CalendarDays, accent: "primary" },
        ]}
      />
      <RequestsClient />
    </>
  );
}
