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
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-20">{children}</div>
      <Footer />
    </div>
  );
}
