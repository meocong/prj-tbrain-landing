import { C } from "../tokens";

/*
 * Placeholders for the record viewer. Static on purpose: nothing in the viewer
 * moves by itself, and a pulsing skeleton would be the one thing in it that did.
 * The text says what is loading, because `aria-busy` alone tells a screen reader
 * nothing about it.
 */

/** The modal body, while the viewer's own chunk is still arriving. */
export function ViewerSkeleton() {
  return (
    <div aria-busy="true" className="flex min-h-[min(60dvh,520px)] flex-1 items-center justify-center px-5 py-10">
      <p className="bp-mono text-[10px]" style={{ color: C.textDim }}>
        Loading the record
      </p>
    </div>
  );
}

/**
 * Where the state lane goes, until its JSON has arrived. Same footprint as the
 * lane (heading, two rows, an axis), so the pane does not jump when it lands.
 */
export function LaneSkeleton({ rowHeight }: { rowHeight: number }) {
  return (
    <div aria-busy="true">
      <p className="bp-mono text-[10px]" style={{ color: C.textDim }}>
        Loading the state lane
      </p>
      <div className="mt-2 space-y-1.5 py-2">
        {[0, 1].map((i) => (
          <div key={i} style={{ height: rowHeight, background: C.wash, border: `1px solid ${C.hairlineSoft}` }} />
        ))}
      </div>
    </div>
  );
}
