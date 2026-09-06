/**
 * Funnel events for the sample library.
 *
 * Mirrors the shape the terminal-bench showcase already logs server side, so the
 * two products stay comparable in GA. Safe to call when GA is not configured:
 * gtag simply will not exist and the call is dropped.
 */
type Gtag = (command: "event", name: string, params?: Record<string, unknown>) => void;

export type SampleEvent =
  | "view_samples_hub"
  | "filter_domain"
  | "filter_rig"
  | "play_preview"
  | "expand_record"
  | "scrub_telemetry"
  | "open_request_access"
  | "open_passcode";

export function track(event: SampleEvent, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag !== "function") return;
  gtag("event", event, params);
}
