import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Article = () => (
  <div className="min-h-[100dvh] bg-[var(--prl-bg)] text-[var(--prl-text)]">
    <Helmet>
      <title>Large Pull Requests: Challenges and Solutions - PRLens</title>
      <meta name="description" content="Large pull requests are harder to review and slower to merge. Learn how breaking PRs into smaller batches improves throughput." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/blog/large-pull-requests-challenges-and-solutions" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <Link to="/blog" className="text-[var(--prl-accent)] hover:text-[var(--prl-text-primary)] mb-6 inline-block">&larr; Back to Blog</Link>
      <h1 className="text-4xl font-bold mb-6 font-display">Large Pull Requests: Challenges and Solutions</h1>
      <div className="prose prose-invert max-w-none text-[var(--prl-text-dim)] space-y-4">
        <p>Large pull requests are harder to review, more likely to introduce bugs, and slower to merge. Breaking them into smaller batches improves throughput and review quality.</p>
      </div>
    </div>
  </div>
);

export default Article;
