import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import GithubSignIn from "./pages/GithubSignIn";
import DocsPage from "./pages/DocsPage";
import GettingStartedPage from "./pages/GettingStartedPage";
import FeaturesPage from "./pages/FeaturesPage";
import FAQPage from "./pages/FAQPage";
import AIReviewPage from "./pages/AIReviewPage";
import GitHubPRAnalysisPage from "./pages/GitHubPRAnalysisPage";
import PRSummaryPage from "./pages/PRSummaryPage";
import CodeReviewAutomationPage from "./pages/CodeReviewAutomationPage";
import BlogPage from "./pages/BlogPage";
import HowToReviewFasterWithAI from "./pages/blog/HowToReviewFasterWithAI.jsx";
import AICodeReviewVsManual from "./pages/blog/AICodeReviewVsManual.jsx";
import GitHubPRBestPractices from "./pages/blog/GitHubPRBestPractices.jsx";
import CommonSecurityIssuesInPRReviews from "./pages/blog/CommonSecurityIssuesInPRReviews.jsx";
import HowRAGImprovesCodeReviewSystems from "./pages/blog/HowRAGImprovesCodeReviewSystems.jsx";
import BuildingAnAIPullRequestReviewTool from "./pages/blog/BuildingAnAIPullRequestReviewTool.jsx";
import ReducingReviewTimeWithAIAssistedAnalysis from "./pages/blog/ReducingReviewTimeWithAIAssistedAnalysis.jsx";
import LargePullRequestsChallengesAndSolutions from "./pages/blog/LargePullRequestsChallengesAndSolutions.jsx";
import AutomatingPRSummariesUsingLLMs from "./pages/blog/AutomatingPRSummariesUsingLLMs.jsx";
import DeveloperProductivityWithAIReviewTools from "./pages/blog/DeveloperProductivityWithAIReviewTools.jsx";
import ProtectedRoute from "./Components/ProtectedRoute";
import ErrorBoundary from "./Components/ErrorBoundary";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const ChatInterface = lazy(() => import("./pages/ChatInterface"));
const FileExplanations = lazy(() => import("./pages/FileExplanations"));

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0b1326] text-white">
    <span className="material-symbols-outlined text-4xl animate-spin text-violet-400">progress_activity</span>
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Suspense fallback={<Loader />}>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<GithubSignIn />} />

            <Route path="/docs" element={<DocsPage />} />
            <Route path="/docs/getting-started" element={<GettingStartedPage />} />
            <Route path="/docs/features" element={<FeaturesPage />} />
            <Route path="/docs/faq" element={<FAQPage />} />

            <Route path="/ai-code-review" element={<AIReviewPage />} />
            <Route path="/github-pull-request-analysis" element={<GitHubPRAnalysisPage />} />
            <Route path="/pull-request-summary" element={<PRSummaryPage />} />
            <Route path="/code-review-automation" element={<CodeReviewAutomationPage />} />

            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/how-to-review-pull-requests-faster-with-ai" element={<HowToReviewFasterWithAI />} />
            <Route path="/blog/ai-code-review-vs-manual" element={<AICodeReviewVsManual />} />
            <Route path="/blog/github-pull-request-best-practices" element={<GitHubPRBestPractices />} />
            <Route path="/blog/common-security-issues-in-pr-reviews" element={<CommonSecurityIssuesInPRReviews />} />
            <Route path="/blog/how-rag-improves-code-review-systems" element={<HowRAGImprovesCodeReviewSystems />} />
            <Route path="/blog/building-an-ai-pull-request-review-tool" element={<BuildingAnAIPullRequestReviewTool />} />
            <Route path="/blog/reducing-review-time-with-ai-assisted-analysis" element={<ReducingReviewTimeWithAIAssistedAnalysis />} />
            <Route path="/blog/large-pull-requests-challenges-and-solutions" element={<LargePullRequestsChallengesAndSolutions />} />
            <Route path="/blog/automating-pr-summaries-using-llms" element={<AutomatingPRSummariesUsingLLMs />} />
            <Route path="/blog/developer-productivity-with-ai-review-tools" element={<DeveloperProductivityWithAIReviewTools />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/:id" element={<FileExplanations />} />
              <Route path="/chat/:id" element={<ChatInterface />} />
            </Route>

            <Route path="*" element={
              <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b1326] text-white">
                <span className="material-symbols-outlined text-6xl text-slate-400 mb-4">route_off</span>
                <h1 className="text-3xl font-bold mb-2">404 - Page Not Found</h1>
                <p className="text-slate-400 mb-6">The page you're looking for doesn't exist.</p>
                <a href="/" className="px-6 py-2 bg-primary rounded-md text-white font-medium hover:bg-primary/90 transition-colors">
                  Go Home
                </a>
              </div>
            } />
          </Routes>
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}

export default App;
