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
