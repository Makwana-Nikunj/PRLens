import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const GitHubPRAnalysisPage = () => (
  <div className="min-h-screen bg-[#0f0f13] light:bg-[#fafaff] text-white light:text-[#18181f]">
    <Helmet>
      <title>GitHub Pull Request Analysis - PRLens</title>
      <meta name="description" content="Deep GitHub PR analysis with file-level insights and risk signals using AI." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/github-pull-request-analysis" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-4">GitHub Pull Request Analysis</h1>
      <p className="text-[#A1A1AA] light:text-[#565662] text-lg mb-10">Deep analysis for GitHub pull requests with file-level insights and risk signals.</p>

      <div className="space-y-6">
        <div className="bg-[#161618] light:bg-[#ffffff] border border-white/10 light:border-black/10 rounded-md p-6">
          <h2 className="text-xl font-semibold mb-2">Repository Context</h2>
          <p className="text-[#A1A1AA] light:text-[#565662]">PRLens reads repo-specific signals and maps changes to risk and impact.</p>
        </div>
        <div className="bg-[#161618] light:bg-[#ffffff] border border-white/10 light:border-black/10 rounded-md p-6">
          <h2 className="text-xl font-semibold mb-2">File Analysis</h2>
          <p className="text-[#A1A1AA] light:text-[#565662]">Understand what each file contributes to the PR without opening every diff.</p>
        </div>
      </div>

      <div className="mt-12">
        <Link to="/" className="text-[#ccff00] light:text-[#ccff00] hover:text-[#ccff00] hover:light:text-[#ccff00]">&larr; Back to Home</Link>
      </div>
    </div>
  </div>
);

export default GitHubPRAnalysisPage;
