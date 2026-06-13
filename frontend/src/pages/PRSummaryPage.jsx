import React from 'react';
import { Link } from 'react-router-dom';

const PRSummaryPage = () => (
  <div className="min-h-screen bg-[#0f0f13] text-white">
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-4">Pull Request Summary Tool</h1>
      <p className="text-[#A1A1AA] text-lg mb-10">Generate clear, concise pull request summaries automatically with AI.</p>

      <div className="space-y-6">
        <div className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">Instant Overview</h2>
          <p className="text-[#A1A1AA]">Get a plain-language summary of what a PR changes and why.</p>
        </div>
        <div className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">File Context</h2>
          <p className="text-[#A1A1AA]">Understand the purpose and impact of each file in the change set.</p>
        </div>
      </div>

      <div className="mt-12">
        <Link to="/" className="text-violet-400 hover:text-violet-300">&larr; Back to Home</Link>
      </div>
    </div>
  </div>
);

export default PRSummaryPage;
