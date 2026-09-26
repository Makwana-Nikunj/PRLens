import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useEmailAuth from "../hooks/useEmailAuth";

const VerifyEmail = () => {
  // The backend's verification email sends a query string: /verify-email?token=…
  // so we read from the URL search params, not the path params.
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { verifyEmail, isLoading } = useEmailAuth();
  const [status, setStatus] = useState("pending"); // pending | success | error
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await verifyEmail(token);
        if (!cancelled) {
          setStatus("success");
          setMessage("Your email is verified. You can sign in now.");
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setMessage(err?.message || "Verification failed. The link may be expired.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f13] light:bg-[#fafaff] text-[#E4E4E7] light:text-[#2a2a33] font-sans relative overflow-hidden">
      <div className="relative z-10 w-[90%] max-w-[400px] bg-[#161618] light:bg-[#ffffff] border border-white/10 light:border-black/10 prl-shadow-card rounded-lg p-8 md:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.5)] text-[#ccff00]enter animate-reveal-up">
        <div className="w-12 h-12 mx-auto mb-6 grid place-items-center bg-[#ccff00]/20 border border-[#ccff00]/30 rounded-md text-[#ccff00] light:text-[#ccff00]">
          {isLoading || status === "pending" ? (
            <div className="w-5 h-5 border-2 border-[#ccff00]/50 border-t-transparent rounded-full animate-spin" />
          ) : status === "success" ? (
            <svg className="w-6 h-6" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg className="w-6 h-6" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          )}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight mb-3 text-white light:text-[#18181f]">
          Email verification
        </h1>
        <p className="text-[14px] text-[#A1A1AA] light:text-[#565662] leading-relaxed mb-6">
          {message}
        </p>
        <Link
          to={status === "success" ? "/email-login" : "/login"}
          className="inline-block bg-[#ccff00] text-[#09090b] py-2.5 px-5 rounded-md text-[14px] font-semibold no-underline transition-colors"
        >
          {status === "success" ? "Go to sign in" : "Back to sign in"}
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmail;
