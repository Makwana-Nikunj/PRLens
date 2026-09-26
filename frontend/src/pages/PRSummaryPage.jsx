import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const PRSummaryPage = () => (
  <div className="min-h-screen bg-[#0f0f13] light:bg-[#fafaff] text-white light:text-[#18181f]">
    <Helmet>
      <title>Pull Request Summary Tool - PRLens</title>
      <meta name="description" content="Generate clear, concise pull request summaries automatically with AI using PRLens." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/pull-request-summary" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-4">Pull Request Summary Tool</h1>
      <p className="text-[#A1A1AA] light:text-[#565662] text-lg mb-10">Generate clear, concise pull request summaries automatically with AI.</p>

      <div className="space-y-6">
        <div className="bg-[#161618] light:bg-[#ffffff] border border-white/10 light:border-black/10 rounded-md p-6">
          <h2 className="text-xl font-semibold mb-2">Instant Overview</h2>
          <p className="text-[#A1A1AA] light:text-[#565662]">Get a plain-language summary of what a PR changes and why.</p>
        </div>
        <div className="bg-[#161618] light:bg-[#ffffff] border border-white/10 light:border-black/10 rounded-md p-6">
          <h2 className="text-xl font-semibold mb-2">File Context</h2>
          <p className="text-[#A1A1AA] light:text-[#565662]">Understand the purpose and impact of each file in the change set.</p>
        </div>
      </div>

      <div className="mt-12">
        <Link to="/" className="text-[#ccff00] light:text-[#ccff00] hover:text-[#ccff00] hover:light:text-[#ccff00]">&larr; Back to Home</Link>
      </div>
    </div>
  </div>
);

export default PRSummaryPage;
