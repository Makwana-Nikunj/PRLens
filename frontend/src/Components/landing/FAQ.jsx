import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    q: 'Is PRLens free to use?',
    a: 'Yes. Core PR summaries, security risk detection, file breakdowns, and AI review questions are free for all public repositories.',
  },
  {
    q: 'Which repositories and plans are supported?',
    a: 'Public GitHub repositories analyze immediately without login. Private repositories connect securely through GitHub OAuth with read-only scopes.',
  },
  {
    q: 'How does the AI review chat work?',
    a: 'The assistant ingests the full unified diff, AST symbol graph, and commit messages. You can interrogate breaking changes or backwards compatibility.',
  },
  {
    q: 'Do I need to install a GitHub App or CLI?',
    a: 'No installation or admin permissions required. Paste any pull request link and the breakdown generates directly in your browser.',
  },
  {
    q: 'What types of pull requests benefit the most?',
    a: 'PRLens saves the most time on multi-file PRs, architectural migrations, and dependency upgrades where manual skimming is slow.',
  },
];

const FAQ = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <section
      id="faq"
      className="bg-[var(--prl-bg-soft)] text-[var(--prl-text)] py-28 md:py-36 px-6 w-full"
    >
      <div className="max-w-[1320px] mx-auto">
        <h2 className="font-display font-bold text-[clamp(36px,5vw,60px)] leading-[0.96] tracking-[-0.04em] mb-4 prl-entrance">
          Common questions.
        </h2>
        <p className="text-[18px] text-[var(--prl-text-dim)] mb-16 max-w-[50ch] prl-entrance prl-delay-1">
          Details on how PRLens analyzes pull requests and protects code privacy.
        </p>

        {/* Blueprint: Desktop two-column (left question index, right sticky answer); Mobile in-place expansion */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start prl-entrance prl-delay-2">
          {/* Columns 1-5: Question Index */}
          <div className="lg:col-span-5 space-y-5">
            {faqs.map((faq, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div key={faq.q} className="group">
                  <button
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className="w-full text-left flex items-start gap-4 py-2 text-[18px] transition-colors duration-150 cursor-pointer"
                  >
                    <span
                      className={`w-2 h-2 rounded-full mt-2 shrink-0 transition-colors duration-150 ${
                        isSelected ? 'bg-[var(--prl-accent)]' : 'bg-zinc-600 group-hover:bg-zinc-400'
                      }`}
                      aria-hidden="true"
                    />
                    <span
                      className={`font-medium leading-snug ${
                        isSelected ? 'text-[var(--prl-text)]' : 'text-[var(--prl-text-dim)] group-hover:text-[var(--prl-text)]'
                      }`}
                    >
                      {faq.q}
                    </span>
                  </button>

                  {/* Mobile answer reveal under active item */}
                  <div className={`lg:hidden pt-2 pb-4 pl-6 text-[16px] leading-relaxed text-[var(--prl-text-dim)] ${isSelected ? 'block' : 'hidden'}`}>
                    {faq.a}
                  </div>
                </div>
              );
            })}

            <div className="pt-8">
              <Link
                to="/docs"
                className="text-[15px] font-semibold text-[var(--prl-accent)] hover:underline inline-flex items-center gap-1.5"
              >
                Read full documentation &rarr;
              </Link>
            </div>
          </div>

          {/* Columns 7-12: Sticky Large Answer Pane (Desktop) */}
          <div className="hidden lg:block lg:col-span-7 lg:sticky lg:top-[140px] pl-4">
            <div className="p-8 rounded-lg bg-[var(--prl-panel-2)] min-h-[220px] flex flex-col justify-center">
              <p className="text-[22px] md:text-[24px] font-normal leading-[1.4] text-[var(--prl-text)] max-w-[34ch]">
                {faqs[selectedIndex].a}
              </p>
              <div className="mt-6 text-[14px] text-[var(--prl-text-dim)]">
                Question {selectedIndex + 1} of {faqs.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
