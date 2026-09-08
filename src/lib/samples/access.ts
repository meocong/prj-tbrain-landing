import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionJwt } from "@/lib/terminal-bench/auth";
import type { SessionClaims } from "@/lib/terminal-bench/types";

/**
 * Server-side gate for the sample library.
 *
 * The sample library and the terminal-bench showcase share one auth secret and
 * one `tb_session` cookie, so a valid signature alone proves nothing about
 * which product the visitor paid for. Every sample route therefore checks the
 * `project` claim as well: only a token minted by
 * `/samples/api/auth/passcode` carries `project: "samples"`.
 */
export const SAMPLES_PROJECT = "samples" as const;

export async function sampleSession(req: NextRequest): Promise<SessionClaims | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const claims = await verifySessionJwt(token);
  if (!claims || claims.project !== SAMPLES_PROJECT) return null;
  return claims;
}

export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}
