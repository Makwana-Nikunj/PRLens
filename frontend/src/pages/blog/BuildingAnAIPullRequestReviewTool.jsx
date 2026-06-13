import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Article = () => (
  <div className="min-h-screen bg-[#0f0f13] text-white">
    <Helmet>
      <title>Building an AI Pull Request Review Tool - PRLens</title>
      <meta name="description" content="Overview of architecture and tradeoffs when building an AI-powered pull request review system." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/blog/building-an-ai-pull-request-review-tool" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <Link to="/blog" className="text-violet-400 hover:text-violet-300 mb-6 inline-block">&larr; Back to Blog</Link>
      <h1 className="text-4xl font-bold mb-6">Building an AI Pull Request Review Tool</h1>
      <div className="prose prose-invert max-w-none text-[#A1A1AA] space-y-4">
        <p>An overview of the architecture and tradeoffs when building an AI-powered PR review system.</p>
      </div>
    </div>
  </div>
);

export default Article;
