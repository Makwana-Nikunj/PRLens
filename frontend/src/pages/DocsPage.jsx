import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const DocsPage = () => (
  <div className="min-h-screen bg-[#0f0f13] text-white">
    <Helmet>
      <title>Docs - PRLens</title>
      <meta name="description" content="PRLens documentation: getting started, features, and FAQ for AI-powered pull request review." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/docs" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-4">Documentation</h1>
      <p className="text-[#A1A1AA] text-lg mb-10">Get started with PRLens and learn how to use its features.</p>

      <div className="grid gap-6">
        <Link to="/docs/getting-started" className="block bg-[#161618] border border-white/10 rounded-xl p-6 hover:border-violet-500/50 transition">
          <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
          <p className="text-[#A1A1AA]">Connect GitHub, analyze your first PR, and view AI results.</p>
        </Link>
        <Link to="/docs/features" className="block bg-[#161618] border border-white/10 rounded-xl p-6 hover:border-violet-500/50 transition">
          <h2 className="text-xl font-semibold mb-2">Features</h2>
          <p className="text-[#A1A1AA]">PR summaries, risk detection, AI chat, file analysis, and more.</p>
        </Link>
        <Link to="/docs/faq" className="block bg-[#161618] border border-white/10 rounded-xl p-6 hover:border-violet-500/50 transition">
          <h2 className="text-xl font-semibold mb-2">FAQ</h2>
          <p className="text-[#A1A1AA]">Common questions and answers about PRLens.</p>
        </Link>
      </div>

      <div className="mt-12">
        <Link to="/" className="text-violet-400 hover:text-violet-300">&larr; Back to Home</Link>
      </div>
    </div>
  </div>
);

export default DocsPage;
