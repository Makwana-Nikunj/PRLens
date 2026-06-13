import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Article = () => (
  <div className="min-h-screen bg-[#0f0f13] text-white">
    <Helmet>
      <title>How RAG Improves Code Review Systems - PRLens</title>
      <meta name="description" content="How retrieval-augmented generation improves code review systems with grounded repository context." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/blog/how-rag-improves-code-review-systems" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20'>
      <Link to="/blog" className="text-violet-400 hover:text-violet-300 mb-6 inline-block">&larr; Back to Blog</Link>
      <h1 className="text-4xl font-bold mb-6">How RAG Improves Code Review Systems</h1>
      <div className="prose prose-invert max-w-none text-[#A1A1AA] space-y-4">
        <p>Retrieval-augmented generation grounds answers in repository context instead of generic training data, leading to more relevant and reliable code review insights.</p>
      </div>
    </div>
  </div>
);

export default Article;
