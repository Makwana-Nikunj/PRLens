import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleLoginClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      navigate('/login');
    }, 1000);
  };

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#0f0f13]/80 backdrop-blur-md transition-colors">
      <div className="max-w-[1100px] mx-auto px-6 h-[72px] flex items-center justify-between">
        <a href="#" className="flex items-center gap-3 text-white font-semibold text-lg no-underline pt-1 pb-1 px-1">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600/20 to-purple-500/20 border border-violet-600/30 text-purple-400">
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M6 9v12" /><path d="M13 6h3a2 2 0 0 1 2 2v7" /><path d="M13 15c-2.5 0-4.5 0-6 0" />
            </svg>
          </span>
          PRLens
        </a>
        <button
          onClick={handleLoginClick}
          disabled={isConnecting}
          className="flex items-center gap-2 bg-transparent text-[#E4E4E7] border border-white/20 px-[18px] py-[10px] rounded-xl text-[14px] font-medium transition hover:border-white/40 hover:bg-white/5 active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed"
        >
          {isConnecting ? (
            <>
              <svg className="w-4 h-4 animate-spin-slow" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Connecting...
            </>
          ) : isAuthenticated ? (
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
              <svg className="w-4 h-4" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              Continue with GitHub
            </>
          )}
        </button>
      </div>
    </nav>
  );
};
export default Navbar;