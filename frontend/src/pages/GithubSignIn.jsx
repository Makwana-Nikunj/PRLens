import React from 'react';
import { useNavigate } from 'react-router-dom';
import useGithubOAuth from '../hooks/useGithubOAuth';

const GithubSignIn = () => {
  const navigate = useNavigate();
  const { handleGithubLogin, isGithubLoading, oauthError } = useGithubOAuth({ redirectPath: '/dashboard' });

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--prl-bg)] text-[var(--prl-text)] font-sans relative overflow-hidden">
      {/* Animated grid backdrop with pulsing halo */}
      <div
        className="absolute inset-0 grid-animated pointer-events-none z-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
        aria-hidden="true"
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:w-[600px] md:h-[600px] w-[300px] h-[300px] grid-pulse pointer-events-none z-0"></div>

      <div className="relative z-10 w-[90%] max-w-[400px] bg-[var(--prl-panel)] border border-[var(--prl-border)] prl-shadow-card rounded-lg p-8 md:p-10 text-center animate-reveal-up">
        <div className="w-12 h-12 mx-auto mb-6 grid place-items-center bg-[#ccff00]/20 border border-[#ccff00]/30 rounded-md text-[var(--prl-accent)]">
          <svg className="w-6 h-6" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M6 9v12" /><path d="M13 6h3a2 2 0 0 1 2 2v7" /><path d="M13 15c-2.5 0-4.5 0-6 0" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight mb-2 text-[var(--prl-text)] font-display">Sign in to PRLens</h1>
        <p className="text-[14px] text-[var(--prl-text-dim)] leading-relaxed mb-8">
          Connect your GitHub account to analyze pull requests and get smarter code reviews.
        </p>

        <button
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-3.5 px-4 rounded-md text-[15px] font-semibold border-none cursor-pointer transition-all hover:-translate-y-px  active:translate-y-0 disabled:opacity-80 disabled:cursor-not-allowed disabled:transform-none"
          onClick={handleGithubLogin}
          disabled={isGithubLoading}
        >
          {isGithubLoading ? (
            <>
              <div className="w-[18px] h-[18px] border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
              Authenticating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              Continue with GitHub
            </>
          )}
        </button>

        {oauthError && (
          <p className="mt-4 text-[13px] text-red-400 text-center">
            {oauthError}
          </p>
        )}

        <div className="mt-6 flex items-center gap-3 text-[12px] text-[#71717a] light:text-[#565662]">
          <div className="flex-1 h-px bg-[var(--prl-border)]" />
          <span>OR</span>
          <div className="flex-1 h-px bg-[var(--prl-border)]" />
        </div>

        <button
          type="button"
          onClick={() => navigate('/email-login')}
          className="mt-4 w-full bg-[var(--prl-bg)] border border-[var(--prl-border)] text-[var(--prl-text)] py-3 px-4 rounded-md text-[14px] font-medium cursor-pointer transition-colors hover:bg-[var(--prl-bg-soft)]"
        >
          Continue with email
        </button>

        <a onClick={() => navigate('/')} className="inline-block mt-6 text-[13px] text-[var(--prl-text-dim)] no-underline transition-colors hover:text-[var(--prl-text)] cursor-pointer">
          &larr; Back to home
        </a>
      </div>
    </div>
  );
};
export default GithubSignIn;
