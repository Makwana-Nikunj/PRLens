import React from 'react';

const SectionHeading = ({ eyebrow, title, subtitle, id }) => (
  <div className="text-center mb-[64px] md:mb-[80px]">
    {eyebrow && (
      <span
        className="inline-flex items-center gap-[6px] text-[12px] font-semibold uppercase tracking-[0.14em] px-[14px] py-[6px] rounded-full border mb-5"
        style={{
          background: 'rgba(124,58,237,0.12)',
          borderColor: 'rgba(124,58,237,0.35)',
          color: '#9457f5',
        }}
      >
        {eyebrow}
      </span>
    )}
    <h2
      id={id}
      className="text-[clamp(28px,5vw,44px)] font-bold text-[#f3f3f6] light:text-[#18181f] tracking-tight mb-4"
      style={{ fontFamily: 'var(--font-display)' }}
    >
      {title}
    </h2>
    {subtitle && (
      <p className="text-[clamp(15px,2vw,17px)] text-[#9b9ba8] light:text-[#5d5d6a] leading-relaxed max-w-[560px] mx-auto">
        {subtitle}
      </p>
    )}
  </div>
);

export default SectionHeading;
