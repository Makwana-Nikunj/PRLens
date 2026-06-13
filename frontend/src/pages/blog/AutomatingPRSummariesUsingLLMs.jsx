import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Article = () => (
  <div className="min-h-screen bg-[#0f0f13] text-white">
    <Helmet>
      <title>Automating PR Summaries Using LLMs - PRLens</title>
      <meta name="description" content="How to automate PR summaries using LLMs: prompting patterns, chunking strategies, and formatting tips." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/blog/automating-pr-summaries-using-llms" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <Link to="/blog" className="text-violet-400 hover:text-violet-300 mb-6 inline-block">&larr; Back to Blog</Link>
      <h1 className="text-4xl font-bold mb-6">Automating PR Summaries Using LLMs</h1>
      <div className="prose prose-invert max-w-none text-[#A1A1AA] space-y-4">
        <p>LLMs can turn raw diffs into concise, structured PR summaries automatically. This post covers prompting patterns, chunking strategies, and formatting tips.</p>
      </div>
    </div>
  </div>
);

export default Article;
