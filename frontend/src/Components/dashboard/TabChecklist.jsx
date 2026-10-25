import React, { useState, useEffect } from 'react';
import { Check, ListChecks } from 'lucide-react';

const storageKey = (prId) => `prlens_checklist_${prId}`;

const TabChecklist = ({ activePR }) => {
  const prId = activePR?.pr_id;

  let parsedChecklist = activePR?.analysis?.checklist || [];
  if (typeof parsedChecklist === 'string') {
    try { parsedChecklist = JSON.parse(parsedChecklist); } catch { /* Not JSON */ }
  }

  const checklistItems = Array.isArray(parsedChecklist)
    ? parsedChecklist.filter(item => item && typeof item === 'string' && item.toLowerCase() !== 'none')
    : typeof parsedChecklist === 'string' && parsedChecklist.toLowerCase() !== 'none'
      ? parsedChecklist.split('\n').filter(item => item.trim())
      : [];

  const [checked, setChecked] = useState({});

  useEffect(() => {
    if (!prId) return;
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey(prId)) || '{}');
      setChecked(saved);
    } catch {
      setChecked({});
    }
  }, [prId]);

  const toggleItem = (item) => {
    setChecked(prev => {
      const next = { ...prev, [item]: !prev[item] };
      try { localStorage.setItem(storageKey(prId), JSON.stringify(next)); } catch { /* storage unavailable */ }
      return next;
    });
  };

  const doneCount = checklistItems.filter(item => checked[item]).length;

  return (
    <div className="animate-[reveal-up_0.4s_ease-out_forwards] space-y-6">
      <div className="bg-[var(--prl-bg-soft)] border border-[var(--prl-border)] rounded-lg p-6 relative overflow-hidden transition-all duration-300 hover:border-[#2a2a38] hover:light:border-[#d9d9e3]">
        <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: 'linear-gradient(90deg, #10b981, transparent)', opacity: 0.8 }}></div>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 rounded-md flex items-center justify-center text-emerald-400 shrink-0 bg-emerald-500/10 border border-emerald-500/25">
              <ListChecks className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-[var(--prl-text)] tracking-tight" >Reviewer Checklist</h3>
              <p className="text-xs text-[var(--prl-text-dim)] mt-1">Items to verify before approving this PR.</p>
            </div>
          </div>
          {checklistItems.length > 0 && (
            <span
              className="shrink-0 text-[12px] font-semibold px-[12px] py-[6px] rounded"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: doneCount === checklistItems.length ? 'var(--prl-ok)' : 'var(--prl-text-dim)' }}
            >
              {doneCount}/{checklistItems.length} done
            </span>
          )}
        </div>

        {checklistItems.length > 0 ? (
          <ul className="space-y-3">
            {checklistItems.map((item) => {
              const isChecked = !!checked[item];
              return (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => toggleItem(item)}
                    aria-pressed={isChecked}
                    className={`w-full flex gap-3.5 items-start p-4 sm:p-5 rounded-md transition-all duration-300 text-left group ${isChecked ? 'bg-emerald-500/5 border border-emerald-500/25' : 'bg-[var(--prl-bg-soft)] border border-[var(--prl-border)] hover:border-emerald-500/30 hover:bg-emerald-500/5'}`}
                  >
                    <span className={`w-5 h-5 shrink-0 mt-0.5 rounded-md flex items-center justify-center transition-all duration-300 ${isChecked ? 'bg-emerald-500 border border-emerald-500' : 'border-2 border-[#3a3a46] light:border-[#c9c9d4] group-hover:border-emerald-400/70'}`}>
                      {isChecked && <Check className="w-3.5 h-3.5 text-[#09090b]" strokeWidth={3} />}
                    </span>
                    <span className={`text-[14px] sm:text-[15px] leading-relaxed break-words min-w-0 transition-colors ${isChecked ? 'text-[var(--prl-text-faint)] line-through decoration-[#3a3a46]' : 'text-[var(--prl-text)] group-hover:text-[var(--prl-text-primary)]'}`}>
                      {item.replace(/^[•\-*]\s*/, '')}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-5 bg-[var(--prl-bg-soft)] border border-[var(--prl-border)] rounded-md text-[14px] text-[var(--prl-text-dim)] flex items-center justify-center">
            No checklist items available.
          </div>
        )}
      </div>
    </div>
  );
};
export default TabChecklist;
