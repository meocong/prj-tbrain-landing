import Link from "next/link";
import type { CaseStudyBlock } from "@/lib/landing/case-study-block-types";

export type CaseStudyMetric = { value: string; label: string };
type Tone = "blue" | "indigo" | "purple" | "green" | "red" | "orange" | "yellow";
type GraphColor = "blue" | "green" | "yellow" | "orange" | "purple" | "pink" | "slate";

const METRIC_ACCENTS = [
  { border: "border-emerald-600", text: "text-emerald-600" },
  { border: "border-blue-600", text: "text-blue-600" },
  { border: "border-purple-600", text: "text-purple-600" },
  { border: "border-pink-600", text: "text-pink-600" },
];
const RICH_TEXT_FLOW =
  "[&_p]:my-0 [&_p+p]:mt-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-1 [&_a]:text-[#6C3CF4] [&_a]:underline [&_strong]:font-semibold " +
  "[&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-xl [&_img]:shadow-md";

export function CaseStudyWidgetRenderer({
  blocks,
  fallbackMetrics,
}: {
  blocks: CaseStudyBlock[];
  fallbackMetrics: CaseStudyMetric[];
}) {
  return (
    <>
      {blocks.map((block) => (
        <CaseStudyWidget key={block.id} block={block} fallbackMetrics={fallbackMetrics} />
      ))}
    </>
  );
}

export function CaseStudyWidget({
  block,
  fallbackMetrics = [],
}: {
  block: CaseStudyBlock;
  fallbackMetrics?: CaseStudyMetric[];
}) {
  switch (block.type) {
    case "metrics_grid":
      return <MetricsGrid metrics={asMetrics(block.config.metrics) || fallbackMetrics} />;
    case "text_card":
      return <TextCard block={block} />;
    case "objective_grid":
      return <ObjectiveGrid block={block} />;
    case "challenge_cards":
      return <ChallengeCards block={block} />;
    case "qa_framework":
      return <QaFramework block={block} />;
    case "process_steps":
      return <ProcessSteps block={block} />;
    case "outcome":
      return <OutcomeBlock block={block} />;
    case "image":
      return <ImageBlock block={block} />;
    case "workflow_graph":
      return <WorkflowGraph block={block} />;
    case "cta":
      return <LegacyCta title={block.title || "Need Expert Data Services?"} subtitle={block.subtitle || ""} config={block.config} />;
    default:
      return null;
  }
}

const METRIC_TOKENS = ["var(--bp-cyan)", "var(--bp-cyan-strong)", "var(--bp-purple)", "var(--bp-amber)"];

export function MetricsGrid({ metrics }: { metrics: CaseStudyMetric[] }) {
  if (!metrics.length) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
      {metrics.slice(0, 4).map((metric, i) => {
        const accent = METRIC_TOKENS[i % METRIC_TOKENS.length];
        return (
          <div
            key={`${metric.value}-${metric.label}-${i}`}
            className="bp-card text-center"
            style={{ padding: "22px 18px", borderRadius: 14, borderTop: `2px solid ${accent}` }}
          >
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(34px,4.4vw,52px)", fontWeight: 600, lineHeight: 1, letterSpacing: "-0.03em", color: accent }}>
              {metric.value}
            </div>
            <div className="bp-mono mt-2" style={{ fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--bp-ink-faint)" }}>
              {metric.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TextCard({ block }: { block: CaseStudyBlock }) {
  const variant = typeof block.config.variant === "string" ? block.config.variant : "";
  const shell = variant === "blue_gradient"
    ? "mb-12 bg-gradient-to-br from-blue-50/80 to-indigo-50/80"
    : "mb-12 bg-white/80";
  return (
    <section className={`${shell} backdrop-blur-sm rounded-2xl p-8 shadow-md`}>
      <LegacyHeading title={block.title || ""} tone="blue" />
      <div className={`space-y-4 text-[#222222] leading-relaxed text-lg ${RICH_TEXT_FLOW}`} dangerouslySetInnerHTML={{ __html: block.content || "" }} />
    </section>
  );
}

function ObjectiveGrid({ block }: { block: CaseStudyBlock }) {
  const items = asItems(block.config.items);
  return (
    <section className="mb-12">
      <LegacyHeading title={block.title || ""} tone="indigo" />
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-md">
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={`${item.title}-${i}`} className="text-center">
              <div className={`w-16 h-16 ${toneBg(item.tone, 100)} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <span className="text-3xl">{item.icon}</span>
              </div>
              <h3 className="font-bold text-lg text-[#222222] mb-2">{item.title}</h3>
              <div className={`text-gray-600 text-sm ${RICH_TEXT_FLOW}`} dangerouslySetInnerHTML={{ __html: item.body }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ChallengeCards({ block }: { block: CaseStudyBlock }) {
  const cards = asItems(block.config.cards);
  return (
    <section className="mb-12">
      <LegacyHeading title={block.title || ""} tone="red" />
      <div className="space-y-6">
        {cards.map((card, i) => (
          <div key={`${card.title}-${i}`} className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 border-l-4 ${toneBorder(card.tone)}`}>
            <h3 className="text-xl font-semibold text-[#222222] mb-3 flex items-center">
              <span className={`w-10 h-10 ${toneBg(card.tone, 100)} ${toneText(card.tone, 600)} rounded-full flex items-center justify-center font-bold mr-3`}>
                {card.icon}
              </span>
              {card.title}
            </h3>
            <div className={`text-[#222222] ml-13 ${RICH_TEXT_FLOW}`} dangerouslySetInnerHTML={{ __html: card.body }} />
          </div>
        ))}
      </div>
    </section>
  );
}

function QaFramework({ block }: { block: CaseStudyBlock }) {
  const layers = asItems(block.config.layers);
  const sampleGates = asItems(block.config.sampleGates);
  const solutionCards = asItems(block.config.solutionCards);
  const frameworkTitle = asString(block.config.frameworkTitle, "5-Layer Quality Assurance Framework");
  const warning = asString(block.config.warning, "");
  const firstLayers = layers.slice(0, 2);
  const finalLayer = layers[2];

  return (
    <section className="mb-12 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 backdrop-blur-sm rounded-2xl p-8 shadow-md">
      <LegacyHeading title={block.title || ""} tone="indigo" />
      {block.content && (
        <div className={`text-[#222222] leading-relaxed text-lg mb-8 ${RICH_TEXT_FLOW}`} dangerouslySetInnerHTML={{ __html: block.content }} />
      )}

      <div className="mb-8 bg-white/90 rounded-xl p-8 shadow-inner">
        <h3 className="text-2xl font-bold text-center text-[#222222] mb-8">{frameworkTitle}</h3>
        <div className="space-y-4">
          {firstLayers.map((layer, i) => (
            <div key={layer.title}>
              <LayerRow layer={layer} />
              {i < firstLayers.length - 1 && <DownArrow />}
            </div>
          ))}
          <DownArrow />
          <div className="bg-yellow-50 rounded-lg p-6 border-2 border-yellow-400">
            <h4 className="font-bold text-[#222222] mb-4 text-center">{asString(block.config.sampleGateTitle, "Parallel Statistical Quality Gates")}</h4>
            <div className="grid md:grid-cols-2 gap-4">
              {sampleGates.map((gate) => (
                <div key={gate.title || gate.label} className="flex items-center gap-4">
                  <div className={`w-20 h-20 ${toneBg(gate.tone, 500)} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <div className="text-center text-white">
                      <div className="text-xl font-bold">{gate.num}</div>
                      <div className="text-xs">{gate.label}</div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm text-gray-600 ${RICH_TEXT_FLOW}`} dangerouslySetInnerHTML={{ __html: gate.body }} />
                  </div>
                </div>
              ))}
            </div>
            {warning && (
              <div className="mt-4 bg-red-100 rounded p-3 text-center">
                <p className="text-sm font-semibold text-red-700">{warning}</p>
              </div>
            )}
          </div>
          {finalLayer && (
            <>
              <DownArrow />
              <LayerRow layer={finalLayer} />
            </>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {solutionCards.map((card, i) => (
          <div key={`${card.title}-${i}`} className="bg-white/90 rounded-xl p-6 shadow-md">
            <div className={`w-12 h-12 ${toneBg(card.tone, 100)} rounded-full flex items-center justify-center mb-4`}>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <h4 className="text-lg font-bold text-[#222222] mb-2">{card.title}</h4>
            <div className={`text-gray-600 text-sm ${RICH_TEXT_FLOW}`} dangerouslySetInnerHTML={{ __html: card.body }} />
          </div>
        ))}
      </div>
    </section>
  );
}

function LayerRow({ layer }: { layer: WidgetItem }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-24 h-24 ${toneBg(layer.tone, 500)} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
        <div className="text-center text-white">
          <div className="text-2xl font-bold">{layer.num}</div>
          <div className="text-xs">{layer.label}</div>
        </div>
      </div>
      <div className={`flex-1 ${toneBg(layer.tone, 50)} rounded-lg p-4`}>
        <h4 className="font-bold text-[#222222] mb-1">{layer.title}</h4>
        <div className={`text-sm text-gray-600 ${RICH_TEXT_FLOW}`} dangerouslySetInnerHTML={{ __html: layer.body }} />
      </div>
    </div>
  );
}

function DownArrow() {
  return (
    <div className="flex items-center justify-center">
      <div className="text-4xl text-gray-400">↓</div>
    </div>
  );
}

function ProcessSteps({ block }: { block: CaseStudyBlock }) {
  const steps = asItems(block.config.steps);
  return (
    <section className="mb-12">
      <LegacyHeading title={block.title || ""} tone="blue" />
      <div className="space-y-4">
        {steps.map((step, i) => (
          <div key={`${step.title}-${i}`} className={`bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border-l-4 ${toneBorder(step.tone)}`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 ${toneBg(step.tone, 100)} ${toneText(step.tone, 700)} rounded-full flex items-center justify-center font-bold flex-shrink-0 text-xl`}>
                {step.number}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#222222] mb-2">{step.title}</h3>
                <div className={`text-gray-600 text-sm ${RICH_TEXT_FLOW}`} dangerouslySetInnerHTML={{ __html: step.body }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function OutcomeBlock({ block }: { block: CaseStudyBlock }) {
  const cards = asItems(block.config.cards);
  const benefits = asStringArray(block.config.benefits);
  return (
    <section className="mb-12 bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm rounded-2xl p-8 shadow-md">
      <LegacyHeading title={block.title || ""} tone="green" />
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {cards.map((card, i) => (
          <div key={`${card.label}-${i}`} className={`bg-white/90 rounded-xl p-6 shadow-lg border-t-4 ${toneBorder(card.tone).replace("border-l-4", "border-t-4")}`}>
            <div className="text-center mb-4">
              <div className={`text-6xl font-bold ${toneText(card.tone, 600)}`}>{card.value}</div>
              <div className="text-gray-600 font-semibold mt-2">{card.label}</div>
            </div>
            <div className={`text-sm text-gray-600 text-center ${RICH_TEXT_FLOW}`} dangerouslySetInnerHTML={{ __html: card.body }} />
          </div>
        ))}
      </div>
      <div className="bg-white/90 rounded-xl p-6 shadow-md">
        <h3 className="text-xl font-bold text-[#222222] mb-4">{asString(block.config.benefitsTitle, "Client Benefits")}</h3>
        <ul className="space-y-3">
          {benefits.map((benefit, i) => (
            <li key={i} className="flex items-start">
              <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-[#222222]" dangerouslySetInnerHTML={{ __html: benefit }} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ImageBlock({ block }: { block: CaseStudyBlock }) {
  const src = asString(block.config.src, "");
  const alt = asString(block.config.alt, "Case study image");
  const caption = asString(block.config.caption, "");
  if (!src) return null;
  return (
    <section className="mb-12">
      <figure className="overflow-hidden rounded-2xl bg-white/80 p-3 shadow-md backdrop-blur-sm">
        <img src={src} alt={alt} className="h-auto w-full rounded-xl object-cover" />
        {caption && <figcaption className="px-2 pt-3 text-center text-sm text-gray-600">{caption}</figcaption>}
      </figure>
    </section>
  );
}

function WorkflowGraph({ block }: { block: CaseStudyBlock }) {
  const nodes = asGraphNodes(block.config.nodes);
  const edges = asGraphEdges(block.config.edges, nodes);
  if (!nodes.length) return null;

  const nodeW = 128;
  const nodeH = 128;
  const gapX = 215;
  const gapY = 144;
  const padX = 48;
  const padY = 56;
  const maxX = Math.max(...nodes.map((node) => node.x));
  const maxY = Math.max(...nodes.map((node) => node.y));
  const width = Math.max(760, padX * 2 + maxX * gapX + nodeW);
  const height = Math.max(280, padY * 2 + maxY * gapY + nodeH);
  const positions = new Map(nodes.map((node) => [node.id, { x: padX + node.x * gapX, y: padY + node.y * gapY }]));

  return (
    <section className="mb-12 overflow-hidden rounded-2xl bg-white/90 p-8 shadow-md backdrop-blur-sm">
      <h2 className="mb-2 text-center text-2xl font-bold text-[#222222]">{block.title || "Workflow"}</h2>
      {block.subtitle && <p className="mb-6 text-center text-gray-600">{block.subtitle}</p>}
      <div className="overflow-x-auto">
        <div className="relative mx-auto" style={{ width, height }}>
          <svg className="pointer-events-none absolute inset-0 h-full w-full" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
            <defs>
              <marker id={`arrow-${block.id}`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#9ca3af" />
              </marker>
            </defs>
            {edges.map((edge, index) => {
              const from = positions.get(edge.from);
              const to = positions.get(edge.to);
              if (!from || !to) return null;
              const x1 = from.x + nodeW + 24;
              const y1 = from.y + nodeH / 2;
              const x2 = to.x - 24;
              const y2 = to.y + nodeH / 2;
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;
              return (
                <g key={`${edge.from}-${edge.to}-${index}`}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#9ca3af" strokeWidth="2.5" markerEnd={`url(#arrow-${block.id})`} />
                  {edge.label && (
                    <text x={midX} y={midY - 8} textAnchor="middle" className="fill-gray-500 text-[12px] font-semibold">
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {nodes.map((node) => {
            const pos = positions.get(node.id);
            if (!pos) return null;
            const palette = graphPalette(node.color);
            return (
              <div
                key={node.id}
                className="absolute flex items-center justify-center rounded-2xl p-4 text-center text-white shadow-lg"
                style={{ left: pos.x, top: pos.y, width: nodeW, height: nodeH, background: palette.bg }}
              >
                <div>
                  <div className="text-2xl font-black leading-tight">{node.label}</div>
                  {node.subtitle && <div className="mt-2 text-sm font-semibold opacity-95">{node.subtitle}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LegacyHeading({ title, tone }: { title: string; tone: Tone }) {
  return (
    <h2 className="text-3xl font-bold text-[#222222] mb-6 flex items-center">
      <div className={`w-2 h-8 ${toneBg(tone, 600)} rounded-full mr-4`} />
      {title}
    </h2>
  );
}

export function LegacyCta({
  title,
  subtitle,
  config = {},
}: {
  title: string;
  subtitle: string;
  config?: Record<string, unknown>;
}) {
  const href = asString(config.href, "https://www.linkedin.com/company/tbrain-ai");
  const label = asString(config.label, "Connect Us Today");
  return (
    <section className="bp-frame relative overflow-hidden text-center" style={{ borderRadius: 18, padding: "clamp(40px,5vw,64px) 24px", background: "var(--bp-forge)" }}>
      <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: "clamp(26px,3.6vw,40px)", lineHeight: 1.05, letterSpacing: "-0.02em", color: "#fff" }}>{title}</h2>
      {subtitle && <p className="mx-auto mt-4 max-w-xl" style={{ fontSize: 16, color: "rgba(255,255,255,0.82)" }}>{subtitle}</p>}
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-7 inline-flex items-center gap-3 rounded-lg py-3 px-8 font-bold transition-all duration-200 hover:scale-[1.03] group"
        style={{ fontFamily: "var(--font-heading)", background: "#fff", color: "#1a1145" }}
      >
        <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
        <span>{label}</span>
      </Link>
    </section>
  );
}

type WidgetItem = {
  icon?: string;
  number?: string;
  num?: string;
  label?: string;
  title?: string;
  value?: string;
  body: string;
  tone: Tone;
};

type WorkflowGraphNode = {
  id: string;
  label: string;
  subtitle: string;
  color: GraphColor;
  x: number;
  y: number;
};

type WorkflowGraphEdge = {
  from: string;
  to: string;
  label: string;
};

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asMetrics(value: unknown): CaseStudyMetric[] | null {
  if (!Array.isArray(value)) return null;
  const metrics = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const source = item as Record<string, unknown>;
      const metric = {
        value: typeof source.value === "string" ? source.value : "",
        label: typeof source.label === "string" ? source.label : "",
      };
      return metric.value && metric.label ? metric : null;
    })
    .filter((item): item is CaseStudyMetric => Boolean(item));
  return metrics.length ? metrics : null;
}

function asItems(value: unknown): WidgetItem[] {
  if (!Array.isArray(value)) return [];
  const items: Array<WidgetItem | null> = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const source = item as Record<string, unknown>;
      return {
        icon: typeof source.icon === "string" ? source.icon : "",
        number: typeof source.number === "string" ? source.number : "",
        num: typeof source.num === "string" ? source.num : "",
        label: typeof source.label === "string" ? source.label : "",
        title: typeof source.title === "string" ? source.title : "",
        value: typeof source.value === "string" ? source.value : "",
        body: typeof source.body === "string" ? source.body : "",
        tone: normalizeTone(source.tone),
      };
    });
  return items.filter((item): item is WidgetItem => Boolean(item));
}

function asGraphNodes(value: unknown): WorkflowGraphNode[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const source = item as Record<string, unknown>;
      const id = asString(source.id, "");
      const label = asString(source.label, "");
      if (!id || !label) return null;
      return {
        id,
        label,
        subtitle: asString(source.subtitle, ""),
        color: normalizeGraphColor(source.color),
        x: typeof source.x === "number" ? source.x : Number(source.x) || 0,
        y: typeof source.y === "number" ? source.y : Number(source.y) || 0,
      };
    })
    .filter((item): item is WorkflowGraphNode => Boolean(item));
}

function asGraphEdges(value: unknown, nodes: WorkflowGraphNode[]): WorkflowGraphEdge[] {
  if (!Array.isArray(value)) return [];
  const ids = new Set(nodes.map((node) => node.id));
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const source = item as Record<string, unknown>;
      const from = asString(source.from, "");
      const to = asString(source.to, "");
      if (!ids.has(from) || !ids.has(to)) return null;
      return { from, to, label: asString(source.label, "") };
    })
    .filter((item): item is WorkflowGraphEdge => Boolean(item));
}

function normalizeTone(value: unknown): Tone {
  const tone = typeof value === "string" ? value : "";
  if (["blue", "indigo", "purple", "green", "red", "orange", "yellow"].includes(tone)) {
    return tone as Tone;
  }
  return "blue";
}

function normalizeGraphColor(value: unknown): GraphColor {
  const color = typeof value === "string" ? value : "";
  if (["blue", "green", "yellow", "orange", "purple", "pink", "slate"].includes(color)) {
    return color as GraphColor;
  }
  return "blue";
}

function graphPalette(color: GraphColor) {
  const map: Record<GraphColor, { bg: string }> = {
    blue: { bg: "#3b82f6" },
    green: { bg: "#48c55b" },
    yellow: { bg: "#eab308" },
    orange: { bg: "#f97316" },
    purple: { bg: "#a855f7" },
    pink: { bg: "#db2777" },
    slate: { bg: "#475569" },
  };
  return map[color];
}

function toneBg(tone: Tone, shade: 50 | 100 | 500 | 600) {
  const map: Record<Tone, Record<number, string>> = {
    blue: { 50: "bg-blue-50", 100: "bg-blue-100", 500: "bg-blue-500", 600: "bg-blue-600" },
    indigo: { 50: "bg-indigo-50", 100: "bg-indigo-100", 500: "bg-indigo-500", 600: "bg-indigo-600" },
    purple: { 50: "bg-purple-50", 100: "bg-purple-100", 500: "bg-purple-500", 600: "bg-purple-600" },
    green: { 50: "bg-green-50", 100: "bg-green-100", 500: "bg-green-500", 600: "bg-green-600" },
    red: { 50: "bg-red-50", 100: "bg-red-100", 500: "bg-red-500", 600: "bg-red-600" },
    orange: { 50: "bg-orange-50", 100: "bg-orange-100", 500: "bg-orange-500", 600: "bg-orange-600" },
    yellow: { 50: "bg-yellow-50", 100: "bg-yellow-100", 500: "bg-yellow-500", 600: "bg-yellow-600" },
  };
  return map[tone][shade];
}

function toneText(tone: Tone, shade: 600 | 700) {
  const map: Record<Tone, Record<number, string>> = {
    blue: { 600: "text-blue-600", 700: "text-blue-700" },
    indigo: { 600: "text-indigo-600", 700: "text-indigo-700" },
    purple: { 600: "text-purple-600", 700: "text-purple-700" },
    green: { 600: "text-green-600", 700: "text-green-700" },
    red: { 600: "text-red-600", 700: "text-red-700" },
    orange: { 600: "text-orange-600", 700: "text-orange-700" },
    yellow: { 600: "text-yellow-600", 700: "text-yellow-700" },
  };
  return map[tone][shade];
}

function toneBorder(tone: Tone) {
  const map: Record<Tone, string> = {
    blue: "border-blue-500",
    indigo: "border-indigo-500",
    purple: "border-purple-500",
    green: "border-green-500",
    red: "border-red-500",
    orange: "border-orange-500",
    yellow: "border-yellow-500",
  };
  return map[tone];
}
