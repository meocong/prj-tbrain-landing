import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import type { SessionClaims } from "./types";

const PASSCODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford base32 (no I/L/O/U).
const PASSCODE_CHARS = 8;
const PASSCODE_PREFIX = "TB";
const BCRYPT_ROUNDS = 12;

export const SESSION_COOKIE = "tb_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
export const APPROVE_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function secretKey(envName: string): Uint8Array {
  const value = process.env[envName];
  if (!value) throw new Error(`Missing env ${envName}`);
  return new TextEncoder().encode(value);
}

/**
 * Generate a human-friendly passcode like `TB-ABCD-EFGH`. ~40 bits of entropy;
 * combined with bcrypt(12) and Cloudflare rate-limit this is not brute-forceable.
 */
export function generatePasscode(): string {
  const bytes = randomBytes(PASSCODE_CHARS);
  let chars = "";
  for (let i = 0; i < PASSCODE_CHARS; i++) {
    chars += PASSCODE_ALPHABET[bytes[i] % PASSCODE_ALPHABET.length];
  }
  return `${PASSCODE_PREFIX}-${chars.slice(0, 4)}-${chars.slice(4, 8)}`;
}

/**
 * Normalize user input: strip whitespace, uppercase, map common
 * Crockford confusables (I→1, L→1, O→0).
 */
export function normalizePasscode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[IL]/g, "1")
    .replace(/O/g, "0");
}

/**
 * First four characters of the 8-char body — used as an indexed lookup key
 * so we only bcrypt-compare against one or two rows per attempt.
 */
export function passcodePrefix(passcode: string): string {
  const normalized = normalizePasscode(passcode);
  const body = normalized.replace(/^TB-/, "").replace(/-/g, "");
  return body.slice(0, 4);
}

export async function hashPasscode(passcode: string): Promise<string> {
  return bcrypt.hash(normalizePasscode(passcode), BCRYPT_ROUNDS);
}

export async function verifyPasscode(passcode: string, hash: string): Promise<boolean> {
  return bcrypt.compare(normalizePasscode(passcode), hash);
}

export function newSessionId(): string {
  return randomBytes(16).toString("hex");
}

export async function signSessionJwt(payload: Omit<SessionClaims, "iat" | "exp">): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey("TB_AUTH_SECRET"));
}

export async function verifySessionJwt(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey("TB_AUTH_SECRET"));
    return payload as unknown as SessionClaims;
  } catch {
    return null;
  }
}

export async function signApproveToken(requestId: string): Promise<string> {
  return new SignJWT({ requestId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${APPROVE_TTL_SECONDS}s`)
    .sign(secretKey("TB_AUTH_SECRET"));
}

export async function verifyApproveToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey("TB_AUTH_SECRET"));
    const requestId = (payload as { requestId?: string }).requestId;
    return requestId ?? null;
  } catch {
    return null;
  }
}

/**
 * Server-to-Cloudflare Turnstile verification. Returns true if the token is
 * valid (including local dev mode where the secret is unset).
 */
export async function verifyTurnstile(token: string | undefined, remoteIp?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Dev mode: no Turnstile configured → allow, but log so we notice in prod.
    console.warn("[terminal-bench] TURNSTILE_SECRET_KEY is unset — skipping Turnstile verification.");
    return true;
  }
  if (!token) return false;

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (remoteIp) body.set("remoteip", remoteIp);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });
  if (!res.ok) return false;
  const json = (await res.json()) as { success?: boolean };
  return json.success === true;
}
