import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — Tbrain",
  robots: "noindex, nofollow",
};

export default function AdminPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-screen" style={{ backgroundColor: "#020617" }}>
      {/* Animated mesh background */}
      <div className="page-mesh" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
