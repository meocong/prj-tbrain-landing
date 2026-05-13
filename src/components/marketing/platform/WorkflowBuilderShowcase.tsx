"use client";

import {
  Cpu,
  Bot,
  Scale,
  ShieldCheck,
  Webhook,
  GitBranch,
  Mail,
  Pause,
  Sparkles,
} from "lucide-react";
import type { ComponentType } from "react";

type NodeKind =
  | "trigger"
  | "auto_qc"
  | "ai_review"
  | "branch"
  | "human_qc"
  | "approval"
  | "webhook"
  | "notification"
  | "ai_score";

type Node = {
  id: string;
  kind: NodeKind;
  title: string;
  status: "done" | "running" | "pending";
  x: number;
  y: number;
  meta?: string;
};

const NODE_PRESETS: Record<
  NodeKind,
  { icon: ComponentType<{ className?: string }>; color: string; tag: string }
> = {
  trigger:      { icon: Sparkles,    color: "#A78BFA", tag: "TRIGGER" },
  auto_qc:      { icon: Cpu,         color: "#6C3CF4", tag: "AUTO QC" },
  ai_review:    { icon: Bot,         color: "#8b5cf6", tag: "AI REVIEW" },
  ai_score:     { icon: Sparkles,    color: "#a78bfa", tag: "AI SCORE" },
  branch:       { icon: GitBranch,   color: "#f59e0b", tag: "BRANCH" },
  human_qc:     { icon: Scale,       color: "#10B981", tag: "HUMAN QC" },
  approval:     { icon: ShieldCheck, color: "#34d399", tag: "APPROVAL" },
  webhook:      { icon: Webhook,     color: "#0ea5e9", tag: "WEBHOOK" },
  notification: { icon: Mail,        color: "#ec4899", tag: "EMAIL" },
};

// Coordinates are in a virtual 1100×620 viewBox.
const NODES: Node[] = [
  { id: "n1", kind: "trigger",  title: "On submission",   status: "done",    x: 60,   y: 270, meta: "submitted" },
  { id: "n2", kind: "auto_qc",  title: "Auto QC checks",  status: "done",    x: 250,  y: 270, meta: "23 rules" },
  { id: "n3", kind: "ai_review",title: "AI judge",        status: "done",    x: 460,  y: 180, meta: "GPT-class" },
  { id: "n4", kind: "ai_score", title: "Score axes",      status: "running", x: 460,  y: 360, meta: "6 dims" },
  { id: "n5", kind: "branch",   title: "Score ≥ 0.85?",   status: "running", x: 670,  y: 270, meta: "threshold" },
  { id: "n6", kind: "human_qc", title: "Reviewer pod",    status: "pending", x: 870,  y: 180, meta: "L2 expert" },
  { id: "n7", kind: "approval", title: "Final approval",  status: "pending", x: 870,  y: 360, meta: "auto-pass" },
  { id: "n8", kind: "webhook",  title: "Push to client",  status: "pending", x: 1050, y: 270, meta: "REST" },
];

type Edge = { from: string; to: string; label?: string; flavor?: "branch-yes" | "branch-no" };

const EDGES: Edge[] = [
  { from: "n1", to: "n2" },
  { from: "n2", to: "n3" },
  { from: "n2", to: "n4" },
  { from: "n3", to: "n5" },
  { from: "n4", to: "n5" },
  { from: "n5", to: "n6", label: "needs review", flavor: "branch-no" },
  { from: "n5", to: "n7", label: "auto-approve", flavor: "branch-yes" },
  { from: "n6", to: "n8" },
  { from: "n7", to: "n8" },
];

const NODE_W = 180;
const NODE_H = 76;

export function WorkflowBuilderShowcase() {
  return (
    <div
      className="relative overflow-hidden rounded-3xl"
      style={{
        background:
          "linear-gradient(135deg, #0b0d12 0%, #15102b 55%, #0b0d12 100%)",
        border: "1px solid rgba(108,60,244,0.25)",
        boxShadow: "0 30px 80px -30px rgba(108,60,244,0.45)",
      }}
    >
      {/* Faux IDE chrome */}
      <div
        className="flex items-center gap-2 border-b px-4 py-3"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <span className="h-3 w-3 rounded-full" style={{ background: "#ef4444" }} />
        <span className="h-3 w-3 rounded-full" style={{ background: "#f59e0b" }} />
        <span className="h-3 w-3 rounded-full" style={{ background: "#10B981" }} />
        <span
          className="ml-3 rounded-md px-2 py-0.5 text-[10px] font-mono"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}
        >
          /projects/odyssey/workflows/qc-default
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{
              background: "rgba(16,185,129,0.18)",
              color: "#34d399",
              border: "1px solid rgba(16,185,129,0.35)",
            }}
          >
            ● Active
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{
              background: "rgba(108,60,244,0.18)",
              color: "#c4b5fd",
              border: "1px solid rgba(108,60,244,0.35)",
            }}
          >
            v3
          </span>
        </div>
      </div>

      {/* Palette toolbar — looks like draggable nodes */}
      <div
        className="flex flex-wrap items-center gap-1.5 border-b px-4 py-3"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <span
          className="mr-2 text-[10px] uppercase tracking-[0.18em]"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Drag nodes →
        </span>
        {(["trigger", "auto_qc", "ai_review", "ai_score", "branch", "human_qc", "approval", "webhook", "notification"] as NodeKind[]).map(
          (kind) => {
            const p = NODE_PRESETS[kind];
            const Icon = p.icon;
            return (
              <span
                key={kind}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold cursor-grab"
                style={{
                  background: `${p.color}1a`,
                  border: `1px solid ${p.color}33`,
                  color: p.color,
                }}
              >
                <Icon className="h-3 w-3" />
                {p.tag}
              </span>
            );
          }
        )}
      </div>

      {/* Canvas */}
      <div className="relative">
        <svg
          viewBox="0 0 1240 620"
          className="block w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background grid */}
          <defs>
            <pattern id="wf-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            </pattern>
            <linearGradient id="wf-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6C3CF4" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="wf-line-yes" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="wf-line-no" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          <rect width="1240" height="620" fill="url(#wf-grid)" />

          {/* Edges (drawn first so nodes overlap them) */}
          {EDGES.map((e, i) => {
            const a = NODES.find((n) => n.id === e.from)!;
            const b = NODES.find((n) => n.id === e.to)!;
            const x1 = a.x + NODE_W;
            const y1 = a.y + NODE_H / 2;
            const x2 = b.x;
            const y2 = b.y + NODE_H / 2;
            const dx = (x2 - x1) * 0.5;
            const path = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
            const stroke =
              e.flavor === "branch-yes"
                ? "url(#wf-line-yes)"
                : e.flavor === "branch-no"
                  ? "url(#wf-line-no)"
                  : "url(#wf-line)";
            return (
              <g key={i}>
                <path
                  d={path}
                  fill="none"
                  stroke={stroke}
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  className="loop-dash"
                />
                {e.label && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 8}
                    fill={e.flavor === "branch-yes" ? "#34d399" : "#fbbf24"}
                    fontSize="10"
                    fontWeight="700"
                    textAnchor="middle"
                    style={{ paintOrder: "stroke", stroke: "#0b0d12", strokeWidth: 4 }}
                  >
                    {e.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {NODES.map((node) => {
            const p = NODE_PRESETS[node.kind];
            const statusColor =
              node.status === "done"
                ? "#10B981"
                : node.status === "running"
                  ? "#6C3CF4"
                  : "rgba(255,255,255,0.35)";
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                style={{
                  filter: node.status === "running" ? "drop-shadow(0 0 12px rgba(108,60,244,0.5))" : undefined,
                }}
              >
                <rect
                  width={NODE_W}
                  height={NODE_H}
                  rx="10"
                  fill="rgba(20, 18, 35, 0.92)"
                  stroke={p.color}
                  strokeWidth="1.5"
                  strokeOpacity="0.55"
                />
                {node.status === "running" && (
                  <rect
                    width={NODE_W}
                    height={NODE_H}
                    rx="10"
                    fill="none"
                    stroke={p.color}
                    strokeWidth="2"
                    className="loop-dash"
                    strokeDasharray="4 4"
                  />
                )}
                {/* Status dot */}
                <circle cx="14" cy="14" r="4" fill={statusColor}>
                  {node.status === "running" && (
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="1.6s" repeatCount="indefinite" />
                  )}
                </circle>
                {/* Tag */}
                <text
                  x={NODE_W - 10}
                  y={18}
                  fill={p.color}
                  fontSize="9"
                  fontWeight="700"
                  textAnchor="end"
                  letterSpacing="1.2"
                >
                  {p.tag}
                </text>
                {/* Title */}
                <text x="48" y="42" fill="#fff" fontSize="14" fontWeight="600">
                  {node.title}
                </text>
                {/* Meta */}
                {node.meta && (
                  <text x="48" y="60" fill="rgba(255,255,255,0.45)" fontSize="10">
                    {node.meta}
                  </text>
                )}
                {/* Icon — drawn via foreignObject so we can use lucide */}
                <foreignObject x="22" y="34" width="18" height="18">
                  <p.icon className="h-4 w-4" />
                </foreignObject>
              </g>
            );
          })}

          {/* Status legend */}
          <g transform="translate(20, 580)">
            <circle cx="6" cy="6" r="4" fill="#10B981" />
            <text x="18" y="10" fill="rgba(255,255,255,0.6)" fontSize="10">Done</text>
            <circle cx="86" cy="6" r="4" fill="#6C3CF4">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="1.6s" repeatCount="indefinite" />
            </circle>
            <text x="98" y="10" fill="rgba(255,255,255,0.6)" fontSize="10">Running</text>
            <circle cx="180" cy="6" r="4" fill="rgba(255,255,255,0.35)" />
            <text x="192" y="10" fill="rgba(255,255,255,0.6)" fontSize="10">Pending</text>
          </g>
        </svg>
      </div>

      {/* Status footer */}
      <div
        className="flex items-center justify-between border-t px-4 py-3 text-[11px]"
        style={{ borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)" }}
      >
        <span className="flex items-center gap-2">
          <Pause className="h-3.5 w-3.5" />
          Temporal-backed · pause / resume / retry every step
        </span>
        <span>
          <span className="text-white font-semibold">8</span> nodes ·{" "}
          <span className="text-white font-semibold">9</span> edges ·{" "}
          <span style={{ color: "#34d399" }}>2 done</span> ·{" "}
          <span style={{ color: "#a78bfa" }}>2 running</span>
        </span>
      </div>
    </div>
  );
}
