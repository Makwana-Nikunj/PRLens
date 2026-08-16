import React from 'react';
import MouseGlow from './MouseGlow';
import PRInputForm from './PRInputForm';
import Typewriter from '../ui/Typewriter';

const fadeUpStyle = (delay) => ({
  animation: `prl-fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards ${delay}s`,
  opacity: 0,
});

const files = [
  { name: 'client/engine.ts', lang: 'TypeScript', dot: '#3178c6', add: 120, del: 31 },
  { name: 'schema.prisma', lang: 'Prisma', dot: '#16a394', add: 42, del: 8 },
  { name: 'README.md', lang: 'Markdown', dot: '#9b9ba8', add: 18, del: 4 },
];

const HeroPreviewCard = () => (
  <div
    className="mt-16 mx-auto rounded-2xl overflow-hidden relative w-full max-w-[800px] z-10 text-left"
    style={{
      animation: `prl-fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.5s, prl-float 6s ease-in-out infinite 1.6s`,
      opacity: 0,
      background: '#16161d',
      border: '1px solid #232330',
      boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 120px rgba(124,58,237,0.08)',
    }}
    aria-hidden="true"
  >
    {/* Browser chrome */}
    <div className="flex items-center gap-[6px] px-5 py-3 bg-[#131318] border-b border-[#232330]">
      <span className="w-[10px] h-[10px] rounded-full bg-[#232330]" />
      <span className="w-[10px] h-[10px] rounded-full bg-[#232330]" />
      <span className="w-[10px] h-[10px] rounded-full bg-[#232330]" />
      <span className="ml-3 text-[12px] text-[#6b6b78] font-medium truncate">prlens.app — analysis view</span>
    </div>

    {/* PR header */}
    <div className="p-6 md:p-8 border-b border-[#232330]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center gap-[6px] text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
            style={{ background: 'rgba(124,58,237,0.12)', color: '#9457f5' }}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            AI
          </span>
          <span className="text-[13px] font-medium text-[#9b9ba8]">prisma/prisma #23145</span>
        </div>
        <span className="inline-flex items-center gap-[6px] text-[12px] font-semibold text-[#4ade80]">
          <span
            className="w-[7px] h-[7px] rounded-full bg-[#4ade80]"
            style={{ animation: 'prl-pulse 2s ease-in-out infinite' }}
          />
          Analyzed in 4.2s
        </span>
      </div>

      <h3 className="text-[17px] md:text-[19px] font-semibold text-[#f3f3f6] mb-3">
        feat: add connection strategy for driver adapters
      </h3>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-medium">
        <span className="text-[#6b6b78]">12 files changed</span>
        <span className="text-[#4ade80]">+248</span>
        <span className="text-[#f87171]">−94</span>
      </div>
    </div>

    {/* AI summary */}
    <div className="p-6 md:p-8 border-b border-[#232330]">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-[#9457f5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z" />
        </svg>
        <span className="text-[12px] font-bold uppercase tracking-wider text-[#9b9ba8]">AI Summary</span>
      </div>
      <p className="text-[14px] leading-relaxed text-[#9b9ba8]">
        Introduces a pooled connection strategy so adapters reuse connections instead of opening one per query.
        The engine lifecycle is untouched — changes are additive and gated behind a flag.
      </p>

      <div
        className="mt-4 flex items-start gap-[10px] rounded-lg px-4 py-3"
        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
      >
        <svg className="w-4 h-4 text-[#fbbf24] shrink-0 mt-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
        <p className="text-[13px] leading-relaxed text-[#d4d4d8]">
          <span className="font-semibold text-[#fbbf24]">Medium risk</span>
          <span className="text-[#9b9ba8]"> — touches the connection lifecycle; custom adapters using the old API will break.</span>
        </p>
      </div>
    </div>

    {/* Files */}
    <div className="px-6 md:px-8 py-5 border-b border-[#232330]">
      <div className="text-[12px] font-bold uppercase tracking-wider text-[#6b6b78] mb-3">Changed files</div>
      <div className="space-y-[10px]">
        {files.map((f) => (
          <div key={f.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-[10px] min-w-0">
              <span className="w-[8px] h-[8px] rounded-full shrink-0" style={{ background: f.dot }} />
              <span className="text-[13px] font-medium text-[#d4d4d8] truncate">{f.name}</span>
            </span>
            <span className="flex items-center gap-3 text-[12px] font-semibold shrink-0 tabular-nums">
              <span className="text-[#4ade80]">+{f.add}</span>
              <span className="text-[#f87171]">−{f.del}</span>
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* Chat */}
    <div className="p-6 md:p-8 bg-[#141419]">
      <div className="flex justify-end mb-3">
        <p
          className="max-w-[80%] rounded-xl rounded-br-sm px-4 py-[10px] text-[13px] text-[#f3f3f6] leading-relaxed"
          style={{ background: 'rgba(124,58,237,0.25)' }}
        >
          Why does the pool size default to 10?
        </p>
      </div>
      <div className="flex justify-start">
        <p className="max-w-[85%] rounded-xl rounded-bl-sm px-4 py-[10px] text-[13px] text-[#9b9ba8] leading-relaxed bg-[#1d1d25]" style={{ border: '1px solid #232330' }}>
          It is set in <span className="text-[#9457f5] font-medium">createPool()</span> to match the default connection limit of most driver adapters — see engine.ts:142.
        </p>
      </div>
    </div>
  </div>
);

const Hero = () => (
  <header className="relative pt-[120px] md:pt-[180px] pb-[100px] text-center overflow-hidden bg-[#0a0a0d]">
    <MouseGlow />

    {/* Grid + glow backdrop */}
    <div className="absolute inset-0 hero-grid pointer-events-none z-0" aria-hidden="true" />
    <div
      className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] pointer-events-none z-0"
      style={{ background: 'radial-gradient(circle at top, rgba(124,58,237,0.12) 0%, transparent 60%)', filter: 'blur(80px)' }}
      aria-hidden="true"
    />

    <div className="relative z-10 w-full px-6 md:px-[60px] 2xl:px-[100px] max-w-[1100px] mx-auto">
      {/* Eyebrow */}
      <div className="inline-flex items-center gap-[6px] mb-6" style={fadeUpStyle(0)}>
        <span
          className="inline-flex items-center gap-[6px] text-[13px] font-semibold px-[14px] py-[6px] rounded-full border"
          style={{ background: 'rgba(124,58,237,0.12)', borderColor: 'rgba(124,58,237,0.35)', color: '#9457f5' }}
        >
          <span aria-hidden="true">✨</span> AI-powered PR analysis
        </span>
      </div>

      {/* Headline */}
      <h1
        className="font-bold tracking-[-0.03em] leading-[1.1] mb-6 mx-auto text-balance break-words min-h-[3.3em] md:min-h-0"
        style={{
          ...fadeUpStyle(0.1),
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(32px, 8vw, 72px)',
          maxWidth: '900px',
        }}
      >
        <Typewriter text="Understand any GitHub PR in seconds" delay={40} />
      </h1>

      {/* Subtext */}
      <p
        className="leading-relaxed mb-10 mx-auto text-[#9b9ba8]"
        style={{ ...fadeUpStyle(0.2), fontSize: 'clamp(16px, 2vw, 20px)', maxWidth: '640px' }}
      >
        Paste a pull request URL and get a clear AI-powered breakdown — summary, risks, file changes, and a chat to ask anything.
      </p>

      {/* Form */}
      <div style={fadeUpStyle(0.3)}>
        <PRInputForm />
      </div>

      {/* Trust line */}
      <p className="mt-5 text-[13px] font-medium text-[#6b6b78]" style={fadeUpStyle(0.4)}>
        Free to use <span className="mx-2 text-[#232330]">·</span>
        Works with public repos <span className="mx-2 text-[#232330]">·</span>
        <span className="text-[#9b9ba8] font-semibold">Login for private repos</span>
      </p>

      <HeroPreviewCard />
    </div>
  </header>
);

export default Hero;
