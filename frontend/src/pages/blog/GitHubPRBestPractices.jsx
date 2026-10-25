import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Article = () => (
  <div className="min-h-[100dvh] bg-[var(--prl-bg)] text-[var(--prl-text)]">
    <Helmet>
      <title>GitHub Pull Request Best Practices - PRLens</title>
      <meta name="description" content="Learn GitHub pull request best practices to keep PRs small, descriptive, and easy to review." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/blog/github-pull-request-best-practices" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <Link to="/blog" className="text-[var(--prl-accent)] hover:text-[var(--prl-text-primary)] mb-6 inline-block">&larr; Back to Blog</Link>
      <h1 className="text-4xl font-bold mb-6 font-display">GitHub Pull Request Best Practices</h1>
      <div className="prose prose-invert max-w-none text-[var(--prl-text-dim)] space-y-4">
        <p>Keep PRs small, write descriptive titles, and include context. Small, focused changes are faster to review and easier to roll back if needed.</p>
      </div>
    </div>
  </div>
);

export default Article;
