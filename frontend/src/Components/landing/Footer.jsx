import React from 'react';
import { Link } from 'react-router-dom';

const FooterLink = ({ to, children, ...props }) => (
  <Link
    to={to}
    className="text-[#9b9ba8] light:text-[#5d5d6a] hover:text-[#f3f3f6] hover:light:text-[#18181f] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] rounded"
    {...props}
  >
    {children}
  </Link>
);

const Footer = () => (
  <footer className="border-t border-[#232330] light:border-[#e3e3ec] pt-16 pb-10 text-[14px] bg-[#0a0a0d] light:bg-[#ffffff]" aria-labelledby="footer-heading">
    <h2 id="footer-heading" className="sr-only">Footer</h2>
    <div className="w-full px-6 md:px-[60px] 2xl:px-[100px] max-w-[1100px] mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-10 mb-12">
        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-3 text-white light:text-[#18181f] font-semibold text-lg no-underline mb-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-600/30 border border-violet-600/30 text-purple-400 light:text-purple-600">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M6 9v12" /><path d="M13 6h3a2 2 0 0 1 2 2v7" /><path d="M13 15c-2.5 0-4.5 0-6 0" />
              </svg>
            </span>
            PRLens
          </Link>
          <p className="text-[#6b6b78] light:text-[#82828e] leading-relaxed max-w-[260px]">
            AI-powered pull request analysis for GitHub. Understand any PR in seconds.
          </p>
        </div>

        {/* Product */}
        <nav aria-label="Product">
          <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#f3f3f6] light:text-[#18181f] mb-4">Product</h3>
          <ul className="space-y-3">
            <li><FooterLink to="/#what-you-get">Features</FooterLink></li>
            <li><FooterLink to="/#how-it-works">How it works</FooterLink></li>
            <li><FooterLink to="/#faq">FAQ</FooterLink></li>
          </ul>
        </nav>

        {/* Resources */}
        <nav aria-label="Resources">
          <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#f3f3f6] light:text-[#18181f] mb-4">Resources</h3>
          <ul className="space-y-3">
            <li><FooterLink to="/docs">Docs</FooterLink></li>
            <li><FooterLink to="/blog">Blog</FooterLink></li>
          </ul>
        </nav>

        {/* Legal */}
        <nav aria-label="Legal">
          <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#f3f3f6] light:text-[#18181f] mb-4">Legal</h3>
          <ul className="space-y-3">
            <li><FooterLink to="/privacy">Privacy</FooterLink></li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-[#232330] light:border-[#e3e3ec] pt-8 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
        <div className="text-[#6b6b78] light:text-[#82828e]">&copy; 2026 PRLens. All rights reserved.</div>
        <div className="flex items-center gap-2">
          <a href="https://github.com" className="text-[#9b9ba8] light:text-[#5d5d6a] hover:text-[#f3f3f6] hover:light:text-[#18181f] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] rounded p-2" aria-label="GitHub">
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </a>
          <a href="https://twitter.com" className="text-[#9b9ba8] light:text-[#5d5d6a] hover:text-[#f3f3f6] hover:light:text-[#18181f] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] rounded p-2" aria-label="Twitter">
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4l11.733 16H20L8.267 4H4z" />
              <path d="M4 20l6.768-6.768M20 4l-6.768 6.768" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
