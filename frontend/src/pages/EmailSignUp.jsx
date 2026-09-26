import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useEmailAuth from "../hooks/useEmailAuth";

const EmailSignUp = () => {
  const navigate = useNavigate();
  const { signup, isLoading, error } = useEmailAuth({ redirectPath: "/dashboard" });

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup({ email, password, name });
      // Account created — backend did NOT issue session cookies.
      // Take the user to the "check your inbox" page so they verify before
      // they can sign in.
      navigate("/verify-email-pending", {
        replace: true,
        state: { email: email.trim().toLowerCase() },
      });
    } catch {
      /* error already exposed via hook */
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f13] light:bg-[#fafaff] text-[#E4E4E7] light:text-[#2a2a33] font-sans relative overflow-hidden">
      <div
        className="absolute inset-0 grid-animated pointer-events-none z-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
        aria-hidden="true"
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:w-[600px] md:h-[600px] w-[300px] h-[300px] grid-pulse pointer-events-none z-0"></div>

      <div className="relative z-10 w-[90%] max-w-[400px] bg-[#161618] light:bg-[#ffffff] border border-white/10 light:border-black/10 prl-shadow-card rounded-lg p-8 md:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.5)] animate-reveal-up">
        <div className="w-12 h-12 mx-auto mb-6 grid place-items-center bg-[#ccff00]/20 border border-[#ccff00]/30 rounded-md text-[#ccff00] light:text-[#ccff00]">
          <svg className="w-6 h-6" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M19 8v6" />
            <path d="M22 11h-6" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight mb-2 text-[#ccff00]enter text-white light:text-[#18181f]">
          Create your account
        </h1>
        <p className="text-[14px] text-[#A1A1AA] light:text-[#565662] leading-relaxed mb-8 text-[#ccff00]enter">
          Sign up with email to start reviewing pull requests.
        </p>

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
            <label htmlFor="name" className="block text-[13px] text-[#A1A1AA] light:text-[#565662] mb-1.5">
              Display name <span className="opacity-60">(optional)</span>
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0f0f13] light:bg-[#fafaff] border border-white/10 light:border-black/10 rounded-lg px-3.5 py-2.5 text-[14px] text-white light:text-[#18181f] outline-none focus:border-[#ccff00]/50 transition-colors"
              placeholder="What should we call you?"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-[13px] text-[#A1A1AA] light:text-[#565662] mb-1.5">
              Password
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#ccff00] text-[#09090b] py-3 px-4 rounded-md text-[15px] font-semibold border-none cursor-pointer transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-[13px] text-red-400 text-[#ccff00]enter">{error}</p>
        )}

        <p className="mt-4 text-[12px] text-[#71717a] light:text-[#565662] text-[#ccff00]enter">
          By signing up, we'll send you a verification email.
        </p>

        <div className="mt-6 text-[#ccff00]enter text-[13px] text-[#A1A1AA] light:text-[#565662]">
          Already have an account?{" "}
          <Link to="/email-login" className="text-[#ccff00] light:text-[#ccff00] hover:underline">
            Sign in
          </Link>
        </div>
        <div className="mt-3 text-[#ccff00]enter">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-[12px] text-[#A1A1AA] light:text-[#565662] hover:text-white light:hover:text-[#18181f]"
          >
            &larr; Use GitHub instead
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailSignUp;
