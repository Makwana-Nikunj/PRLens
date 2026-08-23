import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, Scale, CheckCircle2, ChevronDown } from 'lucide-react';

const parseMaybeJson = (value) => {
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { /* Not JSON */ }
  }
  return value;
};

const toList = (parsed) => {
  if (Array.isArray(parsed)) {
    return parsed.filter(r => r && typeof r === 'string' && r.toLowerCase() !== 'none');
  }
  if (typeof parsed === 'string' && parsed.toLowerCase() !== 'none') {
    return parsed.split('\n').filter(r => r.trim());
  }
  return [];
};

const CollapsibleCard = ({ icon, tileStyle, tileClass, title, subtitle, items, itemClass, emptyState }) => {
  const [open, setOpen] = useState(false);

  if (items.length === 0 && emptyState) {
    return (
      <div className="bg-[#16161d] light:bg-[#f1f1f6] border border-[#232330] light:border-[#e3e3ec] rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:border-[#2a2a38] hover:light:border-[#d9d9e3]">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tileClass}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#f3f3f6] light:text-[#18181f] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
            <p className="text-xs text-[#9b9ba8] light:text-[#5d5d6a] mt-1">{subtitle}</p>
          </div>
        </div>
        {emptyState}
      </div>
    );
  }

  return (
    <div className="bg-[#16161d] light:bg-[#f1f1f6] border border-[#232330] light:border-[#e3e3ec] rounded-2xl relative overflow-hidden transition-all duration-300 hover:border-[#2a2a38] hover:light:border-[#d9d9e3]">
      <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: tileStyle, opacity: 0.8 }} aria-hidden="true" />
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-4 p-6 text-left transition-colors hover:bg-white/[0.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#9457f5] rounded-2xl"
      >
        <div className="flex-1 min-w-0 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tileClass}`}>
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-bold text-[#f3f3f6] light:text-[#18181f] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
              {items.length > 0 && (
                <span className="shrink-0 text-[11px] font-semibold px-[10px] py-[3px] rounded-full bg-[#232330] light:bg-[#e5e5ee] text-[#9b9ba8] light:text-[#5d5d6a] tabular-nums">
                  {items.length}
                </span>
              )}
            </div>
            <p className="text-xs text-[#9b9ba8] light:text-[#5d5d6a] mt-1">{subtitle}</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''} text-[#6b6b78] light:text-[#82828e]`} aria-hidden="true" />
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden min-h-0">
          <ul className="space-y-3 px-6 pb-6">
            {items.map((item, idx) => (
              <li key={idx} className={itemClass.row}>
                <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300 ${itemClass.icon}`} />
                <span className="text-[14px] sm:text-[15px] text-[#E4E4E7] light:text-[#2a2a33] leading-relaxed group-hover:text-white group-hover:light:text-[#2a2a33] transition-colors break-words min-w-0">
                  {typeof item === 'string' ? item.replace(/^[•\-*]\s*/, '') : JSON.stringify(item)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const TabRisks = ({ activePR }) => {
  const risksList = toList(parseMaybeJson(activePR?.analysis?.risks || []));
  const tradeoffsList = toList(parseMaybeJson(activePR?.analysis?.tradeoffs || []));

  return (
    <div className="animate-[reveal-up_0.4s_ease-out_forwards] space-y-6">
      <CollapsibleCard
        icon={<ShieldAlert className="w-5 h-5 text-red-400" />}
        tileClass="bg-red-500/10 border border-red-500/25"
        tileStyle="linear-gradient(90deg, #ef4444, transparent)"
        title="Potential Risks"
        subtitle="Identified security, performance, or bug vulnerabilities."
        items={risksList}
        itemClass={{
          row: 'group flex gap-3.5 p-4 sm:p-5 bg-red-500/5 border border-red-500/10 rounded-xl hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300',
          icon: 'text-red-400/80 group-hover:text-red-400',
        }}
        emptyState={
          <div className="p-5 bg-green-500/5 border border-green-500/20 rounded-xl text-[14px] text-green-400 flex items-center justify-center gap-3 font-medium">
            <CheckCircle2 className="w-5 h-5 text-green-500" /> No major risks identified. Lookin' good!
          </div>
        }
      />

      {tradeoffsList.length > 0 && (
        <CollapsibleCard
          icon={<Scale className="w-5 h-5 text-amber-400" />}
          tileClass="bg-amber-500/10 border border-amber-500/25"
          tileStyle="linear-gradient(90deg, #f59e0b, transparent)"
          title="Tradeoffs"
          subtitle="Design and implementation compromises made."
          items={tradeoffsList}
          itemClass={{
            row: 'group flex gap-3.5 p-4 sm:p-5 bg-amber-500/5 border border-amber-500/10 rounded-xl hover:bg-amber-500/10 hover:border-amber-500/30 transition-all duration-300',
            icon: 'text-amber-400/80 group-hover:text-amber-400',
          }}
        />
      )}
    </div>
  );
};
export default TabRisks;
