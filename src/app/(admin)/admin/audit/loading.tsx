import { SkeletonTable, SkeletonLine } from "@/components/admin/ui/skeleton";
export default function Loading() {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <SkeletonLine width={140} height={28} />
        <SkeletonLine width={360} height={14} />
      </div>
      <SkeletonTable rows={10} cols={5} />
    </div>
  );
}
