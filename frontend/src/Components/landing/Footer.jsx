import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();

  const linkClass = "text-[15px] font-medium text-[var(--prl-text-dim)] hover:text-[var(--prl-text)] transition-colors no-underline";

  return (
    <footer className="bg-[var(--prl-bg)] text-[var(--prl-text)] px-6 pt-12 pb-16 w-full">
      <div className="max-w-[1320px] mx-auto">
        {/* Single quiet line: 1fr auto 1fr grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6 text-[15px]">
          {/* Left: what this is in a few words */}
          <div className="text-[var(--prl-text-dim)] font-medium">
            <span className="text-[var(--prl-text)] font-semibold">prlens.</span> AI pull request review for GitHub.
          </div>

          {/* Centred: Navigation links */}
          <div className="flex flex-wrap items-center gap-6">
            <a href="#how-it-works" className={linkClass}>How it works</a>
            <a href="#features" className={linkClass}>Proof</a>
            <a href="#demo" className={linkClass}>Live Demo</a>
            <a href="#faq" className={linkClass}>FAQ</a>
            <Link to="/docs" className={linkClass}>Docs</Link>
            <Link to="/privacy" className={linkClass}>Privacy</Link>
          </div>

          {/* Right: Year and rights */}
          <div className="md:text-right text-[var(--prl-text-dim)] font-medium">
            &copy; {year} PRLens. All rights reserved.
          </div>
        </div>

        {/* Archival credits as required by open collections assets */}
        <div className="mt-12 text-[13px] text-[var(--prl-text-faint)] leading-relaxed text-center">
          Pictures and footage: <a href="https://commons.wikimedia.org/wiki/File:Code_on_computer_monitor_(Unsplash).jpg" className="text-[var(--prl-text-dim)] underline hover:text-[var(--prl-text)]">“Code on computer monitor”</a> by Markus Spiske (CC0); <a href="https://commons.wikimedia.org/w/index.php?curid=48220976" className="text-[var(--prl-text-dim)] underline hover:text-[var(--prl-text)]">“Wikidata code review”</a> by Lydia Pintscher (CC0); <a href="https://images.nasa.gov/details/JPL-20240425-VOYAGEf-0001-Voyager%201%20Team%20Reacts%20to%20Receiving%20Engineering%20Data%20From%20Spacecraft" className="text-[var(--prl-text-dim)] underline hover:text-[var(--prl-text)]">“Telemetry engineering review”</a> by NASA JPL (Public domain).
        </div>
      </div>
    </footer>
  );
};

export default Footer;
