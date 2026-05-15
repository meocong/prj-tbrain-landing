import Link from "next/link";

export function PlusIconLink({
  href,
  children,
  variant = "outline",
  tone = "default",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline";
  tone?: "default" | "cinema";
}) {
  const base =
    "group inline-flex items-center gap-3 rounded-full px-6 py-3 text-base font-semibold transition-all";
  const style =
    variant === "solid"
      ? "bg-[#6C3CF4] text-white hover:bg-[#5a2fd3] hover:shadow-lg"
      : tone === "cinema"
        ? "border border-white/55 text-white hover:bg-white hover:text-[#0e1b2e]"
        : "border border-[#0e1b2e] text-[#0e1b2e] hover:bg-[#0e1b2e] hover:text-white dark:border-white/25 dark:text-white dark:hover:bg-white dark:hover:text-[#0e1b2e]";

  return (
    <Link href={href} className={`${base} ${style}`}>
      <span>{children}</span>
      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-sm transition-transform group-hover:rotate-90">
        +
      </span>
    </Link>
  );
}
