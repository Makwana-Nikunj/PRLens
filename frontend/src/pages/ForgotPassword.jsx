import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useEmailAuth from "../hooks/useEmailAuth";

const RESET_EMAIL_KEY = "prlens_reset_email";

const ForgotPassword = () => {
  const { requestPasswordReset, isLoading } = useEmailAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    // Stash the email so the next page (reset-password) can prefill it.
    // Done before the API call so the user can navigate even on network error.
    sessionStorage.setItem(RESET_EMAIL_KEY, trimmed);
    try {
      await requestPasswordReset(trimmed);
    } catch {
      /* always show the same success message — hook may set error, ignore it */
    }
    setSent(true);
    // Give the user a moment to read the message, then take them to the OTP page.
    setTimeout(() => navigate("/reset-password", { replace: true }), 1200);
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--prl-bg)] text-[var(--prl-text)] font-sans relative overflow-hidden">
      <div className="relative z-10 w-[90%] max-w-[400px] bg-[var(--prl-panel)] border border-[var(--prl-border)] prl-shadow-card rounded-lg p-8 md:p-10 animate-reveal-up">
        <h1 className="text-2xl font-semibold tracking-tight mb-2 text-center text-[var(--prl-text)] font-display">
          Reset your password
        </h1>
        <p className="text-[14px] text-[var(--prl-text-dim)] leading-relaxed mb-8 text-center">
          {sent
            ? "If an account exists for that email, we've sent a 6-digit code. Redirecting..."
            : "Enter your email and we'll send you a 6-digit reset code."}
        </p>

        {!sent && (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[13px] text-[var(--prl-text-dim)] mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--prl-bg)] border border-[var(--prl-border)] rounded-lg px-3.5 py-2.5 text-[14px] text-[var(--prl-text)] outline-none focus:border-[#ccff00]/50 transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[var(--prl-accent-fill)] text-[var(--prl-on-accent)] py-3 px-4 rounded-md text-[15px] font-semibold border-none cursor-pointer transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Send reset code"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/email-login" className="text-[13px] text-[var(--prl-text-dim)] hover:text-[var(--prl-text)]">
            &larr; Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
export { RESET_EMAIL_KEY };
