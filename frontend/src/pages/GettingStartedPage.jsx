import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const GettingStartedPage = () => (
  <div className="min-h-[100dvh] bg-[var(--prl-bg)] text-[var(--prl-text)]">
    <Helmet>
      <title>Getting Started - PRLens</title>
      <meta name="description" content="Get started with PRLens: connect GitHub, analyze your first pull request, and view AI-powered review results." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/docs/getting-started" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-4 font-display">Getting Started</h1>
      <p className="text-[var(--prl-text-dim)] text-lg mb-10">Follow these steps to start analyzing GitHub pull requests with PRLens.</p>

      <div className="space-y-6">
        <div className="bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-6">
          <h2 className="text-xl font-semibold mb-2 font-display">1. Connect GitHub</h2>
          <p className="text-[var(--prl-text-dim)]">Sign in with your GitHub account to grant PRLens access to your repositories.</p>
        </div>
        <div className="bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-6">
          <h2 className="text-xl font-semibold mb-2 font-display">2. Analyze Your First PR</h2>
          <p className="text-[var(--prl-text-dim)]">Paste a GitHub pull request URL into the home page input and click <span className="text-[var(--prl-accent)] font-medium">Analyze PR</span>.</p>
        </div>
        <div className="bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-6">
          <h2 className="text-xl font-semibold mb-2 font-display">3. View AI Results</h2>
          <p className="text-[var(--prl-text-dim)]">Review the generated summary, risk assessment, file breakdown, and use the AI chat to ask follow-up questions.</p>
        </div>
      </div>

      <div className="mt-12">
        <Link to="/docs" className="text-[var(--prl-accent)] hover:text-[var(--prl-text-primary)]">&larr; Back to Docs</Link>
      </div>
    </div>
  </div>
);

export default GettingStartedPage;
