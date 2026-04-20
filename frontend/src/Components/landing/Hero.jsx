import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const isValidPR = (url) => {
  return /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+/i.test(url.trim());
};

const Hero = () => {
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const handleAnalyze = () => {
    const url = inputRef.current?.value.trim();
    if (!url) {
      inputRef.current.focus();
      inputRef.current.placeholder = 'Please paste a PR URL first';
      setTimeout(() => { if (inputRef.current) inputRef.current.placeholder = 'https://github.com/owner/repo/pull/123'; }, 2000);
      return;
    }
    if (!isValidPR(url)) {
      setError(true);
      setTimeout(() => setError(false), 1800);
      inputRef.current.select();
      return;
    }

    // Valid PR - Redirect to start analyzing
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);

      // Pass the PR URL via sessionStorage or query params so the dashboard picks it up
      sessionStorage.setItem('pending_pr_analyze', url);

      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }, 600);
  };

  return (
    <header className="relative pt-[180px] pb-[100px] text-center overflow-hidden">
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] hero-glow pointer-events-none z-0"></div>
      <div className="max-w-[760px] mx-auto px-6 relative z-10">
        <h1 className="text-[56px] md:text-[72px] font-bold text-white tracking-[-0.03em] leading-[1.1] mb-6 reveal opacity-0">Understand any GitHub PR in seconds</h1>
        <p className="text-[18px] md:text-[20px] text-[#A1A1AA] leading-relaxed mb-10 reveal opacity-0" style={{ transitionDelay: '0.1s' }}>
          Paste a pull request URL and get a clear AI-powered breakdown — summary, risks, file changes, and a chat to ask anything.
        </p>
        <div className="relative max-w-[640px] mx-auto flex items-center bg-[#161618] border border-white/10 rounded-xl p-[6px] transition hover:border-white/20 focus-within:border-violet-500 focus-within:shadow-[0_0_20px_rgba(124,58,237,0.2)] reveal opacity-0" style={{ transitionDelay: '0.2s' }}>
          <input
            type="url"
            ref={inputRef}
            className="flex-1 bg-transparent border-none text-[15px] text-white px-4 py-2 outline-none w-full placeholder:text-[#A1A1AA]"
            placeholder="https://github.com/owner/repo/pull/123"
            autoComplete="off"
            spellCheck={false}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            onFocus={(e) => { if (!e.target.value) e.target.value = 'https://github.com/'; }}
          />
          <button
            className={`flex flex-shrink-0 items-center justify-center gap-2 px-[22px] py-[12px] rounded-lg text-white font-medium transition hover:-translate-y-px ${error ? 'bg-red-500' : success ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-violet-600 to-violet-500'}`}
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="w-[18px] h-[18px] animate-spin-slow" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Analyzing...
              </>
            ) : error ? 'Invalid URL' : success ? 'Done ✓' : 'Analyze PR'}
          </button>
        </div>
        <p className="mt-5 text-[14px] text-[#71717A] font-medium reveal opacity-0" style={{ transitionDelay: '0.3s' }}>Free to use · Works with public repos · Login for private repos</p>
      </div>
    </header>
  );
};
export default Hero;