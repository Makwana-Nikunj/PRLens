import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const CodeReviewAutomationPage = () => (
  <div className="min-h-[100dvh] bg-[var(--prl-bg)] text-[var(--prl-text)]">
    <Helmet>
      <title>Code Review Automation - PRLens</title>
      <meta name="description" content="Automate repetitive review tasks and focus on what matters most with PRLens." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/code-review-automation" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-4 font-display">Code Review Automation</h1>
      <p className="text-[var(--prl-text-dim)] text-lg mb-10">Automate repetitive review tasks and focus on what matters most.</p>

      <div className="space-y-6">
        <div className="bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-6">
          <h2 className="text-xl font-semibold mb-2 font-display">Consistent Reviews</h2>
          <p className="text-[var(--prl-text-dim)]">Apply the same review criteria across every pull request.</p>
        </div>
        <div className="bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-6">
          <h2 className="text-xl font-semibold mb-2 font-display">Faster Turnaround</h2>
          <p className="text-[var(--prl-text-dim)]">Reduce review cycles with instant AI-generated insights.</p>
        </div>
      </div>

      <div className="mt-12">
        <Link to="/" className="text-[var(--prl-accent)] hover:text-[var(--prl-text-primary)]">&larr; Back to Home</Link>
      </div>
    </div>
  </div>
);

export default CodeReviewAutomationPage;
