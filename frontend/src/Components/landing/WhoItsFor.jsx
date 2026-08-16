import React from 'react';
import SectionHeading from './SectionHeading';

const audiences = [
  {
    title: 'Code reviewers',
    desc: 'Skip the tab-switching between files. Get the summary, risks, and checklist up front so you can focus your review where it matters.',
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    title: 'Maintainers',
    desc: 'Triage incoming PRs faster. Spot breaking changes, risky diffs, and missing context before you invest time in a deep review.',
    icon: (
      <>
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </>
    ),
  },
  {
    title: 'New teammates',
    desc: 'Onboard into an unfamiliar codebase by asking questions about real changes — no stale docs or tribal knowledge required.',
    icon: (
      <>
        <path d="M22 10L12 5 2 10l10 5 10-5z" />
        <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
      </>
    ),
  },
];

const AudienceCard = ({ title, desc, icon }) => (
  <div
    className="group rounded-xl p-8 text-left cursor-default"
    style={{ background: '#16161d', border: '1px solid #232330' }}
  >
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
      style={{ background: 'rgba(124,58,237,0.1)', color: '#9457f5' }}
    >
      <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {icon}
      </svg>
    </div>
    <h3 className="text-[18px] font-semibold text-[#f3f3f6] mb-2">{title}</h3>
    <p className="text-[15px] text-[#9b9ba8] leading-relaxed">{desc}</p>
  </div>
);

const WhoItsFor = () => (
  <section id="who-its-for" className="py-[120px] bg-[#0a0a0d]" aria-labelledby="who-its-for-title">
    <div className="w-full px-6 md:px-[60px] 2xl:px-[100px]">
      <SectionHeading
        id="who-its-for-title"
        eyebrow="Use cases"
        title="Built for anyone who reads pull requests"
        subtitle="Reviewing code is a different job for everyone — PRLens adapts to yours."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1100px] mx-auto w-full">
        {audiences.map((a) => (
          <AudienceCard key={a.title} {...a} />
        ))}
      </div>
    </div>
  </section>
);

export default WhoItsFor;
