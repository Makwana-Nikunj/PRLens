import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useEmailAuth from "../hooks/useEmailAuth";

const EmailSignIn = () => {
  const navigate = useNavigate();
  const { loginWithEmail, isLoading, error } = useEmailAuth({ redirectPath: "/dashboard" });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginWithEmail({ email, password });
    } catch {
      /* error already exposed via hook */
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--prl-bg)] text-[var(--prl-text)] font-sans relative overflow-hidden">
      <div
        className="absolute inset-0 grid-animated pointer-events-none z-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
        aria-hidden="true"
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:w-[600px] md:h-[600px] w-[300px] h-[300px] grid-pulse pointer-events-none z-0"></div>

      <div className="relative z-10 w-[90%] max-w-[400px] bg-[var(--prl-panel)] border border-[var(--prl-border)] prl-shadow-card rounded-lg p-8 md:p-10 animate-reveal-up">
        <div className="w-12 h-12 mx-auto mb-6 grid place-items-center bg-[#ccff00]/20 border border-[#ccff00]/30 rounded-md text-[var(--prl-accent)]">
          <svg className="w-6 h-6" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16v16H4z" />
            <path d="M4 4l8 8 8-8" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight mb-2 text-center text-[var(--prl-text)] font-display">
          Sign in with email
        </h1>
        <p className="text-[14px] text-[var(--prl-text-dim)] leading-relaxed mb-8 text-center">
          Welcome back. Sign in to your PRLens account.
        </p>

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
          <div>
            <label htmlFor="password" className="block text-[13px] text-[var(--prl-text-dim)] mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--prl-bg)] border border-[var(--prl-border)] rounded-lg px-3.5 py-2.5 text-[14px] text-[var(--prl-text)] outline-none focus:border-[#ccff00]/50 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-[12px] text-[var(--prl-text-dim)] hover:text-[var(--prl-text)]">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[var(--prl-accent-fill)] text-[var(--prl-on-accent)] py-3 px-4 rounded-md text-[15px] font-semibold border-none cursor-pointer transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-[13px] text-red-400 text-center">{error}</p>
        )}

        <div className="mt-6 text-center text-[13px] text-[var(--prl-text-dim)]">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[var(--prl-accent)] hover:underline">
            Sign up
          </Link>
        </div>
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-[12px] text-[var(--prl-text-dim)] hover:text-[var(--prl-text)]"
          >
            &larr; Use GitHub instead
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailSignIn;
