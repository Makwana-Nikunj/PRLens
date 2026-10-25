import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Article = () => (
  <div className="min-h-[100dvh] bg-[var(--prl-bg)] text-[var(--prl-text)]">
    <Helmet>
      <title>AI Code Review vs Manual Code Review - PRLens</title>
      <meta name="description" content="Compare AI code review and manual code review: strengths, weaknesses, and when to use each approach." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/blog/ai-code-review-vs-manual" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <Link to="/blog" className="text-[var(--prl-accent)] hover:text-[var(--prl-text-primary)] mb-6 inline-block">&larr; Back to Blog</Link>
      <h1 className="text-4xl font-bold mb-6 font-display">AI Code Review vs Manual Code Review</h1>
      <div className="prose prose-invert max-w-none text-[var(--prl-text-dim)] space-y-4">
        <p>Manual review catches design issues and business logic gaps. AI review excels at consistency, coverage, and speed. The best teams use both.</p>
      </div>
    </div>
  </div>
);

export default Article;
