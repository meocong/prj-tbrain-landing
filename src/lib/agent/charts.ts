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

const statSpec = z.object({
  type: z.literal("stat"),
  ...common,
  stats: z
    .array(z.object({ value: text(12), label: text(70), highlight: z.boolean().optional() }))
    .min(1)
    .max(4),
});

const cell = z.union([z.enum(["yes", "no", "partial"]), text(16)]);
const matrixSpec = z.object({
  type: z.literal("matrix"),
  ...common,
  columns: z.array(text(22)).min(2).max(6),
  rows: z
    .array(z.object({ label: text(36), cells: z.array(cell).max(6), highlight: z.boolean().optional() }))
    .min(2)
    .max(10),
});

const scatterSpec = z.object({
  type: z.literal("scatter"),
  ...common,
  x_label: text(40),
  y_label: text(40),
  x_unit: z.string().trim().max(12).optional(),
  y_unit: z.string().trim().max(12).optional(),
  log_x: z.boolean().optional(),
  points: z
    .array(z.object({ label: text(28), x: num, y: num, highlight: z.boolean().optional() }))
    .min(2)
    .max(12),
});

const shareSpec = z.object({
  type: z.literal("share"),
  ...common,
  categories: z.array(text(24)).min(2).max(5),
  rows: z.array(z.object({ label: text(36), values: z.array(num.min(0)).max(5) })).min(1).max(6),
});

// Social/cover card, 1200x630. PNG only.
const coverSpec = z.object({
  type: z.literal("cover"),
  title: text(110),
  eyebrow: text(40).optional(),
  subtitle: text(120).optional(),
  stat: z.object({ value: text(10), label: text(70) }).optional(),
});

// A licensed source figure with numbered call-outs drawn on top.
export const ANNOTATE_SRC = /^\/api\/asset\/cms\/[A-Za-z0-9_\/-]+\.(png|jpe?g|webp)$/;
const annotateSpec = z.object({
  type: z.literal("annotate"),
  title: text(90).optional(),
  subtitle: text(160).optional(),
  source: text(160),
  image_url: z.string().max(300).regex(ANNOTATE_SRC, "image_url must be a /api/asset/cms/… PNG/JPEG/WebP from upload_image"),
  markers: z
    .array(
      z.object({
        kind: z.enum(["dot", "box", "arrow"]),
        x: z.number().min(0).max(1),
        y: z.number().min(0).max(1),
        w: z.number().min(0.01).max(1).optional(),
        h: z.number().min(0.01).max(1).optional(),
        label: text(90),
      }),
    )
    .min(1)
    .max(6),
});

export const chartSpec = z.discriminatedUnion("type", [
  barSpec, lineSpec, timelineSpec, flowSpec, quadrantSpec,
  statSpec, matrixSpec, scatterSpec, shareSpec, coverSpec, annotateSpec,
]);
export const PNG_ONLY = new Set(["cover", "annotate"]);
export interface EmbeddedImage { dataUri: string; width: number; height: number }
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

function renderStat(s: z.infer<typeof statSpec>): string {
  const h = header(s);
  const n = s.stats.length;
  const gap = 24;
  const tileW = (W - 2 * PAD - (n - 1) * gap) / n;
  const valueSize = n > 3 ? 64 : 76;
  const labels = s.stats.map((st) => wrap(st.label, tileW - 48, 22, false, 3));
  const tileH = 72 + valueSize + Math.max(...labels.map((l) => l.length)) * 30;
  const top = h.bottom + 4;
  const anyHi = s.stats.some((st) => st.highlight);
  let body = h.svg;
  s.stats.forEach((st, i) => {
    const x = PAD + i * (tileW + gap);
    const hi = !anyHi || !!st.highlight;
    body += `<rect x="${r(x)}" y="${top}" width="${r(tileW)}" height="${tileH}" rx="16" fill="${hi ? C.accentFill : C.boxFill}" stroke="${hi ? C.series[0] : C.boxStroke}" stroke-width="2"/>`;
    body += t(x + 24, top + 32 + valueSize * 0.85, st.value, { size: valueSize, weight: 700, fill: hi ? C.series[0] : C.ink });
    body += lines(x + 24, top + 48 + valueSize + 22, labels[i], 30, { size: 22, fill: C.ink2 });
  });
  const end = top + tileH + 32;
  return wrapSvg(end + 56, body + footer(s, end), s.title);
}

function renderMatrix(s: z.infer<typeof matrixSpec>): string {
  const h = header(s);
  const labelW = Math.min(360, Math.max(...s.rows.map((r0) => measure(r0.label, 22, true))) + 24);
  const colW = (W - 2 * PAD - labelW) / s.columns.length;
  const colHead = s.columns.map((c) => wrap(c, colW - 16, 19, true, 2));
  const headH = Math.max(...colHead.map((l) => l.length)) * 24 + 16;
  const rowH = 58;
  let y = h.bottom + 4;
  let body = h.svg;
  s.columns.forEach((_, ci) => {
    const cx = PAD + labelW + ci * colW + colW / 2;
    body += lines(cx, y + 20, colHead[ci], 24, { size: 19, weight: 700, fill: C.ink2, anchor: "middle" });
  });
  y += headH;
  s.rows.forEach((row, ri) => {
    const hi = !!row.highlight;
    if (hi) body += `<rect x="${PAD}" y="${y}" width="${W - 2 * PAD}" height="${rowH}" rx="10" fill="${C.accentFill}"/>`;
    else if (ri % 2 === 0) body += `<rect x="${PAD}" y="${y}" width="${W - 2 * PAD}" height="${rowH}" rx="10" fill="${C.boxFill}"/>`;
    body += t(PAD + 16, y + rowH / 2 + 8, row.label, { size: 22, weight: hi ? 700 : 600 });
    s.columns.forEach((_, ci) => {
      const v = row.cells[ci] ?? "";
      const cx = PAD + labelW + ci * colW + colW / 2;
      const cy = y + rowH / 2;
      if (v === "yes") {
        body += `<circle cx="${r(cx)}" cy="${r(cy)}" r="14" fill="${C.series[0]}"/><path d="M${r(cx - 6)},${r(cy)} L${r(cx - 1.5)},${r(cy + 5)} L${r(cx + 7)},${r(cy - 5)}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
      } else if (v === "partial") {
        body += `<circle cx="${r(cx)}" cy="${r(cy)}" r="13" fill="none" stroke="${C.series[0]}" stroke-width="2.5"/><path d="M${r(cx)},${r(cy - 13)} A13,13 0 0 1 ${r(cx)},${r(cy + 13)} Z" fill="${C.series[0]}"/>`;
      } else if (v === "no") {
        body += `<line x1="${r(cx - 9)}" x2="${r(cx + 9)}" y1="${r(cy)}" y2="${r(cy)}" stroke="${C.axis}" stroke-width="3" stroke-linecap="round"/>`;
      } else if (v) {
        body += t(cx, cy + 7, v, { size: 19, fill: C.ink, anchor: "middle" });
      }
    });
    y += rowH + 4;
  });
  const legendY = y + 30;
  body += `<circle cx="${PAD + 10}" cy="${legendY - 6}" r="9" fill="${C.series[0]}"/>` + t(PAD + 26, legendY, "yes", { size: 17, fill: C.muted });
  body += `<circle cx="${PAD + 90}" cy="${legendY - 6}" r="8" fill="none" stroke="${C.series[0]}" stroke-width="2"/><path d="M${PAD + 90},${legendY - 14} A8,8 0 0 1 ${PAD + 90},${legendY + 2} Z" fill="${C.series[0]}"/>` + t(PAD + 106, legendY, "partly", { size: 17, fill: C.muted });
  body += `<line x1="${PAD + 182}" x2="${PAD + 198}" y1="${legendY - 6}" y2="${legendY - 6}" stroke="${C.axis}" stroke-width="3" stroke-linecap="round"/>` + t(PAD + 208, legendY, "no", { size: 17, fill: C.muted });
  const end = legendY + 24;
  return wrapSvg(end + 56, body + footer(s, end), s.title);
}

function renderScatter(s: z.infer<typeof scatterSpec>): string {
  const h = header(s);
  const xs = s.points.map((p) => (s.log_x ? Math.log10(Math.max(p.x, 1e-9)) : p.x));
  const ys = s.points.map((p) => p.y);
  const pad = (a: number, b: number) => (b - a || Math.abs(a) || 1) * 0.08;
  const xMin = Math.min(...xs) - pad(Math.min(...xs), Math.max(...xs));
  const xMax = Math.max(...xs) + pad(Math.min(...xs), Math.max(...xs));
  const yLo = Math.min(0, ...ys);
  const step = niceStep((Math.max(...ys) - yLo) / 4);
  const ticks = Math.max(1, Math.ceil((Math.max(...ys) - yLo) / step));
  const yMax = yLo + ticks * step;
  const tickVals = Array.from({ length: ticks + 1 }, (_, i) => yLo + i * step);
  const yTickW = Math.max(...tickVals.map((v) => measure(fmt(v, s.y_unit), 18))) + 16;
  const x0 = PAD + 30 + yTickW;
  const x1 = W - PAD - 20;
  const top = h.bottom + 16;
  const plotH = 440;
  const xOf = (v: number) => x0 + ((v - xMin) / (xMax - xMin)) * (x1 - x0);
  const yOf = (v: number) => top + plotH - ((v - yLo) / (yMax - yLo)) * plotH;
  let body = h.svg;
  for (const v of tickVals) {
    const y = yOf(v);
    body += `<line x1="${x0}" x2="${x1}" y1="${r(y)}" y2="${r(y)}" stroke="${v === yLo ? C.axis : C.grid}" stroke-width="${v === yLo ? 2 : 1.5}"/>`;
    body += t(x0 - 12, y + 6, fmt(v, s.y_unit), { size: 18, fill: C.muted, anchor: "end" });
  }
  // x ticks: 5 evenly spaced (decades when log)
  const xt: number[] = [];
  if (s.log_x) for (let d = Math.ceil(xMin); d <= Math.floor(xMax); d++) xt.push(d);
  else for (let i = 0; i <= 4; i++) xt.push(xMin + ((xMax - xMin) * i) / 4);
  for (const v of xt) body += t(xOf(v), top + plotH + 30, fmt(s.log_x ? Math.pow(10, v) : v, s.x_unit), { size: 18, fill: C.muted, anchor: "middle" });
  body += t((x0 + x1) / 2, top + plotH + 64, s.x_label + (s.log_x ? " (log scale)" : ""), { size: 19, fill: C.ink2, anchor: "middle" });
  body += `<g transform="translate(${PAD + 14},${top + plotH / 2}) rotate(-90)">${t(0, 0, s.y_label, { size: 19, fill: C.ink2, anchor: "middle" })}</g>`;
  const anyHi = s.points.some((p) => p.highlight);
  s.points.forEach((p, i) => {
    const cx = xOf(xs[i]);
    const cy = yOf(p.y);
    const hi = !anyHi || !!p.highlight;
    body += `<circle cx="${r(cx)}" cy="${r(cy)}" r="${hi ? 10 : 8}" fill="${hi ? C.series[0] : C.ink2}" stroke="${C.surface}" stroke-width="3"/>`;
    const right = cx < x1 - measure(p.label, 19) - 30;
    body += t(right ? cx + 16 : cx - 16, cy + 6, p.label, { size: 19, weight: hi ? 700 : 500, anchor: right ? "start" : "end" });
  });
  const end = top + plotH + 92;
  return wrapSvg(end + 56, body + footer(s, end), s.title);
}

function renderShare(s: z.infer<typeof shareSpec>): string {
  const h = header(s);
  let body = h.svg;
  let lx = PAD;
  const top0 = h.bottom;
  s.categories.forEach((c, i) => {
    body += `<rect x="${lx}" y="${top0 - 14}" width="18" height="18" rx="4" fill="${C.series[i % 4]}"/>`;
    if (i === 4) body += `<rect x="${lx}" y="${top0 - 14}" width="18" height="18" rx="4" fill="${C.rest}"/>`;
    body += t(lx + 26, top0 + 1, c, { size: 20, fill: C.ink2 });
    lx += 26 + measure(c, 20) + 32;
  });
  const color = (i: number) => (i < 4 ? C.series[i] : C.rest);
  const multi = s.rows.length > 1;
  const labelW = multi ? Math.min(300, Math.max(...s.rows.map((r0) => measure(r0.label, 21))) + 20) : 0;
  const x0 = PAD + labelW;
  const barW = W - PAD - x0;
  let y = top0 + 30;
  const barH = 52;
  for (const row of s.rows) {
    const total = row.values.reduce((a, b) => a + b, 0) || 1;
    if (multi) body += t(x0 - 16, y + barH / 2 + 7, row.label, { size: 21, anchor: "end" });
    let x = x0;
    row.values.slice(0, s.categories.length).forEach((v, i) => {
      const w = (v / total) * barW;
      if (w <= 0) return;
      body += `<rect x="${r(x)}" y="${y}" width="${r(Math.max(0, w - 2))}" height="${barH}" rx="4" fill="${color(i)}"/>`;
      const pct = `${Math.round((v / total) * 100)}%`;
      if (w > measure(pct, 20, true) + 16) body += t(x + 10, y + barH / 2 + 7, pct, { size: 20, weight: 700, fill: i === 0 ? "#FFFFFF" : C.ink });
      x += w;
    });
    y += barH + 18;
  }
  const end = y + 14;
  return wrapSvg(end + 56, body + footer(s, end), s.title);
}

function renderCover(s: z.infer<typeof coverSpec>): string {
  const H = 630;
  const textW = s.stat ? 700 : W - 2 * 72;
  const titleSize = s.title.length > 70 ? 52 : 60;
  const tl = wrap(s.title, textW, titleSize, true, 4);
  let body = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1B0B47"/><stop offset="1" stop-color="#5B2EE0"/></linearGradient></defs>`;
  body += `<rect width="${W}" height="${H}" fill="url(#g)"/>`;
  // quiet grid texture
  for (let gx = 0; gx <= W; gx += 60) body += `<line x1="${gx}" x2="${gx}" y1="0" y2="${H}" stroke="#FFFFFF" stroke-opacity="0.05" stroke-width="1"/>`;
  for (let gy = 0; gy <= H; gy += 60) body += `<line x1="0" x2="${W}" y1="${gy}" y2="${gy}" stroke="#FFFFFF" stroke-opacity="0.05" stroke-width="1"/>`;
  let y = 120;
  if (s.eyebrow) {
    body += t(72, y, s.eyebrow.toUpperCase(), { size: 22, weight: 700, fill: "#C4B5FD" });
    y += 60;
  }
  const tTop = y + titleSize * 0.4;
  body += lines(72, tTop, tl, titleSize * 1.15, { size: titleSize, weight: 700, fill: "#FFFFFF" });
  if (s.subtitle) {
    const sub = wrap(s.subtitle, textW, 26, false, 2);
    body += lines(72, tTop + tl.length * titleSize * 1.15 + 16, sub, 34, { size: 26, fill: "#DDD6FE" });
  }
  if (s.stat) {
    const sx = W - 72 - 330;
    body += `<rect x="${sx}" y="150" width="330" height="300" rx="24" fill="#FFFFFF" fill-opacity="0.1" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="2"/>`;
    const vs = s.stat.value.length > 6 ? 72 : 96;
    body += t(sx + 165, 290, s.stat.value, { size: vs, weight: 700, fill: "#FFFFFF", anchor: "middle" });
    body += lines(sx + 165, 345, wrap(s.stat.label, 280, 22, false, 3), 30, { size: 22, fill: "#DDD6FE", anchor: "middle" });
  }
  body += t(72, H - 56, "tbrain.ai", { size: 26, weight: 700, fill: "#FFFFFF" });
  body += t(W - 72, H - 56, "Tbrain blog", { size: 22, weight: 600, fill: "#C4B5FD", anchor: "end" });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(s.title)}" font-family="${FONT}">${body}</svg>`;
}

function renderAnnotate(s: z.infer<typeof annotateSpec>, img: EmbeddedImage): string {
  const h = s.title ? header({ title: s.title, subtitle: s.subtitle }) : { svg: "", bottom: PAD };
  const iw = W - 2 * PAD;
  const ih = Math.round((img.height / img.width) * iw);
  const top = h.bottom + 4;
  const X = (v: number) => PAD + v * iw;
  const Y = (v: number) => top + v * ih;
  let body = h.svg;
  body += `<image x="${PAD}" y="${top}" width="${iw}" height="${ih}" href="${img.dataUri}" preserveAspectRatio="xMidYMid meet"/>`;
  const badge = (cx: number, cy: number, n: number) =>
    `<circle cx="${r(cx)}" cy="${r(cy)}" r="20" fill="${C.series[0]}" stroke="#FFFFFF" stroke-width="4"/>` +
    t(cx, cy + 8, String(n), { size: 22, weight: 700, fill: "#FFFFFF", anchor: "middle" });
  s.markers.forEach((m, i) => {
    const n = i + 1;
    const cx = X(m.x);
    const cy = Y(m.y);
    if (m.kind === "box") {
      const bw = (m.w ?? 0.2) * iw;
      const bh = (m.h ?? 0.2) * ih;
      body += `<rect x="${r(cx)}" y="${r(cy)}" width="${r(Math.min(bw, PAD + iw - cx))}" height="${r(Math.min(bh, top + ih - cy))}" rx="8" fill="none" stroke="#FFFFFF" stroke-width="7"/>`;
      body += `<rect x="${r(cx)}" y="${r(cy)}" width="${r(Math.min(bw, PAD + iw - cx))}" height="${r(Math.min(bh, top + ih - cy))}" rx="8" fill="none" stroke="${C.series[0]}" stroke-width="4"/>`;
      body += badge(Math.max(PAD + 20, cx), Math.max(top + 20, cy), n);
    } else if (m.kind === "arrow") {
      const bx = Math.min(Math.max(cx - 90, PAD + 24), PAD + iw - 24);
      const by = Math.max(cy - 80, top + 24);
      body += `<line x1="${r(bx)}" y1="${r(by)}" x2="${r(cx)}" y2="${r(cy)}" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/>`;
      body += `<line x1="${r(bx)}" y1="${r(by)}" x2="${r(cx)}" y2="${r(cy)}" stroke="${C.series[0]}" stroke-width="4" stroke-linecap="round"/>`;
      body += `<circle cx="${r(cx)}" cy="${r(cy)}" r="7" fill="${C.series[0]}" stroke="#FFFFFF" stroke-width="3"/>`;
      body += badge(bx, by, n);
    } else {
      body += badge(cx, cy, n);
    }
  });
  // Legend under the figure, so labels never cover the data.
  let y = top + ih + 44;
  s.markers.forEach((m, i) => {
    const ls = wrap(m.label, iw - 60, 21, false, 2);
    body += `<circle cx="${PAD + 16}" cy="${y - 7}" r="15" fill="${C.series[0]}"/>` + t(PAD + 16, y, String(i + 1), { size: 17, weight: 700, fill: "#FFFFFF", anchor: "middle" });
    body += lines(PAD + 44, y, ls, 28, { size: 21 });
    y += ls.length * 28 + 14;
  });
  const end = y + 6;
  return wrapSvg(end + 56, body + footer({ source: `${s.source} · annotated by Tbrain` }, end), s.title ?? "Annotated figure");
}

export function renderChart(spec: ChartSpec, img?: EmbeddedImage): string {
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
    case "stat":
      return renderStat(spec);
    case "matrix":
      return renderMatrix(spec);
    case "scatter":
      return renderScatter(spec);
    case "share":
      return renderShare(spec);
    case "cover":
      return renderCover(spec);
    case "annotate":
      if (!img) throw new Error("annotate needs the source image");
      return renderAnnotate(spec, img);
  }
}
