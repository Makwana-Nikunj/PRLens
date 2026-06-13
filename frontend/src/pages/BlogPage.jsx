import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const BlogPage = () => (
  <div className="min-h-screen bg-[#0f0f13] text-white">
    <Helmet>
      <title>Blog - PRLens</title>
      <meta name="description" content="Articles about AI-powered code review, GitHub workflows, and developer productivity." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/blog" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-4">Blog</h1>
      <p className="text-[#A1A1AA] text-lg mb-10">Articles about AI-powered code review, GitHub workflows, and developer productivity.</p>

      <div className="space-y-6">
        <Link to="/blog/how-to-review-pull-requests-faster-with-ai" className="block bg-[#161618] border border-white/10 rounded-xl p-6 hover:border-violet-500/50 transition">
          <h2 className="text-xl font-semibold mb-2">How to Review Pull Requests Faster with AI</h2>
          <p className="text-[#A1A1AA]">Practical techniques for cutting review time without sacrificing quality.</p>
        </Link>
        <Link to="/blog/ai-code-review-vs-manual" className="block bg-[#161618] border border-white/10 rounded-xl p-6 hover:border-violet-500/50 transition">
          <h2 className="text-xl font-semibold mb-2">AI Code Review vs Manual Code Review</h2>
          <p className="text-[#A1A1AA]">Compare strengths, weaknesses, and when to use each approach.</p>
        </Link>
        <Link to="/blog/github-pull-request-best-practices" className="block bg-[#161618] border border-white/10 rounded-xl p-6 hover:border-violet-500/50 transition">
          <h2 className="text-xl font-semibold mb-2">GitHub Pull Request Best Practices</h2>
          <p className="text-[#A1A1AA]">Keep PRs small, descriptive, and easy to review.</p>
        </Link>
        <Link to="/blog/common-security-issues-in-pr-reviews" className="block bg-[#161618] border border-white/10 rounded-xl p-6 hover:border-violet-500/50 transition">
          <h2 className="text-xl font-semibold mb-2">Common Security Issues Found During PR Reviews</h2>
          <p className="text-[#A1A1AA]">Injection flaws, hardcoded secrets, and unsafe deserialization.</p>
        </Link>
        <Link to="/blog/how-rag-improves-code-review-systems" className="block bg-[#161618] border border-white/10 rounded-xl p-6 hover:border-violet-500/50 transition">
          <h2 className="text-xl font-semibold mb-2">How RAG Improves Code Review Systems</h2>
          <p className="text-[#A1A1AA]">Grounded answers from repository context.</p>
        </Link>
        <Link to="/blog/building-an-ai-pull-request-review-tool" className="block bg-[#161618] border border-white/10 rounded-xl p-6 hover:border-violet-500/50 transition">
          <h2 className="text-xl font-semibold mb-2">Building an AI Pull Request Review Tool</h2>
          <p className="text-[#A1A1AA]">Architecture overview and tradeoffs.</p>
        </Link>
        <Link to="/blog/reducing-review-time-with-ai-assisted-analysis" className="block bg-[#161618] border border-white/10 rounded-xl p-6 hover:border-violet-500/50 transition">
          <h2 className="text-xl font-semibold mb-2">Reducing Review Time with AI-Assisted Analysis</h2>
          <p className="text-[#A1A1AA]">Cut cycle time by summarizing PRs and highlighting high-risk areas.</p>
        </Link>
        <Link to="/blog/large-pull-requests-challenges-and-solutions" className="block bg-[#161618] border border-white/10 rounded-xl p-6 hover:border-violet-500/50 transition">
          <h2 className="text-xl font-semibold mb-2">Large Pull Requests: Challenges and Solutions</h2>
          <p className="text-[#A1A1AA]">Breaking large PRs into smaller batches improves throughput.</p>
        </Link>
        <Link to="/blog/automating-pr-summaries-using-llms" className="block bg-[#161618] border border-white/10 rounded-xl p-6 hover:border-violet-500/50 transition">
          <h2 className="text-xl font-semibold mb-2">Automating PR Summaries Using LLMs</h2>
          <p className="text-[#A1A1AA]">Prompting patterns, chunking strategies, and formatting tips.</p>
        </Link>
        <Link to="/blog/developer-productivity-with-ai-review-tools" className="block bg-[#161618] border border-white/10 rounded-xl p-6 hover:border-violet-500/50 transition">
          <h2 className="text-xl font-semibold mb-2">Developer Productivity with AI Review Tools</h2>
          <p className="text-[#A1A1AA]">Spend more time building, less time hunting for issues.</p>
        </Link>
      </div>

      <div className="mt-12">
        <Link to="/" className="text-violet-400 hover:text-violet-300">&larr; Back to Home</Link>
      </div>
    </div>
  </div>
);

export default BlogPage;
