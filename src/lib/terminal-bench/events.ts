import { supabaseAdmin } from "./supabase/admin";
import type { EventType } from "./types";

export interface LogEventInput {
  clientId?: string | null;
  grantId?: string | null;
  sessionId?: string | null;
  batchId?: string | null;
  sampleId?: string | null;
  eventType: EventType;
  filePath?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  meta?: Record<string, unknown>;
}

export async function logEvent(input: LogEventInput): Promise<void> {
  try {
    await supabaseAdmin().from("access_events").insert({
      client_id: input.clientId ?? null,
      grant_id: input.grantId ?? null,
      session_id: input.sessionId ?? null,
      batch_id: input.batchId ?? null,
      sample_id: input.sampleId ?? null,
      event_type: input.eventType,
      file_path: input.filePath ?? null,
      ip: input.ip ?? null,
      user_agent: input.userAgent ?? null,
      meta: input.meta ?? null,
    });
  } catch (err) {
    // Never fail the request because of logging. Print to console for ops.
    console.error("[terminal-bench] logEvent failed:", err);
  }
}

export async function logAuthAttempt(params: {
  ip: string;
  batchId: string | null;
  success: boolean;
  meta?: Record<string, unknown>;
}): Promise<void> {
  try {
    await supabaseAdmin().from("auth_attempts").insert({
      ip: params.ip,
      batch_id: params.batchId,
      success: params.success,
      meta: params.meta ?? null,
    });
  } catch (err) {
    console.error("[terminal-bench] logAuthAttempt failed:", err);
  }
}
