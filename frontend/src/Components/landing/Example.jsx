import React from 'react';

const Example = () => (
  <section className="py-[100px] border-y border-white/10 bg-[#161618]">
    <div className="max-w-[760px] mx-auto px-6">
      <div className="bg-[#1a1a1f] border border-white/10 rounded-[14px] p-6 md:p-10 reveal opacity-0 example-card shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
        <div className="inline-flex items-center gap-[6px] text-violet-400 bg-violet-600/10 px-3 py-1.5 rounded-full text-[13px] font-medium border border-violet-500/20 mb-6 w-max">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
          Example analysis
        </div>
        <div className="text-[18px] md:text-[20px] font-semibold text-white mb-4 leading-tight">vercel/next.js #58492 — refactor image optimizer</div>
        <p className="text-[15px] leading-[1.6] text-[#A1A1AA] mb-8">Refactors the Next.js Image component to move decoding off the main thread using Web Workers. Improves LCP by ~40ms on image-heavy pages, adds new config flag for opt-in during migration, and includes comprehensive WebP/AVIF edge case tests.</p>
        
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="inline-flex items-center gap-[6px] px-3 py-1.5 rounded-[8px] text-[13px] font-medium border bg-red-500/10 text-red-500 border-red-500/20"><span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0"></span>High — potential breaking API change</span>
          <span className="inline-flex items-center gap-[6px] px-3 py-1.5 rounded-[8px] text-[13px] font-medium border bg-amber-500/10 text-amber-500 border-amber-500/20"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0"></span>Medium — increased bundle size</span>
        </div>

        <div className="text-[13px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-4">File changes</div>
        <div className="flex flex-col gap-2">
          {[['packages/next/src/image.tsx', 'moves decoding to worker thread'], ['packages/next/src/server/config.ts', 'adds new optimizer flag']].map(([file, desc], i) => (
            <div key={i} className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 p-3 bg-[#0f0f13] rounded-lg border border-white/5">
              <span className="text-[14px] text-white font-mono break-all">{file}</span>
              <span className="text-[14px] text-[#71717A] md:shrink-0">— {desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
export default Example;