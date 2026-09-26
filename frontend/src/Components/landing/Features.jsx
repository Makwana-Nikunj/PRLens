import React, { useEffect, useRef, useState } from 'react';
import SectionHeading from './SectionHeading';

const features = [
  {
    title: 'PR Summary',
    desc: 'Clear explanation of what changed and why',
    icon: (
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    ),
  },
  {
    title: 'File Breakdown',
    desc: 'Understand each file without reading diffs',
    icon: (
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    ),
  },
  {
    title: 'Risk Detection',
    desc: 'Spot breaking changes and security issues',
    icon: (
      <>
        <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </>
    ),
  },
  {
    title: 'Tradeoffs',
    desc: 'See performance and complexity implications',
    icon: <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />,
  },
  {
    title: 'Review Checklist',
    desc: 'Actionable items before merging',
    icon: <path d="m9 11 3 3L22 4" />,
  },
  {
    title: 'Follow-up Chat',
    desc: 'Ask anything about the PR context',
    icon: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
  },
];

const FeatureCard = ({ title, desc, icon, index }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="group grid-shine relative rounded p-8 overflow-hidden transition-all duration-300 cursor-default"
      style={{
        background: 'var(--prl-panel-2)',
        border: '1px solid var(--prl-border)',
        width: '100%',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ease ${index * 0.08}s, transform 0.6s ease ${index * 0.08}s, border-color 0.3s, box-shadow 0.3s, transform 0.3s`,
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
      }}
      onMouseEnter={(e) => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.1)';
        e.currentTarget.style.transform = 'translateY(-6px)';
      }}
      onMouseLeave={(e) => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        e.currentTarget.style.borderColor = 'var(--prl-border)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Animated fine grid backdrop + scanning laser */}
      <div className="absolute inset-0 grid-animated-fine opacity-50 pointer-events-none [mask-image:radial-gradient(ellipse_at_top_right,black_15%,transparent_70%)]" aria-hidden="true" />
      <div className="grid-scan absolute left-0 right-0 pointer-events-none" aria-hidden="true" />
      {/* Decorative orbit ring in the corner */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 grid-orbit opacity-40 pointer-events-none" aria-hidden="true" />
      <div
        className="w-10 h-10 rounded flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6"
        style={{
          background: 'rgba(124,58,237,0.1)',
          color: '#ccff00',
        }}
      >
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </div>
      <h3 className="text-[18px] font-semibold text-[var(--text-primary)] light:text-[#18181f] mb-2">{title}</h3>
      <p className="text-[15px] text-[var(--text-muted)] light:text-[#5d5d6a] leading-relaxed">{desc}</p>
    </div>
  );
};

const Features = () => {
  return (
    <section id="what-you-get" className="py-[120px] bg-[var(--bg-primary)] light:bg-[#ffffff] scroll-mt-[80px] relative overflow-hidden" aria-labelledby="what-you-get-title">
      {/* Wide drifting grid + twinkling nodes backdrop for the whole section */}
      <div className="absolute inset-0 grid-animated-wide pointer-events-none opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_80%)]" aria-hidden="true" />
      <div className="absolute inset-0 grid-nodes pointer-events-none opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_80%)] [animation-delay:1.5s]" aria-hidden="true" />
      <div className="w-full px-6 md:px-[60px] 2xl:px-[100px] relative z-10">
        <SectionHeading
          id="what-you-get-title"
          eyebrow="Features"
          title="What you get"
          subtitle="Everything you need to review a pull request with confidence — in one place."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1100px] mx-auto w-full">
          {features.map((f, i) => (
            <FeatureCard key={f.title} index={i} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
};
export default Features;
