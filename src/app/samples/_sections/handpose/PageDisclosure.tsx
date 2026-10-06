"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { C } from "../tokens";

const UP = {
  md: { show: "md:block", hide: "md:hidden", gap: "mt-4 md:mt-0" },
  lg: { show: "lg:block", hide: "lg:hidden", gap: "mt-4 lg:mt-0" },
} as const;

/**
 * A show/hide control for a block that is too long to read past.
 *
 * A `<button aria-expanded>` and a region it controls, not `<details>`: the
 * dialog's Tab trap does not know `<summary>`, and a disclosure written one way
 * on the page and another in the record would be two things to learn. The
 * label swaps with the state, as RigViews' does.
 *
 * `below` makes it a phone-only control. The joint table and the pack's field
 * table are reference material, fine open on a desktop and a full screen each
 * on a phone, so from `md` up the button is gone and the block is simply there.
 * The block is rendered either way, so it is in the page for search and for a
 * reader without scripts, just hidden by CSS until opened.
 */
export function PageDisclosure({
  label,
  openLabel,
  below,
  defaultOpen = false,
  className = "",
  children,
}: {
  /** The closed label: "Show the numbers". */
  label: string;
  /** The open label: "Hide the numbers". */
  openLabel: string;
  /** Collapse only below this breakpoint; always open from it up. */
  below?: "md" | "lg";
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  // Whole class names, because Tailwind reads source text, not template output.
  const up = below ? UP[below] : { show: "", hide: "", gap: "mt-4" };

  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-[12px] font-medium transition-transform active:scale-[0.98] ${up.hide}`}
        style={{ border: `1px solid ${C.rule}`, color: C.text }}
      >
        {open ? openLabel : label}
        <ChevronDown
          aria-hidden
          className="h-3.5 w-3.5 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : undefined, color: C.textDim }}
        />
      </button>
      <div id={id} className={`${open ? "block" : "hidden"} ${up.show} ${up.gap}`}>
        {children}
      </div>
    </div>
  );
}
