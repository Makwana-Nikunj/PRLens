import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const GettingStartedPage = () => (
  <div className="min-h-screen bg-[#0f0f13] text-white">
    <Helmet>
      <title>Getting Started - PRLens</title>
      <meta name="description" content="Get started with PRLens: connect GitHub, analyze your first pull request, and view AI-powered review results." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/docs/getting-started" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-4">Getting Started</h1>
      <p className="text-[#A1A1AA] text-lg mb-10">Follow these steps to start analyzing GitHub pull requests with PRLens.</p>

      <div className="space-y-6">
        <div className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">1. Connect GitHub</h2>
          <p className="text-[#A1A1AA]">Sign in with your GitHub account to grant PRLens access to your repositories.</p>
        </div>
        <div className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">2. Analyze Your First PR</h2>
          <p className="text-[#A1A1AA]">Paste a GitHub pull request URL into the home page input and click <span className="text-violet-400 font-medium">Analyze PR</span>.</p>
        </div>
        <div className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">3. View AI Results</h2>
          <p className="text-[#A1A1AA]">Review the generated summary, risk assessment, file breakdown, and use the AI chat to ask follow-up questions.</p>
        </div>
      </div>

      <div className="mt-12">
        <Link to="/docs" className="text-violet-400 hover:text-violet-300">&larr; Back to Docs</Link>
      </div>
    </div>
  </div>
);

export default GettingStartedPage;
