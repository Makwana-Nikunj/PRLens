import React from 'react';
import { Sparkles, Clock } from 'lucide-react';

const TabSummary = ({ activePR }) => {
  const summaryText = activePR?.analysis?.summary || "No PR Summary available.";
  const date = activePR?.analyzed_at ? new Date(activePR.analyzed_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown date';

  return (
    <div className="animate-[reveal-up_0.4s_ease-out_forwards] space-y-6">
      <div className="bg-[#161618] border border-[#1a1a1f] rounded-2xl p-6 shadow-xl relative overflow-hidden group transition-all duration-300 hover:shadow-violet-500/5 hover:border-[#2a2a2f]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 to-purple-400 opacity-70"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center text-violet-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">AI Summary</h3>
              <p className="text-xs text-[#A1A1AA] flex items-center gap-1.5 mt-1">
                <Clock className="w-3.5 h-3.5" /> Analyzed on {date}
              </p>
            </div>
          </div>
        </div>

        <div className="text-[15px] text-[#E4E4E7] leading-relaxed whitespace-pre-wrap bg-[#0f0f13]/50 p-5 sm:p-6 rounded-xl border border-white/5">
          {summaryText}
        </div>
      </div>
    </div>
  );
};
export default TabSummary;