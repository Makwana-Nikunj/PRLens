import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const FeaturesPage = () => (
  <div className="min-h-[100dvh] bg-[var(--prl-bg)] text-[var(--prl-text)]">
    <Helmet>
      <title>Features - PRLens</title>
      <meta name="description" content="Explore PRLens features: AI PR summaries, risk detection, file breakdown, AI chat, and review checklists." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/docs/features" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-4 font-display">Features</h1>
      <p className="text-[var(--prl-text-dim)] text-lg mb-10">A complete set of tools to understand and review pull requests faster.</p>

      <div className="space-y-6">
        <div className="bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-6">
          <h2 className="text-xl font-semibold mb-2 font-display">PR Summary</h2>
          <p className="text-[var(--prl-text-dim)]">AI-generated overview of what changed and why.</p>
        </div>
        <div className="bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-6">
          <h2 className="text-xl font-semibold mb-2 font-display">File Breakdown</h2>
          <p className="text-[var(--prl-text-dim)]">Understand each file without manually reading diffs.</p>
        </div>
        <div className="bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-6">
          <h2 className="text-xl font-semibold mb-2 font-display">Risk Detection</h2>
          <p className="text-[var(--prl-text-dim)]">Highlights breaking changes, security issues, and anti-patterns.</p>
        </div>
        <div className="bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-6">
          <h2 className="text-xl font-semibold mb-2 font-display">AI Chat</h2>
          <p className="text-[var(--prl-text-dim)]">Ask questions about the PR context and get grounded answers.</p>
        </div>
      </div>

      <div className="mt-12">
        <Link to="/docs" className="text-[var(--prl-accent)] hover:text-[var(--prl-text-primary)]">&larr; Back to Docs</Link>
      </div>
    </div>
  </div>
);

export default FeaturesPage;
