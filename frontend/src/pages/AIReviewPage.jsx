import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const AIReviewPage = () => (
  <div className="min-h-screen bg-[#0f0f13] text-white">
    <Helmet>
      <title>AI Code Review - PRLens</title>
      <meta name="description" content="Learn how PRLens uses AI to review code faster, catch security risks, and generate pull request summaries automatically." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/ai-code-review" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-4">AI Code Review</h1>
      <p className="text-[#A1A1AA] text-lg mb-10">Use AI to review code faster and catch issues earlier in the pull request process.</p>

      <div className="space-y-6">
        <div className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">Automated Summaries</h2>
          <p className="text-[#A1A1AA]">Get concise PR summaries so reviewers understand the change set immediately.</p>
        </div>
        <div className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">Risk Detection</h2>
          <p className="text-[#A1A1AA]">Highlight breaking changes, security risks, and performance regressions before merge.</p>
        </div>
        <div className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">Faster Reviews</h2>
          <p className="text-[#A1A1AA]">Reduce review time by focusing on high-signal areas instead of reading every diff.</p>
        </div>
      </div>

      <div className="mt-12">
        <Link to="/" className="text-violet-400 hover:text-violet-300">&larr; Back to Home</Link>
      </div>
    </div>
  </div>
);

export default AIReviewPage;
