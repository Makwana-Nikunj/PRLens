import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const PrivacyPolicyPage = () => (
  <div className="min-h-screen bg-[#0f0f13] text-white">
    <Helmet>
      <title>Privacy Policy - PRLens</title>
      <meta name="description" content="PRLens privacy policy: how we handle your GitHub data, PR analysis, cookies, and personal information." />
      <link rel="canonical" href="https://prlens-eight.vercel.app/privacy" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-[#A1A1AA] text-lg mb-10">Last updated: June 2026</p>

      <div className="space-y-8">
        <section className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
          <p className="text-[#A1A1AA] leading-relaxed">
            PRLens ("we", "our", or "us") is an AI-powered pull request analysis tool. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service. By using PRLens, you agree to the practices described in this policy.
          </p>
        </section>

        <section className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
          <p className="text-[#A1A1AA] leading-relaxed mb-2">
            We collect information necessary to provide and improve the PRLens service:
          </p>
          <ul className="list-disc list-inside text-[#A1A1AA] space-y-2">
            <li><strong className="text-white">GitHub Profile Data:</strong> When you sign in with GitHub OAuth, we receive your GitHub login, avatar URL, and public profile information.</li>
            <li><strong className="text-white">GitHub Access Token:</strong> A GitHub access token is stored securely to access repositories on your behalf. It is never shared with third parties outside of GitHub's own API.</li>
            <li><strong className="text-white">Pull Request Data:</strong> When you analyze a PR, we fetch the PR metadata, file diffs, and related content via the GitHub API. This data is used solely for analysis and is not retained longer than necessary.</li>
            <li><strong className="text-white">Usage Data:</strong> We collect basic usage analytics (e.g., number of analyses performed) to monitor service health and prevent abuse.</li>
          </ul>
        </section>

        <section className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
          <ul className="list-disc list-inside text-[#A1A1AA] space-y-2">
            <li>To authenticate you via GitHub OAuth and maintain your session.</li>
            <li>To fetch and analyze pull request diffs, files, and metadata.</li>
            <li>To generate AI-powered summaries, risk assessments, and chat responses.</li>
            <li>To store your analysis history so you can revisit previous PR analyses.</li>
            <li>To improve service reliability, performance, and security.</li>
          </ul>
        </section>

        <section className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-3">4. Data Sharing and Disclosure</h2>
          <p className="text-[#A1A1AA] leading-relaxed">
            We do not sell, trade, or rent your personal information to third parties. Your PR data is processed by AI providers (e.g., OpenAI, Anthropic) solely to generate analysis results. These providers do not retain your data beyond the processing request unless otherwise stated in their respective privacy policies. We may disclose information if required by law or to protect our rights, property, or safety.
          </p>
        </section>

        <section className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-3">5. Cookies and Local Storage</h2>
          <p className="text-[#A1A1AA] leading-relaxed">
            PRLens uses httpOnly cookies to store JWT access and refresh tokens for authentication. These cookies are essential for the service to function and are not used for tracking. We also use browser localStorage to persist your authentication state for a better user experience. No third-party advertising cookies are used.
          </p>
        </section>

        <section className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-3">6. Data Retention and Deletion</h2>
          <p className="text-[#A1A1AA] leading-relaxed">
            You can delete any PR analysis at any time through the dashboard. Deleting an analysis removes the associated PR metadata, analysis results, chat history, and RAG vector embeddings from our database. Your GitHub access token is removed upon logout. We retain minimal usage logs for security and debugging purposes only.
          </p>
        </section>

        <section className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-3">7. Security</h2>
          <p className="text-[#A1A1AA] leading-relaxed">
            We take reasonable measures to protect your information, including HTTPS encryption, JWT-based authentication, rate limiting, and secure credential storage. However, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
          </p>
        </section>

        <section className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-3">8. Third-Party Services</h2>
          <p className="text-[#A1A1AA] leading-relaxed">
            PRLens relies on the following third-party services, each with its own privacy policy:
          </p>
          <ul className="list-disc list-inside text-[#A1A1AA] space-y-2 mt-2">
            <li><strong className="text-white">GitHub:</strong> For OAuth authentication and repository/PR data access.</li>
            <li><strong className="text-white">OpenAI / Anthropic / Other AI Providers:</strong> For generating PR analysis and chat responses.</li>
            <li><strong className="text-white">PostgreSQL (Hosted Provider):</strong> For storing user data, analysis history, and embeddings.</li>
          </ul>
        </section>

        <section className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-3">9. Children's Privacy</h2>
          <p className="text-[#A1A1AA] leading-relaxed">
            PRLens is not intended for users under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so we can take appropriate action.
          </p>
        </section>

        <section className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-3">10. Changes to This Privacy Policy</h2>
          <p className="text-[#A1A1AA] leading-relaxed">
            We may update this policy from time to time. We will notify users of any material changes by posting the new policy on this page and updating the "Last updated" date. Continued use of PRLens after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="bg-[#161618] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
          <p className="text-[#A1A1AA] leading-relaxed">
            If you have questions or concerns about this Privacy Policy, please reach out via our <a href="https://github.com/Makwana-Nikunj/PRLens" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">GitHub repository</a> or open an issue.
          </p>
        </section>
      </div>

      <div className="mt-12">
        <Link to="/" className="text-violet-400 hover:text-violet-300">&larr; Back to Home</Link>
      </div>
    </div>
  </div>
);

export default PrivacyPolicyPage;
