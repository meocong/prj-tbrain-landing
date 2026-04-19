import type { LucideIcon } from "lucide-react";

export type KpiItem = {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  accent?: "primary" | "success" | "warning" | "error" | "info";
};

export function KpiStrip({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid gap-3 mb-5" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0,1fr))` }}>
      {items.map((k, i) => (
        <div
          key={k.label}
          className={`glass-card p-3 stagger-${Math.min(i + 1, 6)}`}
          style={{ position: "relative", overflow: "hidden" }}
        >
          {k.accent && <div className={`kpi-accent-bar kpi-accent-${k.accent}`} />}
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              {k.label}
            </p>
            {k.icon && <k.icon className="h-3.5 w-3.5 opacity-50" style={{ color: "var(--text-muted)" }} />}
          </div>
          <p
            className="mt-1 text-xl font-bold"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            {k.value}
          </p>
        </div>
      ))}
    </div>
  );
}
