import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import MouseGlow from './MouseGlow';
import Typewriter from '../ui/Typewriter';

const isValidPR = (url) => {
  return /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+/i.test(url.trim());
};

const fadeUpStyle = (delay) => ({
  animation: `prl-fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards ${delay}s`,
  opacity: 0,
});

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

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      sessionStorage.setItem('pending_pr_analyze', url);

      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }, 600);
  };

  return (
    <header className="relative pt-[180px] pb-[100px] text-center overflow-hidden bg-[#0a0a0d]">
      <MouseGlow />
      
      {/* Glow */}
      <div
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle at top, rgba(124,58,237,0.12) 0%, transparent 60%)', filter: 'blur(80px)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full px-6 md:px-[60px] 2xl:px-[100px] max-w-[1100px] mx-auto">
        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-[6px] mb-6"
          style={fadeUpStyle(0)}
        >
          <span className="inline-flex items-center gap-[6px] text-[13px] font-semibold px-[14px] py-[6px] rounded-full border"
            style={{
              background: 'rgba(124,58,237,0.12)',
              borderColor: 'rgba(124,58,237,0.35)',
              color: '#9457f5',
            }}
          >
            <span aria-hidden="true">✨</span> AI-powered PR analysis
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-bold tracking-[-0.03em] leading-[1.1] mb-6 mx-auto text-balance break-words min-h-[3.3em] md:min-h-0"
          style={{
            ...fadeUpStyle(0.1),
            fontSize: 'clamp(32px, 8vw, 72px)',
            maxWidth: '900px',
          }}
        >
          <Typewriter text="Understand any GitHub PR in seconds" delay={40} />
        </h1>

        {/* Subtext */}
        <p className="leading-relaxed mb-10 mx-auto text-[#9b9ba8]"
          style={{
            ...fadeUpStyle(0.2),
            fontSize: 'clamp(16px, 2vw, 20px)',
            maxWidth: '640px',
          }}
        >
          Paste a pull request URL and get a clear AI-powered breakdown — summary, risks, file changes, and a chat to ask anything.
        </p>

        {/* Form */}
        <div className="relative mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 rounded-xl p-[6px] transition max-w-[640px]"
          style={{
            ...fadeUpStyle(0.3),
            background: '#131318',
            border: '1px solid #232330',
          }}
        >
          <Input
            ref={inputRef}
            placeholder="https://github.com/owner/repo/pull/123"
            autoComplete="off"
            spellCheck={false}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            onFocus={(e) => { if (!e.target.value) e.target.value = ''; }}
            aria-label="GitHub Pull Request URL"
          />
          <Button
            variant={error ? 'danger' : success ? 'success' : 'primary'}
            onClick={handleAnalyze}
            disabled={loading}
            aria-label="Analyze Pull Request"
          >
            {loading ? (
              <>
                <svg className="w-[18px] h-[18px] animate-spin-slow" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Analyzing...
              </>
            ) : error ? 'Invalid URL' : success ? 'Done ✓' : 'Analyze PR'}
          </Button>
        </div>

        {/* Trust line */}
        <p className="mt-5 text-[13px] font-medium text-[#6b6b78]"
          style={fadeUpStyle(0.4)}
        >
          Free to use <span className="mx-2 text-[#232330]">·</span>
          Works with public repos <span className="mx-2 text-[#232330]">·</span>
          <span className="text-[#9b9ba8] font-semibold">Login for private repos</span>
        </p>

        {/* Preview Card */}
        <div
          className="mt-16 mx-auto rounded-2xl overflow-hidden relative w-full max-w-[800px] z-10"
          style={{
            ...fadeUpStyle(0.5),
            animation: `prl-fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.5s, prl-float 6s ease-in-out infinite 1.6s`,
            opacity: 0,
            background: '#16161d',
            border: '1px solid #232330',
          }}
        >
            {/* Top bar */}
            <div className="flex items-center gap-[6px] px-5 py-3 bg-[#131318] border-b border-[#232330]">
            <span className="w-[10px] h-[10px] rounded-full bg-[#232330]" />
            <span className="w-[10px] h-[10px] rounded-full bg-[#232330]" />
            <span className="w-[10px] h-[10px] rounded-full bg-[#232330]" />
          </div>

          <div className="p-6 md:p-8">
            {/* Badge + PR id */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-[6px] text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                style={{ background: 'rgba(124,58,237,0.12)', color: '#9457f5' }}
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                AI
              </span>
              <span className="text-[13px] font-medium text-[#9b9ba8]">prisma/prisma #19843</span>
            </div>

            {/* Title */}
            <h3 className="text-[18px] md:text-[20px] font-semibold text-[#f3f3f6] mb-4">feat: add edge runtime support</h3>

            {/* Progress bars placeholders */}
            <div className="space-y-3 mt-4" aria-hidden="true">
              <div className="h-2 bg-[#232330] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: '80%', background: 'linear-gradient(90deg, #7c3aed, #9457f5)' }} />
              </div>
              <div className="h-2 bg-[#232330] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: '60%', background: 'linear-gradient(90deg, #7c3aed, #9457f5)' }} />
              </div>
              <div className="h-2 bg-[#232330] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: '90%', background: 'linear-gradient(90deg, #7c3aed, #9457f5)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Hero;
