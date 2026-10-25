import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Article = () => (
  <div className="min-h-[100dvh] bg-[var(--prl-bg)] text-[var(--prl-text)]">
    <Helmet>
      <title>Developer Productivity with AI Review Tools - PRLens</title>
      <meta name="description" content="Improve developer productivity with AI review tools that reduce context-switching and surface relevant risks faster." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/blog/developer-productivity-with-ai-review-tools" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <Link to="/blog" className="text-[var(--prl-accent)] hover:text-[var(--prl-text-primary)] mb-6 inline-block">&larr; Back to Blog</Link>
      <h1 className="text-4xl font-bold mb-6 font-display">Developer Productivity with AI Review Tools</h1>
      <div className="prose prose-invert max-w-none text-[var(--prl-text-dim)] space-y-4">
        <p>AI review tools reduce context-switching, surface relevant risks faster, and let developers spend more time building and less time hunting for issues in diffs.</p>
      </div>
    </div>
  </div>
);

export default Article;
