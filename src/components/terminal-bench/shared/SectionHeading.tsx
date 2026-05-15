import type { ReactNode } from "react";

export function SectionHeading({
  label,
  children,
  className = "",
  centered = false,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  centered?: boolean;
}) {
  return (
    <div className={`mb-14 ${centered ? "text-center" : ""} ${className}`}>
      <p className="font-family_avt text-xs uppercase tracking-[0.2em] text-[#78818f]">
        / {label}
      </p>
      <h2
        className={`mt-4 max-w-4xl text-4xl font-medium leading-tight text-[#0e1b2e] md:text-6xl ${centered ? "mx-auto" : ""}`}
      >
        {children}
      </h2>
    </div>
  );
}
