"use client";

import { useMemo, useState } from "react";
import { SampleCard } from "./SampleCard";
import type { SampleRow } from "@/lib/terminal-bench/types";

const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export function FilterableSampleGrid({
  samples,
  batchSlug,
}: {
  samples: SampleRow[];
  batchSlug: string;
}) {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const s of samples) if (s.category) set.add(s.category);
    return Array.from(set).sort();
  }, [samples]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return samples.filter((s) => {
      if (difficulty && s.difficulty !== difficulty) return false;
      if (category && s.category !== category) return false;
      if (!q) return true;
      const hay =
        s.title.toLowerCase() +
        " " +
        (s.slug ?? "").toLowerCase() +
        " " +
        (s.tags ?? []).join(" ").toLowerCase() +
        " " +
        (s.category ?? "").toLowerCase();
      return hay.includes(q);
    });
  }, [samples, query, difficulty, category]);

  return (
    <div>
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search samples by title, tag, or slug"
            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#0e1b2e] placeholder:text-[#78818f] focus:border-[#6C3CF4] focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip
            active={difficulty === null}
            onClick={() => setDifficulty(null)}
            label="all difficulties"
          />
          {DIFFICULTIES.map((d) => (
            <Chip
              key={d}
              active={difficulty === d}
              onClick={() => setDifficulty(difficulty === d ? null : d)}
              label={d}
            />
          ))}
        </div>
      </div>

      {categories.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs uppercase tracking-wider text-[#78818f]">
            category
          </span>
          <Chip
            active={category === null}
            onClick={() => setCategory(null)}
            label="all"
          />
          {categories.map((c) => (
            <Chip
              key={c}
              active={category === c}
              onClick={() => setCategory(category === c ? null : c)}
              label={c}
            />
          ))}
        </div>
      ) : null}

      <div className="mt-5 text-sm text-[#78818f]">
        {filtered.length} sample{filtered.length === 1 ? "" : "s"}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[#E5E7EB] p-16 text-center text-[#78818f]">
          No samples match these filters.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <SampleCard key={s.id} sample={s} batchSlug={batchSlug} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full px-3 py-1.5 text-xs font-medium transition-all " +
        (active
          ? "bg-[#6C3CF4] text-white"
          : "border border-[#E5E7EB] bg-white text-[#0e1b2e] hover:border-[#6C3CF4]/40")
      }
    >
      {label}
    </button>
  );
}
