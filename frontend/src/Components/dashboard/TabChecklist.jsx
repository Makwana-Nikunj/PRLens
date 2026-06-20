import React from 'react';
import { CheckCircle2, ListChecks } from 'lucide-react';

const TabChecklist = ({ activePR }) => {
  let parsedChecklist = activePR?.analysis?.checklist || [];
  if (typeof parsedChecklist === 'string') {
    try { parsedChecklist = JSON.parse(parsedChecklist); } catch { /* Not JSON */ }
  }

  const checklistItems = Array.isArray(parsedChecklist)
    ? parsedChecklist.filter(item => item && typeof item === 'string' && item.toLowerCase() !== 'none')
    : typeof parsedChecklist === 'string' && parsedChecklist.toLowerCase() !== 'none'
      ? parsedChecklist.split('\n').filter(item => item.trim())
      : [];

  return (
    <div className="animate-[reveal-up_0.4s_ease-out_forwards] space-y-6">
      <div className="bg-[#161618] border border-[#1a1a1f] rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-emerald-500/5 hover:border-[#2a2a2f]">
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 opacity-70"></div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ListChecks className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Reviewer Checklist</h3>
            <p className="text-xs text-[#A1A1AA] mt-1">Items to verify before approving this PR.</p>
          </div>
        </div>

        {checklistItems.length > 0 ? (
          <ul className="space-y-3">
            {checklistItems.map((item, idx) => (
              <li key={idx} className="flex gap-3.5 p-4 sm:p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300 group">
                <CheckCircle2 className="w-5 h-5 text-emerald-400/70 shrink-0 mt-0.5 group-hover:text-emerald-400 group-hover:scale-110 transition-all duration-300" />
                <span className="text-[14px] sm:text-[15px] text-[#E4E4E7] leading-relaxed group-hover:text-white transition-colors break-words min-w-0">{item.replace(/^[•\-*]\s*/, '')}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-5 bg-[#0f0f13]/50 border border-white/5 rounded-xl text-[14px] text-[#A1A1AA] flex items-center justify-center">
            No checklist items available.
          </div>
        )}
      </div>
    </div>
  );
};

export default TabChecklist;
