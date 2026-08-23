import React, { useState } from 'react';
import useDashboardStore from '../../store/dashboardStore';

const AnalyzeForm = () => {
  const [url, setUrl] = useState('');
  const isAnalyzing = useDashboardStore(state => state.isAnalyzing);
  const historyError = useDashboardStore(state => state.historyError);
  const analyzePr = useDashboardStore(state => state.analyzePr);

  const analysisPhase = useDashboardStore(state => state.analysisPhase);
  const analysisProgress = useDashboardStore(state => state.analysisProgress);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanUrl = url.trim();
    if (!cleanUrl) return;
    try {
      new URL(cleanUrl);
    } catch {
      useDashboardStore.setState({ historyError: new Error('Please enter a valid URL') });
      return;
    }
    if (!cleanUrl.includes('github.com') || !cleanUrl.includes('/pull/')) {
      useDashboardStore.setState({ historyError: new Error('Please enter a valid GitHub PR URL') });
      return;
    }
    analyzePr(cleanUrl).then(() => setUrl('')).catch(() => {});
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 sm:py-32 text-center px-4 w-full relative">
      {/* Glow + grid backdrop */}
      <div
        className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[420px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at top, rgba(124,58,237,0.12) 0%, transparent 65%)', filter: 'blur(60px)' }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 hero-grid pointer-events-none" aria-hidden="true" />

      <div className="relative flex flex-col items-center w-full">
        <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center mb-8 animate-[reveal-up_0.4s_ease-out_forwards]"
          style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.35)', color: '#9457f5', boxShadow: '0 0 60px rgba(124,58,237,0.2)' }}>
          <svg className="w-8 h-8" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M13 6h3a2 2 0 0 1 2 2v7" /><path d="M6 9v9" /><path d="M13 15c-2.5 0-4.5 0-6 0" /></svg>
        </div>

        <h2 className="text-[clamp(28px,4vw,40px)] font-bold text-[#f3f3f6] light:text-[#18181f] mb-4 tracking-tight animate-[reveal-up_0.5s_ease-out_forwards]" style={{ fontFamily: 'var(--font-display)' }}>
          Analyze a Pull Request
        </h2>
        <p className="text-[15px] text-[#9b9ba8] light:text-[#5d5d6a] max-w-lg mb-10 leading-relaxed animate-[reveal-up_0.6s_ease-out_forwards]">
          Paste a GitHub Pull Request URL below to generate an AI-powered summary, review key file changes, and detect potential risks before merging.
        </p>

        <div className="w-full max-w-xl animate-[reveal-up_0.7s_ease-out_forwards] relative">
          {historyError && (
            <p className="text-[13px] text-red-400 text-center sm:text-left mb-2 absolute -top-6 left-0">
              {historyError.message}
            </p>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 w-full rounded-xl p-[6px]"
            style={{ background: 'var(--prl-panel)', border: '1px solid var(--prl-border)' }}>
            <input
              type="url"
              placeholder="https://github.com/owner/repo/pull/123"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-transparent border-none text-[15px] text-[#f3f3f6] light:text-[#18181f] px-4 py-3 sm:py-2 outline-none w-full placeholder:text-[#6b6b78] placeholder:light:text-[#82828e] rounded-lg min-w-0"
              autoComplete="off"
              spellCheck={false}
              required
              aria-label="GitHub Pull Request URL"
            />
            <button
              type="submit"
              className="relative overflow-hidden flex shrink-0 items-center justify-center gap-2 px-[22px] py-[12px] min-h-[44px] w-full sm:w-auto rounded-lg font-medium text-white transition hover:bg-[#8b5cf6] active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed"
              style={{ background: '#7c3aed' }}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <div
                    className="absolute left-0 top-0 h-full bg-white/15 transition-all duration-700 ease-out"
                    style={{ width: `${analysisProgress}%` }}
                  />
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <span className="w-[18px] h-[18px] border-2 border-white/90 border-t-transparent rounded-full animate-spin" />
                    {analysisProgress > 0 ? `${analysisProgress}% - ` : ''}{analysisPhase || "Analyzing..."}
                  </div>
                </>
              ) : (
                <>
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  Analyze PR
                </>
              )}
            </button>
          </form>
          <p className="mt-5 text-[13px] font-medium text-[#6b6b78] light:text-[#82828e]">
            Free to use <span className="mx-2 text-[#232330] light:text-[#c1c1cd]">·</span>
            Works with public repos <span className="mx-2 text-[#232330] light:text-[#c1c1cd]">·</span>
            <span className="text-[#9b9ba8] light:text-[#5d5d6a] font-semibold">Login for private repos</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyzeForm;
