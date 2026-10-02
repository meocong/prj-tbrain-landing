import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * Machine auth for the content agent (Hermes) calling /api/agent/*.
 *
 * The agent holds a single bearer token (CONTENT_AGENT_TOKEN). It can create
 * and edit drafts and submit them for review — it has no way to publish: there
 * is no publish route, and the cms_posts_review_guard trigger (migration 023)
 * rejects publishing an agent post without a human reviewer.
 *
 * Returns null when the request is allowed, or the error response to send.
 */
export function requireAgent(req: Request): NextResponse | null {
  const expected = process.env.CONTENT_AGENT_TOKEN;
  if (!expected || expected.length < 32) {
    return NextResponse.json({ error: "agent_api_disabled" }, { status: 503 });
  }

  const ip = getClientIp(req.headers);
  const limit = checkRateLimit(`agent:${ip}`, { maxRequests: 120, windowSeconds: 60 });
  if (!limit.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}
