import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, FileCode2, MessageSquare, ArrowRight } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const scenarios = [
  {
    id: 'auth',
    name: 'Auth.js v5 Migration',
    repo: 'authjs/next-auth #9412',
    stats: '+342 -28 lines · 6 files',
    summary: 'Replaces custom JWT cookie handling with native Auth.js v5 edge session adapter and adds WebAuthn passkey support.',
    risk: {
      level: 'High Severity',
      desc: 'Breaking route contract: /api/auth/session no longer exports raw user metadata object.',
      color: 'text-red-400',
      bg: 'bg-red-950/40',
    },
    files: [
      { name: 'src/auth/config.ts', diff: '+42 -8', text: 'Configured new passkey credential provider' },
      { name: 'src/middleware.ts', diff: '+14 -4', text: 'Bypasses token verification on static assets' },
    ],
    chat: {
      q: 'Will existing session cookies fail after this deploy?',
      a: 'No. The PR includes a backward-compatible cookie decoder in src/auth/compat.ts that migrates v4 tokens automatically.',
    },
  },
  {
    id: 'stripe',
    name: 'Stripe Webhook Signature',
    repo: 'stripe/stripe-node #882',
    stats: '+94 -12 lines · 3 files',
    summary: 'Enforces HMAC signature verification on incoming webhook payloads to prevent unauthorized webhook spoofing.',
    risk: {
      level: 'Medium Severity',
      desc: 'Requires raw body buffer: JSON body parser must be bypassed for this route.',
      color: 'text-amber-400',
      bg: 'bg-amber-950/40',
    },
    files: [
      { name: 'src/api/webhooks.ts', diff: '+68 -8', text: 'Added stripe.webhooks.constructEvent check' },
      { name: 'src/server.ts', diff: '+26 -4', text: 'Configured raw buffer middleware on /webhooks' },
    ],
    chat: {
      q: 'What happens if a webhook arrives with an invalid signature?',
      a: 'The handler throws a 400 Bad Request error and logs the signature mismatch without executing business logic.',
    },
  },
  {
    id: 'redis',
    name: 'Redis Connection Leak',
    repo: 'redis/ioredis #205',
    stats: '+24 -6 lines · 2 files',
    summary: 'Fixes memory leak by ensuring dangling reconnect intervals are properly cleared when Redis disconnects.',
    risk: {
      level: 'Low Severity',
      desc: 'Bugfix only: No breaking changes or configuration modifications required.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/40',
    },
    files: [
      { name: 'lib/connection.ts', diff: '+18 -4', text: 'Cleared active reconnection timer in cleanup handler' },
      { name: 'test/leak.test.ts', diff: '+6 -2', text: 'Added unit test validating timer clearance' },
    ],
    chat: {
      q: 'Is this safe to deploy to production without downtime?',
      a: 'Yes. It fixes an edge-case memory leak on network blips and maintains full API compatibility.',
    },
  },
];

const Showcase = () => {
  const [activeScenarioId, setActiveScenarioId] = useState('auth');
  const [activeTab, setActiveTab] = useState('summary');
  const [inputUrl, setInputUrl] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const current = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];

  const handleCustomAnalyze = (e) => {
    e.preventDefault();
    const url = inputUrl.trim() || `https://github.com/${current.repo.split(' ')[0]}/pull/${current.repo.split('#')[1]}`;
    sessionStorage.setItem('pending_pr_analyze', url);
    navigate(isAuthenticated ? '/dashboard' : '/login');
  };

  return (
    <section id="demo" className="bg-[var(--prl-bg-soft)] text-[var(--prl-text)] py-28 md:py-36 px-6 w-full">
      <div className="max-w-[1320px] mx-auto">
        <h2 className="font-display font-bold text-[clamp(36px,5vw,60px)] leading-[0.96] tracking-[-0.04em] mb-4 prl-entrance">
          Inspect a pull request live.
        </h2>
        <p className="text-[18px] text-[var(--prl-text-dim)] mb-14 max-w-[50ch] prl-entrance prl-delay-1">
          Test the analysis engine directly on real pull request scenarios, or test your own repo.
        </p>

        {/* Live Demo with controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start prl-entrance prl-delay-2">
          {/* Left: Controls Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-lg bg-[var(--prl-panel-2)]">
              <span className="block text-[14px] font-semibold text-[var(--prl-text)] mb-3">
                Select Scenario
              </span>
              <div className="space-y-2">
                {scenarios.map((sc) => {
                  const isSelected = sc.id === activeScenarioId;
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => setActiveScenarioId(sc.id)}
                      className={`w-full text-left p-3.5 rounded transition-colors duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--prl-accent-fill)] text-[var(--prl-on-accent)] font-semibold'
                          : 'bg-[var(--prl-bg)] text-[var(--prl-text)] hover:bg-[var(--prl-surface-2)]'
                      }`}
                    >
                      <div className="text-[15px]">{sc.name}</div>
                      <div className={`text-[13px] ${isSelected ? 'text-black/80' : 'text-[var(--prl-text-dim)]'}`}>
                        {sc.repo}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom URL Tester */}
            <form onSubmit={handleCustomAnalyze} className="p-5 rounded-lg bg-[var(--prl-panel-2)] space-y-3">
              <label htmlFor="showcase-url" className="block text-[14px] font-semibold text-[var(--prl-text)]">
                Or Analyze Any PR
              </label>
              <input
                id="showcase-url"
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://github.com/owner/repo/pull/123"
                className="w-full p-3 rounded bg-[var(--prl-bg)] text-[14px] text-[var(--prl-text)] outline-none focus:ring-1 focus:ring-[var(--prl-accent)]"
              />
              <button
                type="submit"
                className="w-full py-3 px-4 rounded bg-[var(--prl-accent-fill)] text-[var(--prl-on-accent)] font-semibold text-[14px] hover:brightness-105 cursor-pointer"
              >
                Analyze in Dashboard &rarr;
              </button>
            </form>
          </div>

          {/* Right: Live Interactive Demo Area (data-ui) */}
          <div className="lg:col-span-8 w-full">
            <div data-ui className="w-full rounded-lg p-6 md:p-8 bg-[var(--prl-panel-2)]">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-3 mb-5">
                <div>
                  <h3 className="text-[18px] font-bold text-[var(--prl-text)]">
                    {current.repo}
                  </h3>
                  <p className="text-[14px] text-[var(--prl-text-dim)]">
                    {current.stats}
                  </p>
                </div>

                {/* View Tabs */}
                <div className="flex items-center gap-1.5 p-1 rounded bg-[var(--prl-bg)]">
                  <button
                    type="button"
                    onClick={() => setActiveTab('summary')}
                    className={`py-1.5 px-3 rounded text-[13px] font-semibold transition-colors cursor-pointer ${
                      activeTab === 'summary'
                        ? 'bg-[var(--prl-panel-2)] text-[var(--prl-accent)]'
                        : 'text-[var(--prl-text-dim)] hover:text-[var(--prl-text)]'
                    }`}
                  >
                    Summary
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('risks')}
                    className={`py-1.5 px-3 rounded text-[13px] font-semibold transition-colors cursor-pointer ${
                      activeTab === 'risks'
                        ? 'bg-[var(--prl-panel-2)] text-[var(--prl-accent)]'
                        : 'text-[var(--prl-text-dim)] hover:text-[var(--prl-text)]'
                    }`}
                  >
                    Risk Radar
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('files')}
                    className={`py-1.5 px-3 rounded text-[13px] font-semibold transition-colors cursor-pointer ${
                      activeTab === 'files'
                        ? 'bg-[var(--prl-panel-2)] text-[var(--prl-accent)]'
                        : 'text-[var(--prl-text-dim)] hover:text-[var(--prl-text)]'
                    }`}
                  >
                    Files
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('chat')}
                    className={`py-1.5 px-3 rounded text-[13px] font-semibold transition-colors cursor-pointer ${
                      activeTab === 'chat'
                        ? 'bg-[var(--prl-panel-2)] text-[var(--prl-accent)]'
                        : 'text-[var(--prl-text-dim)] hover:text-[var(--prl-text)]'
                    }`}
                  >
                    AI Chat
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="min-h-[220px]">
                {activeTab === 'summary' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded bg-[var(--prl-bg)]">
                      <div className="flex items-center gap-2 text-[15px] font-semibold text-[var(--prl-text)] mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Executive Intent
                      </div>
                      <p className="text-[15px] text-[var(--prl-text-dim)] leading-relaxed">
                        {current.summary}
                      </p>
                    </div>

                    <div className="p-4 rounded bg-[var(--prl-bg)] text-[14px] text-[var(--prl-text-dim)] flex items-center justify-between">
                      <span>Automated Checklist: 5/5 verifications passed</span>
                      <span className="text-emerald-400 font-semibold">CI Green</span>
                    </div>
                  </div>
                )}

                {activeTab === 'risks' && (
                  <div className="space-y-4">
                    <div className={`p-4 rounded ${current.risk.bg}`}>
                      <div className={`text-[15px] font-semibold ${current.risk.color} flex items-center gap-2 mb-2`}>
                        <AlertTriangle className="w-4 h-4" />
                        {current.risk.level}
                      </div>
                      <p className="text-[14px] text-[var(--prl-text)] leading-relaxed">
                        {current.risk.desc}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'files' && (
                  <div className="space-y-3">
                    {current.files.map((f) => (
                      <div key={f.name} className="p-3.5 rounded bg-[var(--prl-bg)]">
                        <div className="flex items-center justify-between text-[13px] mb-1">
                          <code className="text-[var(--prl-text)]">{f.name}</code>
                          <span className="text-emerald-400 font-medium">{f.diff}</span>
                        </div>
                        <p className="text-[14px] text-[var(--prl-text-dim)]">
                          {f.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'chat' && (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded bg-[var(--prl-bg)] text-[14px] text-[var(--prl-text)]">
                      <span className="text-[13px] font-semibold text-[var(--prl-accent)] block mb-1">Reviewer:</span>
                      {current.chat.q}
                    </div>
                    <div className="p-3.5 rounded bg-[var(--prl-bg)] text-[14px] text-[var(--prl-text-dim)] leading-relaxed">
                      <span className="text-[13px] font-semibold text-emerald-400 block mb-1">PRLens:</span>
                      {current.chat.a}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom action */}
              <div className="pt-5 mt-5 flex flex-wrap items-center justify-between gap-4">
                <span className="text-[14px] text-[var(--prl-text-dim)]">
                  Want the full interactive dashboard for your own pull requests?
                </span>
                <button
                  type="button"
                  onClick={handleCustomAnalyze}
                  className="inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--prl-accent)] hover:underline cursor-pointer"
                >
                  Open in demo dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Showcase;
