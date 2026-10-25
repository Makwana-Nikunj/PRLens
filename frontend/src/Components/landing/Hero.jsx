import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileCode2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import PRInputForm from './PRInputForm';

const Hero = () => {
  const formRef = useRef(null);

  const focusForm = () => {
    const input = formRef.current?.querySelector('input');
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    input?.focus({ preventScroll: true });
  };

  return (
    <section className="max-w-[1320px] mx-auto px-6 pt-12 pb-24 md:pb-32 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left: Two-line title, supporting sentence, primary action */}
        <div className="lg:col-span-6 flex flex-col justify-center pt-2">
          <h1 className="font-display font-bold text-[clamp(48px,5.8vw,76px)] leading-[0.94] tracking-[-0.04em] text-[var(--prl-text)] mb-8 prl-entrance">
            Pull requests,<br />understood.
          </h1>

          <p className="text-[18px] md:text-[20px] leading-[1.55] max-w-[42ch] font-normal text-[var(--prl-text-dim)] mb-10 prl-entrance prl-delay-1">
            Paste any GitHub pull request to receive an instant architectural summary, breaking risk detection, and an interactive chat.
          </p>

          <div className="flex flex-wrap items-center gap-6 prl-entrance prl-delay-2">
            <button
              type="button"
              onClick={focusForm}
              className="inline-flex items-center gap-2 py-3.5 px-7 rounded bg-[var(--prl-accent-fill)] text-[var(--prl-on-accent)] font-semibold text-[16px] hover:brightness-105 active:scale-[0.98] transition-transform duration-150 cursor-pointer"
            >
              Analyze PR
              <ArrowRight className="w-4 h-4" strokeWidth={2.2} aria-hidden="true" />
            </button>
            <Link
              to="/docs"
              className="text-[16px] font-medium text-[var(--prl-text-dim)] hover:text-[var(--prl-text)] transition-colors no-underline"
            >
              Read the documentation
            </Link>
          </div>

          <p className="mt-8 text-[14px] text-[var(--prl-text-dim)] prl-entrance prl-delay-3">
            Free for all public repositories. No bots, tokens, or permissions needed.
          </p>
        </div>

        {/* Right: The real product interface fragment (data-ui) */}
        <div ref={formRef} className="lg:col-span-6 w-full prl-entrance prl-delay-1">
          <div
            data-ui
            className="w-full rounded-lg p-6 md:p-7 bg-[var(--prl-panel-2)]"
          >
            {/* Real PR Metadata bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" aria-hidden="true" />
                <span className="text-[14px] font-semibold text-[var(--prl-text)]">
                  authjs/next-auth #9412
                </span>
              </div>
              <span className="text-[13px] font-medium text-[var(--prl-text-dim)]">
                +342 -28 lines · 6 files
              </span>
            </div>

            {/* Live PR Input */}
            <div className="mb-6">
              <PRInputForm buttonLabel="Analyze PR" id="hero-input" />
            </div>

            {/* Real review breakdown preview */}
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded bg-[var(--prl-bg)]">
                <div className="flex items-center gap-2 text-[14px] font-semibold text-[var(--prl-text)] mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Executive Summary
                </div>
                <p className="text-[14px] text-[var(--prl-text-dim)] leading-relaxed">
                  Migrated session storage to edge cookies and unified OAuth handling with Auth.js v5. Drops custom JWT token refresh helper.
                </p>
              </div>

              <div className="p-4 rounded bg-[var(--prl-bg)]">
                <div className="flex items-center gap-2 text-[14px] font-semibold text-[var(--prl-danger)] mb-1.5">
                  <AlertTriangle className="w-4 h-4 text-[var(--prl-danger)] shrink-0" />
                  Risk Detected · Breaking API Route
                </div>
                <p className="text-[14px] text-[var(--prl-text-dim)] leading-relaxed">
                  Response payload in <code className="text-[var(--prl-text)]">api/auth/session</code> no longer exports legacy user metadata object.
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 text-[13px] text-[var(--prl-text-dim)]">
                <div className="flex items-center gap-1.5">
                  <FileCode2 className="w-4 h-4" />
                  <span>Changed: src/auth/config.ts (+42 -8)</span>
                </div>
                <span className="text-[var(--prl-accent)] font-medium">Ready for review</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
