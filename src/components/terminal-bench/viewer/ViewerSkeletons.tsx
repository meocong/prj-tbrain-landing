// Deterministic widths so server-render doesn't flicker.
const LINE_WIDTHS = [92, 78, 96, 65, 88, 72, 94, 70, 83, 90, 74, 95, 68, 86];

export function PanelSkeleton({
  maxWidth = "max-w-3xl",
  lines = 12,
  title = true,
}: {
  maxWidth?: string;
  lines?: number;
  title?: boolean;
}) {
  return (
    <div className={`container mx-auto ${maxWidth} px-6 py-12`}>
      <div className="animate-pulse space-y-4">
        {title ? (
          <>
            <div className="h-8 w-2/3 rounded-md bg-[#EEF0F3]" />
            <div className="h-4 w-1/3 rounded bg-[#F3F4F6]" />
            <div className="h-2" />
          </>
        ) : null}
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded bg-[#F3F4F6]"
            style={{ width: `${LINE_WIDTHS[i % LINE_WIDTHS.length]}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function InstructionSkeleton() {
  return <PanelSkeleton maxWidth="max-w-3xl" lines={14} />;
}

export function SolutionSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3">
          <div className="h-3 w-48 animate-pulse rounded bg-[#F3F4F6]" />
          <div className="h-6 w-14 animate-pulse rounded bg-[#F3F4F6]" />
        </div>
        <div className="space-y-3 p-5">
          {LINE_WIDTHS.slice(0, 10).map((w, i) => (
            <div
              key={i}
              className="h-3 animate-pulse rounded bg-[#F3F4F6]"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function FilesSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl px-6 py-8">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="h-[50vh] animate-pulse rounded-2xl border border-[#E5E7EB] bg-[#FAFAF7]" />
        <section className="h-[60vh] animate-pulse rounded-2xl border border-[#E5E7EB] bg-[#FAFAF7]" />
      </div>
    </div>
  );
}

export function TestsSkeleton() {
  return (
    <div className="container mx-auto max-w-3xl px-6 py-12">
      <div className="h-3 w-24 animate-pulse rounded bg-[#F3F4F6]" />
      <ul className="mt-6 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <li
            key={i}
            className="animate-pulse rounded-xl border border-[#E5E7EB] bg-white p-5"
          >
            <div className="h-4 w-2/3 rounded bg-[#F3F4F6]" />
            <div className="mt-3 h-3 w-1/2 rounded bg-[#F3F4F6]" />
            <div className="mt-3 h-3 w-11/12 rounded bg-[#F3F4F6]" />
          </li>
        ))}
      </ul>
    </div>
  );
}
