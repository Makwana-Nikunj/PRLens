import React, { useEffect, useRef } from 'react';
import Navbar from '../Components/landing/Navbar';
import Hero from '../Components/landing/Hero';
import HowItWorks from '../Components/landing/HowItWorks';
import Features from '../Components/landing/Features';
import CTA from '../Components/landing/CTA';
import Footer from '../Components/landing/Footer';

const LandingPage = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const elements = root.querySelectorAll('[data-reveal]');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
            setTimeout(() => {
              el.classList.add('is-revealed');
            }, delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full bg-[#0a0a0d] text-white font-sans min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
};
export default LandingPage;
