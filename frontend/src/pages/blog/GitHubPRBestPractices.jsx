import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Article = () => (
  <div className="min-h-screen bg-[#0f0f13] text-white">
    <Helmet>
      <title>GitHub Pull Request Best Practices - PRLens</title>
      <meta name="description" content="Learn GitHub pull request best practices to keep PRs small, descriptive, and easy to review." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/blog/github-pull-request-best-practices" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <Link to="/blog" className="text-violet-400 hover:text-violet-300 mb-6 inline-block">&larr; Back to Blog</Link>
      <h1 className="text-4xl font-bold mb-6">GitHub Pull Request Best Practices</h1>
      <div className="prose prose-invert max-w-none text-[#A1A1AA] space-y-4">
        <p>Keep PRs small, write descriptive titles, and include context. Small, focused changes are faster to review and easier to roll back if needed.</p>
      </div>
    </div>
  </div>
);

export default Article;
