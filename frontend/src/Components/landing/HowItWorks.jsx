import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle, FileCode2, MessageSquare } from 'lucide-react';

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      action: 'Paste a link.',
      desc: 'Point PRLens at any public repository pull request. No app installation, permissions, or webhook configuration needed.',
    },
    {
      action: 'The engine walks the diff.',
      desc: 'Our analyzer inspects modified symbols, parses dependency imports, and flags breaking API changes or missing security guards.',
    },
    {
      action: 'Review with full context.',
      desc: 'Read concise file explanations, follow the automated verification checklist, and ask follow-up questions in the interactive chat.',
    },
  ];

  return (
    <section
      id="how-it-works"
      className="bg-[var(--prl-bg-soft)] text-[var(--prl-text)] py-28 md:py-36 px-6 w-full"
    >
      <div className="max-w-[1320px] mx-auto">
        <h2 className="font-display font-bold text-[clamp(36px,5vw,60px)] leading-[0.96] tracking-[-0.04em] mb-4 prl-entrance">
          How it works.
        </h2>
        <p className="text-[18px] text-[var(--prl-text-dim)] mb-16 max-w-[50ch] prl-entrance prl-delay-1">
          Three steps from a pull request link to an actionable architectural breakdown.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left: 3 statements with order words */}
          <div className="lg:col-span-5 space-y-8 prl-entrance prl-delay-1">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <div
                  key={step.action}
                  onClick={() => setActiveStep(idx)}
                  className={`cursor-pointer p-6 rounded transition-colors duration-200 ${
                    isActive
                      ? 'bg-[var(--prl-panel-2)] text-[var(--prl-text)]'
                      : 'bg-transparent text-[var(--prl-text-dim)] hover:text-[var(--prl-text)]'
                  }`}
                >
                  <h3 className="font-display text-[22px] md:text-[24px] font-bold tracking-tight mb-3">
                    {step.action}
                  </h3>
                  <p className="text-[16px] leading-relaxed text-[var(--prl-text-dim)]">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right: Sticky real interface stage (data-ui) changing state */}
          <div className="lg:col-span-7 lg:sticky lg:top-[120px] prl-entrance prl-delay-2">
            <div
              data-ui
              className="w-full rounded-lg p-6 md:p-8 bg-[var(--prl-panel-2)] min-h-[380px] flex flex-col justify-between"
            >
              {activeStep === 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 mb-2">
                    <span className="text-[14px] font-semibold text-[var(--prl-text)]">
                      Step 1: Input URL
                    </span>
                    <span className="text-[13px] text-emerald-400 font-medium">Valid GitHub target</span>
                  </div>

                  <div className="p-4 rounded bg-[var(--prl-bg)]">
                    <label className="block text-[13px] font-medium text-[var(--prl-text-dim)] mb-2">
                      Repository Pull Request
                    </label>
                    <code className="text-[14px] text-[var(--prl-accent)] break-all font-mono">
                      https://github.com/facebook/react/pull/28411
                    </code>
                  </div>

                  <div className="space-y-2 text-[14px] text-[var(--prl-text-dim)]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Public repository verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Base branch: <strong className="text-[var(--prl-text)]">main</strong> &larr; Head: <strong className="text-[var(--prl-text)]">server-actions-v2</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Ready to parse 14 modified files</span>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 mb-2">
                    <span className="text-[14px] font-semibold text-[var(--prl-text)]">
                      Step 2: Engine Analysis
                    </span>
                    <span className="text-[13px] text-[var(--prl-accent)] font-medium">Parsing diff AST...</span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded bg-[var(--prl-bg)] flex items-center justify-between text-[14px]">
                      <span className="text-[var(--prl-text)]">Changed files mapped</span>
                      <span className="text-emerald-400 font-semibold">14 / 14</span>
                    </div>
                    <div className="p-3.5 rounded bg-[var(--prl-bg)] flex items-center justify-between text-[14px]">
                      <span className="text-[var(--prl-text)]">Security risk rules checked</span>
                      <span className="text-emerald-400 font-semibold">28 passed · 1 flag</span>
                    </div>
                    <div className="p-3.5 rounded bg-[var(--prl-bg)] flex items-center justify-between text-[14px]">
                      <span className="text-[var(--prl-text)]">Dependency upgrades parsed</span>
                      <span className="text-[var(--prl-text)] font-semibold">3 packages</span>
                    </div>
                  </div>

                  <div className="p-3 rounded bg-amber-950/40 text-amber-200 text-[13px] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Risk flagged: Modified auth guard in middleware.ts</span>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 mb-2">
                    <span className="text-[14px] font-semibold text-[var(--prl-text)]">
                      Step 3: Review Ready
                    </span>
                    <span className="text-[13px] text-emerald-400 font-medium">Analysis complete</span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded bg-[var(--prl-bg)]">
                      <div className="text-[14px] font-semibold text-[var(--prl-text)] mb-1">
                        Executive Summary Generated
                      </div>
                      <p className="text-[14px] text-[var(--prl-text-dim)]">
                        Unifies server action dispatching and secures token expiration handling across edge endpoints.
                      </p>
                    </div>

                    <div className="p-4 rounded bg-[var(--prl-bg)] flex items-center justify-between text-[14px]">
                      <div className="flex items-center gap-2 text-[var(--prl-text)]">
                        <MessageSquare className="w-4 h-4 text-[var(--prl-accent)]" />
                        <span>Interactive AI Chat ready for questions</span>
                      </div>
                      <span className="text-[13px] font-medium text-[var(--prl-accent)]">Live</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-5 flex items-center justify-between text-[13px] text-[var(--prl-text-dim)]">
                <span>Active state: {activeStep + 1} of 3</span>
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => (prev + 1) % 3)}
                  className="text-[var(--prl-accent)] font-medium hover:underline cursor-pointer"
                >
                  Next step &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;