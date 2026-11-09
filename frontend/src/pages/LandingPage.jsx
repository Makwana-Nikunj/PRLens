import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../Components/landing/Navbar';
import Hero from '../Components/landing/Hero';
import HowItWorks from '../Components/landing/HowItWorks';
import Features from '../Components/landing/Features';
import Showcase from '../Components/landing/Showcase';
import EngineeringFootage from '../Components/landing/EngineeringFootage';
import FAQ from '../Components/landing/FAQ';
import CTA from '../Components/landing/CTA';
import Footer from '../Components/landing/Footer';

const LandingPage = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const target = document.querySelector(hash);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash]);

  // Scroll reveal observer for landing page elements
  useEffect(() => {
    const reveals = document.querySelectorAll('.prl-reveal, .prl-reveal-scale');
    if (!reveals.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    reveals.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full bg-[var(--prl-bg)] text-[var(--prl-text)] min-h-[100dvh] flex flex-col font-sans selection:bg-[var(--prl-accent)] selection:text-black">
      <Navbar />
      <main className="flex flex-col flex-1">
        <Hero />
        <HowItWorks />
        <Features />
        <Showcase />
        <EngineeringFootage />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
