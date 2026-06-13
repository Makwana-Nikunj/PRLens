import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Article = () => (
  <div className="min-h-screen bg-[#0f0f13] text-white">
    <Helmet>
      <title>AI Code Review vs Manual Code Review - PRLens</title>
      <meta name="description" content="Compare AI code review and manual code review: strengths, weaknesses, and when to use each approach." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/blog/ai-code-review-vs-manual" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <Link to="/blog" className="text-violet-400 hover:text-violet-300 mb-6 inline-block">&larr; Back to Blog</Link>
      <h1 className="text-4xl font-bold mb-6">AI Code Review vs Manual Code Review</h1>
      <div className="prose prose-invert max-w-none text-[#A1A1AA] space-y-4">
        <p>Manual review catches design issues and business logic gaps. AI review excels at consistency, coverage, and speed. The best teams use both.</p>
      </div>
    </div>
  </div>
);

export default Article;
