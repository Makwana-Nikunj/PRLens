import React from 'react';
import { AlertTriangle, FileCode2, MessageSquare, Check } from 'lucide-react';

const Features = () => {
  return (
    <section
      id="features"
      className="bg-[var(--prl-bg)] text-[var(--prl-text)] py-28 md:py-36 px-6 w-full"
    >
      <div className="max-w-[1320px] mx-auto">
        <h2 className="font-display font-bold text-[clamp(36px,5vw,60px)] leading-[0.96] tracking-[-0.04em] mb-4 prl-entrance">
          What PRLens catches.
        </h2>
        <p className="text-[18px] text-[var(--prl-text-dim)] mb-20 max-w-[50ch] prl-entrance prl-delay-1">
          Three capabilities designed to replace manual line-by-line skimming.
        </p>

        {/* Modules in blueprint sequence: left proof demonstration, right text */}
        <div className="space-y-24">
          {/* Module 1: Risk & Breaking Change Detection */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center prl-entrance">
            <div className="lg:col-span-6 w-full">
              <div
                data-ui
                className="w-full rounded-lg p-6 bg-[var(--prl-panel-2)]"
              >
                <div className="flex items-center justify-between pb-3 mb-4">
                  <div className="flex items-center gap-2 text-[14px] font-semibold text-red-400">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                    High Severity Alert
                  </div>
                  <code className="text-[13px] text-[var(--prl-text-dim)]">auth/callback.ts</code>
                </div>

                <div className="p-3.5 rounded bg-[var(--prl-bg)] text-[14px] leading-relaxed mb-4 text-[var(--prl-text)]">
                  <strong className="text-red-400">Breaking Contract:</strong> Response shape changed in <code className="text-[var(--prl-text)]">api/v2/users</code>. Missing CSRF token verification on POST.
                </div>

                <pre className="p-3 rounded bg-[#0d0d10] text-[13px] text-[var(--prl-text-dim)] overflow-x-auto">
                  <code>
                    <div className="text-red-400">- export const POST = async (req: Request) =&gt; ...</div>
                    <div className="text-emerald-400">+ export const POST = auth(async (req) =&gt; ...</div>
                  </code>
                </pre>
              </div>
            </div>

            <div className="lg:col-span-6 max-w-[520px]">
              <h3 className="font-display text-[26px] md:text-[30px] font-bold tracking-tight text-[var(--prl-text)] mb-4">
                Catch breaking changes before merge.
              </h3>
              <p className="text-[16px] leading-[1.65] text-[var(--prl-text-dim)] mb-4">
                PRLens inspects modified routes, signatures, and auth guards. It flags breaking schema alterations, removed exports, and missed security headers that pass typical unit tests.
              </p>
              <ul className="space-y-2 text-[15px] text-[var(--prl-text)]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Flags unvalidated webhook handlers and payloads</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Catches deleted database columns and table renames</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Module 2: File-by-File Intelligence */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center prl-entrance">
            <div className="lg:col-span-6 w-full">
              <div
                data-ui
                className="w-full rounded-lg p-6 bg-[var(--prl-panel-2)]"
              >
                <div className="flex items-center justify-between pb-3 mb-4">
                  <div className="flex items-center gap-2 text-[14px] font-semibold text-[var(--prl-text)]">
                    <FileCode2 className="w-4 h-4 text-[var(--prl-accent)]" />
                    Modified Files Analysis
                  </div>
                  <span className="text-[13px] text-emerald-400 font-medium">3 files triaged</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded bg-[var(--prl-bg)]">
                    <div className="flex items-center justify-between text-[13px] text-[var(--prl-text-dim)] mb-1">
                      <code className="text-[var(--prl-text)]">src/auth/session.ts</code>
                      <span className="text-emerald-400 font-medium">+42 -8</span>
                    </div>
                    <p className="text-[14px] text-[var(--prl-text)]">
                      Replaces hand-rolled JWT validation with native edge cookie verification.
                    </p>
                  </div>

                  <div className="p-3.5 rounded bg-[var(--prl-bg)]">
                    <div className="flex items-center justify-between text-[13px] text-[var(--prl-text-dim)] mb-1">
                      <code className="text-[var(--prl-text)]">src/middleware.ts</code>
                      <span className="text-emerald-400 font-medium">+12 -3</span>
                    </div>
                    <p className="text-[14px] text-[var(--prl-text)]">
                      Ensures public marketing routes bypass auth overhead for fast TTFB.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 max-w-[520px]">
              <h3 className="font-display text-[26px] md:text-[30px] font-bold tracking-tight text-[var(--prl-text)] mb-4">
                One-line context for every changed file.
              </h3>
              <p className="text-[16px] leading-[1.65] text-[var(--prl-text-dim)] mb-4">
                Stop jumping across 40 browser tabs to understand what each file actually does. PRLens distills every file diff into its architectural purpose.
              </p>
              <p className="text-[15px] text-[var(--prl-text)]">
                Reviewers quickly scan the files that need scrutiny and skip pure boilerplate updates.
              </p>
            </div>
          </div>

          {/* Module 3: Interactive Diff Chat */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center prl-entrance">
            <div className="lg:col-span-6 w-full">
              <div
                data-ui
                className="w-full rounded-lg p-6 bg-[var(--prl-panel-2)]"
              >
                <div className="flex items-center justify-between pb-3 mb-4">
                  <div className="flex items-center gap-2 text-[14px] font-semibold text-[var(--prl-text)]">
                    <MessageSquare className="w-4 h-4 text-[var(--prl-accent)]" />
                    AI Review Assistant
                  </div>
                  <span className="text-[13px] text-emerald-400 font-medium">Context: Diff Loaded</span>
                </div>

                <div className="space-y-3.5">
                  <div className="p-3 rounded bg-[var(--prl-bg)] text-[14px] text-[var(--prl-text)]">
                    <span className="text-[13px] font-semibold text-[var(--prl-accent)] block mb-1">Reviewer:</span>
                    Does this PR break backward compatibility for existing user sessions?
                  </div>

                  <div className="p-3.5 rounded bg-[var(--prl-bg)] text-[14px] text-[var(--prl-text-dim)] leading-relaxed">
                    <span className="text-[13px] font-semibold text-emerald-400 block mb-1">PRLens AI:</span>
                    No. The migration includes a legacy fallback cookie parser in <code className="text-[var(--prl-text)]">src/auth/compat.ts</code>. Sessions created prior to deploy will upgrade on their next request.
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 max-w-[520px]">
              <h3 className="font-display text-[26px] md:text-[30px] font-bold tracking-tight text-[var(--prl-text)] mb-4">
                Interrogate any commit with AI chat.
              </h3>
              <p className="text-[16px] leading-[1.65] text-[var(--prl-text-dim)] mb-4">
                Ask specific questions directly against the pull request diff. Query performance consequences, backwards compatibility, and test coverage in real-time.
              </p>
              <p className="text-[15px] text-[var(--prl-text)]">
                Pairs with the reviewer like an engineering teammate who has already memorized the entire PR.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
