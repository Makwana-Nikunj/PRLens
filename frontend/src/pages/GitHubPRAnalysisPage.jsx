import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const GitHubPRAnalysisPage = () => (
  <div className="min-h-[100dvh] bg-[var(--prl-bg)] text-[var(--prl-text)]">
    <Helmet>
      <title>GitHub Pull Request Analysis - PRLens</title>
      <meta name="description" content="Deep GitHub PR analysis with file-level insights and risk signals using AI." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/github-pull-request-analysis" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-4 font-display">GitHub Pull Request Analysis</h1>
      <p className="text-[var(--prl-text-dim)] text-lg mb-10">Deep analysis for GitHub pull requests with file-level insights and risk signals.</p>

      <div className="space-y-6">
        <div className="bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-6">
          <h2 className="text-xl font-semibold mb-2 font-display">Repository Context</h2>
          <p className="text-[var(--prl-text-dim)]">PRLens reads repo-specific signals and maps changes to risk and impact.</p>
        </div>
        <div className="bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-6">
          <h2 className="text-xl font-semibold mb-2 font-display">File Analysis</h2>
          <p className="text-[var(--prl-text-dim)]">Understand what each file contributes to the PR without opening every diff.</p>
        </div>
      </div>

      <div className="mt-12">
        <Link to="/" className="text-[var(--prl-accent)] hover:text-[var(--prl-text-primary)]">&larr; Back to Home</Link>
      </div>
    </div>
  </div>
);

export default GitHubPRAnalysisPage;
