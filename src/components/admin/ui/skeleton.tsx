/** Skeleton shimmer primitives using existing .skeleton CSS class. */

export function SkeletonLine({ width = "100%", height = 14 }: { width?: string | number; height?: number }) {
  return (
    <span
      className="skeleton block"
      style={{ width, height, borderRadius: 6 }}
    />
  );
}

export function SkeletonCircle({ size = 32 }: { size?: number }) {
  return <span className="skeleton block" style={{ width: size, height: size, borderRadius: "50%" }} />;
}

export function SkeletonCard({ lines = 2 }: { lines?: number }) {
  return (
    <div className="glass-card p-5 space-y-2.5">
      <SkeletonLine width="60%" height={18} />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} width={`${60 + ((i * 23) % 30)}%`} height={12} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="glass-card overflow-hidden">
      {/* Toolbar skeleton */}
      <div
        className="flex items-center gap-2 px-4 py-2.5"
        style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-input)" }}
      >
        <SkeletonLine width={240} height={30} />
        <SkeletonLine width={110} height={30} />
        <div className="flex-1" />
      </div>
      {/* Rows skeleton */}
      <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={`grid gap-3 px-3 py-3 items-center stagger-${Math.min(i + 1, 6)}`}
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {Array.from({ length: cols }).map((__, j) => (
              <SkeletonLine key={j} width={j === 0 ? "80%" : "60%"} height={12} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonKpiGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`glass-card relative overflow-hidden p-5 stagger-${Math.min(i + 1, 6)}`}>
          <SkeletonLine width={100} height={10} />
          <div className="mt-3">
            <SkeletonLine width={60} height={32} />
          </div>
        </div>
      ))}
    </div>
  );
}
