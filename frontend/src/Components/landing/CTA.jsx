import React from 'react';
import { Link } from 'react-router-dom';
import PRInputForm from './PRInputForm';

const CTA = () => (
  <section className="py-[120px] bg-[var(--bg-primary)] light:bg-[#ffffff] text-center" aria-labelledby="cta-title">
    <div className="w-full max-w-[1100px] mx-auto px-6 md:px-[60px] 2xl:px-[100px]">
      <div
        className="relative max-w-[880px] mx-auto rounded-3xl px-6 py-16 md:px-16 md:py-20 overflow-hidden"
        style={{ background: 'var(--prl-panel)', border: '1px solid var(--prl-border)' }}
      >
        {/* Animated grid + sweeping beam backdrop */}
        <div
          className="absolute inset-0 grid-animated pointer-events-none opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]"
          aria-hidden="true"
        />
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="grid-beam absolute top-0 left-0 w-[40%] h-full" />
        </div>

        {/* Gradient border glow */}
        <div
          className="absolute inset-0 pointer-events-none rounded-3xl"
          style={{
            background:
              'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(124,58,237,0.18) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px]"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(148,87,245,0.6), transparent)' }}
          aria-hidden="true"
        />

        <div className="relative">
          <h2
            id="cta-title"
            className="text-[clamp(28px,4vw,42px)] font-bold text-[var(--text-primary)] light:text-[#18181f] tracking-tight mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Still reading diffs manually?
          </h2>
          <p className="text-[clamp(15px,2vw,17px)] text-[var(--text-muted)] light:text-[#5d5d6a] mb-10 max-w-[480px] mx-auto">
            Analyze your next pull request with PRLens — free, no setup required.
          </p>

          <PRInputForm buttonLabel="Analyze" />

          <p className="mt-5 text-[13px] font-medium text-[var(--text-muted)] light:text-[#82828e]">
            Or read the{' '}
            <Link to="/docs" className="text-[var(--text-muted)] light:text-[#5d5d6a] font-semibold hover:text-[var(--text-primary)] hover:light:text-[#18181f] transition">
              docs
            </Link>{' '}
            first.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default CTA;
