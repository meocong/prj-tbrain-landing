import { NextResponse, type NextRequest } from "next/server";
import { sampleSession } from "@/lib/samples/access";

/**
 * Is this visitor holding a redeemed sample passcode?
 *
 * The catalogue is a client component rendered from static JSON, so it cannot
 * read an httpOnly cookie itself. It asks here once on mount and swaps every
 * "Request access" button for a real download link when the answer is yes.
 *
 * This only drives presentation — the download route re-checks the session, so
 * a forged answer here buys nothing.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const claims = await sampleSession(req);
  return NextResponse.json(
    { unlocked: !!claims, expiresAt: claims ? claims.exp * 1000 : null },
    { headers: { "Cache-Control": "no-store" } }
  );
}
