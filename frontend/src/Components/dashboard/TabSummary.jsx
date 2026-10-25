import React from 'react';
import { Sparkles, Clock } from 'lucide-react';

const TabSummary = ({ activePR }) => {
  const summaryText = activePR?.analysis?.summary || "No PR Summary available.";
  const date = activePR?.analyzed_at ? new Date(activePR.analyzed_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown date';

  return (
    <div className="animate-[reveal-up_0.4s_ease-out_forwards] space-y-6">
      <div className="bg-[var(--prl-bg-soft)] border border-[var(--prl-border)] rounded-lg p-6 relative overflow-hidden group transition-all duration-300 hover:border-[#2a2a38] hover:light:border-[#d9d9e3]">
        <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: 'linear-gradient(90deg, #ccff00, transparent)', opacity: 0.8 }}></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md flex items-center justify-center text-[var(--prl-accent)] bg-[#ccff00]/10 border border-[#ccff00]/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--prl-text)] tracking-tight" >AI Summary</h3>
              <p className="text-xs text-[var(--prl-text-dim)] flex items-center gap-1.5 mt-1">
                <Clock className="w-3.5 h-3.5" /> Analyzed on {date}
              </p>
            </div>
          </div>
        </div>

        <div className="text-[15px] text-[var(--prl-text)] leading-relaxed whitespace-pre-wrap break-words overflow-x-auto bg-[var(--prl-bg-soft)] p-5 sm:p-6 rounded-md border border-[var(--prl-border)]">
          {summaryText}
        </div>
      </div>
    </div>
  );
};
export default TabSummary;
