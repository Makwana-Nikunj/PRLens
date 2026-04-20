import React from 'react';
import { AlertTriangle, ShieldAlert, Scale, CheckCircle2 } from 'lucide-react';

const TabRisks = ({ activePR }) => {
  let parsedRisks = activePR?.analysis?.risks || [];
  if (typeof parsedRisks === 'string') {
    try { parsedRisks = JSON.parse(parsedRisks); } catch (e) { /* Not JSON */ }
  }

  let parsedTradeoffs = activePR?.analysis?.tradeoffs || [];
  if (typeof parsedTradeoffs === 'string') {
    try { parsedTradeoffs = JSON.parse(parsedTradeoffs); } catch (e) { /* Not JSON */ }
  }

  const risksList = Array.isArray(parsedRisks)
    ? parsedRisks.filter(r => r && typeof r === 'string' && r.toLowerCase() !== 'none')
    : typeof parsedRisks === 'string' && parsedRisks.toLowerCase() !== 'none' ? parsedRisks.split('\n').filter(r => r.trim()) : [];

  const tradeoffsList = Array.isArray(parsedTradeoffs)
    ? parsedTradeoffs.filter(t => t && typeof t === 'string' && t.toLowerCase() !== 'none')
    : typeof parsedTradeoffs === 'string' && parsedTradeoffs.toLowerCase() !== 'none' ? parsedTradeoffs.split('\n').filter(t => t.trim()) : [];

  return (
    <div className="animate-[reveal-up_0.4s_ease-out_forwards] space-y-6">

      {/* Risks Section */}
      <div className="bg-[#161618] border border-[#1a1a1f] rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-red-500/5 hover:border-[#2a2a2f]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-400 opacity-70"></div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Potential Risks</h3>
            <p className="text-xs text-[#A1A1AA] mt-1">Identified security, performance, or bug vulnerabilities.</p>
          </div>
        </div>

        {risksList.length > 0 ? (
          <ul className="space-y-3">
            {risksList.map((risk, idx) => (
              <li key={idx} className="flex gap-3.5 p-4 sm:p-5 bg-red-500/5 border border-red-500/10 rounded-xl hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300 group">
                <AlertTriangle className="w-5 h-5 text-red-400/80 shrink-0 mt-0.5 group-hover:text-red-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[14px] sm:text-[15px] text-[#E4E4E7] leading-relaxed group-hover:text-white transition-colors">{typeof risk === 'string' ? risk.replace(/^[•\-\*]\s*/, '') : JSON.stringify(risk)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-5 bg-green-500/5 border border-green-500/20 rounded-xl text-[14px] text-green-400 flex items-center justify-center gap-3 font-medium">
            <CheckCircle2 className="w-5 h-5 text-green-500" /> No major risks identified. Lookin' good!
          </div>
        )}
      </div>

      {/* Tradeoffs Section */}
      {tradeoffsList.length > 0 && (
        <div className="bg-[#161618] border border-[#1a1a1f] rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-yellow-500/5 hover:border-[#2a2a2f]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-amber-400 opacity-70"></div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Tradeoffs</h3>
              <p className="text-xs text-[#A1A1AA] mt-1">Design and implementation compromises made.</p>
            </div>
          </div>

          <ul className="space-y-3">
            {tradeoffsList.map((tradeoff, idx) => (
              <li key={idx} className="flex gap-3.5 p-4 sm:p-5 bg-yellow-500/5 border border-yellow-500/10 rounded-xl hover:bg-yellow-500/10 hover:border-yellow-500/30 transition-all duration-300 group">
                <AlertTriangle className="w-5 h-5 text-yellow-400/80 shrink-0 mt-0.5 group-hover:text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[14px] sm:text-[15px] text-[#E4E4E7] leading-relaxed group-hover:text-white transition-colors">{typeof tradeoff === 'string' ? tradeoff.replace(/^[•\-\*]\s*/, '') : JSON.stringify(tradeoff)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
};
export default TabRisks;