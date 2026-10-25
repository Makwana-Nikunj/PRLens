import React, { useState } from 'react';
import { FileCode2, ChevronDown, ChevronRight } from 'lucide-react';

const TabFileExplanations = ({ activePR }) => {
  let fileExplanations = activePR?.analysis?.file_explanations || {};
  if (typeof fileExplanations === 'string') {
    try { fileExplanations = JSON.parse(fileExplanations); } catch { /* Not JSON */ }
  }
  const entries = Object.entries(fileExplanations).filter(([_, explanation]) => explanation && typeof explanation === 'string' && explanation.toLowerCase() !== 'none');
  const [openFiles, setOpenFiles] = useState({});

  const toggleFile = (filename) => {
    setOpenFiles(prev => ({ ...prev, [filename]: !prev[filename] }));
  };

  return (
    <div className="animate-[reveal-up_0.4s_ease-out_forwards] space-y-6">
      <div className="bg-[var(--prl-bg-soft)] border border-[var(--prl-border)] rounded-lg p-6 relative overflow-hidden transition-all duration-300 hover:border-[#2a2a38] hover:light:border-[#d9d9e3]">
        <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: 'linear-gradient(90deg, var(--prl-accent), transparent)', opacity: 0.8 }}></div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-md flex items-center justify-center text-[var(--prl-accent)] shrink-0 bg-[var(--prl-accent-soft)] border border-[var(--prl-accent-line)]">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--prl-text)] tracking-tight" >File Explanations</h3>
            <p className="text-xs text-[var(--prl-text-dim)] mt-1">AI-generated explanations for each changed file.</p>
          </div>
        </div>

        {entries.length > 0 ? (
          <div className="space-y-3">
            {entries.map(([filename, explanation]) => {
              const isOpen = openFiles[filename] !== false;
              return (
                <div key={filename} className="border border-[var(--prl-accent-line)] bg-[var(--prl-accent-soft)] rounded-md overflow-hidden transition-all duration-200 hover:border-[var(--prl-accent)]">
                  <button
                    onClick={() => toggleFile(filename)}
                    className="w-full flex items-center gap-3 p-4 sm:p-5 text-left transition-colors hover:bg-[var(--prl-accent-soft)]"
                  >
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-[var(--prl-accent)] shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[var(--prl-accent)] shrink-0" />
                    )}
                    <FileCode2 className="w-4 h-4 text-[var(--prl-accent)]/70 shrink-0" />
                    <span className="text-[14px] sm:text-[15px] text-[var(--prl-text)] font-medium truncate">{filename}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1">
                      <p className="text-[14px] sm:text-[15px] text-[var(--prl-text)] leading-relaxed whitespace-pre-wrap break-words overflow-x-auto min-w-0 bg-[var(--prl-bg-soft)] p-4 rounded-md border border-[var(--prl-border)]">
                        {explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-5 bg-[var(--prl-bg-soft)] border border-[var(--prl-border)] rounded-md text-[14px] text-[var(--prl-text-dim)] flex items-center justify-center">
            No file explanations available.
          </div>
        )}
      </div>
    </div>
  );
};
export default TabFileExplanations;
