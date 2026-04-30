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

  // Unified passcode lookup: per-client grants (client_id set) and shared
  // batch codes (client_id null) live in the same table.
  const { data: candidates } = await db
    .from("passcodes")
    .select("id, client_id, passcode_hash, expires_at, max_uses, use_count, revoked_at")
    .eq("batch_id", batch.id)
    .eq("passcode_prefix", prefix)
    .is("revoked_at", null);

  for (const p of candidates ?? []) {
    if (p.expires_at && new Date(p.expires_at) < new Date()) continue;
    if (p.max_uses != null && p.use_count >= p.max_uses) continue;
    if (!(await verifyPasscode(passcode, p.passcode_hash))) continue;

    const isPerClient = p.client_id != null;
    const kind = isPerClient ? "grant" : "batch_passcode";

    const { error: bumpErr } = await db
      .from("passcodes")
      .update({ use_count: p.use_count + 1, last_used_at: new Date().toISOString() })
      .eq("id", p.id);
    if (bumpErr) {
      // Don't block sign-in on a use_count bump failure — but log so we can
      // detect quota-tracking drift if it happens repeatedly.
      console.error("[terminal-bench] passcode use_count update failed:", bumpErr);
    }

    const sessionId = newSessionId();
    const jwt = await signSessionJwt({
      batchIds: [batch.id],
      clientId: p.client_id ?? undefined,
      grantId: p.id,
      sessionId,
    });
    await Promise.all([
      logAuthAttempt({ ip, batchId: batch.id, success: true, meta: { kind } }),
      logEvent({
        clientId: p.client_id,
        grantId: p.id,
        sessionId,
        batchId: batch.id,
        eventType: "enter_success",
        ip,
        userAgent,
        meta: { kind },
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
