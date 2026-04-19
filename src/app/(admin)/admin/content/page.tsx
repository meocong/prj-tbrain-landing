import { getContentStats } from "@/lib/admin/server/stats";
import { ContentClient } from "./content-client";
import { KpiStrip } from "@/components/admin/ui/kpi-strip";
import { FileText, Eye, FileEdit, CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const stats = await getContentStats();

  return (
    <>
      <KpiStrip
        items={[
          { label: "Total posts", value: stats.total, icon: FileText, accent: "primary" },
          { label: "Published", value: stats.published, icon: Eye, accent: "success" },
          { label: "Drafts", value: stats.drafts, icon: FileEdit, accent: "warning" },
          { label: "Updated (7d)", value: stats.updated_7d, icon: CalendarDays, accent: "info" },
        ]}
      />
      <ContentClient />
    </>
  );
}
