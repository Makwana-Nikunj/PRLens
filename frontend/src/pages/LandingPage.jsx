import React, { useEffect } from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import HowItWorks from '../components/landing/HowItWorks';
import Preview from '../components/landing/Preview';
import Features from '../components/landing/Features';
import Example from '../components/landing/Example';
import CTA from '../components/landing/CTA';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full bg-[#0f0f13] text-white font-sans min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Preview />
      <Features />
      <Example />
      <CTA />
      <Footer />
    </div>
  );
};
export default LandingPage;