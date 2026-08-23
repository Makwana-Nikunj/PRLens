import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Article = () => (
  <div className="min-h-screen bg-[#0f0f13] light:bg-[#fafaff] text-white light:text-[#18181f]">
    <Helmet>
      <title>Reducing Review Time with AI-Assisted Analysis - PRLens</title>
      <meta name="description" content="Reduce review cycle time with AI-assisted PR analysis and high-risk area highlighting." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/blog/reducing-review-time-with-ai-assisted-analysis" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <Link to="/blog" className="text-violet-400 light:text-violet-600 hover:text-violet-300 hover:light:text-violet-500 mb-6 inline-block">&larr; Back to Blog</Link>
      <h1 className="text-4xl font-bold mb-6">Reducing Review Time with AI-Assisted Analysis</h1>
      <div className="prose prose-invert max-w-none text-[#A1A1AA] light:text-[#565662] space-y-4">
        <p>AI-assisted analysis reduces cycle time by summarizing PRs and highlighting high-risk change areas before the reviewer opens the diff.</p>
      </div>
    </div>
  </div>
);

export default Article;
