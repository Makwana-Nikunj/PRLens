import React from 'react';
import { Link } from 'react-router-dom';

const BlogPage = () => (
  <div className="min-h-[100dvh] bg-[var(--prl-bg)] text-[var(--prl-text)]">
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-4 font-display">Blog</h1>
      <p className="text-[var(--prl-text-dim)] text-lg mb-10">Articles about AI-powered code review, GitHub workflows, and developer productivity.</p>

      <div className="space-y-6">
        <Link to="/blog/how-to-review-pull-requests-faster-with-ai" className="block bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-6 hover:border-[#ccff00]/30 transition">
          <h2 className="text-xl font-semibold mb-2 font-display">How to Review Pull Requests Faster with AI</h2>
          <p className="text-[var(--prl-text-dim)]">Practical techniques for cutting review time without sacrificing quality.</p>
        </Link>
        <Link to="/blog/ai-code-review-vs-manual" className="block bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-6 hover:border-[#ccff00]/30 transition">
          <h2 className="text-xl font-semibold mb-2 font-display">AI Code Review vs Manual Code Review</h2>
          <p className="text-[var(--prl-text-dim)]">Compare strengths, weaknesses, and when to use each approach.</p>
        </Link>
        <Link to="/blog/github-pull-request-best-practices" className="block bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-6 hover:border-[#ccff00]/30 transition">
          <h2 className="text-xl font-semibold mb-2 font-display">GitHub Pull Request Best Practices</h2>
          <p className="text-[var(--prl-text-dim)]">Keep PRs small, descriptive, and easy to review.</p>
        </Link>
      </div>

      <div className="mt-12">
        <Link to="/" className="text-[var(--prl-accent)] hover:text-[var(--prl-text-primary)]">&larr; Back to Home</Link>
      </div>
    </div>
  </div>
);

export default BlogPage;
