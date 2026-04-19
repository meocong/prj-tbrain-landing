import { SkeletonTable, SkeletonLine } from "@/components/admin/ui/skeleton";
export default function Loading() {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <SkeletonLine width={180} height={28} />
        <SkeletonLine width={380} height={14} />
      </div>
      <SkeletonTable rows={6} cols={4} />
    </div>
  );
}
