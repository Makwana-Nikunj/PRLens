import React from 'react';
import {
  Sparkles, FileCode2, ShieldAlert, Scale, ChevronDown,
  LayoutDashboard, ListChecks, FileText, Search, Plus,
} from 'lucide-react';
import MouseGlow from './MouseGlow';
import PRInputForm from './PRInputForm';
import Typewriter from '../ui/Typewriter';

const fadeUpStyle = (delay) => ({
  animation: `prl-fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards ${delay}s`,
  opacity: 0,
});

// Miniature of the real dashboard (same layout, tokens, and content structure)
const CollapsedRow = ({ icon: Icon, tileClass, strip, title, count }) => (
  <div className="relative overflow-hidden rounded-xl bg-[#16161d] border border-[#232330] px-3.5 py-2.5 flex items-center gap-3">
    <div className={`w-[22px] h-[22px] rounded-lg flex items-center justify-center shrink-0 ${tileClass}`}>
      <Icon className="w-[13px] h-[13px]" />
    </div>
    <span className="text-[12px] font-semibold text-[#f3f3f6]" style={{ fontFamily: 'var(--font-display)' }}>{title}</span>
    <span className="text-[9.5px] font-semibold px-[8px] py-[2px] rounded-full bg-[#232330] text-[#9b9ba8] tabular-nums">{count}</span>
    <ChevronDown className="w-[13px] h-[13px] text-[#6b6b78] ml-auto" />
    <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: strip, opacity: 0.8 }} />
  </div>
);

const HeroPreviewCard = () => (
  <div
    className="mt-16 mx-auto rounded-2xl overflow-hidden relative w-full max-w-[860px] z-10 text-left"
    style={{
      animation: `prl-fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.5s, prl-float 6s ease-in-out infinite 1.6s`,
      opacity: 0,
      background: '#0a0a0d',
      border: '1px solid #232330',
      boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 120px rgba(124,58,237,0.08)',
    }}
    aria-hidden="true"
  >
    <div className="flex" style={{ minHeight: '500px' }}>
      {/* Sidebar */}
      <div className="w-[180px] sm:w-[200px] shrink-0 bg-[#0d0d12] border-r border-[#232330] flex flex-col">
        {/* Logo row */}
        <div className="h-[44px] flex items-center gap-2 px-3 border-b border-[#232330] shrink-0">
          <span className="w-6 h-6 rounded-lg flex items-center justify-center bg-violet-600/30 border border-violet-600/30 text-purple-400">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none"><circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M13 6h3a2 2 0 0 1 2 2v7" /><path d="M6 9v9" /></svg>
          </span>
          <span className="text-[12px] font-semibold text-[#f3f3f6] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>PRLens</span>
        </div>

        {/* Nav */}
        <div className="p-2.5 flex flex-col gap-2 shrink-0">
          <div className="w-full flex items-center justify-center gap-1.5 h-[30px] rounded-lg text-white text-[10.5px] font-semibold" style={{ background: '#7c3aed' }}>
            <Plus className="w-3 h-3" />
            Analyze PR
          </div>
          <div className="flex items-center gap-1.5 h-[30px] px-2.5 rounded-lg bg-[#131318] border border-[#232330]">
            <Search className="w-3 h-3 text-[#6b6b78]" />
            <span className="text-[10px] text-[#6b6b78] truncate">Search history...</span>
          </div>
        </div>

        {/* History */}
        <div className="px-3.5 pt-1 pb-1.5 text-[8.5px] font-bold uppercase tracking-[0.14em] text-[#6b6b78]">Recent Analyses</div>
        <div className="px-2 flex flex-col gap-1">
          <div className="rounded-lg px-2.5 py-2" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.35)' }}>
            <div className="text-[10.5px] font-medium text-[#9457f5] truncate">prisma/prisma</div>
            <div className="text-[9px] truncate" style={{ color: 'rgba(148,87,245,0.8)' }}>connection pooling for adapters</div>
          </div>
          <div className="rounded-lg px-2.5 py-2 border border-transparent">
            <div className="text-[10.5px] font-medium text-[#9b9ba8] truncate">vercel/next.js</div>
            <div className="text-[9px] text-[#6b6b78] truncate">streaming server components</div>
          </div>
        </div>

        <div className="flex-1" />

        {/* User footer */}
        <div className="border-t border-[#232330] p-2.5 flex items-center gap-2">
          <span className="w-[22px] h-[22px] rounded-lg flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{ background: '#7c3aed' }}>U</span>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold text-[#E4E4E7] truncate">User</div>
            <div className="text-[8.5px] text-[#6b6b78] truncate">@github</div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0 relative">
        {/* Page header */}
        <div className="p-4 sm:p-5">
          <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#9457f5] mb-1.5">prisma/prisma #23145</div>
          <div className="text-[15px] sm:text-[16px] font-bold text-[#f3f3f6] tracking-tight leading-snug break-words" style={{ fontFamily: 'var(--font-display)' }}>
            feat: add connection strategy for driver adapters
          </div>

          {/* Meta chips */}
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 mt-3 text-[9.5px] text-[#9b9ba8]">
            <span className="flex items-center gap-1.5">
              <span className="w-[16px] h-[16px] rounded-full overflow-hidden border border-[#232330] flex items-center justify-center text-[7px] font-bold text-white" style={{ background: '#7c3aed' }}>M</span>
              mniku
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-[5px] h-[5px] rounded-full bg-[#4ade80]" style={{ animation: 'prl-pulse 2s ease-in-out infinite' }} />
              Analyzed Aug 16, 2026
            </span>
            <span className="flex items-center gap-1">
              <FileCode2 className="w-3 h-3 opacity-70" />
              3 files
            </span>
            <span className="flex-1" />
            <span className="px-[10px] py-[4px] rounded-full font-semibold text-[9px]" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.35)', color: '#9457f5' }}>
              View on GitHub
            </span>
          </div>

          {/* Segmented tabs */}
          <div className="inline-flex gap-[3px] rounded-lg p-[3px] mt-4" style={{ background: '#131318', border: '1px solid #232330' }}>
            <span className="flex items-center gap-1.5 px-2.5 py-[6px] rounded-md text-[10px] font-medium text-white" style={{ background: '#7c3aed', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}>
              <LayoutDashboard className="w-[11px] h-[11px]" />
              Overview
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-[6px] rounded-md text-[10px] font-medium text-[#9b9ba8]">
              <ListChecks className="w-[11px] h-[11px] opacity-70" />
              Reviewer Checklist
              <span className="min-w-[14px] h-[13px] px-1 rounded-full text-[8px] font-semibold flex items-center justify-center bg-[#232330] text-[#9b9ba8] tabular-nums">4</span>
            </span>
            <span className="hidden md:flex items-center gap-1.5 px-2.5 py-[6px] rounded-md text-[10px] font-medium text-[#9b9ba8]">
              <FileText className="w-[11px] h-[11px] opacity-70" />
              File Explanations
              <span className="min-w-[14px] h-[13px] px-1 rounded-full text-[8px] font-semibold flex items-center justify-center bg-[#232330] text-[#9b9ba8] tabular-nums">3</span>
            </span>
          </div>

          {/* Cards */}
          <div className="mt-4 flex flex-col gap-2.5">
            {/* AI Summary */}
            <div className="relative overflow-hidden rounded-xl bg-[#16161d] border border-[#232330] p-3.5">
              <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: 'linear-gradient(90deg, #8b5cf6, transparent)', opacity: 0.8 }} />
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-[22px] h-[22px] rounded-lg flex items-center justify-center bg-violet-500/10 border border-violet-500/25 text-violet-400">
                  <Sparkles className="w-[13px] h-[13px]" />
                </div>
                <span className="text-[12px] font-bold text-[#f3f3f6] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>AI Summary</span>
              </div>
              <p className="text-[10.5px] leading-relaxed text-[#9b9ba8] bg-[#0d0d12] border border-[#232330] rounded-lg p-2.5">
                Introduces a pooled connection strategy so adapters reuse connections instead of opening one per
                query. The engine lifecycle is untouched — changes are additive and gated behind a flag.
              </p>
            </div>

            <CollapsedRow
              icon={FileCode2}
              tileClass="bg-blue-500/10 border border-blue-500/25 text-blue-400"
              strip="linear-gradient(90deg, #3b82f6, transparent)"
              title="Key Changes"
              count={4}
            />
            <CollapsedRow
              icon={ShieldAlert}
              tileClass="bg-red-500/10 border border-red-500/25 text-red-400"
              strip="linear-gradient(90deg, #ef4444, transparent)"
              title="Potential Risks"
              count={2}
            />
            <CollapsedRow
              icon={Scale}
              tileClass="bg-amber-500/10 border border-amber-500/25 text-amber-400"
              strip="linear-gradient(90deg, #f59e0b, transparent)"
              title="Tradeoffs"
              count={2}
            />
          </div>
        </div>

        {/* Chat FAB — matches the dashboard's reopen-chat button */}
        <div
          className="absolute bottom-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-white"
          style={{ background: '#7c3aed', boxShadow: '0 8px 32px rgba(124,58,237,0.35)' }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        </div>
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
