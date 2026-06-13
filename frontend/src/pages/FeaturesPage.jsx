import React from 'react';
import { Link } from 'react-router-dom';

const FeaturesPage = () => (
  <div className="min-h-screen bg-[#0f0f13] text-white">
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-4">Features</h1>
      <p className="text-[#A1A1AA] text-lg mb-10">A complete set of tools to understand and review pull requests faster.</p>

      <div className="space-y-6">
        <div className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">PR Summary</h2>
          <p className="text-[#A1A1AA]">AI-generated overview of what changed and why.</p>
        </div>
        <div className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">File Breakdown</h2>
          <p className="text-[#A1A1AA]">Understand each file without manually reading diffs.</p>
        </div>
        <div className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">Risk Detection</h2>
          <p className="text-[#A1A1AA]">Highlights breaking changes, security issues, and anti-patterns.</p>
        </div>
        <div className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">AI Chat</h2>
          <p className="text-[#A1A1AA]">Ask questions about the PR context and get grounded answers.</p>
        </div>
      </div>

      <div className="mt-12">
        <Link to="/docs" className="text-violet-400 hover:text-violet-300">&larr; Back to Docs</Link>
      </div>
    </div>
  </div>
);

export default FeaturesPage;
