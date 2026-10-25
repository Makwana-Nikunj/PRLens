import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const DocsPage = () => (
  <div className="min-h-[100dvh] bg-[var(--prl-bg)] text-[var(--prl-text)]">
    <Helmet>
      <title>Docs - PRLens</title>
      <meta name="description" content="PRLens documentation: getting started, features, and FAQ for AI-powered pull request review." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/docs" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-4 font-display">Documentation</h1>
      <p className="text-[var(--prl-text-dim)] text-lg mb-10">Get started with PRLens and learn how to use its features.</p>

      <div className="grid gap-6">
        <Link to="/docs/getting-started" className="block bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-6 hover:border-[#ccff00]/30 transition">
          <h2 className="text-xl font-semibold mb-2 font-display">Getting Started</h2>
          <p className="text-[var(--prl-text-dim)]">Connect GitHub, analyze your first PR, and view AI results.</p>
        </Link>
        <Link to="/docs/features" className="block bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-6 hover:border-[#ccff00]/30 transition">
          <h2 className="text-xl font-semibold mb-2 font-display">Features</h2>
          <p className="text-[var(--prl-text-dim)]">PR summaries, risk detection, AI chat, file analysis, and more.</p>
        </Link>
        <Link to="/docs/faq" className="block bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-6 hover:border-[#ccff00]/30 transition">
          <h2 className="text-xl font-semibold mb-2 font-display">FAQ</h2>
          <p className="text-[var(--prl-text-dim)]">Common questions and answers about PRLens.</p>
        </Link>
        <Link to="/privacy" className="block bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-6 hover:border-[#ccff00]/30 transition">
          <h2 className="text-xl font-semibold mb-2 font-display">Privacy Policy</h2>
          <p className="text-[var(--prl-text-dim)]">How PRLens handles your GitHub data, PR content, cookies, and personal information.</p>
        </Link>
      </div>

      <div className="mt-12">
        <Link to="/" className="text-[var(--prl-accent)] hover:text-[var(--prl-text-primary)]">&larr; Back to Home</Link>
      </div>
    </div>
  </div>
);

export default DocsPage;
