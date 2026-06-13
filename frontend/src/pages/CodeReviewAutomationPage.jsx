import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const CodeReviewAutomationPage = () => (
  <div className="min-h-screen bg-[#0f0f13] text-white">
    <Helmet>
      <title>Code Review Automation - PRLens</title>
      <meta name="description" content="Automate repetitive review tasks and focus on what matters most with PRLens." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/code-review-automation" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-4">Code Review Automation</h1>
      <p className="text-[#A1A1AA] text-lg mb-10">Automate repetitive review tasks and focus on what matters most.</p>

      <div className="space-y-6">
        <div className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">Consistent Reviews</h2>
          <p className="text-[#A1A1AA]">Apply the same review criteria across every pull request.</p>
        </div>
        <div className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">Faster Turnaround</h2>
          <p className="text-[#A1A1AA]">Reduce review cycles with instant AI-generated insights.</p>
        </div>
      </div>

      <div className="mt-12">
        <Link to="/" className="text-violet-400 hover:text-violet-300">&larr; Back to Home</Link>
      </div>
    </div>
  </div>
);

export default CodeReviewAutomationPage;
