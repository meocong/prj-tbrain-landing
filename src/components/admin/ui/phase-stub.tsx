import { Construction } from "lucide-react";

export function PhaseStub({ phase, title }: { phase: string; title: string }) {
  return (
    <div
      className="glass-card flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ background: "var(--bg-input)", color: "var(--text-muted)" }}
      >
        <Construction className="h-6 w-6" />
      </div>
      <h3
        className="text-lg font-semibold"
        style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
      >
        {title}
      </h3>
      <p className="mt-1 text-sm max-w-md" style={{ color: "var(--text-muted)" }}>
        This surface ships in {phase}. The schema + nav are already in place —
        UI comes next.
      </p>
    </div>
  );
}
