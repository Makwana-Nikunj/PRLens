import React, { useEffect } from 'react';
import Navbar from '../Components/landing/Navbar';
import Hero from '../Components/landing/Hero';
import HowItWorks from '../Components/landing/HowItWorks';
import Preview from '../Components/landing/Preview';
import Features from '../Components/landing/Features';
import Example from '../Components/landing/Example';
import CTA from '../Components/landing/CTA';
import Footer from '../Components/landing/Footer';

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
