import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Article = () => (
  <div className="min-h-[100dvh] bg-[var(--prl-bg)] text-[var(--prl-text)]">
    <Helmet>
      <title>Automating PR Summaries Using LLMs - PRLens</title>
      <meta name="description" content="How to automate PR summaries using LLMs: prompting patterns, chunking strategies, and formatting tips." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/blog/automating-pr-summaries-using-llms" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <Link to="/blog" className="text-[var(--prl-accent)] hover:text-[var(--prl-text-primary)] mb-6 inline-block">&larr; Back to Blog</Link>
      <h1 className="text-4xl font-bold mb-6 font-display">Automating PR Summaries Using LLMs</h1>
      <div className="prose prose-invert max-w-none text-[var(--prl-text-dim)] space-y-4">
        <p>LLMs can turn raw diffs into concise, structured PR summaries automatically. This post covers prompting patterns, chunking strategies, and formatting tips.</p>
      </div>
    </div>
  </div>
);

export default Article;
