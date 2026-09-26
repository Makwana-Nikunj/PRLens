import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  emailSignup,
  emailLogin,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logoutUser,
  changePassword,
  getCurrentUser,
  googleLoginStart,
  googleLoginCallback,
  githubLogin,
  githubConnectStart,
  githubConnectCallback,
  githubDisconnect,
} from "../controllers/auth.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

// ============================================
// RATE LIMITERS
// ============================================
// IMPORTANT: every limiter below is mounted BEFORE the controller on its
// route. That ordering is the actual guarantee that a brute-force attacker
// sending garbage payloads still hits the rate limit and gets throttled —
// the controller's 400/501 cannot run until the limiter has had its say.

// Loose limit for the rest of the public auth flows. The plan calls for
// 10/hr, which is what we use here; bump if your traffic profile needs it.
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});

// Tighter limit on the password login endpoint specifically — the
// account-takeover risk on this one is much higher than the rest.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});

// Tighter limit on the OTP / verification routes — these are the
// attack surface for guessing short tokens.
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});

// ============================================
// PUBLIC ROUTES (no session required)
// ============================================

// Email + password auth (canonical paths — replaces the old /email/* aliases).
router.post("/register",            authLimiter, emailSignup);
router.post("/login",               loginLimiter, emailLogin);
router.post("/refresh",             refreshAccessToken);
router.post("/forgot-password",     authLimiter, forgotPassword);
router.post("/reset-password",      authLimiter, resetPassword);
router.post("/resend-verification", authLimiter, resendVerification);

// GET form (used by the email link click-through) and POST form
// (used by SPAs that capture the token and POST it themselves).
router.get ("/verify-email",        otpLimiter,  verifyEmail);
router.post("/verify-email",        otpLimiter,  verifyEmail);

// ============================================
// GITHUB OAUTH (login provider via PKCE)
// ============================================
router.post("/oauth", authLimiter, githubLogin);

// ============================================
// GOOGLE OAUTH (login provider)
// ============================================
// Both routes are public; the callback handles its own CSRF state check
// against a signed cookie set by /google.
router.get("/google",          googleLoginStart);
router.get("/google/callback", googleLoginCallback);

// ============================================
// AUTHENTICATED ROUTES
// ============================================

router.post("/logout", verifyJwt, logoutUser);
router.post("/change-password", authLimiter, verifyJwt, changePassword);
router.get ("/me",     verifyJwt, getCurrentUser);

// ============================================
// GITHUB CONNECT (post-login, for PR data)
// ============================================
// All three require an active session — the GitHub App installation is
// owned by the user, not by PRLens.
router.get ("/github/connect",          verifyJwt, githubConnectStart);
router.get ("/github/connect/callback", verifyJwt, githubConnectCallback);
router.post("/github/disconnect",       verifyJwt, githubDisconnect);

export default router;
