import React, { memo } from 'react';
import useDashboardStore from '../../store/dashboardStore';

const Header = memo(({ activePR }) => {
  const setSidebarOpen = useDashboardStore(state => state.setSidebarOpen);

  const hamburger = (
    <button className="lg:hidden min-w-[44px] min-h-[44px] flex shrink-0 items-center justify-center rounded-lg text-[#a1a1aa] light:text-[#5d5d6a] hover:bg-[#18181b] hover:light:bg-[#ffffff] hover:text-[#fafafa] hover:light:text-[#18181f] transition" onClick={() => setSidebarOpen(true)}>
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></svg>
    </button>
  );

  if (!activePR) {
    return (
      <div className="h-[60px] border-b border-[#27272a] light:border-[#27272a] flex items-center justify-between px-4 sm:px-6 bg-[#09090b] light:bg-[#ffffff] flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 pr-4">
          {hamburger}
          <div className="flex flex-col min-w-0 leading-tight">
            <h1 className="text-[16px] font-semibold text-[#fafafa] light:text-[#18181f] m-0 truncate" style={{ fontFamily: 'var(--font-display)' }}>Welcome to PRLens</h1>
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

  const prTitle = activePR.title?.trim() || (prNumDisplay ? `Pull Request ${prNumDisplay}` : 'Pull Request');

  // On desktop the in-content PRPageHeader replaces this bar; keep it on mobile for the sidebar trigger
  return (
    <div className="lg:hidden h-[60px] border-b border-[#27272a] light:border-[#27272a] flex items-center justify-between px-4 sm:px-6 bg-[#09090b] light:bg-[#ffffff] flex-shrink-0">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 pr-4">
        {hamburger}
        <div className="flex flex-col min-w-0 leading-tight">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a3cc00] light:text-[#ccff00] truncate">{repoDisplay} {prNumDisplay}</div>
          <h1 className="text-[15px] font-semibold text-[#fafafa] light:text-[#18181f] m-0 truncate" title={prTitle}>{prTitle}</h1>
        </div>
      </div>
    </div>
  );
});
export default Header;
