import React from 'react';
import { Link } from 'react-router-dom';

const FAQPage = () => (
  <div className="min-h-screen bg-[#0f0f13] text-white">
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-4">FAQ</h1>
      <p className="text-[#A1A1AA] text-lg mb-10">Common questions about PRLens.</p>

      <div className="space-y-6">
        <div className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">Is PRLens free?</h2>
          <p className="text-[#A1A1AA]">Yes. The core analysis features are free to use.</p>
        </div>
        <div className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">Which GitHub plans are supported?</h2>
          <p className="text-[#A1A1AA]">Public repositories work without login. Private repositories require GitHub authentication.</p>
        </div>
        <div className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">How does the AI chat work?</h2>
          <p className="text-[#A1A1AA]">The chat uses the PR diff and analysis as context, so you can ask questions about specific files or risks.</p>
        </div>
      </div>

      <div className="mt-12">
        <Link to="/docs" className="text-violet-400 hover:text-violet-300">&larr; Back to Docs</Link>
      </div>
    </div>
  </div>
);

export default FAQPage;
