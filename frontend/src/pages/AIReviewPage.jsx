import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const AIReviewPage = () => (
  <div className="min-h-[100dvh] bg-[var(--prl-bg)] text-[var(--prl-text)]">
    <Helmet>
      <title>AI Code Review - PRLens</title>
      <meta name="description" content="Learn how PRLens uses AI to review code faster, catch security risks, and generate pull request summaries automatically." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/ai-code-review" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-4 font-display">AI Code Review</h1>
      <p className="text-[var(--prl-text-dim)] text-lg mb-10">Use AI to review code faster and catch issues earlier in the pull request process.</p>

      <div className="space-y-6">
        <div className="bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-6">
          <h2 className="text-xl font-semibold mb-2 font-display">Automated Summaries</h2>
          <p className="text-[var(--prl-text-dim)]">Get concise PR summaries so reviewers understand the change set immediately.</p>
        </div>
        <div className="bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-6">
          <h2 className="text-xl font-semibold mb-2 font-display">Risk Detection</h2>
          <p className="text-[var(--prl-text-dim)]">Highlight breaking changes, security risks, and performance regressions before merge.</p>
        </div>
        <div className="bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-6">
          <h2 className="text-xl font-semibold mb-2 font-display">Faster Reviews</h2>
          <p className="text-[var(--prl-text-dim)]">Reduce review time by focusing on high-signal areas instead of reading every diff.</p>
        </div>
      </div>

      <div className="mt-12">
        <Link to="/" className="text-[var(--prl-accent)] hover:text-[var(--prl-text-primary)]">&larr; Back to Home</Link>
      </div>
    </div>
  </div>
);

export default AIReviewPage;
