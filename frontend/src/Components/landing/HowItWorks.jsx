import React from 'react';

const HowItWorks = () => (
  <section className="py-[100px] border-t border-white/10 bg-gradient-to-b from-[#0f0f13] to-[#161618]">
    <div className="max-w-[1100px] mx-auto px-6">
      <h2 className="text-[32px] font-bold text-center mb-[60px] tracking-tight reveal opacity-0">How it works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { num: "1", title: "Paste a GitHub PR URL", desc: "Copy any public pull request link", delay: "0.1s" },
          { num: "2", title: "AI analyzes the diff in seconds", desc: "Understands code changes and context", delay: "0.2s" },
          { num: "3", title: "Read insights or chat for deeper understanding", desc: "Ask follow-up questions instantly", delay: "0.3s" }
        ].map(step => (
          <div key={step.num} className="text-center p-6 reveal opacity-0" style={{ transitionDelay: step.delay }}>
            <div className="w-[48px] h-[48px] rounded-full bg-violet-600/10 text-violet-400 text-[20px] font-bold flex items-center justify-center mx-auto mb-5 border border-violet-500/20">{step.num}</div>
            <h3 className="text-[18px] font-semibold text-white mb-2">{step.title}</h3>
            <p className="text-[15px] text-[#A1A1AA] leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
export default HowItWorks;