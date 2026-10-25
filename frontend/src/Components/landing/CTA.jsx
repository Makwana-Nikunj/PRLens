import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section
      id="cta"
      className="bg-[var(--prl-bg)] text-[var(--prl-text)] pt-32 pb-24 px-6 w-full"
    >
      <div className="max-w-[760px] mx-auto text-center prl-entrance">
        <h2 className="font-display font-bold text-[clamp(32px,5.2vw,56px)] leading-[0.96] tracking-[-0.04em] text-[var(--prl-text)] mb-6">
          Review pull requests<br />with PRLens.
        </h2>

        <p className="text-[18px] md:text-[20px] leading-[1.6] text-[var(--prl-text-dim)] max-w-[38ch] mx-auto mb-10 prl-delay-1">
          Paste any public or private GitHub link to receive an immediate architectural summary and risk breakdown.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 prl-delay-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 py-3.5 px-8 rounded bg-[var(--prl-accent-fill)] text-[var(--prl-on-accent)] font-semibold text-[16px] hover:brightness-105 active:scale-[0.98] transition-transform duration-150 cursor-pointer"
          >
            Analyze PR
            <ArrowRight className="w-4 h-4" strokeWidth={2.2} />
          </button>
          <Link
            to="/docs"
            className="text-[16px] font-medium text-[var(--prl-text-dim)] hover:text-[var(--prl-text)] transition-colors no-underline"
          >
            Read documentation
          </Link>
        </div>

        <p className="mt-8 text-[14px] text-[var(--prl-text-dim)] prl-delay-3">
          Free to use. No repository installation required.
        </p>
      </div>
    </section>
  );
};

export default CTA;
