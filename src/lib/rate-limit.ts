/**
 * Simple in-memory rate limiter.
 * For production with multiple instances, use Redis instead.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt < now) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Window size in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit for a given key (typically IP + route).
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    // New window
    store.set(key, {
      count: 1,
      resetAt: now + config.windowSeconds * 1000,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowSeconds * 1000,
    };
  }

  entry.count++;
  const allowed = entry.count <= config.maxRequests;

  return {
    allowed,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetAt: entry.resetAt,
  };
}

/**
 * Extract client IP from request headers.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "0.0.0.0";
}

// Pre-configured rate limits
export const RATE_LIMITS = {
  contact: { maxRequests: 5, windowSeconds: 300 } as RateLimitConfig,
  newsletter: { maxRequests: 3, windowSeconds: 300 } as RateLimitConfig,
  chat: { maxRequests: 20, windowSeconds: 60 } as RateLimitConfig,
  auth: { maxRequests: 5, windowSeconds: 60 } as RateLimitConfig,
  api: { maxRequests: 60, windowSeconds: 60 } as RateLimitConfig,
};
