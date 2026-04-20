import React from 'react';

const Preview = () => (
  <section className="py-[120px] bg-[#0f0f13] relative overflow-hidden">
    <div className="max-w-[1100px] mx-auto px-6">
      <h2 className="text-[32px] md:text-[40px] font-bold text-center tracking-tight mb-[80px] reveal opacity-0 text-white">See PRLens in action</h2>
      <div className="relative max-w-[900px] mx-auto reveal opacity-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-violet-600/20 to-purple-600/20 filter blur-[100px] z-0"></div>
        <div className="relative z-10 flex flex-col md:flex-row bg-[#161618] border border-white/10 rounded-[16px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.6)] h-auto md:h-[560px]">
          <div className="hidden md:flex w-[60px] bg-[#0b0b0f] border-r border-white/5 flex-col items-center py-4 flex-shrink-0">
            <div className="w-10 h-10 flex items-center justify-center text-violet-400 bg-white/5 rounded-xl mb-2"><svg className="w-5 h-5" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
            <div className="w-10 h-10 flex items-center justify-center text-[#71717A]"><svg className="w-5 h-5" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>
            <div className="w-10 h-10 flex items-center justify-center text-[#71717A]"><svg className="w-5 h-5" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"/><path d="M12 7v5l3 3"/></svg></div>
          </div>
          
          <div className="flex-1 p-8 md:overflow-y-auto">
            <div className="mb-6">
              <div className="text-[13px] font-medium text-[#A1A1AA] mb-1">prisma/prisma #19843</div>
              <div className="text-[24px] font-semibold text-white">feat: add edge runtime support</div>
            </div>
            
            <div className="bg-[#1a1a1f] border border-white/10 rounded-xl p-6 mb-8">
              <div className="text-[13px] font-bold text-violet-400 uppercase tracking-wider mb-2 flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> AI Summary</div>
              <div className="text-[15px] text-[#E4E4E7] leading-relaxed">Adds lightweight client for Edge runtimes (Vercel, Cloudflare). Removes Node.js-specific dependencies, introduces fetch-based engine communication, and maintains API compatibility with existing Prisma Client.</div>
            </div>

            <div>
              <div className="text-[13px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-3">Key changes</div>
              <div className="flex flex-col gap-3">
                {[
                  { file: 'packages/client/edge.ts', desc: 'New edge-optimized client entry point' },
                  { file: 'packages/engine-core/fetch.ts', desc: 'Implements fetch transport for queries' },
                  { file: 'docs/edge.md', desc: 'Documents limitations and setup' }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 p-3 bg-[#161618] border border-white/5 rounded-lg">
                    <div className="hidden sm:block text-[#A1A1AA] mt-0.5"><svg className="w-4 h-4" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
                    <div>
                      <div className="text-[14px] font-medium text-white font-mono sm:mb-0.5 break-all">{item.file}</div>
                      <div className="text-[13px] text-[#A1A1AA]">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full md:w-[320px] bg-[#0b0b0f] border-t md:border-t-0 md:border-l border-white/5 flex flex-col h-[300px] md:h-auto">
            <div className="p-4 border-b border-white/5 text-[14px] font-semibold text-white">Chat with PR</div>
            <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto w-full">
              <div className="bg-[#1a1a1f] text-white p-3 rounded-xl rounded-tl-sm text-[14px] leading-relaxed border border-white/5 w-fit max-w-[90%]">This PR adds Edge runtime support while keeping the same API.</div>
              <div className="bg-violet-600 text-white p-3 rounded-xl rounded-tr-sm text-[14px] leading-relaxed w-fit max-w-[90%] self-end">Any breaking changes?</div>
              <div className="bg-[#1a1a1f] text-white p-3 rounded-xl rounded-tl-sm text-[14px] leading-relaxed border border-white/5 w-fit max-w-[90%]">No breaking changes for standard usage. Raw queries are limited on Edge.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
export default Preview;