import { SkeletonKpiGrid, SkeletonLine } from "@/components/admin/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <div className="mb-8 space-y-2">
        <SkeletonLine width={160} height={28} />
        <SkeletonLine width={320} height={14} />
      </div>
      <SkeletonKpiGrid count={6} />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-5 space-y-3">
          <SkeletonLine width="40%" height={18} />
          <SkeletonLine width="90%" height={14} />
          <SkeletonLine width="70%" height={14} />
          <SkeletonLine width="80%" height={14} />
        </div>
        <div className="glass-card p-5 space-y-3">
          <SkeletonLine width="40%" height={18} />
          <SkeletonLine width="80%" height={14} />
          <SkeletonLine width="70%" height={14} />
          <SkeletonLine width="90%" height={14} />
        </div>
      </div>
    </div>
  );
}
