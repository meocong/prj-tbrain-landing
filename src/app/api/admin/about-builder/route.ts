import { NextResponse } from "next/server";
import { createAdminServerClient } from "@/lib/admin/supabase-server";
import { getAdminUser, hasPermission } from "@/lib/admin/permissions";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";

type AboutBuilderAction =
  | "saveHero"
  | "saveSection"
  | "saveCard"
  | "deleteCard"
  | "deleteSection"
  | "reorderCards"
  | "reorderSections";

type AboutBuilderBody = {
  action?: AboutBuilderAction;
  item?: Record<string, unknown>;
  id?: string;
  groupKey?: string;
  rows?: Array<{ id?: string; display_order?: number }>;
  sections?: Array<{ id?: string; display_order?: number }>;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as AboutBuilderBody | null;
  if (!body?.action) return NextResponse.json({ error: "bad_json" }, { status: 400 });

  const permission = permissionFor(body);
  const forbidden = await assertPermission(permission);
  if (forbidden) return forbidden;

  try {
    switch (body.action) {
      case "saveHero":
        return NextResponse.json({ row: await saveHero(body.item ?? {}) });
      case "saveSection":
        return NextResponse.json({ row: await saveSection(body.item ?? {}) });
      case "saveCard":
        return NextResponse.json({ row: await saveCard(body.item ?? {}) });
      case "deleteCard":
        await deleteCard(requiredString(body.id, "id"));
        return NextResponse.json({ ok: true });
      case "deleteSection":
        await deleteSection(requiredString(body.id, "id"), requiredString(body.groupKey, "groupKey"));
        return NextResponse.json({ ok: true });
      case "reorderCards":
        await reorderCards(body.rows ?? []);
        return NextResponse.json({ ok: true });
      case "reorderSections":
        await reorderSections(body.sections ?? []);
        return NextResponse.json({ ok: true });
      default:
        return NextResponse.json({ error: "unknown_action" }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "request_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function permissionFor(body: AboutBuilderBody) {
  if (body.action === "deleteCard" || body.action === "deleteSection") return "content.delete";
  if (body.action === "saveCard" || body.action === "saveSection") return body.item?.id ? "content.edit" : "content.create";
  return "content.edit";
}

async function assertPermission(permission: string) {
  const supa = await createAdminServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = await getAdminUser(user.email);
  if (!admin || !hasPermission(admin, permission)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return null;
}

async function saveHero(item: Record<string, unknown>) {
  const payload = {
    key: "about",
    title_before: nullableString(item.title_before),
    title_highlight: nullableString(item.title_highlight),
    title_after: nullableString(item.title_after),
    description: nullableString(item.description),
    stats: Array.isArray(item.stats) ? item.stats : [],
  };
  const query =
    typeof item.id === "string"
      ? supabaseAdmin().from("about_hero_settings").update(payload).eq("id", item.id)
      : supabaseAdmin().from("about_hero_settings").upsert(payload, { onConflict: "key" });
  const { data, error } = await query
    .select("id, title_before, title_highlight, title_after, description, stats, updated_at")
    .single();
  if (error) throw error;
  return data;
}

async function saveSection(item: Record<string, unknown>) {
  const payload = {
    group_key: requiredString(item.group_key, "group_key"),
    eyebrow: nullableString(item.eyebrow),
    title_before: nullableString(item.title_before),
    title_highlight: nullableString(item.title_highlight),
    title_after: nullableString(item.title_after),
    description: nullableString(item.description),
    child_widget_type: widgetType(item.child_widget_type),
    layout: layoutType(item.layout),
    accent: nullableString(item.accent) ?? "#6C3CF4",
    display_order: numberValue(item.display_order, 100),
    is_active: Boolean(item.is_active),
  };
  const query =
    typeof item.id === "string"
      ? supabaseAdmin().from("about_sections").update(payload).eq("id", item.id)
      : supabaseAdmin().from("about_sections").insert(payload);
  const { data, error } = await query
    .select("id, group_key, eyebrow, title_before, title_highlight, title_after, description, child_widget_type, layout, accent, display_order, is_active, updated_at")
    .single();
  if (error) throw error;
  return data;
}

async function saveCard(item: Record<string, unknown>) {
  const payload = {
    group_key: requiredString(item.group_key, "group_key"),
    slug: nullableString(item.slug) || autoSlug(requiredString(item.title, "title")),
    title: requiredString(item.title, "title"),
    label: nullableString(item.label),
    description: nullableString(item.description),
    icon: nullableString(item.icon),
    image_url: nullableString(item.image_url),
    meta: objectValue(item.meta),
    display_order: numberValue(item.display_order, 100),
    is_active: Boolean(item.is_active),
  };
  const query =
    typeof item.id === "string"
      ? supabaseAdmin().from("about_cards").update(payload).eq("id", item.id)
      : supabaseAdmin().from("about_cards").insert(payload);
  const { data, error } = await query
    .select("id, group_key, slug, title, label, description, icon, image_url, meta, display_order, is_active, updated_at")
    .single();
  if (error) throw error;
  return data;
}

async function deleteCard(id: string) {
  const { error } = await supabaseAdmin().from("about_cards").delete().eq("id", id);
  if (error) throw error;
}

async function deleteSection(id: string, groupKey: string) {
  const cardsResult = await supabaseAdmin().from("about_cards").delete().eq("group_key", groupKey);
  if (cardsResult.error) throw cardsResult.error;
  const sectionResult = await supabaseAdmin().from("about_sections").delete().eq("id", id);
  if (sectionResult.error) throw sectionResult.error;
}

async function reorderCards(rows: Array<{ id?: string; display_order?: number }>) {
  const results = await Promise.all(
    rows.filter((row) => row.id).map((row) => supabaseAdmin().from("about_cards").update({ display_order: numberValue(row.display_order, 100) }).eq("id", row.id))
  );
  const failed = results.find((result) => result.error);
  if (failed?.error) throw failed.error;
}

async function reorderSections(sections: Array<{ id?: string; display_order?: number }>) {
  const results = await Promise.all(
    sections.filter((section) => section.id).map((section) => supabaseAdmin().from("about_sections").update({ display_order: numberValue(section.display_order, 100) }).eq("id", section.id))
  );
  const failed = results.find((result) => result.error);
  if (failed?.error) throw failed.error;
}

function requiredString(value: unknown, name: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${name}_required`);
  return value.trim();
}

function nullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberValue(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function objectValue(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function widgetType(value: unknown) {
  return value === "profile-card" || value === "avatar-card" || value === "icon-card" ? value : "icon-card";
}

function layoutType(value: unknown) {
  return value === "two" || value === "three" || value === "four" ? value : "three";
}

function autoSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 200);
}
