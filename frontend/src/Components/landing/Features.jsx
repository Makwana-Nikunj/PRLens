import React, { useEffect, useRef, useState } from 'react';

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
      className="group rounded-xl p-8 transition-all duration-300 cursor-default"
      style={{
        background: '#16161d',
        border: '1px solid #232330',
        maxWidth: '320px',
        width: '100%',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ease ${index * 0.08}s, transform 0.6s ease ${index * 0.08}s, border-color 0.3s, box-shadow 0.3s, transform 0.3s`,
      }}
      onMouseEnter={(e) => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.1)';
        e.currentTarget.style.transform = 'translateY(-6px)';
      }}
      onMouseLeave={(e) => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        e.currentTarget.style.borderColor = '#232330';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6"
        style={{
          background: 'rgba(124,58,237,0.1)',
          color: '#9457f5',
        }}
      >
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </div>
      <h3 className="text-[18px] font-semibold text-[#f3f3f6] mb-2">{title}</h3>
      <p className="text-[15px] text-[#9b9ba8] leading-relaxed">{desc}</p>
    </div>
  );
};

const Features = () => {
  return (
    <section id="what-you-get" className="py-[120px] bg-[#0a0a0d]" aria-labelledby="what-you-get-title">
      <div className="w-full px-6 md:px-[60px] 2xl:px-[100px]">
        <h2
          id="what-you-get-title"
          className="text-[clamp(28px,4vw,40px)] font-bold text-[#f3f3f6] tracking-tight mb-[80px] text-center"
        >
          What you get
        </h2>
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: 'repeat(3, 1fr)',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          {features.map((f, i) => (
            <FeatureCard key={f.title} index={i} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
};
export default Features;
