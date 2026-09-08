import type { ReactNode } from "react";

/**
 * The samples pages follow the site-wide theme toggle.
 *
 * They used to force dark through `ForceDarkScope`, which is what
 * `/data/terminal-bench` and `/data/physical-ai` still do — their heroes are
 * painted for a dark backdrop and break on white. These pages are not that:
 * `.samples-scope` in globals.css declares a full light palette beside the dark
 * one and the class on <html> switches between them, so forcing the class here
 * pinned the page to one half of a design that already had both.
 */
export default function SamplesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
