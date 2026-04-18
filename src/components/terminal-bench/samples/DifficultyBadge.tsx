const STYLES: Record<string, string> = {
  easy: "bg-green-50 text-green-700 border-green-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  hard: "bg-[#F3EEFF] text-[#6C3CF4] border-[#6C3CF4]/30",
};

export function DifficultyBadge({ value }: { value: string | null }) {
  if (!value) return null;
  const key = value.toLowerCase();
  const cls = STYLES[key] ?? "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${cls}`}
    >
      {value}
    </span>
  );
}
