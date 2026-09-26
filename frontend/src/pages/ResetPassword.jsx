import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useEmailAuth from "../hooks/useEmailAuth";
import { RESET_EMAIL_KEY } from "./ForgotPassword";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { submitPasswordReset, isLoading, error } = useEmailAuth();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);

  // Prefill email from the previous step if it's still in sessionStorage.
  // If the user landed here directly (no prior /forgot-password visit), they
  // can still type the email in manually.
  useEffect(() => {
    const stashed = sessionStorage.getItem(RESET_EMAIL_KEY);
    if (stashed) setEmail(stashed);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return;
    if (!/^\d{6}$/.test(otp)) return;
    try {
      await submitPasswordReset({ email: email.trim(), otp, newPassword: password });
      // Done — clear the stashed email so a future reset starts clean.
      sessionStorage.removeItem(RESET_EMAIL_KEY);
      setDone(true);
      setTimeout(() => navigate("/email-login", { replace: true }), 1500);
    } catch {
      /* error from hook */
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f13] light:bg-[#fafaff] text-[#E4E4E7] light:text-[#2a2a33] font-sans relative overflow-hidden">
      <div className="relative z-10 w-[90%] max-w-[400px] bg-[#161618] light:bg-[#ffffff] border border-white/10 light:border-black/10 prl-shadow-card rounded-lg p-8 md:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.5)] animate-reveal-up">
        <h1 className="text-2xl font-semibold tracking-tight mb-2 text-[#ccff00]enter text-white light:text-[#18181f]">
          Set a new password
        </h1>
        <p className="text-[14px] text-[#A1A1AA] light:text-[#565662] leading-relaxed mb-8 text-[#ccff00]enter">
          {done
            ? "Password updated. Redirecting you to sign in..."
            : "Enter the 6-digit code we emailed you, then choose a new password."}
        </p>

        {!done && (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[13px] text-[#A1A1AA] light:text-[#565662] mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0f0f13] light:bg-[#fafaff] border border-white/10 light:border-black/10 rounded-lg px-3.5 py-2.5 text-[14px] text-white light:text-[#18181f] outline-none focus:border-[#ccff00]/50 transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="otp" className="block text-[13px] text-[#A1A1AA] light:text-[#565662] mb-1.5">
                6-digit reset code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full bg-[#0f0f13] light:bg-[#fafaff] border border-white/10 light:border-black/10 rounded-lg px-3.5 py-2.5 text-[14px] text-white light:text-[#18181f] outline-none focus:border-[#ccff00]/50 transition-colors tracking-[0.4em] text-[#ccff00]enter font-mono"
                placeholder="000000"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-[13px] text-[#A1A1AA] light:text-[#565662] mb-1.5">
                New password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0f0f13] light:bg-[#fafaff] border border-white/10 light:border-black/10 rounded-lg px-3.5 py-2.5 text-[14px] text-white light:text-[#18181f] outline-none focus:border-[#ccff00]/50 transition-colors"
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label htmlFor="confirm" className="block text-[13px] text-[#A1A1AA] light:text-[#565662] mb-1.5">
                Confirm new password
              </label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-[#0f0f13] light:bg-[#fafaff] border border-white/10 light:border-black/10 rounded-lg px-3.5 py-2.5 text-[14px] text-white light:text-[#18181f] outline-none focus:border-[#ccff00]/50 transition-colors"
                placeholder="Re-enter password"
              />
            </div>
            {password && confirm && password !== confirm && (
              <p className="text-[12px] text-red-400">Passwords do not match.</p>
            )}
            <button
              type="submit"
              disabled={
                isLoading ||
                password !== confirm ||
                !password ||
                !/^\d{6}$/.test(otp) ||
                !email
              }
              className="w-full bg-[#ccff00] text-[#09090b] py-3 px-4 rounded-md text-[15px] font-semibold border-none cursor-pointer transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save new password"}
            </button>
          </form>
        )}

        {error && !done && (
          <p className="mt-4 text-[13px] text-red-400 text-[#ccff00]enter">{error}</p>
        )}

        <div className="mt-6 text-[#ccff00]enter">
          <Link to="/email-login" className="text-[13px] text-[#A1A1AA] light:text-[#565662] hover:text-white light:hover:text-[#18181f]">
            &larr; Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
