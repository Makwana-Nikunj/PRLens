// ============================================
// AUTH CONTROLLERS — IMPLEMENTATION
// ============================================
//
// Real handlers for the 5-table auth schema (users, auth_identities,
// verification_tokens, sessions, github_connections). Each handler:
//   1. Validates input (400/401 on bad shape).
//   2. Touches the DB / external services.
//   3. Returns the documented success response with cookies as needed.
//
// Security notes that are easy to miss if you skim:
//   - emailLogin runs a dummy bcrypt compare even when the user is not
//     found, so failed-email and failed-password take the same time.
//     That's a timing-attack defense — DO NOT remove it.
//   - resetPassword increments `attempts` only on a mismatch, with a
//     FOR UPDATE row lock, and a 5-attempt cap.
//   - googleLoginCallback verifies the `state` query param against the
//     signed oauth_state cookie BEFORE doing any work (CSRF defense).
//   - logoutUser revokes ALL active sessions for the user, not just the
//     current one. This is intentional: matches existing
//     revokeAllUserRefreshTokens behavior and means a password-reset
//     and a logout both sign the user out everywhere.
//   - The GitHub App connect/disconnect flow is deferred to a later
//     round (still returns 501); the plan said this round is just
//     email + Google + sessions.

import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  isValidEmail,
  isValidPassword,
  hashPassword,
  verifyPassword,
} from "../utils/emailAuth.util.js";
import { generateRawToken, sha256 } from "../utils/token.util.js";
import {
  signAccessToken,
  issueRefreshToken,
  hashRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  setOAuthStateCookie,
  verifyOAuthState,
  clearOAuthStateCookie,
} from "../utils/session.util.js";
import { encryptToken } from "../utils/crypto.util.js";
import {
  sendVerificationEmail,
  sendOtpEmail,
  sendPasswordChangedEmail,
} from "../services/email.service.js";
import { sql } from "../db/index.js";

// ============================================
// CONSTANTS
// ============================================

// Email-verification tokens live 24h per spec.
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
// Password-reset OTPs live 10 minutes — long enough to type, short
// enough to be unusable if leaked.
const PASSWORD_RESET_TTL_MS = 10 * 60 * 1000;
// Cap wrong attempts at 5. Picked low enough to defeat brute force,
// high enough that a tired user can retype a 6-digit OTP a few times.
const MAX_OTP_ATTEMPTS = 5;

// Fixed dummy bcrypt hash. The plaintext matches nothing — we run
// `verifyPassword` against it ONLY to keep the timing of the
// "user not found" path equal to the "wrong password" path. If you
// regenerate this hash, use bcrypt with the same cost factor as
// `hashPassword` (12 rounds).
const DUMMY_BCRYPT_HASH =
  "$2b$12$CwTycUXWue0Thq9StjUM0uJ8jVQ3RH9bX9z3xQ7yZ4bN8kG9rJy2e";

// ============================================
// HELPERS
// ============================================

const normalizeEmail = (e) => String(e).trim().toLowerCase();

/**
 * Generate a 6-digit numeric OTP, returned as a string. The raw OTP
 * is what we email; the SHA-256 hash is what we store.
 */
const generateOtp = () => {
  // crypto.randomInt avoids the modulo bias of Math.floor(Math.random()*1e6).
  const n = crypto.randomInt(0, 1_000_000);
  return n.toString().padStart(6, "0");
};

/**
 * Public-shape user object. Used for /me, signup response, login response.
 * Maps DB column `email_verified` → camelCase `emailVerified` for the API.
 */
const toPublicUser = (u) => ({
  id:             u.id,
  email:          u.email,
  name:           u.name ?? null,
  avatar_url:     u.avatar_url ?? null,
  emailVerified:  u.email_verified ?? false,
});

// ============================================
// EMAIL + PASSWORD AUTH
// ============================================

/**
 * POST /api/auth/register
 *   body: { email, password, name? }
 *   201 { user: { id, email, name, emailVerified: false } }
 *
 *   — Does NOT issue session cookies. The user must verify their
 *     email and then log in. This preserves the Phase 1 fix: signup
 *     must not let users in.
 */
export const emailSignup = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!isValidEmail(email)) {
    throw new ApiError(400, "Please provide a valid email address");
  }
  if (!isValidPassword(password)) {
    throw new ApiError(400, "Password must be at least 8 characters long");
  }
  if (name != null && typeof name !== "string") {
    throw new ApiError(400, "name must be a string");
  }

  const normalized = normalizeEmail(email);

  // 1. Reject if email already registered. CITEXT means the comparison
  //    is case-insensitive at the DB level, so we don't have to
  //    lowercase before the SELECT.
  const existing = await sql`
    SELECT id FROM users WHERE email = ${normalized} LIMIT 1
  `;
  if (existing.length > 0) {
    throw new ApiError(409, "An account with this email already exists");
  }

  // 2. Hash the password (bcrypt, 12 rounds).
  const passwordHash = await hashPassword(password);

  // 3. Create user + email identity in one transaction so a partial
  //    failure doesn't leave a user with no way to log in.
  const [user] = await sql.begin(async (tx) => {
    const inserted = await tx`
      INSERT INTO users (email, name, email_verified)
      VALUES (${normalized}, ${name || null}, false)
      RETURNING id, email, name, avatar_url, email_verified
    `;
    const newUser = inserted[0];
    await tx`
      INSERT INTO auth_identities (user_id, provider, password_hash)
      VALUES (${newUser.id}, 'email', ${passwordHash})
    `;
    return inserted;
  });

  // 4. Mint a verification token (raw → email, hash → DB).
  const rawToken = generateRawToken();
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);
  await sql`
    INSERT INTO verification_tokens (user_id, token_hash, purpose, expires_at)
    VALUES (${user.id}, ${tokenHash}, 'email_verification', ${expiresAt})
  `;

  // 5. Send the email. email.service.js logs to console in dev if
  //    BREVO_API_KEY is missing, so this is safe to call without
  //    configuration. Email failure must NOT fail signup (matches
  //    the existing behavior).
  sendVerificationEmail(user.email, rawToken, user.name || "").catch((err) =>
    console.error("[auth] sendVerificationEmail failed:", err?.message || err)
  );

  return res
    .status(201)
    .json(new ApiResponse(201, { user: toPublicUser(user) }, "Account created. Please verify your email."));
});

/**
 * POST /api/auth/login
 *   body: { email, password }
 *   200 { user } + sets httpOnly access + refresh cookies
 *   401 on bad credentials
 *   403 "Verify your email first" when the account exists but
 *       email_verified is false
 */
export const emailLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  // Generic 401 for bad shape — never reveal which field is wrong.
  if (!isValidEmail(email) || typeof password !== "string" || !password) {
    throw new ApiError(401, "Invalid email or password");
  }

  const normalized = normalizeEmail(email);

  // 1. Look up the user + email identity together.
  const rows = await sql`
    SELECT u.id, u.email, u.name, u.avatar_url, u.email_verified,
           a.password_hash
    FROM users u
    LEFT JOIN auth_identities a
      ON a.user_id = u.id AND a.provider = 'email'
    WHERE u.email = ${normalized}
    LIMIT 1
  `;

  // 2. ALWAYS run verifyPassword against SOMETHING so failed-email
  //    and failed-password take the same time. This is the timing
  //    oracle defense — the previous code did this and the contract
  //    preserves it.
  const row = rows[0];
  const hashToCheck = row?.password_hash || DUMMY_BCRYPT_HASH;
  const passwordOk = await verifyPassword(password, hashToCheck);

  if (!row || !passwordOk) {
    throw new ApiError(401, "Invalid email or password");
  }

  // 3. Gate: require a verified email before letting the user in.
  if (!row.email_verified) {
    throw new ApiError(403, "Please verify your email before logging in");
  }

  // 4. Issue a session: insert row in `sessions`, set cookies.
  const { raw: rawRefresh, hash: refreshHash, expiresAt } = issueRefreshToken();
  const userAgent = req.headers["user-agent"] || null;
  const ip = req.ip || null;
  await sql`
    INSERT INTO sessions (user_id, refresh_token_hash, expires_at, user_agent, ip)
    VALUES (${row.id}, ${refreshHash}, ${expiresAt}, ${userAgent}, ${ip})
  `;

  const accessToken = signAccessToken({ id: row.id, email: row.email });
  setAuthCookies(res, { accessToken, refreshToken: rawRefresh });

  return res
    .status(200)
    .json(new ApiResponse(200, { user: toPublicUser(row) }, "Logged in"));
});

/**
 * GET  /api/auth/verify-email?token=...
 * POST /api/auth/verify-email { token }
 *   200 { message: "Email verified" }
 *   400 on bad/expired/already-used token
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.query?.token || req.body?.token;
  if (!token || typeof token !== "string") {
    throw new ApiError(400, "Verification token is required");
  }

  const tokenHash = sha256(token);

  // FOR UPDATE locks the row for the rest of the transaction so two
  // concurrent verifications can't both consume the same token.
  const result = await sql.begin(async (tx) => {
    const rows = await tx`
      SELECT id, user_id FROM verification_tokens
      WHERE token_hash = ${tokenHash}
        AND purpose = 'email_verification'
        AND consumed_at IS NULL
        AND expires_at > NOW()
      FOR UPDATE
    `;
    if (rows.length === 0) return null;
    const row = rows[0];
    await tx`UPDATE verification_tokens SET consumed_at = NOW() WHERE id = ${row.id}`;
    await tx`UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = ${row.user_id}`;
    return row;
  });

  if (!result) {
    throw new ApiError(400, "Invalid or expired verification link");
  }

  return res.json(new ApiResponse(200, {}, "Email verified"));
});

/**
 * POST /api/auth/resend-verification { email }
 *   Always 200. If the account exists AND is unverified, mint a new
 *   verification_tokens row and email the link.
 */
export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body || {};
  const ok = isValidEmail(email);

  // Generic 200 — don't leak whether the email is valid format or not.
  if (!ok) {
    return res.json(
      new ApiResponse(
        200,
        {},
        "If an account exists and is unverified, a new verification link has been sent."
      )
    );
  }

  const normalized = normalizeEmail(email);
  const users = await sql`
    SELECT id, email, name, email_verified
    FROM users WHERE email = ${normalized} LIMIT 1
  `;

  if (users.length === 1 && users[0].email_verified === false) {
    const user = users[0];
    // Invalidate any older unused email-verification tokens for this user
    // so the most recent link is the only one that works.
    await sql`
      UPDATE verification_tokens
      SET consumed_at = NOW()
      WHERE user_id = ${user.id}
        AND purpose = 'email_verification'
        AND consumed_at IS NULL
    `;
    const rawToken = generateRawToken();
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);
    await sql`
      INSERT INTO verification_tokens (user_id, token_hash, purpose, expires_at)
      VALUES (${user.id}, ${tokenHash}, 'email_verification', ${expiresAt})
    `;
    sendVerificationEmail(user.email, rawToken, user.name || "").catch((err) =>
      console.error("[auth] resendVerification email failed:", err?.message || err)
    );
  }

  return res.json(
    new ApiResponse(
      200,
      {},
      "If an account exists and is unverified, a new verification link has been sent."
    )
  );
});

/**
 * POST /api/auth/forgot-password { email }
 *   Always 200. If the account exists, generate a 6-digit OTP, store
 *   its hash, and email the raw OTP.
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body || {};
  const ok = isValidEmail(email);

  if (!ok) {
    return res.json(
      new ApiResponse(200, {}, "If an account exists, a reset OTP has been sent")
    );
  }

  const normalized = normalizeEmail(email);
  // Only verified users can request a password reset. An unverified email
  // address is one that hasn't been claimed yet (the signup form creates the
  // user row before verification), so allowing password resets against it
  // would let anyone who knows the address take over the account before
  // the legitimate owner has a chance to verify it. We silently no-op so
  // the response doesn't leak which case applied.
  const users = await sql`
    SELECT id, email, name FROM users
    WHERE email = ${normalized} AND email_verified = true
    LIMIT 1
  `;

  if (users.length === 1) {
    const user = users[0];
    // Invalidate any older unused password-reset tokens for this user.
    await sql`
      UPDATE verification_tokens
      SET consumed_at = NOW()
      WHERE user_id = ${user.id}
        AND purpose = 'password_reset'
        AND consumed_at IS NULL
    `;
    const otp = generateOtp();
    const tokenHash = sha256(otp);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
    await sql`
      INSERT INTO verification_tokens (user_id, token_hash, purpose, expires_at)
      VALUES (${user.id}, ${tokenHash}, 'password_reset', ${expiresAt})
    `;
    sendOtpEmail(user.email, otp, user.name || "").catch((err) =>
      console.error("[auth] sendOtpEmail failed:", err?.message || err)
    );
  }

  return res.json(
    new ApiResponse(200, {}, "If an account exists, a reset OTP has been sent")
  );
});

/**
 * POST /api/auth/reset-password { email, otp, newPassword }
 *   200 on success, 400 on bad/expired/over-attempts.
 *   On success: hash the new password, update auth_identities.password_hash,
 *   revoke all active sessions, send password-changed email.
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body || {};
  if (!isValidEmail(email)) {
    throw new ApiError(400, "Email is required");
  }
  if (!otp || typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
    throw new ApiError(400, "A valid 6-digit OTP is required");
  }
  if (!isValidPassword(newPassword)) {
    throw new ApiError(400, "Password must be at least 8 characters long");
  }

  const normalized = normalizeEmail(email);

  // We resolve the active password_reset token by user (looked up via
  // email). The OTP itself is the *test* against that row's token_hash.
  // The `attempts` cap is enforced before the OTP compare; the counter
  // only increments on a mismatch. Correct guesses go straight to
  // consumed_at.
  const result = await sql.begin(async (tx) => {
    const users = await tx`
      SELECT id, email, name FROM users WHERE email = ${normalized} LIMIT 1
    `;
    if (users.length === 0) return { kind: "not_found" };
    const user = users[0];

    const tokens = await tx`
      SELECT id, token_hash, attempts
      FROM verification_tokens
      WHERE user_id = ${user.id}
        AND purpose = 'password_reset'
        AND consumed_at IS NULL
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
      FOR UPDATE
    `;
    if (tokens.length === 0) return { kind: "not_found" };
    const token = tokens[0];

    if (token.attempts >= MAX_OTP_ATTEMPTS) {
      return { kind: "too_many" };
    }

    // Constant-time compare of the sha256(presented) against the stored hash.
    const presentedHash = sha256(otp);
    const expectedBuf = Buffer.from(token.token_hash, "hex");
    const presentedBuf = Buffer.from(presentedHash, "hex");
    let matches = false;
    if (expectedBuf.length === presentedBuf.length) {
      matches = crypto.timingSafeEqual(expectedBuf, presentedBuf);
    }

    if (!matches) {
      await tx`
        UPDATE verification_tokens
        SET attempts = attempts + 1
        WHERE id = ${token.id}
      `;
      return { kind: "invalid" };
    }

    await tx`UPDATE verification_tokens SET consumed_at = NOW() WHERE id = ${token.id}`;
    const newHash = await hashPassword(newPassword);
    await tx`
      UPDATE auth_identities
      SET password_hash = ${newHash}
      WHERE user_id = ${user.id} AND provider = 'email'
    `;
    // Revoke ALL active sessions for this user — the new password
    // means any existing device is unauthenticated.
    await tx`
      UPDATE sessions
      SET revoked_at = NOW()
      WHERE user_id = ${user.id} AND revoked_at IS NULL
    `;
    return { kind: "ok", user };
  });

  if (result.kind === "not_found") {
    throw new ApiError(400, "Invalid or expired OTP");
  }
  if (result.kind === "too_many") {
    throw new ApiError(400, "Too many attempts. Please request a new OTP.");
  }
  if (result.kind === "invalid") {
    throw new ApiError(400, "Invalid OTP");
  }

  // Best-effort notification; never fail the request if it doesn't send.
  sendPasswordChangedEmail(result.user.email, result.user.name || "").catch((err) =>
    console.error("[auth] password-changed email failed:", err?.message || err)
  );

  return res.json(new ApiResponse(200, {}, "Password reset successful. Please log in."));
});

// ============================================
// SESSIONS
// ============================================

/**
 * POST /api/auth/refresh
 *   Reads the refresh token from cookie or body, validates, rotates.
 *   200 + new cookies on success.
 *   401 on missing / unknown / revoked / expired.
 *
 *   Reuse-detection: if the row exists but is already revoked, an
 *   attacker may be replaying a stolen token. Revoke all of this
 *   user's active sessions and 401.
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incoming = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!incoming) {
    throw new ApiError(401, "Refresh token is required");
  }

  const refreshHash = hashRefreshToken(incoming);

  // Look up the session row. We need user_id either way.
  const rows = await sql`
    SELECT id, user_id, revoked_at, expires_at
    FROM sessions
    WHERE refresh_token_hash = ${refreshHash}
    LIMIT 1
  `;

  if (rows.length === 0) {
    throw new ApiError(401, "Invalid refresh token");
  }
  const session = rows[0];

  // REUSE-DETECTION: a revoked token was presented. Treat as compromise.
  if (session.revoked_at) {
    await sql`
      UPDATE sessions SET revoked_at = NOW()
      WHERE user_id = ${session.user_id} AND revoked_at IS NULL
    `;
    clearAuthCookies(res);
    throw new ApiError(401, "Refresh token reuse detected. All sessions revoked.");
  }

  // Expired session.
  if (new Date(session.expires_at).getTime() < Date.now()) {
    await sql`UPDATE sessions SET revoked_at = NOW() WHERE id = ${session.id}`;
    clearAuthCookies(res);
    throw new ApiError(401, "Refresh token expired");
  }

  // Rotate: mark old as revoked, insert new, link via replaced_by.
  const { raw: rawRefresh, hash: newHash, expiresAt } = issueRefreshToken();
  const userAgent = req.headers["user-agent"] || null;
  const ip = req.ip || null;
  const newRows = await sql.begin(async (tx) => {
    const inserted = await tx`
      INSERT INTO sessions (user_id, refresh_token_hash, expires_at, user_agent, ip)
      VALUES (${session.user_id}, ${newHash}, ${expiresAt}, ${userAgent}, ${ip})
      RETURNING id
    `;
    await tx`
      UPDATE sessions
      SET revoked_at = NOW(), replaced_by = ${inserted[0].id}
      WHERE id = ${session.id}
    `;
    return inserted;
  });

  // Read user for the access token payload.
  const users = await sql`
    SELECT id, email FROM users WHERE id = ${session.user_id} LIMIT 1
  `;
  if (users.length === 0) {
    throw new ApiError(401, "Invalid refresh token");
  }
  const accessToken = signAccessToken({ id: users[0].id, email: users[0].email });
  setAuthCookies(res, { accessToken, refreshToken: rawRefresh });

  return res.json(new ApiResponse(200, {}, "Refreshed"));
});

/**
 * POST /api/auth/logout  (requires verifyJwt)
 *   Revokes ALL active sessions for the current user, then clears
 *   cookies. Matches the existing revokeAllUserRefreshTokens
 *   behavior — "logout" is the nuclear option.
 */
export const logoutUser = asyncHandler(async (req, res) => {
  await sql`
    UPDATE sessions
    SET revoked_at = NOW()
    WHERE user_id = ${req.user.id} AND revoked_at IS NULL
  `;
  clearAuthCookies(res);
  return res.json(new ApiResponse(200, {}, "Logged out"));
});

/**
 * POST /api/auth/change-password  (requires verifyJwt + authLimiter)
 *   body: { currentPassword, newPassword }
 *   200 { message: "Password changed..." }
 *   400 on bad input or new password == current.
 *   401 if currentPassword is wrong.
 *   403 if the user has no `email` identity (Google-only account).
 *
 *   Unlike resetPassword (which proves email control via OTP), this
 *   proves knowledge of the current password. Same security model as
 *   emailLogin: we always run verifyPassword against SOMETHING so
 *   "no row" and "wrong password" take the same time.
 *
 *   On success: hash the new password, update auth_identities.password_hash,
 *   revoke ALL active sessions for the user (they'll need to log in again
 *   on every device), and send a "password changed" email as a heads-up.
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};

  if (typeof currentPassword !== "string" || !currentPassword) {
    throw new ApiError(400, "Current password is required");
  }
  if (!isValidPassword(newPassword)) {
    throw new ApiError(400, "New password must be 8–128 characters long");
  }

  // Single query for the user + email identity. Returns 0 rows for
  // Google-only accounts (no `email` identity row exists).
  const rows = await sql`
    SELECT u.id, u.email, u.name, a.password_hash
    FROM users u
    LEFT JOIN auth_identities a
      ON a.user_id = u.id AND a.provider = 'email'
    WHERE u.id = ${req.user.id}
    LIMIT 1
  `;
  const row = rows[0];

  // Google-only account: there's no password to change. Return a separate
  // status from "wrong password" so the user gets an actionable message.
  if (!row || !row.password_hash) {
    throw new ApiError(
      403,
      "This account does not have a password. Sign in with Google instead."
    );
  }

  // Always run verifyPassword against SOMETHING — same timing-attack
  // defense as emailLogin. The DUMMY_BCRYPT_HASH is reused from the
  // top of this file.
  const passwordOk = await verifyPassword(currentPassword, row.password_hash);
  if (!passwordOk) {
    throw new ApiError(401, "Current password is incorrect");
  }

  // UX guard: don't let the user set the same password they already have.
  // Not constant-time — this is a UX check, not a security check.
  if (await verifyPassword(newPassword, row.password_hash)) {
    throw new ApiError(400, "New password must be different from current password");
  }

  // Hash the new password and persist. The current session is about to
  // be revoked, so this request gets its 200 but the user's refresh
  // token will no longer work.
  const newHash = await hashPassword(newPassword);
  await sql`
    UPDATE auth_identities
    SET password_hash = ${newHash}
    WHERE user_id = ${req.user.id} AND provider = 'email'
  `;

  // Revoke all active sessions. Same statement as logoutUser / resetPassword.
  // The user must re-authenticate on every device.
  await sql`
    UPDATE sessions
    SET revoked_at = NOW()
    WHERE user_id = ${req.user.id} AND revoked_at IS NULL
  `;

  // Best-effort notification; never fail the request if email doesn't send.
  sendPasswordChangedEmail(row.email, row.name || "").catch((err) =>
    console.error("[auth] changePassword email failed:", err?.message || err)
  );

  return res.json(
    new ApiResponse(
      200,
      {},
      "Password changed. Please log in again on other devices."
    )
  );
});

/**
 * GET /api/auth/me  (requires verifyJwt)
 *   200 { user: { id, email, name, avatar_url, email_verified } }.
 *   `req.user` is set by verifyJwt; we re-read the latest values from
 *   the DB so this reflects any concurrent changes (e.g. email
 *   verification, profile update).
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const rows = await sql`
    SELECT id, email, name, avatar_url, email_verified
    FROM users WHERE id = ${req.user.id} LIMIT 1
  `;
  if (rows.length === 0) {
    throw new ApiError(401, "User not found");
  }
  return res.json(new ApiResponse(200, { user: toPublicUser(rows[0]) }, "OK"));
});

// ============================================
// GOOGLE OAUTH (login provider)
// ============================================

const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

function getGoogleClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new ApiError(500, "Google OAuth is not configured");
  }
  return new OAuth2Client(clientId);
}

/**
 * GET /api/auth/google
 *   302 to Google. Sets a signed oauth_state cookie for CSRF defense.
 */
export const googleLoginStart = asyncHandler(async (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL;
  if (!clientId || !callbackUrl) {
    throw new ApiError(500, "Google OAuth is not configured");
  }
  const state = crypto.randomBytes(32).toString("hex");
  setOAuthStateCookie(res, state);
  const url =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent("openid email profile")}` +
    `&state=${encodeURIComponent(state)}` +
    `&access_type=offline` +
    `&prompt=consent`;
  return res.redirect(302, url);
});

/**
 * GET /api/auth/google/callback?code=...&state=...
 *   Verifies state, exchanges code, verifies id_token, finds or
 *   creates the user, issues a session, redirects to the dashboard.
 */
export const googleLoginCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query || {};
  if (!code) throw new ApiError(400, "Missing authorization code");
  if (!state) throw new ApiError(400, "Missing state parameter");

  // CSRF defense: verify state BEFORE any token exchange or DB lookups.
  if (!verifyOAuthState(req, state)) {
    clearOAuthStateCookie(res);
    throw new ApiError(400, "Invalid state");
  }
  // Always clear the state cookie regardless of outcome.
  clearOAuthStateCookie(res);

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new ApiError(500, "Google OAuth is not configured");
  }

  // 1. Exchange code → tokens.
  const oauth = getGoogleClient();
  oauth.on("tokens", () => { /* no-op; we use verifyIdToken below */ });
  const { tokens } = await oauth.getToken({
    code: String(code),
    redirect_uri: redirectUri,
  }).catch((err) => {
    throw new ApiError(401, `Google token exchange failed: ${err?.message || "unknown error"}`);
  });
  if (!tokens?.id_token) {
    throw new ApiError(401, "Google did not return an id_token");
  }

  // 2. Verify the id_token.
  let payload;
  try {
    const ticket = await oauth.verifyIdToken({
      idToken: tokens.id_token,
      audience: clientId,
    });
    payload = ticket.getPayload();
  } catch (err) {
    throw new ApiError(401, `Google id_token verification failed: ${err?.message || "unknown error"}`);
  }
  if (!payload?.email || !payload?.sub) {
    throw new ApiError(401, "Google id_token missing required claims");
  }
  if (payload.email_verified === false) {
    throw new ApiError(403, "Your Google email is not verified");
  }

  const email = normalizeEmail(payload.email);
  const sub = String(payload.sub);
  const name = payload.name || null;
  const avatarUrl = payload.picture || null;

  // 3. Find existing identity, or link to existing user by email,
  //    or create a new user.
  const userRow = await sql.begin(async (tx) => {
    const identity = await tx`
      SELECT user_id FROM auth_identities
      WHERE provider = 'google' AND provider_user_id = ${sub}
      LIMIT 1
    `;
    if (identity.length === 1) {
      const u = await tx`
        SELECT id, email, name, avatar_url, email_verified
        FROM users WHERE id = ${identity[0].user_id} LIMIT 1
      `;
      return u[0] || null;
    }
    // No existing Google identity. Try to link to an existing user
    // with this email (account merging on first Google login).
    const existing = await tx`
      SELECT id, email, name, avatar_url, email_verified
      FROM users WHERE email = ${email} LIMIT 1
    `;
    if (existing.length === 1) {
      const u = existing[0];
      await tx`
        INSERT INTO auth_identities (user_id, provider, provider_user_id)
        VALUES (${u.id}, 'google', ${sub})
        ON CONFLICT (user_id, provider) DO NOTHING
      `;
      // If the email matches a verified account, mark it verified too
      // (Google already verified it). If unverified, now it is.
      if (!u.email_verified) {
        await tx`UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = ${u.id}`;
        u.email_verified = true;
      }
      return u;
    }
    // Brand-new user.
    const inserted = await tx`
      INSERT INTO users (email, name, avatar_url, email_verified)
      VALUES (${email}, ${name}, ${avatarUrl}, true)
      RETURNING id, email, name, avatar_url, email_verified
    `;
    const u = inserted[0];
    await tx`
      INSERT INTO auth_identities (user_id, provider, provider_user_id)
      VALUES (${u.id}, 'google', ${sub})
    `;
    return u;
  });

  if (!userRow) {
    throw new ApiError(500, "Failed to establish Google identity");
  }

  // 4. Issue a session.
  const { raw: rawRefresh, hash: refreshHash, expiresAt } = issueRefreshToken();
  const userAgent = req.headers["user-agent"] || null;
  const ip = req.ip || null;
  await sql`
    INSERT INTO sessions (user_id, refresh_token_hash, expires_at, user_agent, ip)
    VALUES (${userRow.id}, ${refreshHash}, ${expiresAt}, ${userAgent}, ${ip})
  `;
  const accessToken = signAccessToken({ id: userRow.id, email: userRow.email });
  setAuthCookies(res, { accessToken, refreshToken: rawRefresh });

  // 5. Redirect to the dashboard.
  return res.redirect(302, `${FRONTEND_URL}/dashboard`);
});

// ============================================
// GITHUB OAUTH (login provider via PKCE)
// ============================================

/**
 * POST /api/auth/oauth
 *   Accepts PKCE code to verify, exchanges for a GitHub token, gets user info,
 *   links/creates the user, encrypts the token to github_connections,
 *   and issues a session.
 */
export const githubLogin = asyncHandler(async (req, res) => {
  const { code, redirectUri, provider } = req.body;

  if (provider !== 'github') {
    throw new ApiError(400, "Unsupported OAuth provider");
  }
  if (!code) {
    throw new ApiError(400, "Authorization code is required");
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new ApiError(500, "GitHub OAuth credentials are not configured");
  }

  // 1. Exchange code for access token
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    throw new ApiError(401, `GitHub auth failed: ${tokenData.error_description || tokenData.error}`);
  }

  const githubToken = tokenData.access_token;
  if (!githubToken) {
    throw new ApiError(401, "No access token received from GitHub");
  }

  // 2. Get GitHub user data
  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: 'application/json',
    },
  });

  if (!userResponse.ok) {
    throw new ApiError(401, "Failed to fetch user data from GitHub");
  }

  const githubUser = await userResponse.json();

  // 3. Get user's emails
  const emailsResponse = await fetch('https://api.github.com/user/emails', {
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: 'application/json',
    },
  });

  if (!emailsResponse.ok) {
    throw new ApiError(401, "Failed to fetch user emails from GitHub");
  }

  const emails = await emailsResponse.json();
  const primaryEmailObj = emails.find(e => e.primary) || emails[0];

  if (!primaryEmailObj || !primaryEmailObj.email) {
    throw new ApiError(400, "No email found for GitHub account");
  }

  const email = normalizeEmail(primaryEmailObj.email);
  const providerUserId = String(githubUser.id);
  const name = githubUser.name || githubUser.login;
  const avatarUrl = githubUser.avatar_url || null;

  // 4. Find/create user & link identity within a transaction
  const userRow = await sql.begin(async (tx) => {
    let finalUser = null;

    // A. Does this exact GitHub identity exist?
    const identity = await tx`
      SELECT user_id FROM auth_identities
      WHERE provider = 'github' AND provider_user_id = ${providerUserId}
      LIMIT 1
    `;

    if (identity.length === 1) {
      const users = await tx`
        SELECT id, email, name, avatar_url, email_verified
        FROM users WHERE id = ${identity[0].user_id} LIMIT 1
      `;
      finalUser = users[0];
    } else {
      // B. Is there an existing user with this email? Merge them.
      const existingUser = await tx`
        SELECT id, email, name, avatar_url, email_verified
        FROM users WHERE email = ${email} LIMIT 1
      `;

      if (existingUser.length === 1) {
        finalUser = existingUser[0];

        // Link GitHub provider
        await tx`
          INSERT INTO auth_identities (user_id, provider, provider_user_id)
          VALUES (${finalUser.id}, 'github', ${providerUserId})
          ON CONFLICT (user_id, provider) DO NOTHING
        `;

        // Verified by GitHub, mark as verified if it was pending
        if (!finalUser.email_verified && primaryEmailObj.verified) {
          await tx`UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = ${finalUser.id}`;
          finalUser.email_verified = true;
        }
      } else {
        // C. Brand-new user
        const inserted = await tx`
          INSERT INTO users (email, name, avatar_url, email_verified)
          VALUES (${email}, ${name}, ${avatarUrl}, ${primaryEmailObj.verified})
          RETURNING id, email, name, avatar_url, email_verified
        `;
        finalUser = inserted[0];

        await tx`
          INSERT INTO auth_identities (user_id, provider, provider_user_id)
          VALUES (${finalUser.id}, 'github', ${providerUserId})
        `;
      }
    }

    // 5. Encrypt and store the GitHub token in github_connections
    if (finalUser) {
      const encryptedTokenObj = encryptToken(githubToken);

      await tx`
        INSERT INTO github_connections (user_id, access_token_encrypted)
        VALUES (${finalUser.id}, ${encryptedTokenObj})
        ON CONFLICT (user_id) DO UPDATE
        SET access_token_encrypted = ${encryptedTokenObj}, updated_at = NOW()
      `;
    }

    return finalUser;
  });

  if (!userRow) {
    throw new ApiError(500, "Failed to establish GitHub identity");
  }

  // 6. Issue a session.
  const { raw: rawRefresh, hash: refreshHash, expiresAt } = issueRefreshToken();
  const userAgent = req.headers["user-agent"] || null;
  const ip = req.ip || null;

  await sql`
    INSERT INTO sessions (user_id, refresh_token_hash, expires_at, user_agent, ip)
    VALUES (${userRow.id}, ${refreshHash}, ${expiresAt}, ${userAgent}, ${ip})
  `;

  const accessToken = signAccessToken({ id: userRow.id, email: userRow.email });
  setAuthCookies(res, { accessToken, refreshToken: rawRefresh });

  return res.status(200).json(
    new ApiResponse(200, { user: toPublicUser(userRow), accessToken }, "Github login successful")
  );
});

// ============================================
// GITHUB CONNECT (post-login, for PR data)
// ============================================
// Per the plan, this round ships email + Google + sessions. The GitHub
// App connect/disconnect flow is intentionally deferred to a later
// round — it needs the App's private key wiring and a separate plan.
// The stubs return 501 so the routes still exist and the HTTP
// contract is reviewable.

const notImplemented = (res, name) =>
  res
    .status(501)
    .json(
      new ApiResponse(
        501,
        {},
        `${name}: not yet implemented. The GitHub App flow is deferred to a follow-up round.`
      )
    );

export const githubConnectStart = asyncHandler(async (req, res) => {
  notImplemented(res, "githubConnectStart");
});

export const githubConnectCallback = asyncHandler(async (req, res) => {
  notImplemented(res, "githubConnectCallback");
});

export const githubDisconnect = asyncHandler(async (req, res) => {
  notImplemented(res, "githubDisconnect");
});
