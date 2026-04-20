import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import GithubSignIn from "./pages/GithubSignIn";
import ProtectedRoute from "./Components/ProtectedRoute";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const ChatInterface = lazy(() => import("./pages/ChatInterface"));
const FileExplanations = lazy(() => import("./pages/FileExplanations"));

// Fallback loader
const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0b1326] text-white">
    <span className="material-symbols-outlined text-4xl animate-spin text-primary">progress_activity</span>
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<GithubSignIn />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/:id" element={<FileExplanations />} />
            <Route path="/chat/:id" element={<ChatInterface />} />
          </Route>

          {/* Catch-all 404 Route */}
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
      </Suspense>
    </div>
  );
}

export default App;
