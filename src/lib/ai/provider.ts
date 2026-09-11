/**
 * Resolve AI provider credentials from SSO database.
 * Falls back to ANTHROPIC_API_KEY env var if SSO is unavailable.
 *
 * Uses sso.api_providers + sso.provider_api_keys tables,
 * same pattern as prj-tbrain-management.
 */

import { createClient } from "@supabase/supabase-js";

export interface AIProvider {
  apiKey: string;
  baseURL: string;
  model: string;
  /**
   * Ask the model not to emit a thinking block.
   *
   * GLM reasons by default and the chat route forwards only `text_delta`, so
   * the thinking is invisible to the reader while still being billed and
   * still spending the 1024 `max_tokens` the answer has to fit in. Measured
   * on 2026-09-12 against the same prompt: thinking on took 12.4s and burned
   * 2,011 characters of hidden reasoning for 283 visible; off took 4.1s for
   * 255 visible. Three times faster for the same answer.
   *
   * Only set for providers known to accept the field. Anthropic proper is
   * left alone — the env fallback below does not set it.
   */
  disableThinking?: boolean;
}

/**
 * GLM keys, in the order they should be tried.
 *
 * A list rather than one key because they are metered per key and run dry
 * independently: of the three issued on 2026-09-12, one was already returning
 * `1113 Insufficient balance` while the other two answered normally. One key
 * in an env var would have meant a chat widget that works or does not depending
 * on which key was pasted. `resolveAIProvider` hands back every candidate and
 * the caller walks them.
 *
 * Accepts either `GLM_API_KEY` holding a comma-separated list, or the numbered
 * `GLM_API_KEY_1..9` that the keys arrive in.
 */
function glmKeys(): string[] {
  const out: string[] = [];
  const list = process.env.GLM_API_KEY;
  if (list) out.push(...list.split(",").map((k) => k.trim()).filter(Boolean));
  for (let i = 1; i <= 9; i++) {
    const k = process.env[`GLM_API_KEY_${i}`];
    if (k?.trim()) out.push(k.trim());
  }
  return [...new Set(out)];
}

/** z.ai's Anthropic-compatible endpoint, so the Anthropic SDK needs no change. */
const GLM_BASE_URL = process.env.GLM_BASE_URL || "https://api.z.ai/api/anthropic";
const GLM_MODEL = process.env.GLM_MODEL || "glm-4.6";

let _cached: AIProvider | null = null;
let _cachedAt = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getSSOClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { db: { schema: "sso" } });
}

export async function resolveAIProvider(): Promise<AIProvider> {
  // Check cache
  if (_cached && Date.now() - _cachedAt < CACHE_TTL) return _cached;

  // ENV override — when ANTHROPIC_API_KEY is set, use it directly. This lets
  // local dev / Vercel / any environment that can't reach the internal Bifrost
  // gateway (`http://tbrain-ai-api-prod:8080`) work without DB changes.
  const envKey = process.env.ANTHROPIC_API_KEY;
  if (envKey) {
    _cached = {
      apiKey: envKey,
      baseURL: process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com",
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    };
    _cachedAt = Date.now();
    return _cached;
  }

  // Try SSO database (Bifrost gateway path — works inside Docker network)
  try {
    const supabase = getSSOClient();

    // Find an active provider with anthropic adapter
    const { data: providers } = await supabase
      .from("api_providers")
      .select("id, name, base_url, adapter_type, config")
      .eq("is_active", true)
      .eq("adapter_type", "anthropic");

    if (providers && providers.length > 0) {
      const provider = providers[0];

      // Get a random active key for load distribution
      const { data: keys } = await supabase
        .from("provider_api_keys")
        .select("api_key_encrypted")
        .eq("provider_id", provider.id)
        .eq("is_active", true);

      if (keys && keys.length > 0) {
        const key = keys[Math.floor(Math.random() * keys.length)];
        const config = provider.config as Record<string, unknown> | null;
        const models = config?.models as Record<string, string> | undefined;

        // Rewrite Docker-internal hostnames to host-port mappings so dev/non-
        // Docker callers can reach the gateway. Override via BIFROST_HOST_BASE
        // env if the host port differs from the default 127.0.0.1:3010.
        const hostOverride = process.env.BIFROST_HOST_BASE || "http://127.0.0.1:3010";
        const baseURL = provider.base_url.replace(
          /^http:\/\/tbrain-ai-api-prod:8080/,
          hostOverride
        );

        // Bifrost gateway routes by lowercase model id (e.g. "glm-4.7"); the
        // DB config sometimes stores it uppercase, normalize here.
        const rawModel = models?.helper || "claude-sonnet-4-20250514";
        const model = rawModel.toLowerCase();

        _cached = {
          apiKey: key.api_key_encrypted,
          baseURL,
          model,
        };
        _cachedAt = Date.now();
        return _cached;
      }
    }
  } catch (err) {
    console.warn("[ai/provider] SSO provider lookup failed, falling back to env:", err);
  }

  // GLM, via its Anthropic-compatible endpoint.
  const glm = glmKeys();
  if (glm.length > 0) {
    // Random start so load spreads across keys, then the caller walks the rest
    // in order if the first one is out of balance.
    const offset = Math.floor(Math.random() * glm.length);
    _cached = {
      apiKey: glm[offset],
      baseURL: GLM_BASE_URL,
      model: GLM_MODEL,
      disableThinking: true,
    };
    _cachedAt = Date.now();
    return _cached;
  }

  // Fallback to env var
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("No AI provider configured (SSO, GLM_API_KEY or ANTHROPIC_API_KEY)");
  }

  _cached = {
    apiKey,
    baseURL: "https://api.anthropic.com",
    model: "claude-sonnet-4-20250514",
  };
  _cachedAt = Date.now();
  return _cached;
}

/**
 * Promote the credential that actually answered.
 *
 * Without this the 5-minute cache can hold a spent key as the primary, and
 * every message for those five minutes pays a failed round-trip before the
 * failover reaches a key with credit. Measured with one dead key in a pool of
 * two: six consecutive messages, six wasted requests. Caching the winner makes
 * that cost once per cache window instead of once per message.
 */
export function noteWorkingProvider(p: AIProvider): void {
  _cached = p;
  _cachedAt = Date.now();
}

/**
 * Every credential worth trying, best first.
 *
 * The chat route needs this rather than just `resolveAIProvider` because a key
 * that is out of balance fails only when the request is made, and by then the
 * reader is waiting on a stream that will never produce a token.
 */
export async function resolveAIProviderCandidates(): Promise<AIProvider[]> {
  const primary = await resolveAIProvider();
  const glm = glmKeys();
  if (glm.length < 2 || primary.baseURL !== GLM_BASE_URL) return [primary];

  const rest = glm
    .filter((k) => k !== primary.apiKey)
    .map((apiKey) => ({ ...primary, apiKey }));
  return [primary, ...rest];
}
