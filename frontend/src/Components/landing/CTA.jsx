import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const isValidPR = (url) => /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+/i.test(url.trim());

const CTA = () => {
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const handleAnalyze = () => {
    const url = inputRef.current?.value.trim();
    if (!url) {
      inputRef.current.focus();
      return;
    }
    if (!isValidPR(url)) {
      setError(true);
      setTimeout(() => setError(false), 1800);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      sessionStorage.setItem('pending_pr_analyze', url);
      navigate('/login');
    }, 1600);
  };

  return (
    <section className="py-[120px] bg-[#0a0a0d] text-center" aria-labelledby="cta-title">
      <div className="w-full max-w-[1100px] mx-auto px-6 md:px-[60px] 2xl:px-[100px]">
        <div className="max-w-[640px] mx-auto">
          <h2
            id="cta-title"
            className="text-[clamp(28px,4vw,40px)] font-bold text-[#f3f3f6] tracking-tight mb-4"
          >
            Still reading diffs manually?
          </h2>
          <p className="text-[clamp(14px,2vw,16px)] text-[#9b9ba8] mb-10">
            Try PRLens free — no setup required.
          </p>

          <div
            className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 rounded-xl p-[6px] transition max-w-[640px] mx-auto"
            style={{
              background: '#131318',
              border: '1px solid #232330',
            }}
          >
            <input
              type="url"
              ref={inputRef}
              className="flex-1 bg-transparent border-none text-[15px] text-[#f3f3f6] px-4 py-3 sm:py-2 outline-none w-full placeholder:text-[#6b6b78]"
              placeholder="https://github.com/owner/repo/pull/123"
              autoComplete="off"
              spellCheck={false}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              aria-label="GitHub Pull Request URL"
            />
            <button
              className="flex shrink-0 items-center justify-center gap-2 px-[22px] py-[12px] min-h-[44px] w-full sm:w-auto rounded-lg text-white font-medium transition hover:-translate-y-px active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed"
              style={{
                background: error ? '#ef4444' : success ? '#22c55e' : '#7c3aed',
              }}
              onClick={handleAnalyze}
              disabled={loading}
              aria-label="Analyze Pull Request"
            >
              {loading ? '...' : error ? 'Invalid URL' : success ? 'Done ✓' : 'Analyze'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
export default CTA;
