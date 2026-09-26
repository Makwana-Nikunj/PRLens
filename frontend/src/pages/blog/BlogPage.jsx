import React from 'react';
import { Link } from 'react-router-dom';

const BlogPage = () => (
  <div className="min-h-screen bg-[#0f0f13] light:bg-[#fafaff] text-white light:text-[#18181f]">
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-4">Blog</h1>
      <p className="text-[#A1A1AA] light:text-[#565662] text-lg mb-10">Articles about AI-powered code review, GitHub workflows, and developer productivity.</p>

      <div className="space-y-6">
        <Link to="/blog/how-to-review-pull-requests-faster-with-ai" className="block bg-[#161618] light:bg-[#ffffff] border border-white/10 light:border-black/10 rounded-md p-6 hover:border-[#ccff00]/30 transition">
          <h2 className="text-xl font-semibold mb-2">How to Review Pull Requests Faster with AI</h2>
          <p className="text-[#A1A1AA] light:text-[#565662]">Practical techniques for cutting review time without sacrificing quality.</p>
        </Link>
        <Link to="/blog/ai-code-review-vs-manual" className="block bg-[#161618] light:bg-[#ffffff] border border-white/10 light:border-black/10 rounded-md p-6 hover:border-[#ccff00]/30 transition">
          <h2 className="text-xl font-semibold mb-2">AI Code Review vs Manual Code Review</h2>
          <p className="text-[#A1A1AA] light:text-[#565662]">Compare strengths, weaknesses, and when to use each approach.</p>
        </Link>
        <Link to="/blog/github-pull-request-best-practices" className="block bg-[#161618] light:bg-[#ffffff] border border-white/10 light:border-black/10 rounded-md p-6 hover:border-[#ccff00]/30 transition">
          <h2 className="text-xl font-semibold mb-2">GitHub Pull Request Best Practices</h2>
          <p className="text-[#A1A1AA] light:text-[#565662]">Keep PRs small, descriptive, and easy to review.</p>
        </Link>
      </div>

      <div className="mt-12">
        <Link to="/" className="text-[#ccff00] light:text-[#ccff00] hover:text-[#ccff00] hover:light:text-[#ccff00]">&larr; Back to Home</Link>
      </div>
    </div>
  </div>
);

export default BlogPage;
