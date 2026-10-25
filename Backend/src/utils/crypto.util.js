import crypto from "crypto";

/**
 * AES-256-GCM helpers for encrypting tokens at rest.
 *
 * Currently used for GitHub connection tokens (see `github_connections`).
 * The single-key version reads `process.env.GITHUB_TOKEN_ENCRYPTION_KEY`,
 * which must be a base64-encoded 32-byte (256-bit) key.
 *
 * Key rotation (deferred): to rotate, introduce a two-key window
 * (GITHUB_TOKEN_ENCRYPTION_KEY + GITHUB_TOKEN_ENCRYPTION_KEY_PREVIOUS),
 * have `decryptToken` try the current key first and fall back to the
 * previous, and add a migration script that re-encrypts every row.
 */

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;          // 96 bits, GCM standard
const AUTH_TAG_LENGTH = 16;    // 128 bits

function getKey() {
  const raw = process.env.GITHUB_TOKEN_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("GITHUB_TOKEN_ENCRYPTION_KEY is not set");
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error(
      "GITHUB_TOKEN_ENCRYPTION_KEY must decode to 32 bytes (256 bits) of base64"
    );
  }
  return key;
}

/**
 * Encrypt a UTF-8 string with AES-256-GCM.
 *
 * Output format (single Buffer): [12-byte IV][16-byte authTag][ciphertext].
 * The IV is randomly generated per call — never reuse an IV with the same key.
 *
 * @param {string} plaintext - the token to encrypt
 * @returns {Buffer} encrypted bytes (store in a BYTEA column)
 */
export function encryptToken(plaintext) {
  if (typeof plaintext !== "string") {
    throw new TypeError("encryptToken: plaintext must be a string");
  }
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, ciphertext]);
}

/**
 * Decrypt a Buffer previously produced by `encryptToken`.
 *
 * Throws if the input is malformed or the auth tag doesn't verify
 * (which would indicate the wrong key, or a tampered ciphertext).
 *
 * @param {Buffer} encrypted - the bytes from the BYTEA column
 * @returns {string} the original plaintext token
 */
export function decryptToken(encrypted) {
  if (!Buffer.isBuffer(encrypted)) {
    throw new TypeError("decryptToken: encrypted must be a Buffer");
  }
  if (encrypted.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error("decryptToken: input is too short to be a valid ciphertext");
  }
  const key = getKey();
  const iv = encrypted.subarray(0, IV_LENGTH);
  const authTag = encrypted.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = encrypted.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString(
    "utf8"
  );
}
