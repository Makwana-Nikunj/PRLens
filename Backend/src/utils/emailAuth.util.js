import bcrypt from "bcrypt";
import crypto from "crypto";

export const BCRYPT_ROUNDS = 12;

export const hashPassword = (plain) => bcrypt.hash(plain, BCRYPT_ROUNDS);

export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);

// Constant-time hex string comparison to prevent timing attacks
export const safeTokenCompare = (a, b) => {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ab.length === 0 || ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email) =>
  typeof email === "string" && email.length <= 254 && EMAIL_RE.test(email);

export const isValidUsername = (username) =>
  typeof username === "string" &&
  /^[a-zA-Z0-9_]{3,20}$/.test(username);

export const isValidPassword = (password) =>
  typeof password === "string" && password.length >= 8 && password.length <= 128;
