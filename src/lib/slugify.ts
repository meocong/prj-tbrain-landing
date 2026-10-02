/** URL slug from any title, Vietnamese included ("Dữ liệu đẹp" -> "du-lieu-dep"). */
export function slugify(input: string): string {
  return input
    .replace(/[đĐ]/g, "d")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
