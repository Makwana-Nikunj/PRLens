import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="border-t border-[#232330] py-8 text-[#9b9ba8] text-[14px]" aria-labelledby="footer-heading">
    <h2 id="footer-heading" className="sr-only">Footer</h2>
    <div className="w-full px-6 md:px-[60px] 2xl:px-[100px] max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
      <div>© 2026 PRLens. All rights reserved.</div>
      <nav className="flex items-center gap-5" aria-label="Footer links">
        <Link to="/privacy" className="text-[#9b9ba8] hover:text-[#f3f3f6] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] rounded">
          Privacy
        </Link>
        <a href="https://github.com" className="text-[#9b9ba8] hover:text-[#f3f3f6] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] rounded" aria-label="GitHub">
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
        </a>
        <a href="https://twitter.com" className="text-[#9b9ba8] hover:text-[#f3f3f6] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] rounded" aria-label="Twitter">
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4l11.733 16H20L8.267 4H4z" />
            <path d="M4 20l6.768-6.768M20 4l-6.768 6.768" />
          </svg>
        </a>
      </nav>
    </div>
  </footer>
);
export default Footer;
