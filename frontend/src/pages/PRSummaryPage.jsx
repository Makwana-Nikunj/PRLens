import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const PRSummaryPage = () => (
  <div className="min-h-[100dvh] bg-[var(--prl-bg)] text-[var(--prl-text)]">
    <Helmet>
      <title>Pull Request Summary Tool - PRLens</title>
      <meta name="description" content="Generate clear, concise pull request summaries automatically with AI using PRLens." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/pull-request-summary" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-4 font-display">Pull Request Summary Tool</h1>
      <p className="text-[var(--prl-text-dim)] text-lg mb-10">Generate clear, concise pull request summaries automatically with AI.</p>

      <div className="space-y-6">
        <div className="bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-6">
          <h2 className="text-xl font-semibold mb-2 font-display">Instant Overview</h2>
          <p className="text-[var(--prl-text-dim)]">Get a plain-language summary of what a PR changes and why.</p>
        </div>
        <div className="bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-6">
          <h2 className="text-xl font-semibold mb-2 font-display">File Context</h2>
          <p className="text-[var(--prl-text-dim)]">Understand the purpose and impact of each file in the change set.</p>
        </div>
      </div>

      <div className="mt-12">
        <Link to="/" className="text-[var(--prl-accent)] hover:text-[var(--prl-text-primary)]">&larr; Back to Home</Link>
      </div>
    </div>
  </div>
);

export default PRSummaryPage;
