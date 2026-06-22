import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
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
      <div className="w-20 h-20 bg-violet-600/30 border border-violet-500/20 rounded-2xl flex items-center justify-center mb-8 text-violet-400 shadow-[0_0_40px_rgba(124,58,237,0.15)] animate-[reveal-up_0.4s_ease-out_forwards]">
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" /></svg>
      </div>
      <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight animate-[reveal-up_0.5s_ease-out_forwards]">Analyze a Pull Request</h2>
      <p className="text-[15px] text-[#A1A1AA] max-w-lg mb-10 leading-relaxed animate-[reveal-up_0.6s_ease-out_forwards]">
        Paste a GitHub Pull Request URL below to generate an AI-powered summary, review key file changes, and detect potential risks before merging.
      </p>
      
      <div className="w-full max-w-xl animate-[reveal-up_0.7s_ease-out_forwards] relative">
        {historyError && (
          <p className="text-[13px] text-red-400 text-center sm:text-left mb-2 absolute -top-6 left-0">
            {historyError.message}
          </p>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full">
          <Input
            variant="secondary"
            type="url"
            placeholder="https://github.com/owner/repo/pull/123"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full"
            required
          />
          <Button
            variant="secondary"
            type="submit"
            className="w-full sm:w-auto shrink-0 relative overflow-hidden"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <div 
                  className="absolute left-0 top-0 h-full bg-violet-200/50 transition-all duration-700 ease-out z-0" 
                  style={{ width: `${analysisProgress}%` }}
                />
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span> 
                  {analysisProgress > 0 ? `${analysisProgress}% - ` : ''}{analysisPhase || "Analyzing..."}
                </div>
              </>
            ) : (
              <><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg> Analyze PR</>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AnalyzeForm;
