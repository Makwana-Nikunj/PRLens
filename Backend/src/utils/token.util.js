import crypto from "crypto";

/**
 * Generate a cryptographically secure random token, returned as hex.
 *
 * 32 bytes = 64 hex chars = 256 bits of entropy. Plenty for email-verification
 * tokens, password-reset tokens, and refresh-token secrets.
 *
 * @param {number} bytes - Number of random bytes (default 32)
 * @returns {string} hex-encoded token
 */
export const generateRawToken = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

/**
 * SHA-256 hash a string, returned as lowercase hex.
 *
 * Used to fingerprint tokens before storing them in the database — the raw
 * token only ever lives in the cookie or email link, never in our DB.
 *
 * @param {string} input - String to hash
 * @returns {string} 64-char lowercase hex digest
 */
export const sha256 = (input) =>
  crypto.createHash("sha256").update(input).digest("hex");
