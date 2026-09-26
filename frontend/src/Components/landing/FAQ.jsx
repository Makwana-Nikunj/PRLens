import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SectionHeading from './SectionHeading';

const faqs = [
  {
    q: 'Is PRLens free?',
    a: 'Yes. The core analysis features are free to use.',
  },
  {
    q: 'Which GitHub plans are supported?',
    a: 'Public repositories work without login. Private repositories require GitHub authentication.',
  },
  {
    q: 'How does the AI chat work?',
    a: 'The chat uses the PR diff and analysis as context, so you can ask questions about specific files or risks.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'No. PRLens runs entirely in your browser — paste a pull request URL and the analysis starts immediately.',
  },
  {
    q: 'What kinds of pull requests work best?',
    a: 'Any GitHub pull request can be analyzed. PRLens saves the most time on large, multi-file diffs where reading the raw diff manually is slow.',
  },
];

const FAQItem = ({ q, a, isOpen, onToggle }) => (
  <div
    className="relative rounded overflow-hidden transition-colors duration-300"
    style={{
      background: 'var(--prl-panel-2)',
      border: `1px solid ${isOpen ? 'rgba(124,58,237,0.4)' : 'var(--prl-border)'}`,
    }}
  >
    {isOpen && (
      <div className="absolute inset-0 grid-animated-fine grid-drift-paused opacity-30 pointer-events-none [mask-image:linear-gradient(to_bottom,black_30%,transparent_70%)]" aria-hidden="true" />
    )}
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left min-h-[44px]"
      aria-expanded={isOpen}
    >
      <span className="text-[16px] font-semibold text-[var(--text-primary)] light:text-[#18181f]">{q}</span>
      <svg
        className="w-4 h-4 shrink-0 text-[var(--text-muted)] light:text-[#5d5d6a] transition-transform duration-300"
        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
    <div
      className="grid transition-[grid-template-rows] duration-300 ease-out"
      style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
    >
      <div className="overflow-hidden min-h-0">
        <p className="px-6 pb-5 text-[15px] text-[var(--text-muted)] light:text-[#5d5d6a] leading-relaxed">{a}</p>
      </div>
    </div>
  </div>
);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="py-[120px] bg-[var(--bg-primary)] light:bg-[#ffffff] scroll-mt-[80px] relative overflow-hidden" aria-labelledby="faq-title">
      <div className="absolute inset-0 grid-animated-fine pointer-events-none opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" aria-hidden="true" />
      <div className="w-full px-6 md:px-[60px] 2xl:px-[100px] relative z-10">
        <SectionHeading
          id="faq-title"
          eyebrow="FAQ"
          title="Common questions"
          subtitle="Everything else you might be wondering before pasting your first PR."
        />
        <div className="max-w-[720px] mx-auto w-full space-y-3">
          {faqs.map((f, i) => (
            <FAQItem
              key={f.q}
              {...f}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
        <p className="mt-8 text-center text-[14px] text-[var(--text-muted)] light:text-[#82828e]">
          Still have questions?{' '}
          <Link to="/docs/faq" className="text-[#ccff00] light:text-[#ccff00] font-medium hover:text-[#b08bff] hover:light:text-[#ccff00] transition">
            Read the full FAQ &rarr;
          </Link>
        </p>
      </div>
    </section>
  );
};

export default FAQ;
