import { SkeletonTable, SkeletonLine } from "@/components/admin/ui/skeleton";
export default function Loading() {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <SkeletonLine width={160} height={28} />
        <SkeletonLine width={360} height={14} />
      </div>
      <SkeletonTable rows={8} cols={5} />
    </div>
  );
}
