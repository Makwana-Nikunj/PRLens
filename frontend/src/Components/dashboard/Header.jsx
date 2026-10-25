import React, { memo } from 'react';
import { Menu } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';

const Header = memo(({ activePR }) => {
  const setSidebarOpen = useDashboardStore(state => state.setSidebarOpen);

  const hamburger = (
    <button className="lg:hidden min-w-[44px] min-h-[44px] flex shrink-0 items-center justify-center rounded-md text-[var(--prl-text-dim)] hover:bg-[var(--prl-panel)] hover:text-[var(--prl-text)] transition" onClick={() => setSidebarOpen(true)}>
      <Menu className="w-5 h-5" />
    </button>
  );

  if (!activePR) {
    return (
      <div className="h-[60px] border-b border-[var(--prl-border)] flex items-center justify-between px-4 sm:px-6 bg-[var(--prl-bg)] flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 pr-4">
          {hamburger}
          <div className="flex flex-col min-w-0 leading-tight">
            <h1 className="text-[16px] font-semibold text-[var(--prl-text)] m-0 truncate font-display" >Welcome to PRLens</h1>
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
    <div className="lg:hidden h-[60px] border-b border-[var(--prl-border)] flex items-center justify-between px-4 sm:px-6 bg-[var(--prl-bg)] flex-shrink-0">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 pr-4">
        {hamburger}
        <div className="flex flex-col min-w-0 leading-tight">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--prl-accent-2)] truncate">{repoDisplay} {prNumDisplay}</div>
          <h1 className="text-[15px] font-semibold text-[var(--prl-text)] m-0 truncate font-display" title={prTitle}>{prTitle}</h1>
        </div>
      </div>
    </div>
  );
});
export default Header;
