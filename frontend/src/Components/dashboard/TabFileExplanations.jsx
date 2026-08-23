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
      <div className="bg-[#16161d] light:bg-[#f1f1f6] border border-[#232330] light:border-[#e3e3ec] rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:border-[#2a2a38] hover:light:border-[#d9d9e3]">
        <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: 'linear-gradient(90deg, #6366f1, transparent)', opacity: 0.8 }}></div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-indigo-400 light:text-indigo-600 shrink-0 bg-indigo-500/10 border border-indigo-500/25">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#f3f3f6] light:text-[#18181f] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>File Explanations</h3>
            <p className="text-xs text-[#9b9ba8] light:text-[#5d5d6a] mt-1">AI-generated explanations for each changed file.</p>
          </div>
        </div>

        {entries.length > 0 ? (
          <div className="space-y-3">
            {entries.map(([filename, explanation]) => {
              const isOpen = openFiles[filename] !== false;
              return (
                <div key={filename} className="border border-indigo-500/15 bg-indigo-500/5 rounded-xl overflow-hidden transition-all duration-200 hover:border-indigo-500/30">
                  <button
                    onClick={() => toggleFile(filename)}
                    className="w-full flex items-center gap-3 p-4 sm:p-5 text-left transition-colors hover:bg-indigo-500/10"
                  >
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-indigo-400 light:text-indigo-600 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-indigo-400 light:text-indigo-600 shrink-0" />
                    )}
                    <FileCode2 className="w-4 h-4 text-indigo-400/70 light:text-indigo-600/70 shrink-0" />
                    <span className="text-[14px] sm:text-[15px] text-[#f3f3f6] light:text-[#18181f] font-medium truncate">{filename}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1">
                      <p className="text-[14px] sm:text-[15px] text-[#E4E4E7] light:text-[#2a2a33] leading-relaxed whitespace-pre-wrap break-words overflow-x-auto min-w-0 bg-[#0d0d12] light:bg-[#f4f4f9] p-4 rounded-lg border border-[#232330] light:border-[#e3e3ec]">
                        {explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-5 bg-[#0d0d12] light:bg-[#f4f4f9] border border-[#232330] light:border-[#e3e3ec] rounded-xl text-[14px] text-[#9b9ba8] light:text-[#5d5d6a] flex items-center justify-center">
            No file explanations available.
          </div>
        )}
      </div>
    </div>
  );
};
export default TabFileExplanations;
