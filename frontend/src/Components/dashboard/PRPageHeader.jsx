import React, { memo } from 'react';

const PRPageHeader = memo(({ activePR }) => {
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
  const date = activePR.analyzed_at
    ? new Date(activePR.analyzed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  let fileCount = 0;
  let fileExplanations = activePR.analysis?.file_explanations;
  if (typeof fileExplanations === 'string') {
    try { fileExplanations = JSON.parse(fileExplanations); } catch { fileExplanations = null; }
  }
  if (fileExplanations && typeof fileExplanations === 'object') {
    fileCount = Object.entries(fileExplanations).filter(([_, v]) => v && typeof v === 'string' && v.toLowerCase() !== 'none').length;
  }

  return (
    <div className="mb-6 pt-2 lg:pt-6">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a3cc00] light:text-[#ccff00] mb-2">
        {repoDisplay} {prNumDisplay}
      </div>
      <h1
        className="text-[clamp(22px,3vw,30px)] font-bold text-[#fafafa] light:text-[#18181f] tracking-tight leading-tight mb-5 break-words"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {prTitle}
      </h1>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        {/* Author */}
        <span className="flex items-center gap-2 min-w-0">
          <span className="w-6 h-6 rounded-full overflow-hidden border border-[#27272a] light:border-[#27272a] shrink-0 bg-[#18181b] light:bg-[#f1f1f6] flex items-center justify-center text-[10px] font-semibold text-[#a1a1aa] light:text-[#5d5d6a]">
            {activePR.author ? (
              <img src={`https://github.com/${activePR.author}.png`} alt={activePR.author} className="w-full h-full object-cover" />
            ) : (
              <span className="uppercase">?</span>
            )}
          </span>
          <span className="text-[13px] font-medium text-[#a1a1aa] light:text-[#5d5d6a] truncate">{activePR.author || 'Unknown author'}</span>
        </span>

        {/* Analyzed status */}
        {date && (
          <span className="flex items-center gap-2 text-[13px] text-[#a1a1aa] light:text-[#5d5d6a]">
            <span
              className="w-[7px] h-[7px] rounded-full bg-[#4ade80] shrink-0"
              style={{ animation: 'prl-pulse 2s ease-in-out infinite' }}
            />
            Analyzed {date}
          </span>
        )}

        {/* Files */}
        {fileCount > 0 && (
          <span className="flex items-center gap-1.5 text-[13px] text-[#a1a1aa] light:text-[#5d5d6a]">
            <svg className="w-3.5 h-3.5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
            {fileCount} {fileCount === 1 ? 'file' : 'files'}
          </span>
        )}

        <span className="flex-1" />

        {/* GitHub link */}
        <a
          href={activePR.github_pr_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-[14px] py-[7px] rounded-full text-[12px] font-semibold transition hover:brightness-110 whitespace-nowrap"
          style={{ background: 'rgba(204,255,0,0.12)', border: '1px solid rgba(204,255,0,0.35)', color: '#a3cc00' }}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
          View on GitHub
        </a>
      </div>
    </div>
  );
});

export default PRPageHeader;
