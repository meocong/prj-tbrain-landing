import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Tbrain about AI training data, RLHF, evaluation, and custom dataset projects. We respond within 1-2 business days.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Tbrain",
    description:
      "Tell us about your AI training data project — RLHF, evaluation, custom datasets, expert pods.",
    url: "/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
