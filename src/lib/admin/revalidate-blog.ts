/** Client helper: ask the server to refresh blog ISR for one post. Best effort. */
export async function revalidateBlogPost(slug: string | null | undefined): Promise<void> {
  if (!slug) return;
  try {
    await fetch("/api/admin/content/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
  } catch {
    // ISR still refreshes on its own within 5 minutes.
  }
}
