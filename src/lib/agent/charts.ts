import { z } from "zod";

// Server-side chart/diagram renderer for agent posts. The agent sends a small
// JSON spec; we build the SVG ourselves (every string escaped, no markup from
// the caller), so the stored file can't carry script. Palette: brand violet
// first, then the validated categorical steps (dataviz validator: adjacent CVD
// ΔE ≥ 9.1, normal-vision ≥ 22.9 on light). Contrast of slots 3-4 is < 3:1,
// so every series is direct-labeled.

const W = 1200;
const PAD = 56;
const FONT = "Inter, 'Helvetica Neue', Arial, sans-serif";
const C = {
  surface: "#FFFFFF",
  ink: "#0F172A",
  ink2: "#475569",
  muted: "#64748B",
  grid: "#E2E8F0",
  axis: "#CBD5E1",
  rest: "#CBD5E1",
  boxFill: "#F8FAFC",
  boxStroke: "#CBD5E1",
  accentFill: "#F1ECFE",
  series: ["#6C3CF4", "#EB6834", "#1BAF7A", "#EDA100"],
};

const text = (max: number) => z.string().trim().min(1).max(max);
const num = z.number().finite().min(-1e12).max(1e12);
const common = {
  title: text(90),
  subtitle: text(160).optional(),
  source: text(160).optional(),
};

const barSpec = z.object({
  type: z.literal("bar"),
  ...common,
  unit: z.string().trim().max(12).optional(),
  data: z
    .array(z.object({ label: text(48), value: num.min(0), highlight: z.boolean().optional() }))
    .min(2)
    .max(12),
  sort: z.boolean().optional(),
});

const lineSpec = z.object({
  type: z.literal("line"),
  ...common,
  unit: z.string().trim().max(12).optional(),
  x_labels: z.array(text(16)).min(2).max(24),
  series: z
    .array(z.object({ name: text(32), values: z.array(num.nullable()).max(24) }))
    .min(1)
    .max(4),
  y_min: num.optional(),
});

const timelineSpec = z.object({
  type: z.literal("timeline"),
  ...common,
  events: z
    .array(z.object({ date: text(16), label: text(80), highlight: z.boolean().optional() }))
    .min(2)
    .max(8),
});

const flowSpec = z.object({
  type: z.literal("flow"),
  ...common,
  steps: z
    .array(z.object({ label: text(40), note: text(110).optional(), highlight: z.boolean().optional() }))
    .min(2)
    .max(6),
});

const quadrantSpec = z.object({
  type: z.literal("quadrant"),
  ...common,
  x_axis: z.object({ low: text(28), high: text(28) }),
  y_axis: z.object({ low: text(28), high: text(28) }),
  quadrant_labels: z.tuple([text(32), text(32), text(32), text(32)]).optional(),
  items: z
    .array(
      z.object({
        label: text(32),
        x: z.number().min(0).max(1),
        y: z.number().min(0).max(1),
        highlight: z.boolean().optional(),
      }),
    )
    .min(1)
    .max(10),
});

export const chartSpec = z.discriminatedUnion("type", [barSpec, lineSpec, timelineSpec, flowSpec, quadrantSpec]);
export type ChartSpec = z.infer<typeof chartSpec>;

// ---------- helpers ----------

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

// Rough width estimate; Arial/Inter average glyph ≈ 0.55em (0.6em bold).
function measure(s: string, size: number, bold = false): number {
  return s.length * size * (bold ? 0.6 : 0.55);
}

function wrap(s: string, maxWidth: number, size: number, bold = false, maxLines = 4): string[] {
  const words = s.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (measure(next, size, bold) <= maxWidth || !cur) cur = next;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].replace(/\s*\S*$/, "") + "…";
    return kept;
  }
  return lines;
}

function t(
  x: number,
  y: number,
  s: string,
  o: { size?: number; weight?: number; fill?: string; anchor?: "start" | "middle" | "end" } = {},
): string {
  return `<text x="${r(x)}" y="${r(y)}" font-size="${o.size ?? 20}" font-weight="${o.weight ?? 400}" fill="${o.fill ?? C.ink}" text-anchor="${o.anchor ?? "start"}">${esc(s)}</text>`;
}

function lines(
  x: number,
  y: number,
  ls: string[],
  lh: number,
  o: Parameters<typeof t>[3] = {},
): string {
  return ls.map((l, i) => t(x, y + i * lh, l, o)).join("");
}

const r = (n: number) => Math.round(n * 10) / 10;

function fmt(v: number, unit?: string): string {
  const abs = Math.abs(v);
  const digits = abs >= 100 ? 0 : abs >= 10 ? 1 : 2;
  const n = Number(v.toFixed(digits)).toLocaleString("en-US", { maximumFractionDigits: digits });
  if (!unit) return n;
  if (unit === "$") return `$${n}`;
  return /^[%×x]$/.test(unit) ? `${n}${unit}` : `${n} ${unit}`;
}

function niceStep(raw: number): number {
  if (raw <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= raw) return m * p;
  return 10 * p;
}

// Bar whose data end (right) is rounded 4px*scale; the baseline end is square.
function hbar(x: number, y: number, w: number, h: number, fill: string): string {
  const rad = Math.min(6, w / 2, h / 2);
  if (w <= 0) return "";
  return `<path d="M${r(x)},${r(y)} H${r(x + w - rad)} Q${r(x + w)},${r(y)} ${r(x + w)},${r(y + rad)} V${r(y + h - rad)} Q${r(x + w)},${r(y + h)} ${r(x + w - rad)},${r(y + h)} H${r(x)} Z" fill="${fill}"/>`;
}

function header(spec: { title: string; subtitle?: string }): { svg: string; bottom: number } {
  const titleLines = wrap(spec.title, W - 2 * PAD, 34, true, 2);
  let svg = lines(PAD, 70, titleLines, 42, { size: 34, weight: 700 });
  let y = 70 + (titleLines.length - 1) * 42;
  if (spec.subtitle) {
    const sub = wrap(spec.subtitle, W - 2 * PAD, 22, false, 2);
    svg += lines(PAD, y + 38, sub, 30, { size: 22, fill: C.ink2 });
    y += 38 + (sub.length - 1) * 30;
  }
  return { svg, bottom: y + 36 };
}

function footer(spec: { source?: string }, y: number): string {
  const src = spec.source ? `Source: ${spec.source}` : "";
  return (
    `<line x1="${PAD}" x2="${W - PAD}" y1="${y}" y2="${y}" stroke="${C.grid}" stroke-width="1.5"/>` +
    (src ? t(PAD, y + 32, src.length > 110 ? src.slice(0, 109) + "…" : src, { size: 18, fill: C.muted }) : "") +
    t(W - PAD, y + 32, "tbrain.ai", { size: 18, weight: 600, fill: C.muted, anchor: "end" })
  );
}

function wrapSvg(height: number, body: string, label: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Math.ceil(height)}" viewBox="0 0 ${W} ${Math.ceil(height)}" role="img" aria-label="${esc(label)}" font-family="${FONT}">` +
    `<rect x="1" y="1" width="${W - 2}" height="${Math.ceil(height) - 2}" rx="16" fill="${C.surface}" stroke="${C.grid}" stroke-width="2"/>` +
    body +
    `</svg>`
  );
}

// ---------- forms ----------

function renderBar(s: z.infer<typeof barSpec>): string {
  const h = header(s);
  const data = s.sort === false ? s.data : [...s.data].sort((a, b) => b.value - a.value);
  const anyHi = data.some((d) => d.highlight);
  const labelSize = 22;
  const labelW = Math.min(420, Math.max(...data.map((d) => measure(d.label, labelSize))) + 8);
  const x0 = PAD + labelW + 16;
  const maxVal = Math.max(...data.map((d) => d.value)) || 1;
  const valueRoom = Math.max(...data.map((d) => measure(fmt(d.value, s.unit), 22, true))) + 20;
  const plotW = W - PAD - x0 - valueRoom;
  const rowH = 58;
  const barH = 34;
  let body = h.svg;
  let y = h.bottom + 8;
  for (const d of data) {
    const w = Math.max(2, (d.value / maxVal) * plotW);
    const fill = !anyHi || d.highlight ? C.series[0] : C.rest;
    const label = wrap(d.label, labelW, labelSize, false, 2);
    const ly = y + barH / 2 + 7 - ((label.length - 1) * 24) / 2;
    body += lines(x0 - 16, ly, label, 24, { size: labelSize, anchor: "end", fill: C.ink });
    body += hbar(x0, y, w, barH, fill);
    body += t(x0 + w + 12, y + barH / 2 + 8, fmt(d.value, s.unit), {
      size: 22,
      weight: !anyHi || d.highlight ? 700 : 500,
      fill: !anyHi || d.highlight ? C.ink : C.ink2,
    });
    y += rowH;
  }
  body += `<line x1="${x0}" x2="${x0}" y1="${h.bottom}" y2="${y - rowH + barH + 8}" stroke="${C.axis}" stroke-width="2"/>`;
  const end = y + 12;
  return wrapSvg(end + 56, body + footer(s, end), s.title);
}

function renderLine(s: z.infer<typeof lineSpec>): string {
  const h = header(s);
  const n = s.x_labels.length;
  const multi = s.series.length > 1;
  let body = h.svg;
  let top = h.bottom;
  if (multi) {
    let lx = PAD;
    s.series.forEach((se, i) => {
      body += `<rect x="${lx}" y="${top - 6}" width="24" height="6" rx="3" fill="${C.series[i]}"/>`;
      body += t(lx + 32, top + 1, se.name, { size: 20, fill: C.ink2 });
      lx += 32 + measure(se.name, 20) + 36;
    });
    top += 36;
  }
  const all = s.series.flatMap((se) => se.values.filter((v): v is number => v !== null));
  const yMin = s.y_min ?? Math.min(0, ...all);
  const tickStep = niceStep((Math.max(...all, yMin + 1) - yMin) / 4);
  const ticks = Math.max(1, Math.ceil((Math.max(...all, yMin + 1) - yMin) / tickStep));
  const yMax = yMin + ticks * tickStep;
  const lastOf = (vs: (number | null)[]) => [...vs].reverse().find((v): v is number => v !== null) ?? 0;
  const endLabelW = Math.max(
    ...s.series.map((se) => measure(multi ? `${se.name} ${fmt(lastOf(se.values), s.unit)}` : fmt(lastOf(se.values), s.unit), 20, true) + 44),
    100,
  );
  const tickVals = Array.from({ length: ticks + 1 }, (_, i) => yMin + i * tickStep);
  const yTickW = Math.max(...tickVals.map((v) => measure(fmt(v, s.unit), 18))) + 16;
  const x0 = PAD + yTickW;
  const x1 = W - PAD - Math.min(endLabelW, 380);
  const plotTop = top + 16;
  const plotH = 400;
  const yOf = (v: number) => plotTop + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
  const xOf = (i: number) => x0 + (n === 1 ? 0 : (i / (n - 1)) * (x1 - x0));
  for (const [i, v] of tickVals.entries()) {
    const y = yOf(v);
    body += `<line x1="${x0}" x2="${x1}" y1="${r(y)}" y2="${r(y)}" stroke="${i === 0 ? C.axis : C.grid}" stroke-width="${i === 0 ? 2 : 1.5}"/>`;
    body += t(x0 - 12, y + 6, fmt(v, s.unit), { size: 18, fill: C.muted, anchor: "end" });
  }
  const step = Math.ceil(n / 10);
  s.x_labels.forEach((l, i) => {
    if (i % step === 0 || i === n - 1) body += t(xOf(i), plotTop + plotH + 32, l, { size: 18, fill: C.muted, anchor: "middle" });
  });
  const ends: { y: number; text: string; color: string }[] = [];
  s.series.forEach((se, si) => {
    const color = C.series[si];
    let d = "";
    let pen = false;
    let last: { i: number; v: number } | null = null;
    se.values.slice(0, n).forEach((v, i) => {
      if (v === null) {
        pen = false;
        return;
      }
      d += `${pen ? "L" : "M"}${r(xOf(i))},${r(yOf(v))} `;
      pen = true;
      last = { i, v };
    });
    body += `<path d="${d.trim()}" fill="none" stroke="${color}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>`;
    if (last) {
      const { i, v } = last as { i: number; v: number };
      body += `<circle cx="${r(xOf(i))}" cy="${r(yOf(v))}" r="7" fill="${color}" stroke="${C.surface}" stroke-width="3"/>`;
      ends.push({ y: yOf(v), text: multi ? `${se.name} ${fmt(v, s.unit)}` : fmt(v, s.unit), color });
    }
  });
  // End labels: push apart so they never overlap.
  ends.sort((a, b) => a.y - b.y);
  for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 26) ends[i].y = ends[i - 1].y + 26;
  for (const e of ends) {
    body += `<rect x="${x1 + 16}" y="${r(e.y - 4)}" width="14" height="6" rx="3" fill="${e.color}"/>`;
    body += t(x1 + 36, e.y + 7, e.text, { size: 20, weight: 600 });
  }
  const end = plotTop + plotH + 60;
  return wrapSvg(end + 56, body + footer(s, end), s.title);
}

function renderTimeline(s: z.infer<typeof timelineSpec>): string {
  const h = header(s);
  const n = s.events.length;
  const slot = (W - 2 * PAD) / n;
  const labelW = Math.min(slot * 2 - 24, 300);
  const size = 20;
  const wrapped = s.events.map((e) => wrap(e.label, labelW, size, false, 3));
  const above = Math.max(0, ...wrapped.filter((_, i) => i % 2 === 0).map((l) => l.length));
  const below = Math.max(0, ...wrapped.filter((_, i) => i % 2 === 1).map((l) => l.length));
  const axisY = h.bottom + 40 + 30 + above * 26 + 20;
  let body = h.svg;
  body += `<line x1="${PAD}" x2="${W - PAD}" y1="${axisY}" y2="${axisY}" stroke="${C.axis}" stroke-width="3"/>`;
  s.events.forEach((e, i) => {
    const x = PAD + slot * (i + 0.5);
    const up = i % 2 === 0;
    const color = e.highlight ? C.series[0] : C.ink2;
    const stemEnd = up ? axisY - 28 : axisY + 28;
    body += `<line x1="${r(x)}" x2="${r(x)}" y1="${axisY}" y2="${stemEnd}" stroke="${C.axis}" stroke-width="2"/>`;
    body += `<circle cx="${r(x)}" cy="${axisY}" r="${e.highlight ? 10 : 8}" fill="${e.highlight ? C.series[0] : C.surface}" stroke="${e.highlight ? C.surface : C.ink2}" stroke-width="3"/>`;
    const ls = wrapped[i];
    const anchor = i === 0 ? "start" : i === n - 1 ? "end" : "middle";
    const tx = anchor === "start" ? x - 8 : anchor === "end" ? x + 8 : x;
    if (up) {
      const yDate = axisY - 40 - ls.length * 26;
      body += t(tx, yDate, e.date, { size: 20, weight: 700, fill: color, anchor });
      body += lines(tx, yDate + 28, ls, 26, { size, fill: C.ink, anchor });
    } else {
      const yDate = axisY + 56;
      body += t(tx, yDate, e.date, { size: 20, weight: 700, fill: color, anchor });
      body += lines(tx, yDate + 28, ls, 26, { size, fill: C.ink, anchor });
    }
  });
  const end = axisY + 56 + 28 + below * 26 + 16;
  return wrapSvg(end + 56, body + footer(s, end), s.title);
}

function renderFlow(s: z.infer<typeof flowSpec>): string {
  const h = header(s);
  const n = s.steps.length;
  const gap = 44;
  const boxW = (W - 2 * PAD - (n - 1) * gap) / n;
  const inner = boxW - 32;
  const labelSize = n > 4 ? 20 : 22;
  const noteSize = n > 4 ? 17 : 19;
  const wrapped = s.steps.map((st) => ({
    label: wrap(st.label, inner, labelSize, true, 3),
    note: st.note ? wrap(st.note, inner, noteSize, false, 5) : [],
  }));
  const boxH = Math.max(...wrapped.map((w) => 64 + w.label.length * (labelSize + 6) + (w.note.length ? 10 + w.note.length * (noteSize + 6) : 0)));
  const top = h.bottom + 8;
  let body = h.svg;
  s.steps.forEach((st, i) => {
    const x = PAD + i * (boxW + gap);
    const hi = !!st.highlight;
    body += `<rect x="${r(x)}" y="${top}" width="${r(boxW)}" height="${r(boxH)}" rx="14" fill="${hi ? C.accentFill : C.boxFill}" stroke="${hi ? C.series[0] : C.boxStroke}" stroke-width="${hi ? 3 : 2}"/>`;
    body += t(x + 16, top + 34, String(i + 1).padStart(2, "0"), { size: 18, weight: 700, fill: hi ? C.series[0] : C.muted });
    const w = wrapped[i];
    body += lines(x + 16, top + 34 + 34, w.label, labelSize + 6, { size: labelSize, weight: 700 });
    if (w.note.length) {
      body += lines(x + 16, top + 34 + 34 + w.label.length * (labelSize + 6) + 6, w.note, noteSize + 6, { size: noteSize, fill: C.ink2 });
    }
    if (i < n - 1) {
      const ax = x + boxW + 8;
      const ay = top + boxH / 2;
      body += `<line x1="${r(ax)}" x2="${r(ax + gap - 20)}" y1="${r(ay)}" y2="${r(ay)}" stroke="${C.muted}" stroke-width="3"/>`;
      body += `<path d="M${r(ax + gap - 22)},${r(ay - 8)} L${r(ax + gap - 12)},${r(ay)} L${r(ax + gap - 22)},${r(ay + 8)}" fill="none" stroke="${C.muted}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
  });
  const end = top + boxH + 32;
  return wrapSvg(end + 56, body + footer(s, end), s.title);
}

function renderQuadrant(s: z.infer<typeof quadrantSpec>): string {
  const h = header(s);
  const plotX0 = PAD + 40;
  const plotX1 = W - PAD;
  const plotY0 = h.bottom + 16;
  const plotH = 560;
  const plotY1 = plotY0 + plotH;
  const midX = (plotX0 + plotX1) / 2;
  const midY = (plotY0 + plotY1) / 2;
  let body = h.svg;
  body += `<rect x="${plotX0}" y="${plotY0}" width="${plotX1 - plotX0}" height="${plotH}" rx="12" fill="${C.boxFill}" stroke="${C.grid}" stroke-width="1.5"/>`;
  body += `<line x1="${midX}" x2="${midX}" y1="${plotY0}" y2="${plotY1}" stroke="${C.axis}" stroke-width="2" stroke-dasharray="6 6"/>`;
  body += `<line x1="${plotX0}" x2="${plotX1}" y1="${midY}" y2="${midY}" stroke="${C.axis}" stroke-width="2" stroke-dasharray="6 6"/>`;
  if (s.quadrant_labels) {
    const [tl, tr, bl, br] = s.quadrant_labels;
    body += t(plotX0 + 18, plotY0 + 32, tl, { size: 18, weight: 600, fill: C.muted });
    body += t(plotX1 - 18, plotY0 + 32, tr, { size: 18, weight: 600, fill: C.muted, anchor: "end" });
    body += t(plotX0 + 18, plotY1 - 18, bl, { size: 18, weight: 600, fill: C.muted });
    body += t(plotX1 - 18, plotY1 - 18, br, { size: 18, weight: 600, fill: C.muted, anchor: "end" });
  }
  // Axis captions: x below, y rotated on the left.
  body += t(plotX0, plotY1 + 32, `← ${s.x_axis.low}`, { size: 19, fill: C.ink2 });
  body += t(plotX1, plotY1 + 32, `${s.x_axis.high} →`, { size: 19, fill: C.ink2, anchor: "end" });
  body += `<g transform="translate(${PAD + 18},${plotY1}) rotate(-90)">${t(0, 0, `← ${s.y_axis.low}`, { size: 19, fill: C.ink2 })}</g>`;
  body += `<g transform="translate(${PAD + 18},${plotY0}) rotate(-90)">${t(0, 0, `${s.y_axis.high} →`, { size: 19, fill: C.ink2, anchor: "end" })}</g>`;
  const inset = 36;
  for (const it of s.items) {
    const x = plotX0 + inset + it.x * (plotX1 - plotX0 - 2 * inset);
    const y = plotY1 - inset - it.y * (plotH - 2 * inset);
    const hi = !!it.highlight;
    body += `<circle cx="${r(x)}" cy="${r(y)}" r="${hi ? 11 : 9}" fill="${hi ? C.series[0] : C.ink2}" stroke="${C.surface}" stroke-width="3"/>`;
    const right = it.x < 0.72;
    body += t(right ? x + 18 : x - 18, y + 7, it.label, { size: 20, weight: hi ? 700 : 500, anchor: right ? "start" : "end" });
  }
  const end = plotY1 + 56;
  return wrapSvg(end + 56, body + footer(s, end), s.title);
}

export function renderChart(spec: ChartSpec): string {
  switch (spec.type) {
    case "bar":
      return renderBar(spec);
    case "line":
      return renderLine(spec);
    case "timeline":
      return renderTimeline(spec);
    case "flow":
      return renderFlow(spec);
    case "quadrant":
      return renderQuadrant(spec);
  }
}
