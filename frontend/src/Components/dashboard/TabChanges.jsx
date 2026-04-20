import React from 'react';
import { FileCode2, CheckCircle2 } from 'lucide-react';

const TabChanges = ({ activePR }) => {
  let parsedChanges = activePR?.analysis?.key_changes || [];
  if (typeof parsedChanges === 'string') {
    try {
      parsedChanges = JSON.parse(parsedChanges);
    } catch (e) {
      // Not a JSON array string
    }
  }

  const changesList = Array.isArray(parsedChanges)
    ? parsedChanges
    : typeof parsedChanges === 'string' ? parsedChanges.split('\n').filter(c => c.trim()) : [];

  return (
    <div className="animate-[reveal-up_0.4s_ease-out_forwards]">
      <div className="bg-[#161618] border border-[#1a1a1f] rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-blue-500/5 hover:border-[#2a2a2f]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-70"></div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Key Changes</h3>
            <p className="text-xs text-[#A1A1AA] mt-1">Major architectural and logic changes found in the diff.</p>
          </div>
        </div>

        {changesList.length > 0 ? (
          <ul className="space-y-3">
            {changesList.map((change, idx) => (
              <li key={idx} className="flex gap-3.5 p-4 sm:p-5 bg-[#0f0f13]/50 border border-white/5 rounded-xl hover:border-blue-500/30 hover:bg-[#1a1a24] transition-all group">
                <CheckCircle2 className="w-5 h-5 text-blue-400/70 shrink-0 mt-0.5 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-300" />
                <span className="text-[14px] sm:text-[15px] text-[#E4E4E7] leading-relaxed group-hover:text-white transition-colors">{typeof change === 'string' ? change.replace(/^[•\-\*]\s*/, '') : JSON.stringify(change)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-5 bg-[#0f0f13]/50 border border-white/5 rounded-xl text-[14px] text-[#A1A1AA] flex items-center justify-center">
            No key changes documented.
          </div>
        )}
      </div>
    </div>
  );
};
export default TabChanges;