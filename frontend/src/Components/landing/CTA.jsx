import React, { useRef, useState } from 'react';

const isValidPR = (url) => /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+/i.test(url.trim());

const CTA = () => {
  const inputRef = useRef(null);
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
      setTimeout(() => setSuccess(false), 2000);
    }, 1600);
  };

  return (
    <section className="py-[120px] text-center px-6">
      <div className="max-w-[760px] mx-auto">
        <h2 className="text-[40px] md:text-[48px] font-bold text-white tracking-tight mb-10 reveal opacity-0 leading-tight">Ready to review smarter?</h2>
        <div className="relative max-w-[640px] mx-auto flex items-center bg-[#161618] border border-white/10 rounded-xl p-[6px] transition hover:border-white/20 focus-within:border-violet-500 focus-within:shadow-[0_0_20px_rgba(124,58,237,0.2)] reveal opacity-0">
          <input
            type="url"
            ref={inputRef}
            className="flex-1 bg-transparent border-none text-[15px] text-white px-4 py-2 outline-none w-full placeholder:text-[#A1A1AA]"
            placeholder="https://github.com/owner/repo/pull/123"
            autoComplete="off"
            spellCheck={false}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
          />
          <button
            className={`flex shrink-0 items-center justify-center gap-2 px-[22px] py-[12px] rounded-lg text-white font-medium transition hover:-translate-y-px animate-none ${error ? 'bg-red-500' : success ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-violet-600 to-violet-500'}`}
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? "..." : error ? 'Invalid URL' : success ? 'Done ✓' : 'Analyze'}
          </button>
        </div>
      </div>
    </section>
  );
};
export default CTA;