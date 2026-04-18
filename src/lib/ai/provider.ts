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
}

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

  // Try SSO database first
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

        _cached = {
          apiKey: key.api_key_encrypted,
          baseURL: provider.base_url,
          model: models?.helper || "claude-sonnet-4-20250514",
        };
        _cachedAt = Date.now();
        return _cached;
      }
    }
  } catch (err) {
    console.warn("[ai/provider] SSO provider lookup failed, falling back to env:", err);
  }

  // Fallback to env var
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("No AI provider configured (SSO or ANTHROPIC_API_KEY)");
  }

  _cached = {
    apiKey,
    baseURL: "https://api.anthropic.com",
    model: "claude-sonnet-4-20250514",
  };
  _cachedAt = Date.now();
  return _cached;
}
