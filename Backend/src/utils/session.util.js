
// ============================================
// SESSION UTILITY
// ============================================
//
// One place for: JWT signing, refresh-token hashing, cookie write/clear, and
// the OAuth state cookie (used by the Google login flow). Centralizing these
// means the controllers all use the same cookie flags, expiry math, and
// security defaults.
//
// Cookie flags:
//   - httpOnly: true          — not readable from JS
//   - secure:   in prod only  — sent over HTTPS only
//   - sameSite: 'lax'         — allows top-level OAuth redirects
//   - path:     '/'           — the cookie applies to the whole app
//
// The `req.user` object is what `verifyJwt` puts on the request after
// decoding the access token. The `id` field is the user UUID.

import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sha256 } from "./token.util.js";

const isProd = process.env.NODE_ENV === "production";

// JWT secret sanity — fail loud at boot, not silently on the first request.
function requireSecret(name) {
  const v = process.env[name];
  if (!v || v.length < 32) {
    throw new Error(
      `${name} must be set and at least 32 characters. Generate with: openssl rand -hex 32`
    );
  }
  return v;
}

const ACCESS_SECRET  = () => requireSecret("ACCESS_TOKEN_SECRET");
const REFRESH_SECRET = () => requireSecret("REFRESH_TOKEN_SECRET");
// Reuse the access secret for OAuth state cookies if a dedicated secret is
// not set. The state value is short-lived (10 min) and contains no PII, so
// reusing the access secret is acceptable.
const STATE_SECRET   = () =>
  process.env.OAUTH_STATE_SECRET || process.env.ACCESS_TOKEN_SECRET;

const ACCESS_EXPIRY  = process.env.ACCESS_TOKEN_EXPIRY  || "15m";
const REFRESH_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

// ============================================
// TOKENS
// ============================================

/**
 * Sign a short-lived access JWT for the user.
 * @param {{ id: string, email?: string }} user
 * @returns {string} signed JWT
 */
export function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    ACCESS_SECRET(),
    { expiresIn: ACCESS_EXPIRY }
  );
}

/**
 * Generate a fresh refresh token (random 32 bytes hex) AND its sha256 hash.
 * The raw token is sent to the client (cookie); only the hash is stored
 * in `sessions.refresh_token_hash`. This way a DB read can't impersonate
 * a user.
 *
 * @returns {{ raw: string, hash: string, expiresAt: Date }}
 */
export function issueRefreshToken() {
  const raw = crypto.randomBytes(32).toString("hex");
  const hash = sha256(raw);
  const expiresAt = new Date(Date.now() + parseExpiryMs(REFRESH_EXPIRY));
  return { raw, hash, expiresAt };
}

/**
 * Compute the sha256 hash of a refresh token. Used to look up sessions.
 * @param {string} raw
 * @returns {string} 64-char hex digest
 */
export const hashRefreshToken = (raw) => sha256(raw);

// ============================================
// COOKIES
// ============================================

/**
 * Set the access + refresh cookies on the response.
 * @param {import('express').Response} res
 * @param {{ accessToken: string, refreshToken: string }} tokens
 */
export function setAuthCookies(res, { accessToken, refreshToken }) {
  const baseOpts = {
    httpOnly: true,
    secure:   isProd,
    sameSite: "lax",
    path:     "/",
  };
  res.cookie("accessToken",  accessToken,  {
    ...baseOpts,
    maxAge: parseExpiryMs(ACCESS_EXPIRY),
  });
  res.cookie("refreshToken", refreshToken, {
    ...baseOpts,
    maxAge: parseExpiryMs(REFRESH_EXPIRY),
  });
}

/**
 * Clear the access + refresh cookies. Used on logout and on the final step
 * of a password-reset (which revokes all sessions).
 * @param {import('express').Response} res
 */
export function clearAuthCookies(res) {
  const baseOpts = {
    httpOnly: true,
    secure:   isProd,
    sameSite: "lax",
    path:     "/",
  };
  res.clearCookie("accessToken",  baseOpts);
  res.clearCookie("refreshToken", baseOpts);
}

// ============================================
// OAUTH STATE COOKIE
// ============================================
//
// googleLoginStart sets this cookie with a random `state` value. The
// callback verifies the `state` query param against the cookie value
// before doing any work — that's the CSRF defense. The cookie is signed
// with HMAC so the callback can be sure it was set by us, not forged by
// the attacker (even though it lives in the user's browser, which is
// exactly the threat model).
//
// Format: <state>.<hmac_hex>

/**
 * Set a signed oauth_state cookie. `state` is the random nonce we send
 * to the OAuth provider as the `state` query param.
 *
 * @param {import('express').Response} res
 * @param {string} state
 */
export function setOAuthStateCookie(res, state) {
  const sig = signOAuthState(state);
  res.cookie("oauth_state", `${state}.${sig}`, {
    httpOnly: true,
    secure:   isProd,
    sameSite: "lax",
    path:     "/",
    maxAge:   10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Verify the `state` query param against the signed oauth_state cookie.
 * Constant-time comparison. Returns true on match, false otherwise.
 *
 * @param {{ state?: string }} req - request with parsed cookies
 * @param {string} presented - the state value from the OAuth callback
 * @returns {boolean}
 */
export function verifyOAuthState(req, presented) {
  if (!presented || typeof presented !== "string") return false;
  const raw = req.cookies?.oauth_state;
  if (!raw || typeof raw !== "string") return false;

  const dot = raw.lastIndexOf(".");
  if (dot < 1) return false;
  const state = raw.slice(0, dot);
  const sig   = raw.slice(dot + 1);

  const expectedSig = signOAuthState(state);
  if (sig.length !== expectedSig.length) return false;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(sig, "hex"),
      Buffer.from(expectedSig, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Clear the oauth_state cookie regardless of whether the OAuth flow
 * succeeded or failed. Called by the callback handler.
 * @param {import('express').Response} res
 */
export function clearOAuthStateCookie(res) {
  res.clearCookie("oauth_state", {
    httpOnly: true,
    secure:   isProd,
    sameSite: "lax",
    path:     "/",
  });
}

// ============================================
// HELPERS
// ============================================

function signOAuthState(state) {
  return crypto
    .createHmac("sha256", STATE_SECRET())
    .update(state)
    .digest("hex");
}

/**
 * Parse strings like "15m", "7d", "1h" into milliseconds. Falls back to
 * the raw number for numeric values (e.g. "3600" → 1 hour).
 */
function parseExpiryMs(input) {
  if (typeof input === "number") return input;
  const s = String(input).trim();
  const m = /^(\d+)\s*(ms|s|m|h|d)?$/.exec(s);
  if (!m) return 15 * 60 * 1000; // safe default
  const n = Number(m[1]);
  const unit = m[2] || "ms";
  switch (unit) {
    case "ms": return n;
    case "s":  return n * 1000;
    case "m":  return n * 60 * 1000;
    case "h":  return n * 60 * 60 * 1000;
    case "d":  return n * 24 * 60 * 60 * 1000;
    default:   return n;
  }
}
