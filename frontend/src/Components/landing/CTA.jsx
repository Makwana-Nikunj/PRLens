import React from 'react';
import { Link } from 'react-router-dom';
import PRInputForm from './PRInputForm';

const CTA = () => (
  <section className="py-[120px] bg-[#0a0a0d] text-center" aria-labelledby="cta-title">
    <div className="w-full max-w-[1100px] mx-auto px-6 md:px-[60px] 2xl:px-[100px]">
      <div
        className="relative max-w-[880px] mx-auto rounded-3xl px-6 py-16 md:px-16 md:py-20 overflow-hidden"
        style={{ background: '#101016', border: '1px solid #232330' }}
      >
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
            className="text-[clamp(28px,4vw,42px)] font-bold text-[#f3f3f6] tracking-tight mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Still reading diffs manually?
          </h2>
          <p className="text-[clamp(15px,2vw,17px)] text-[#9b9ba8] mb-10 max-w-[480px] mx-auto">
            Analyze your next pull request with PRLens — free, no setup required.
          </p>

          <PRInputForm buttonLabel="Analyze" />

          <p className="mt-5 text-[13px] font-medium text-[#6b6b78]">
            Or read the{' '}
            <Link to="/docs" className="text-[#9b9ba8] font-semibold hover:text-[#f3f3f6] transition">
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
