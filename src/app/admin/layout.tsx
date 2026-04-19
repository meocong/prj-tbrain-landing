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
      {/* Animated orb background (matches management project) */}
      <div aria-hidden="true" className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full animate-pulse"
          style={{
            background: "#6C3CF4",
            width: "55vmax",
            height: "55vmax",
            top: "-15%",
            right: "-10%",
            opacity: 0.18,
            filter: "blur(50px)",
            animationDuration: "6s",
          }}
        />
        <div
          className="absolute rounded-full animate-pulse"
          style={{
            background: "#10B981",
            width: "45vmax",
            height: "45vmax",
            bottom: "-12%",
            left: "-8%",
            opacity: 0.14,
            filter: "blur(50px)",
            animationDuration: "8s",
            animationDelay: "1s",
          }}
        />
        <div
          className="absolute rounded-full animate-pulse"
          style={{
            background: "#A78BFA",
            width: "60vmax",
            height: "60vmax",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 0.07,
            filter: "blur(70px)",
            animationDuration: "10s",
            animationDelay: "2s",
          }}
        />
        <div
          className="absolute rounded-full animate-pulse"
          style={{
            background: "#34D399",
            width: "28vmax",
            height: "28vmax",
            top: "12%",
            left: "6%",
            opacity: 0.12,
            filter: "blur(45px)",
            animationDuration: "7s",
            animationDelay: "3s",
          }}
        />
        <div
          className="absolute rounded-full animate-pulse"
          style={{
            background: "#8B5CF6",
            width: "32vmax",
            height: "32vmax",
            right: "3%",
            bottom: "8%",
            opacity: 0.1,
            filter: "blur(45px)",
            animationDuration: "9s",
            animationDelay: "4s",
          }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
