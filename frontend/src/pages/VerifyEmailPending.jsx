import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useEmailAuth from "../hooks/useEmailAuth";

/**
 * Shown after a login attempt by an account whose email isn't verified yet.
 * - Reads the email from useLocation().state (set by useEmailAuth.loginWithEmail).
 * - Offers a "Resend verification email" button.
 * - Has a "Use a different account" link that goes back to /email-login.
 */
const VerifyEmailPending = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resendVerification, isLoading } = useEmailAuth();

  const email = location.state?.email || "";
  const [resent, setResent] = useState(false);
  const [error, setError] = useState(null);

  // If the user lands here directly (no email in state), send them back to login.
  useEffect(() => {
    if (!email) {
      navigate("/email-login", { replace: true });
    }
  }, [email, navigate]);

  const handleResend = async () => {
    setError(null);
    try {
      await resendVerification(email);
      setResent(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not resend verification email."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f13] light:bg-[#fafaff] text-[#E4E4E7] light:text-[#2a2a33] font-sans relative overflow-hidden">
      <div className="relative z-10 w-[90%] max-w-[440px] bg-[#161618] light:bg-[#ffffff] border border-white/10 light:border-black/10 prl-shadow-card rounded-lg p-8 md:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.5)] text-[#ccff00]enter animate-reveal-up">
        <div className="w-12 h-12 mx-auto mb-6 grid place-items-center bg-[#ccff00]/20 border border-[#ccff00]/30 rounded-md text-[#ccff00] light:text-[#ccff00]">
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 8l9 6 9-6" />
            <path d="M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight mb-3 text-white light:text-[#18181f]">
          Check your email
        </h1>

        <p className="text-[14px] text-[#A1A1AA] light:text-[#565662] leading-relaxed mb-2">
          We've sent a verification link to
        </p>
        <p className="text-[14px] text-white light:text-[#18181f] font-medium mb-6 break-all">
          {email}
        </p>
        <p className="text-[13px] text-[#A1A1AA] light:text-[#565662] leading-relaxed mb-8">
          Click the link in the email to verify your address. The link expires
          in 30 minutes. You can close this tab and come back — we'll remember
          where you were.
        </p>

        {resent ? (
          <p className="text-[13px] text-green-400 mb-4">
            A fresh verification email is on its way.
          </p>
        ) : null}
        {error ? (
          <p className="text-[13px] text-red-400 mb-4">{error}</p>
        ) : null}

        <button
          type="button"
          onClick={handleResend}
          disabled={isLoading || resent}
          className="w-full bg-[#ccff00] text-[#09090b] py-3 px-4 rounded-md text-[15px] font-semibold border-none cursor-pointer transition-colors disabled:opacity-70 disabled:cursor-not-allowed mb-3"
        >
          {isLoading ? "Sending..." : resent ? "Email sent" : "Resend verification email"}
        </button>

        <Link
          to="/email-login"
          replace
          className="block text-[13px] text-[#A1A1AA] light:text-[#565662] hover:text-white light:hover:text-[#18181f]"
        >
          &larr; Use a different account
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmailPending;
