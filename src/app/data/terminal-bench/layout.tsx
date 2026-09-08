import type { ReactNode } from "react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

export const metadata = {
  title: "Terminal Bench — Tbrain",
  description:
    "Production-grade training data & evaluation environments for agentic AI, built by Tbrain.",
};

export default function TerminalBenchLayout({ children }: { children: ReactNode }) {
  return (
    <div className="terminal-bench-themeable min-h-screen bg-[#020617]">
      <Header />
      <div>{children}</div>
      <Footer />
    </div>
  );
}
