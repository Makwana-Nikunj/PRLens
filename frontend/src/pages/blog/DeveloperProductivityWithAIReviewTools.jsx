import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Article = () => (
  <div className="min-h-screen bg-[#0f0f13] text-white">
    <Helmet>
      <title>Developer Productivity with AI Review Tools - PRLens</title>
      <meta name="description" content="Improve developer productivity with AI review tools that reduce context-switching and surface relevant risks faster." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/blog/developer-productivity-with-ai-review-tools" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <Link to="/blog" className="text-violet-400 hover:text-violet-300 mb-6 inline-block">&larr; Back to Blog</Link>
      <h1 className="text-4xl font-bold mb-6">Developer Productivity with AI Review Tools</h1>
      <div className="prose prose-invert max-w-none text-[#A1A1AA] space-y-4">
        <p>AI review tools reduce context-switching, surface relevant risks faster, and let developers spend more time building and less time hunting for issues in diffs.</p>
      </div>
    </div>
  </div>
);

export default Article;
