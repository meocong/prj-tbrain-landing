import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/admin/server/list";
import { SettingsClient } from "./settings-client";

export const dynamic = "force-dynamic";

export default async function ProductSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  return <SettingsClient product={product} />;
}
