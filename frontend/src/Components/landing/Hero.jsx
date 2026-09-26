import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import PRInputForm from './PRInputForm';

const Hero = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    // Simple observer to trigger the mask-reveal animation on mount
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    const el = heroRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  return (
    <header className="relative pt-[120px] md:pt-[180px] pb-[100px] overflow-hidden bg-[var(--color-bg-theme)]">
      {/* Background Neon Grid & Drift */}
      <div className="absolute inset-0 grid-animated pointer-events-none opacity-20" aria-hidden="true" />

      <div className="relative z-10 w-full px-6 md:px-[60px] 2xl:px-[100px] max-w-[1400px] mx-auto text-left">

        {/* Developer Badge */}
        <div className="pill-badge reveal inline-block px-4 py-2 font-mono text-[13px] font-bold tracking-wide border border-[rgba(255,255,255,0.15)] rounded text-[var(--color-accent)] mb-8">
          ✨ AI-POWERED PR ANALYSIS
        </div>

        {/* Massive Slicer Header */}
        <h1
          className="mask-reveal font-bold leading-[0.85] tracking-[-0.05em] mb-12 text-[var(--color-text-primary)]"
          style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(70px, 14vw, 172px)' }}
          ref={heroRef}
        >
          <span className="mask-line"><span className="mask-text">Flawless</span></span><br/>
          <span className="mask-line"><span className="mask-text">Code.</span></span>
        </h1>

        {/* Subtext */}
        <p className="subtitle text-[22px] leading-[1.6] max-w-[700px] font-medium text-[var(--color-text-muted)] mb-12 reveal" style={{ animationDelay: '0.3s' }}>
          Paste a pull request URL and get a clear AI-powered breakdown — summary, risks, file changes, and a chat to ask anything.<br/><br/><strong className="text-[var(--color-text-primary)]">Free to use. Works with public repos.</strong>
        </p>

        {/* CTA Form */}
        <div className="hero-actions reveal max-w-[600px]" style={{ animationDelay: '0.5s' }}>
          <PRInputForm />
          <p className="mt-4 text-[13px] font-mono text-[var(--color-text-muted)] opacity-70 uppercase tracking-widest">
            // No setup required. Instantly analyze.
          </p>
        </div>
      </div>

      {/* Marquee Strip */}
      <div className="marquee-container mt-24">
        <div className="marquee-content">
          <span>AI CODE REVIEW // ZERO BUGS // MERGE FASTER // PRLENS // AI CODE REVIEW // ZERO BUGS // MERGE FASTER // PRLENS // AI CODE REVIEW // ZERO BUGS // MERGE FASTER // PRLENS //</span>
        </div>
      </div>
    </header>
  );
};

export default Hero;