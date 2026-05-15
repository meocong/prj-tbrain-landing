import { SkeletonTable, SkeletonLine } from "@/components/admin/ui/skeleton";
export default function Loading() {
  return (
    <div>
      <SkeletonLine width={90} height={12} />
      <div className="mt-3 flex items-center gap-3 mb-4">
        <span className="skeleton h-11 w-11 rounded-xl block" />
        <div className="space-y-1">
          <SkeletonLine width={180} height={24} />
          <SkeletonLine width={280} height={12} />
        </div>
      </div>
      <div className="mb-5 flex gap-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="skeleton my-1" style={{ width: 80, height: 20, borderRadius: 4 }} />
        ))}
      </div>
      <SkeletonTable rows={7} cols={5} />
    </div>
  );
}
