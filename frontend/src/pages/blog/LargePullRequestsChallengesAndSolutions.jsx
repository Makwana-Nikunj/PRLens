import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Article = () => (
  <div className="min-h-screen bg-[#0f0f13] text-white">
    <Helmet>
      <title>Large Pull Requests: Challenges and Solutions - PRLens</title>
      <meta name="description" content="Large pull requests are harder to review and slower to merge. Learn how breaking PRs into smaller batches improves throughput." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/blog/large-pull-requests-challenges-and-solutions" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <Link to="/blog" className="text-violet-400 hover:text-violet-300 mb-6 inline-block">&larr; Back to Blog</Link>
      <h1 className="text-4xl font-bold mb-6">Large Pull Requests: Challenges and Solutions</h1>
      <div className="prose prose-invert max-w-none text-[#A1A1AA] space-y-4">
        <p>Large pull requests are harder to review, more likely to introduce bugs, and slower to merge. Breaking them into smaller batches improves throughput and review quality.</p>
      </div>
    </div>
  </div>
);

export default Article;
