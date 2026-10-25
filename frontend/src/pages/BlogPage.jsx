import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Grouped index instead of one flat stack of cards. Every slug below is a live
// route (see App.jsx), so the groups only change how the list is presented.
const GROUPS = [
  {
    id: 'review-workflow',
    label: 'Review workflow',
    blurb: 'Making the review itself smaller, faster and safer.',
    posts: [
      {
        slug: 'how-to-review-pull-requests-faster-with-ai',
        title: 'How to Review Pull Requests Faster with AI',
        description: 'Practical techniques for cutting review time without sacrificing quality.',
      },
      {
        slug: 'reducing-review-time-with-ai-assisted-analysis',
        title: 'Reducing Review Time with AI-Assisted Analysis',
        description: 'Cut cycle time by summarizing PRs and highlighting high-risk areas.',
      },
      {
        slug: 'large-pull-requests-challenges-and-solutions',
        title: 'Large Pull Requests: Challenges and Solutions',
        description: 'Breaking large PRs into smaller batches improves throughput.',
      },
      {
        slug: 'github-pull-request-best-practices',
        title: 'GitHub Pull Request Best Practices',
        description: 'Keep PRs small, descriptive, and easy to review.',
      },
      {
        slug: 'developer-productivity-with-ai-review-tools',
        title: 'Developer Productivity with AI Review Tools',
        description: 'Spend more time building, less time hunting for issues.',
      },
    ],
  },
  {
    id: 'security',
    label: 'Security',
    blurb: 'What automated review catches before it ships.',
    posts: [
      {
        slug: 'common-security-issues-in-pr-reviews',
        title: 'Common Security Issues Found During PR Reviews',
        description: 'Injection flaws, hardcoded secrets, and unsafe deserialization.',
      },
    ],
  },
  {
    id: 'building-and-architecture',
    label: 'Building & architecture',
    blurb: 'How AI review systems are put together.',
    posts: [
      {
        slug: 'building-an-ai-pull-request-review-tool',
        title: 'Building an AI Pull Request Review Tool',
        description: 'Architecture overview and tradeoffs.',
      },
      {
        slug: 'how-rag-improves-code-review-systems',
        title: 'How RAG Improves Code Review Systems',
        description: 'Grounded answers from repository context.',
      },
      {
        slug: 'automating-pr-summaries-using-llms',
        title: 'Automating PR Summaries Using LLMs',
        description: 'Prompting patterns, chunking strategies, and formatting tips.',
      },
      {
        slug: 'ai-code-review-vs-manual',
        title: 'AI Code Review vs Manual Code Review',
        description: 'Compare strengths, weaknesses, and when to use each approach.',
      },
    ],
  },
];

const BlogPage = () => (
  <div className="min-h-[100dvh] bg-[var(--prl-bg)] text-[var(--prl-text)]">
    <Helmet>
      <title>Blog - PRLens</title>
      <meta name="description" content="Articles about AI-powered code review, GitHub workflows, and developer productivity." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/blog" />
    </Helmet>
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-4 font-display">Blog</h1>
      <p className="text-[var(--prl-text-dim)] text-lg mb-12">Articles about AI-powered code review, GitHub workflows, and developer productivity.</p>

      <div className="grid gap-x-12 gap-y-14 md:grid-cols-2">
        {GROUPS.map((group) => (
          <section key={group.id} aria-labelledby={`blog-group-${group.id}`}>
            <div className="flex items-baseline gap-3 mb-1.5">
              <h2
                id={`blog-group-${group.id}`}
                className="text-xl font-semibold font-display text-[var(--prl-text)]"
              >
                {group.label}
              </h2>
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--prl-text-faint)]">
                {String(group.posts.length).padStart(2, '0')}
              </span>
            </div>
            <p className="text-[13px] text-[var(--prl-text-faint)] mb-5">{group.blurb}</p>

            <ul className="space-y-3">
              {group.posts.map((post) => (
                <li key={post.slug}>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group block bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md p-5 transition-colors hover:border-[var(--prl-accent-line)]"
                  >
                    <h3 className="text-[15px] font-semibold mb-1.5 font-display text-[var(--prl-text)] group-hover:text-[var(--prl-accent)]">
                      {post.title}
                    </h3>
                    <p className="text-[13px] text-[var(--prl-text-dim)] leading-relaxed">
                      {post.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-16">
        <Link to="/" className="text-[var(--prl-accent)] hover:underline">&larr; Back to Home</Link>
      </div>
    </div>
  </div>
);

export default BlogPage;
