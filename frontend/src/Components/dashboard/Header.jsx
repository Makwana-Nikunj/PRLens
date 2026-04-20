import React from 'react';

const Header = ({ activePR, setSidebarOpen }) => {
  if (!activePR) {
    return (
      <div className="h-[60px] border-b border-[#1a1a1f] flex items-center justify-between px-4 sm:px-6 bg-[#0f0f13] flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 pr-4">
          <button className="md:hidden w-8 h-8 flex shrink-0 items-center justify-center rounded-lg text-[#A1A1AA] hover:bg-[#1a1a1f] hover:text-white transition" onClick={() => setSidebarOpen(true)}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></svg>
          </button>
          <div className="flex flex-col min-w-0 leading-tight">
            <h1 className="text-[16px] font-semibold text-[#E4E4E7] m-0 truncate">Welcome to PRLens</h1>
          </div>
        </div>
      </div>
    );
  }

  // Parse the GitHub URL to get repo and PR number
  let repoDisplay = '', prNumDisplay = '';
  try {
    if (activePR.github_pr_url) {
      const parts = activePR.github_pr_url.split('/');
      repoDisplay = `${parts[3]}/${parts[4]}`;
      prNumDisplay = `#${parts[6]}`;
    }
  } catch {
    // Ignore parsing errors
  }

  return (
    <div className="h-[60px] border-b border-[#1a1a1f] flex items-center justify-between px-4 sm:px-6 bg-[#0f0f13] flex-shrink-0">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 pr-4">
        <button className="md:hidden w-8 h-8 flex shrink-0 items-center justify-center rounded-lg text-[#A1A1AA] hover:bg-[#1a1a1f] hover:text-white transition" onClick={() => setSidebarOpen(true)}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></svg>
        </button>
        <div className="flex flex-col min-w-0 leading-tight">
          <h1 className="text-[16px] font-semibold text-[#E4E4E7] m-0 truncate">PR Insights</h1>
          <div className="text-[13px] text-[#A1A1AA] truncate">{repoDisplay} {prNumDisplay}</div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-3">
          <a href={activePR.github_pr_url} target="_blank" rel="noreferrer" className="px-2 py-0.5 rounded-md bg-violet-600/10 text-violet-400 hover:text-white hover:bg-violet-600/30 transition border border-violet-500/20 text-[12px] font-medium flex items-center gap-1.5 whitespace-nowrap">
            View on GitHub
          </a>
        </div>
        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0 bg-[#1a1a1f] flex items-center justify-center text-[#A1A1AA] text-xs font-semibold" title={activePR.author ? `PR by ${activePR.author}` : "Unknown Author"}>
          {activePR.author ? (
            <img src={`https://github.com/${activePR.author}.png`} alt={activePR.author} className="w-full h-full object-cover" />
          ) : (
            <span className="uppercase">{prNumDisplay?.replace('#', '') || '?'}</span>
          )}
        </div>
      </div>
    </div>
  );
};
export default Header;