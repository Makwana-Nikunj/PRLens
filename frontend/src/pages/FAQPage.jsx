import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const FAQPage = () => (
  <div className="min-h-[100dvh] bg-[var(--prl-bg)] text-[var(--prl-text)]">
    <Helmet>
      <title>FAQ - PRLens</title>
      <meta name="description" content="Frequently asked questions about PRLens: pricing, supported GitHub plans, and how the AI chat works." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/docs/faq" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-4 font-display">FAQ</h1>
      <p className="text-[var(--prl-text-dim)] text-lg mb-10">Common questions about PRLens.</p>

      <div className="space-y-6">
        <div className="bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-6">
          <h2 className="text-xl font-semibold mb-2 font-display">Is PRLens free?</h2>
          <p className="text-[var(--prl-text-dim)]">Yes. The core analysis features are free to use.</p>
        </div>
        <div className="bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-6">
          <h2 className="text-xl font-semibold mb-2 font-display">Which GitHub plans are supported?</h2>
          <p className="text-[var(--prl-text-dim)]">Public repositories work without login. Private repositories require GitHub authentication.</p>
        </div>
        <div className="bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-6">
          <h2 className="text-xl font-semibold mb-2 font-display">How does the AI chat work?</h2>
          <p className="text-[var(--prl-text-dim)]">The chat uses the PR diff and analysis as context, so you can ask questions about specific files or risks.</p>
        </div>
      </div>

      <div className="mt-12">
        <Link to="/docs" className="text-[var(--prl-accent)] hover:text-[var(--prl-text-primary)]">&larr; Back to Docs</Link>
      </div>
    </div>
  </div>
);

export default FAQPage;
