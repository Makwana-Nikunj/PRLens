import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';

const GithubIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const handleLoginClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }
    navigate('/login');
  };

  const isDocsActive = location.pathname.startsWith('/docs');
  const isBlogActive = location.pathname.startsWith('/blog');

  const navLinkClasses = (isActive) =>
    `text-[14px] font-medium transition ${isActive ? 'text-white light:text-[#18181f]' : 'text-[#A1A1AA] light:text-[#565662] hover:text-white light:text-[#565662] light:hover:text-[#18181f]'}`;

  return (
    <>
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 light:border-black/10 bg-[#0f0f13]/80 light:bg-white/80 backdrop-blur-md transition-colors">
        <div className="max-w-[1100px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-white light:text-[#18181f] font-semibold text-lg no-underline pt-1 pb-1 px-1">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-600/30 border border-violet-600/30 text-purple-400 light:text-purple-600">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M6 9v12" /><path d="M13 6h3a2 2 0 0 1 2 2v7" /><path d="M13 15c-2.5 0-4.5 0-6 0" />
              </svg>
            </span>
            PRLens
          </Link>
          <div className="flex items-center gap-2 sm:gap-6">
            <Link to="/docs" className={`hidden md:block ${navLinkClasses(isDocsActive)}`}>
              Docs
            </Link>
            <Link to="/blog" className={`hidden md:block ${navLinkClasses(isBlogActive)}`}>
              Blog
            </Link>
            <Button variant="ghost" onClick={handleLoginClick} className="hidden md:flex">
              {isAuthenticated ? (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  Dashboard
                </>
              ) : (
                <>
                  <GithubIcon />
                  Continue with GitHub
                </>
              )}
            </Button>

            <ThemeToggle />

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex items-center justify-center w-[44px] h-[44px] text-[#E4E4E7] light:text-[#2a2a33] transition hover:text-white light:hover:text-[#18181f]"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {menuOpen ? (
                  <>
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </>
                ) : (
                  <>
                    <path d="M4 6h16" />
                    <path d="M4 12h16" />
                    <path d="M4 18h16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 light:border-black/10 bg-[#0f0f13]/95 light:bg-white/95 backdrop-blur-md">
            <div className="max-w-[1100px] mx-auto px-6 py-4 flex flex-col gap-1">
              <Link to="/docs" className={`${navLinkClasses(isDocsActive)} py-3 min-h-[44px] flex items-center`}>
                Docs
              </Link>
              <Link to="/blog" className={`${navLinkClasses(isBlogActive)} py-3 min-h-[44px] flex items-center`}>
                Blog
              </Link>
              <Button variant="ghost" onClick={handleLoginClick} className="mt-2">
                {isAuthenticated ? (
                  'Dashboard'
                ) : (
                  <>
                    <GithubIcon />
                    Continue with GitHub
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};
export default Navbar;
