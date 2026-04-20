import React from 'react';

const Features = () => (
  <section className="py-[120px] bg-[#0f0f13]">
    <div className="max-w-[1100px] mx-auto px-6">
      <h2 className="text-[32px] font-bold text-center tracking-tight mb-[80px] reveal opacity-0">What you get</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "PR Summary", desc: "Clear explanation of what changed and why", delay: "0.05s", icon: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /> },
          { title: "File Breakdown", desc: "Understand each file without reading diffs", delay: "0.1s", icon: <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" /> },
          { title: "Risk Detection", desc: "Spot breaking changes and security issues", delay: "0.15s", icon: <><path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" /><path d="M12 8v4" /><path d="M12 16h.01" /></> },
          { title: "Tradeoffs", desc: "See performance and complexity implications", delay: "0.2s", icon: <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /> },
          { title: "Review Checklist", desc: "Actionable items before merging", delay: "0.25s", icon: <path d="m9 11 3 3L22 4" /> },
          { title: "Follow-up Chat", desc: "Ask anything about the PR context", delay: "0.3s", icon: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /> }
        ].map((f, i) => (
          <div key={i} className="bg-[#161618] border border-white/10 rounded-xl p-8 hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-[0_12px_40px_rgba(124,58,237,0.1)] transition duration-300 reveal opacity-0" style={{ transitionDelay: f.delay }}>
            <div className="w-10 h-10 bg-violet-600/10 text-violet-400 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">{f.icon}</svg>
            </div>
            <h3 className="text-[18px] font-semibold text-white mb-2">{f.title}</h3>
            <p className="text-[15px] text-[#A1A1AA] leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
export default Features;