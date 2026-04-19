"use client";

import { FileCode, Video, Image as ImageIcon, MessageSquare } from "lucide-react";
import type { ReactNode } from "react";

export type SampleType = "terminal_bench" | "video_annotation" | "image_labeling" | "text_qc";

export type SampleRow = {
  id: string;
  batch_id: string;
  slug: string;
  title: string;
  difficulty: string | null;
  category: string | null;
  sample_type: SampleType;
  payload: Record<string, unknown>;
};

export const SAMPLE_TYPE_META: Record<
  SampleType,
  { label: string; icon: typeof FileCode; color: string }
> = {
  terminal_bench: { label: "Terminal Bench", icon: FileCode, color: "#6C3CF4" },
  video_annotation: { label: "Video Annotation", icon: Video, color: "#10B981" },
  image_labeling: { label: "Image Labeling", icon: ImageIcon, color: "#3B82F6" },
  text_qc: { label: "Text QC", icon: MessageSquare, color: "#F59E0B" },
};

/** Type-specific preview cell (rendered in the list row) */
export function SamplePreviewCell({ row }: { row: SampleRow }): ReactNode {
  const meta = SAMPLE_TYPE_META[row.sample_type];
  const Icon = meta.icon;
  return (
    <span className="inline-flex items-center gap-1 text-xs" style={{ color: meta.color }}>
      <Icon className="h-3.5 w-3.5" /> {meta.label}
    </span>
  );
}

/** Detail renderer — dispatches by type */
export function SampleDetailRenderer({ row }: { row: SampleRow }) {
  switch (row.sample_type) {
    case "terminal_bench":   return <TerminalBenchRenderer row={row} />;
    case "video_annotation": return <VideoAnnotationRenderer row={row} />;
    case "image_labeling":   return <ImageLabelingRenderer row={row} />;
    case "text_qc":          return <TextQcRenderer row={row} />;
    default: return null;
  }
}

function TerminalBenchRenderer({ row }: { row: SampleRow }) {
  const instruction = (row.payload.instruction_md as string | undefined) ?? "";
  const tests = row.payload.tests as unknown[] | undefined;
  const spec = row.payload.spec as Record<string, unknown> | undefined;
  return (
    <div className="space-y-4">
      <Section title="Instruction">
        <pre
          className="whitespace-pre-wrap rounded-md p-3 text-xs"
          style={{ background: "var(--bg-input)", color: "var(--text-primary)" }}
        >
          {instruction || "—"}
        </pre>
      </Section>
      <Section title="Tests">
        <pre
          className="rounded-md p-3 text-[11px] overflow-x-auto"
          style={{ background: "var(--bg-input)", color: "var(--text-primary)" }}
        >
          {JSON.stringify(tests ?? [], null, 2)}
        </pre>
      </Section>
      {spec && (
        <Section title="Spec">
          <pre
            className="rounded-md p-3 text-[11px] overflow-x-auto"
            style={{ background: "var(--bg-input)", color: "var(--text-primary)" }}
          >
            {JSON.stringify(spec, null, 2)}
          </pre>
        </Section>
      )}
    </div>
  );
}

function VideoAnnotationRenderer({ row }: { row: SampleRow }) {
  const video = row.payload.video_url as string | undefined;
  const labels = (row.payload.labels as Array<{ start: number; end: number; label: string }> | undefined) ?? [];
  return (
    <div className="space-y-4">
      <Section title="Video">
        {video ? (
          <video src={video} controls className="w-full rounded-md" style={{ background: "var(--bg-input)" }} />
        ) : (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>No video URL</p>
        )}
      </Section>
      <Section title="Timeline labels">
        {labels.length === 0 && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>No labels yet.</p>
        )}
        <div className="space-y-1">
          {labels.map((l, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-md px-3 py-1.5 text-xs"
              style={{ background: "var(--bg-input)" }}
            >
              <span style={{ color: "var(--text-primary)" }}>{l.label}</span>
              <code style={{ color: "var(--text-muted)" }}>
                {l.start.toFixed(2)}s → {l.end.toFixed(2)}s
              </code>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function ImageLabelingRenderer({ row }: { row: SampleRow }) {
  const images = (row.payload.images as string[] | undefined) ?? [];
  const labels = (row.payload.labels as string[] | undefined) ?? [];
  return (
    <div className="space-y-4">
      <Section title="Images">
        <div className="grid grid-cols-3 gap-2">
          {images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt="" className="aspect-square rounded-md object-cover" style={{ background: "var(--bg-input)" }} />
          ))}
          {images.length === 0 && (
            <p className="text-xs col-span-full" style={{ color: "var(--text-muted)" }}>No images.</p>
          )}
        </div>
      </Section>
      <Section title="Labels">
        <div className="flex flex-wrap gap-1.5">
          {labels.map((l, i) => (
            <span
              key={i}
              className="rounded-full px-2 py-0.5 text-xs"
              style={{ background: "var(--bg-input)", color: "var(--text-primary)" }}
            >
              {l}
            </span>
          ))}
          {labels.length === 0 && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>No labels.</p>
          )}
        </div>
      </Section>
    </div>
  );
}

function TextQcRenderer({ row }: { row: SampleRow }) {
  const prompt = row.payload.prompt as string | undefined;
  const response = row.payload.response as string | undefined;
  const rubric = row.payload.rubric as Array<{ criterion: string; score: number; max: number }> | undefined;
  return (
    <div className="space-y-4">
      <Section title="Prompt">
        <pre className="whitespace-pre-wrap rounded-md p-3 text-xs" style={{ background: "var(--bg-input)", color: "var(--text-primary)" }}>
          {prompt || "—"}
        </pre>
      </Section>
      <Section title="Response">
        <pre className="whitespace-pre-wrap rounded-md p-3 text-xs" style={{ background: "var(--bg-input)", color: "var(--text-primary)" }}>
          {response || "—"}
        </pre>
      </Section>
      <Section title="Rubric">
        <div className="space-y-1">
          {(rubric ?? []).map((r, i) => (
            <div key={i} className="flex items-center justify-between text-xs rounded-md px-3 py-1.5" style={{ background: "var(--bg-input)" }}>
              <span style={{ color: "var(--text-primary)" }}>{r.criterion}</span>
              <code style={{ color: "var(--color-brand-500)" }}>
                {r.score}/{r.max}
              </code>
            </div>
          ))}
          {!rubric?.length && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>No rubric.</p>
          )}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
        {title}
      </p>
      {children}
    </div>
  );
}
