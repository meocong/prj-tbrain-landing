import { NextResponse, type NextRequest } from "next/server";
import { verifySessionJwt, SESSION_COOKIE } from "@/lib/terminal-bench/auth";
import { logEvent } from "@/lib/terminal-bench/events";
import type { EventType } from "@/lib/terminal-bench/types";

export const runtime = "nodejs";

const ALLOWED: EventType[] = ["view_tests", "view_solution"];

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const claims = token ? await verifySessionJwt(token) : null;
  if (!claims) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { events?: Array<{ type: string; sampleId?: string; batchId?: string; meta?: Record<string, unknown> }> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const events = (body.events ?? []).filter((e) => ALLOWED.includes(e.type as EventType)).slice(0, 50);
  const ip = clientIp(req);
  const userAgent = req.headers.get("user-agent") ?? null;

  await Promise.all(
    events.map((e) =>
      logEvent({
        clientId: claims.clientId,
        grantId: claims.grantId,
        sessionId: claims.sessionId,
        batchId: e.batchId ?? null,
        sampleId: e.sampleId ?? null,
        eventType: e.type as EventType,
        ip,
        userAgent,
        meta: e.meta,
      })
    )
  );

  return NextResponse.json({ ok: true, logged: events.length });
}
