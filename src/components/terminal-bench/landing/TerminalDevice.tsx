"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Beat =
  | { kind: "cmd"; text: string; dwell?: number }
  | { kind: "out"; text: string; color?: string; dwell?: number }
  | { kind: "gap"; dwell: number };

const SCRIPT: Beat[] = [
  { kind: "cmd", text: "tb run msal-mcp-support --agent claude-opus-4-7", dwell: 600 },
  { kind: "out", text: "› spawning container  python:3.11-slim  4 cpu  2G mem", color: "#8b949e", dwell: 900 },
  { kind: "out", text: "› loading instruction.md  (48 lines)", color: "#8b949e", dwell: 700 },
  { kind: "out", text: "› agent.step  patch env/auth.py", color: "#8b949e", dwell: 700 },
  { kind: "out", text: "› agent.step  add mcp handler", color: "#8b949e", dwell: 700 },
  { kind: "out", text: "› agent.step  write tests/test_outputs.py", color: "#8b949e", dwell: 700 },
  { kind: "out", text: "› verifier  pytest -q   .................. [100%]", color: "#8b949e", dwell: 800 },
  { kind: "out", text: "✓ 18/18 tests passed   142.4s", color: "#3fb950", dwell: 1600 },
  { kind: "gap", dwell: 1400 },
];

const CHAR_MS = 22;

export function TerminalDevice() {
  const reduced = useReducedMotion();
  const [beatIdx, setBeatIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [committed, setCommitted] = useState<Beat[]>([]);

  useEffect(() => {
    if (reduced) {
      setCommitted(SCRIPT.filter((b) => b.kind !== "gap"));
      setBeatIdx(SCRIPT.length);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function play() {
      for (let i = 0; i < SCRIPT.length; i++) {
        if (cancelled) return;
        const beat = SCRIPT[i];
        setBeatIdx(i);
        if (beat.kind === "gap") {
          await wait(beat.dwell);
          continue;
        }
        const text = beat.text;
        setTyped("");
        for (let c = 0; c <= text.length; c++) {
          if (cancelled) return;
          setTyped(text.slice(0, c));
          await wait(beat.kind === "cmd" ? CHAR_MS : Math.max(4, CHAR_MS / 3));
        }
        setCommitted((prev) => [...prev, beat]);
        await wait(beat.dwell ?? 400);
      }
      // Loop
      if (!cancelled) {
        timer = setTimeout(() => {
          if (cancelled) return;
          setCommitted([]);
          setTyped("");
          setBeatIdx(0);
          play();
        }, 400);
      }
    }

    function wait(ms: number) {
      return new Promise<void>((resolve) => {
        timer = setTimeout(resolve, ms);
      });
    }

    play();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [reduced]);

  const current = beatIdx < SCRIPT.length ? SCRIPT[beatIdx] : null;
  const showCaret = !reduced && current && current.kind !== "gap";

  return (
    <div
      role="img"
      aria-label="Terminal replay: agent solves msal-mcp-support in 142 seconds, 18 of 18 tests pass"
      className="relative w-full rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_24px_60px_-24px_rgba(14,27,46,0.25)]"
    >
      <div className="flex items-center gap-2 rounded-t-2xl border-b border-[#E5E7EB] bg-[#FAFAF7] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="font-family_avt ml-4 text-xs tracking-widest text-[#78818f]">
          tbrain — tb run
        </span>
      </div>
      <div className="overflow-hidden rounded-b-2xl bg-[#0D1117] px-5 py-6 font-mono text-[13px] leading-relaxed text-[#c9d1d9] sm:px-7 sm:py-7 sm:text-sm">
        <div className="min-h-[16rem] sm:min-h-[18rem]">
          {committed.map((beat, i) => (
            <Line key={i} beat={beat} />
          ))}
          {current && current.kind !== "gap" && (
            <Line
              beat={{ ...current, text: typed } as Beat}
              trailing={showCaret ? <Caret /> : null}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Line({ beat, trailing }: { beat: Beat; trailing?: React.ReactNode }) {
  if (beat.kind === "gap") return null;
  if (beat.kind === "cmd") {
    return (
      <div className="whitespace-pre-wrap">
        <span className="text-[#6C3CF4]">$</span>{" "}
        <span className="text-[#f0f6fc]">{beat.text}</span>
        {trailing}
      </div>
    );
  }
  return (
    <div className="whitespace-pre-wrap" style={{ color: beat.color ?? "#c9d1d9" }}>
      {beat.text}
      {trailing}
    </div>
  );
}

function Caret() {
  return (
    <motion.span
      aria-hidden
      className="ml-[2px] inline-block h-[1em] w-[0.55ch] translate-y-[2px] bg-[#f0f6fc] align-middle"
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
}
