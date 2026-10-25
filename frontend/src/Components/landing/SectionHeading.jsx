import React from 'react';

const SectionHeading = ({ eyebrow, title, subtitle, id }) => (
  /* Left-aligned: AXIS-BIAS. Keep headings on the page's left edge so the
     section body can hold its own rhythm. */
  <div className="mb-[64px] md:mb-[80px]">
    {eyebrow && (
      <span
        className="inline-flex items-center gap-[6px] text-[12px] font-semibold uppercase tracking-[0.14em] px-[14px] py-[6px] rounded border mb-5"
        style={{
          background: 'var(--prl-accent-soft)',
          borderColor: 'var(--prl-accent-line)',
          color: 'var(--prl-accent)',
        }}
      >
        {eyebrow}
      </span>
    )}
    <h2
      id={id}
      className="text-[clamp(28px,5vw,44px)] font-bold text-[var(--prl-text)] tracking-tight mb-4 font-display"
    >
      {title}
    </h2>
    {subtitle && (
      <p className="text-[clamp(15px,2vw,17px)] text-[var(--prl-text-dim)] leading-relaxed max-w-[560px]">
        {subtitle}
      </p>
    )}
  </div>
);

export default SectionHeading;
