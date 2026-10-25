import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Article = () => (
  <div className="min-h-[100dvh] bg-[var(--prl-bg)] text-[var(--prl-text)]">
    <Helmet>
      <title>Common Security Issues Found During PR Reviews - PRLens</title>
      <meta name="description" content="Common security issues found during PR reviews: injection flaws, hardcoded secrets, and unsafe deserialization." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/blog/common-security-issues-in-pr-reviews" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <Link to="/blog" className="text-[var(--prl-accent)] hover:text-[var(--prl-text-primary)] mb-6 inline-block">&larr; Back to Blog</Link>
      <h1 className="text-4xl font-bold mb-6 font-display">Common Security Issues Found During PR Reviews</h1>
      <div className="prose prose-invert max-w-none text-[var(--prl-text-dim)] space-y-4">
        <p>Injection flaws, hardcoded secrets, and unsafe deserialization are among the most common security issues caught during PR review. Automated triage helps surface these faster.</p>
      </div>
    </div>
  </div>
);

export default Article;
