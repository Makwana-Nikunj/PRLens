import React, { useState } from 'react';
import { FileCode2, CheckCircle2, ChevronDown } from 'lucide-react';

const TabChanges = ({ activePR }) => {
  const [open, setOpen] = useState(false);

  let parsedChanges = activePR?.analysis?.key_changes || [];
  if (typeof parsedChanges === 'string') {
    try {
      parsedChanges = JSON.parse(parsedChanges);
    } catch {
      // Not a JSON array string
    }
  }

  const changesList = Array.isArray(parsedChanges)
    ? parsedChanges
    : typeof parsedChanges === 'string' ? parsedChanges.split('\n').filter(c => c.trim()) : [];

  const header = (interactive) => (
    <div className={`flex items-center gap-4 ${interactive ? 'flex-1 min-w-0' : 'mb-6'}`}>
      <div className="w-10 h-10 rounded-md flex items-center justify-center text-[#ccff00]lue-400 shrink-0 bg-blue-500/10 border border-blue-500/25">
        <FileCode2 className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <h3 className="text-lg font-bold text-[#fafafa] light:text-[#18181f] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Key Changes</h3>
          {interactive && !open && changesList.length > 0 && (
            <span className="shrink-0 text-[11px] font-semibold px-[10px] py-[3px] rounded-full bg-[#27272a] light:bg-[#e5e5ee] text-[#a1a1aa] light:text-[#5d5d6a] tabular-nums">
              {changesList.length}
            </span>
          )}
        </div>
        <p className="text-xs text-[#a1a1aa] light:text-[#5d5d6a] mt-1">Major architectural and logic changes found in the diff.</p>
      </div>
    </div>
  );

  return (
    <div className="animate-[reveal-up_0.4s_ease-out_forwards]">
      <div className="bg-[#18181b] light:bg-[#f1f1f6] border border-[#27272a] light:border-[#27272a] rounded-lg relative overflow-hidden transition-all duration-300 hover:border-[#2a2a38] hover:light:border-[#d9d9e3]">
        <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: 'linear-gradient(90deg, #3b82f6, transparent)', opacity: 0.8 }}></div>

        {changesList.length > 0 ? (
          <>
            <button
              type="button"
              onClick={() => setOpen(v => !v)}
              aria-expanded={open}
              className="w-full flex items-center gap-4 p-6 text-left transition-colors hover:bg-white/[0.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#a3cc00] rounded-lg"
            >
              {header(true)}
              <ChevronDown
                className={`w-5 h-5 shrink-0 transition-transform duration-300 ${open ? 'rotate-180 text-[#ccff00]lue-400' : 'text-[#a1a1aa] light:text-[#82828e]'}`}
                aria-hidden="true"
              />
            </button>

            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden min-h-0">
                <ul className="space-y-3 px-6 pb-6">
                  {changesList.map((change, idx) => (
                    <li key={idx} className="flex gap-3.5 p-4 sm:p-5 bg-[#18181b] light:bg-[#f4f4f9] border border-[#27272a] light:border-[#27272a] rounded-md hover:border-blue-500/30 transition-all group overflow-x-auto">
                      <CheckCircle2 className="w-5 h-5 text-[#ccff00]lue-400/70 shrink-0 mt-0.5 group-hover:text-[#ccff00]lue-400 group-hover:scale-110 transition-all duration-300" />
                      <span className="text-[14px] sm:text-[15px] text-[#E4E4E7] light:text-[#2a2a33] leading-relaxed group-hover:text-white group-hover:light:text-[#2a2a33] transition-colors break-words min-w-0">{typeof change === 'string' ? change.replace(/^[•\-*]\s*/, '') : JSON.stringify(change)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : (
          <div className="p-6">
            {header(false)}
            <div className="p-5 bg-[#18181b] light:bg-[#f4f4f9] border border-[#27272a] light:border-[#27272a] rounded-md text-[14px] text-[#a1a1aa] light:text-[#5d5d6a] flex items-center justify-center">
              No key changes documented.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default TabChanges;
