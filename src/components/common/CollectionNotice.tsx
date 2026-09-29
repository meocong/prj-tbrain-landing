import Link from "next/link";

/**
 * Notice at collection, shown beside every public form that takes personal
 * information.
 *
 * The CCPA requires a business to tell people, at or before the point it
 * collects their information, what it collects and why, and to link the full
 * privacy policy (CCPA regs §7012). A policy page alone does not do that — the
 * visitor typing into a form never has to see it — so each form carries this
 * line directly above its submit button.
 */
export default function CollectionNotice({
  purpose = "to respond to your request",
  className = "text-xs leading-relaxed",
  style,
}: {
  /** What the details are used for, completing "We use these details …". */
  purpose?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <p className={className} style={{ color: "var(--text-muted, #64748b)", ...style }}>
      We use these details {purpose}. We don&apos;t sell or share them. See our{" "}
      <Link href="/policy" className="underline underline-offset-2">
        Privacy Policy
      </Link>{" "}
      for what we collect and your rights, including for California residents.
    </p>
  );
}
