import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  newSessionId,
  passcodePrefix,
  signSessionJwt,
  verifyPasscode,
  verifyTurnstile,
} from "@/lib/terminal-bench/auth";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { logAuthAttempt, logEvent } from "@/lib/terminal-bench/events";

export const runtime = "nodejs";

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}

export async function POST(req: NextRequest) {
  let body: { passcode?: string; batchSlug?: string; turnstileToken?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const passcode = body.passcode?.trim();
  const batchSlug = body.batchSlug?.trim();
  if (!passcode) return NextResponse.json({ error: "missing_passcode" }, { status: 400 });

  const ip = clientIp(req);
  const userAgent = req.headers.get("user-agent") ?? null;

  const ok = await verifyTurnstile(body.turnstileToken, ip);
  if (!ok) return NextResponse.json({ error: "turnstile_failed" }, { status: 400 });

  const db = supabaseAdmin();

  // Resolve the batch.
  const { data: batch } = await db
    .from("batches")
    .select("id, slug")
    .eq("project", "terminal-bench")
    .eq("slug", batchSlug ?? "")
    .maybeSingle();

  if (!batch) {
    await logAuthAttempt({ ip, batchId: null, success: false, meta: { reason: "unknown_batch", batchSlug } });
    return NextResponse.json({ error: "unknown_batch" }, { status: 404 });
  }

  const prefix = passcodePrefix(passcode);

  // 1) Per-user grant.
  const { data: grantCandidates } = await db
    .from("access_grants")
    .select("id, client_id, passcode_hash, expires_at, max_uses, use_count, revoked_at")
    .eq("batch_id", batch.id)
    .eq("passcode_prefix", prefix)
    .is("revoked_at", null);

  for (const g of grantCandidates ?? []) {
    if (g.expires_at && new Date(g.expires_at) < new Date()) continue;
    if (g.max_uses != null && g.use_count >= g.max_uses) continue;
    if (await verifyPasscode(passcode, g.passcode_hash)) {
      await db
        .from("access_grants")
        .update({ use_count: g.use_count + 1, last_used_at: new Date().toISOString() })
        .eq("id", g.id);
      const sessionId = newSessionId();
      const jwt = await signSessionJwt({
        batchIds: [batch.id],
        clientId: g.client_id ?? undefined,
        grantId: g.id,
        sessionId,
      });
      await Promise.all([
        logAuthAttempt({ ip, batchId: batch.id, success: true, meta: { kind: "grant" } }),
        logEvent({
          clientId: g.client_id,
          grantId: g.id,
          sessionId,
          batchId: batch.id,
          eventType: "enter_success",
          ip,
          userAgent,
          meta: { kind: "grant" },
        }),
      ]);

      const res = NextResponse.json({ ok: true, batchSlug: batch.slug });
      res.cookies.set(SESSION_COOKIE, jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: SESSION_TTL_SECONDS,
      });
      return res;
    }
  }

  // 2) Shared batch passcode fallback.
  const { data: batchCandidates } = await db
    .from("batch_passcodes")
    .select("id, passcode_hash, expires_at, revoked_at")
    .eq("batch_id", batch.id)
    .eq("passcode_prefix", prefix)
    .is("revoked_at", null);

  for (const b of batchCandidates ?? []) {
    if (b.expires_at && new Date(b.expires_at) < new Date()) continue;
    if (await verifyPasscode(passcode, b.passcode_hash)) {
      const sessionId = newSessionId();
      const jwt = await signSessionJwt({
        batchIds: [batch.id],
        sessionId,
      });
      await Promise.all([
        logAuthAttempt({ ip, batchId: batch.id, success: true, meta: { kind: "batch_passcode", id: b.id } }),
        logEvent({
          sessionId,
          batchId: batch.id,
          eventType: "enter_success",
          ip,
          userAgent,
          meta: { kind: "batch_passcode", id: b.id },
        }),
      ]);
      const res = NextResponse.json({ ok: true, batchSlug: batch.slug });
      res.cookies.set(SESSION_COOKIE, jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: SESSION_TTL_SECONDS,
      });
      return res;
    }
  }

  // Failure path.
  await Promise.all([
    logAuthAttempt({ ip, batchId: batch.id, success: false, meta: { prefix } }),
    logEvent({
      batchId: batch.id,
      eventType: "enter_fail",
      ip,
      userAgent,
      meta: { prefix },
    }),
  ]);

  return NextResponse.json({ error: "invalid_passcode" }, { status: 401 });
}
