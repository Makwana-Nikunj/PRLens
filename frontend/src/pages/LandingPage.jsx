import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../Components/landing/Navbar';
import Hero from '../Components/landing/Hero';
import HowItWorks from '../Components/landing/HowItWorks';
import Features from '../Components/landing/Features';
import WhoItsFor from '../Components/landing/WhoItsFor';
import FAQ from '../Components/landing/FAQ';
import CTA from '../Components/landing/CTA';
import Footer from '../Components/landing/Footer';
import GridBackdrop from '../Components/landing/GridBackdrop';

const LandingPage = () => {
  const { hash } = useLocation();

  // Scroll to anchored sections for SPA navigations like /#faq from the footer
  useEffect(() => {
    if (!hash) return;
    const target = document.querySelector(hash);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash]);

  return (
    <div className="w-full bg-[#09090b] light:bg-[#ffffff] text-white light:text-[#18181f] font-sans min-h-screen relative">
      <GridBackdrop />
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <WhoItsFor />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
};
export default LandingPage;
