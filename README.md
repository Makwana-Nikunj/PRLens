<p align="center">
  <img src="https://img.shields.io/badge/PRLens-PR%20Intelligence-8957E5?style=for-the-badge&labelColor=0d1117" alt="PRLens" />
</p>

<h1 align="center">🔍 PRLens</h1>
<p align="center">
  <strong>AI-powered Pull Request analysis tool — review PRs faster with intelligent insights</strong>
</p>

<p align="center">
  <a href="#-features">✨ Features</a> &nbsp;·&nbsp;
  <a href="#-quick-start">🚀 Quick Start</a> &nbsp;·&nbsp;
  <a href="#-api-reference">📡 API Reference</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-5.2-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-47A248?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Vite-7.2-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.2-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Zustand-5.0-6C5EB5?style=flat-square&logo=react&logoColor=white" alt="Zustand" />
  <img src="https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white" alt="OpenAI" />
</p>

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Authentication Flows](#-authentication-flows)
- [Frontend Deep Dive](#-frontend-deep-dive)
- [Performance & Optimizations](#-performance--optimizations)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [Author](#-author)
- [License](#-license)

---

## ✨ Features

### Core Analysis
| Feature | Description |
|---------|-------------|
| 📊 **PR Summary** | AI-generated overview of what the PR does, its size, and impact |
| 📂 **File Changes** | Structured view of added/modified/deleted files with stats |
| 🚨 **Risk Detection** | Highlights breaking changes, security concerns, and anti-patterns |
| 💬 **AI Chat** | Context-aware chat powered by LLMs — ask follow-up questions about the PR |

### User Experience
| Feature | Description |
|---------|-------------|
| 🔐 **GitHub OAuth** | Secure login with GitHub to access private and public repositories |
| 📜 **Analysis History** | Revisit previously analyzed PRs from your personal history |
| 📱 **Responsive UI** | Clean, modern dashboard that works on desktop and mobile |
| ⚡ **Fast Analysis** | Caching and optimized GitHub API calls for quick results |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework with concurrent features |
| **Vite 7** | Lightning-fast build tool & dev server |
| **Tailwind CSS 4** | Utility-first styling via `@tailwindcss/vite` plugin |
| **React Router DOM 7** | Client-side routing |
| **Zustand 5** | Lightweight global state management (auth only) |
| **Axios** | HTTP client with 401 refresh interceptor |
| **Lucide React** | Icon library |
| **React Markdown** | Markdown rendering for AI responses + remark-gfm |
| **react-helmet-async** | Per-page SEO meta tags |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js 18+** | JavaScript runtime (ESM) |
| **Express 5** | Web framework |
| **PostgreSQL** | Relational database (via `postgres` driver) + pgvector |
| **@langchain/textsplitters** | Recursive chunking for RAG (1000 chars, 200 overlap) |
| **OpenAI SDK** | Unified API client for multi-provider AI (round-robin + failover) |
| **Octokit REST** | GitHub API client |
| **express-rate-limit** | Per-route rate limiting (5 analyses / 15 min, 60 chat / min) |
| **compression** | Gzip response compression (~70% smaller JSON) |
| **jsonwebtoken** | JWT access + refresh token auth |
| **node-cache** | GitHub API response caching |
| **Nodemon** | Development hot-reload |
| **cookie-parser** | HTTP-only cookie parsing for JWT tokens |
| **security middleware** | Helmet-style security headers (HSTS, X-Frame-Options, etc.) |
| **request logger** | Request/response timing + auth failure monitoring |

---

## 🏗 Architecture

```mermaid
flowchart TB
    subgraph Client["🖥 Frontend — React + Vite"]
        UI["React Pages & Components"]
        Store["Zustand Store (auth, history)"]
        Services["Service Layer (Axios)"]
        UI --> Store --> Services
    end

    subgraph Server["⚙️ Backend — Node.js + Express 5"]
        Routes["Route Handlers"]
        Auth["Auth Middleware (JWT verify)"]
        Controllers["Controllers"]
        Services2["Services (AI, GitHub)"]
        Routes --> Auth --> Controllers --> Services2
    end

    subgraph External["☁️ External Services"]
        GitHub["GitHub API (Octokit)"]
        AI["OpenAI / Claude API"]
        PostgreSQL[("PostgreSQL Database")]
    end

    Services <-->|"REST API + httpOnly Cookies"| Routes
    Services2 --> GitHub
    Services2 --> AI
    Controllers --> PostgreSQL
```

### Request Flow

```
Client Request (PR URL)
  → Express Router
    → Auth Middleware (JWT verify)
      → PR Controller (business logic)
        → Octokit (fetch PR diff, files, metadata)
        → AI Service (analyze diff + context)
        → PostgreSQL (save analysis to history)
      ← Analysis Result
    ← JSON Response
  ← Client renders Summary / Changes / Risks
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ and **npm**
- **PostgreSQL** (local install or [Neon](https://neon.tech)/[Supabase](https://supabase.com) free tier)
- **GitHub OAuth App** ([create one](https://github.com/settings/developers))
- **AI API Key** ([OpenAI](https://platform.openai.com) or [Anthropic](https://console.anthropic.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/Makwana-Nikunj/PRLens.git
cd PRLens

# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

Create environment files (see [Environment Variables](#-environment-variables) for all options):

```bash
# Backend
cp Backend/.env.example Backend/.env  # or create manually

# Frontend
cp frontend/.env.example frontend/.env  # or create manually
```

### Run Development Servers

```bash
# Terminal 1 — Backend (http://localhost:8000)
cd Backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd ../frontend
npm run dev
```

Open **http://localhost:5173** in your browser and login with GitHub.

---

## 🔐 Environment Variables

### Backend (`Backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `8000` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/prlens` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |
| `ACCESS_TOKEN_SECRET` | JWT access token secret (32+ chars) | `your-secret-key` |
| `ACCESS_TOKEN_EXPIRY` | Access token TTL | `15m` |
| `REFRESH_TOKEN_SECRET` | JWT refresh token secret (32+ chars) | `your-secret-key` |
| `REFRESH_TOKEN_EXPIRY` | Refresh token TTL | `7d` |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID | `Iv1.xxxxx` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret | `your_secret` |
| `FRONTEND_URL` | Frontend URL for redirects | `http://localhost:5173` |
| `AI_BASE_URL` | AI API base URL | `https://openrouter.ai/api/v1` or compatible endpoints |
| `AI_API_KEY` | AI API key for primary provider | `sk-xxxx` |
| `AI_MODEL` | AI model to use | *(configurable)* |
| `PROVIDER_1_BASE_URL` | Override provider 1 base URL | *(overrides `AI_BASE_URL`)* |
| `PROVIDER_1_API_KEY` | Override provider 1 key | *(overrides `AI_API_KEY`)* |
| `PROVIDER_1_MODEL` | Override provider 1 model | |
| `PROVIDER_1_FALLBACK_MODEL` | Fallback model for provider 1 | |
| `MODAL_AI_BASE_URL` | Modal AI base URL | |
| `MODAL_AI_API_KEY` | Modal AI API key | |
| `MODAL_AI_MODEL` | Modal AI model | |
| `NVIDIA_AI_BASE_URL` | NVIDIA AI base URL | |
| `NVIDIA_AI_API_KEY` | NVIDIA AI API key | |
| `NVIDIA_AI_MODEL` | NVIDIA AI model | |
| `PROVIDER_4_BASE_URL` | NVIDIA provider base URL | |
| `PROVIDER_4_API_KEY` | NVIDIA provider API key | |
| `PROVIDER_4_MODEL` | NVIDIA provider model | |
| `PROVIDER_4_FALLBACK_MODEL` | NVIDIA provider fallback model | |
| `PROVIDER_GEMINI_BASE_URL` | Gemini API base URL | `https://generativelanguage.googleapis.com/v1beta` |
| `PROVIDER_GEMINI_API_KEY` | Gemini API key (shared with embeddings) | |
| `GEMINI_FALLBACK_MODEL` | Gemini model used as last-resort fallback | |
| `RAG_ENABLED` | Disable RAG indexing | `'true'` (set `'false'` to skip) |
| `RAG_SIMILARITY_THRESHOLD` | Min cosine similarity for RAG results | `0.4` |
| `RAG_TOP_K` | Max RAG chunks returned per query | `5` |
| `GEMINI_API_KEY` | Alias for `PROVIDER_GEMINI_API_KEY` | |
| `RENDER_EXTERNAL_URL` | Keep-alive URL (production) | `https://prlens.onrender.com` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000/api` |

> ⚠️ **Never commit `.env` files.** Both directories have `.gitignore` entries for these files.

---

## 📁 Project Structure

```
PRLens/
├── README.md
├── package.json
├── tailwind.config.js
├── Backend/
│   ├── package.json
│   └── src/
│       ├── index.js              # Server entry — DB connect & listen
│       ├── app.js                # Express app — middleware, CORS, routes
│       ├── controllers/
│       │   ├── auth.controller.js    # GitHub OAuth, JWT, token refresh, logout
│       │   ├── pr.controller.js      # PR analyze, history, delete, rename
│       │   └── chat.controller.js    # AI chat SSE streaming with RAG
│       ├── services/
│       │   ├── ai.service.js         # PR analysis + chat streaming
│       │   ├── ai.providers.js      # Multi-provider registry, round-robin, failover
│       │   ├── github.service.js    # Octokit-based GitHub API client
│       │   ├── oauth.service.js     # GitHub OAuth token verification
│       │   ├── rag.service.js       # Chunk storage, vector retrieval, cleanup
│       │   ├── gemini-embeddings.service.js  # Gemini embedding client (1536-dim)
│       │   ├── chunker.service.js   # Diff filtering, truncation, prompt formatting
│       │   ├── cache.service.js     # PR + analysis DB cache with upsert
│       │   ├── chat.service.js      # Chat message persistence
│       │   └── analytics.service.js # Usage analytics
│       ├── middlewares/
│       │   ├── auth.middleware.js      # JWT verification + cache invalidation
│       │   ├── rateLimit.middleware.js # API, auth, analyze, chat limiter
│       │   ├── security.middleware.js  # Security headers (helmet-style)
│       │   └── requestLogger.middleware.js # Request/response logging
│       ├── db/
│       │   └── index.js             # PostgreSQL connection via `postgres`
│       └── utils/
│           ├── keepAlive.js         # Production keep-alive ping
│           ├── tokenBudget.js       # Token caps (systemPrompt, userMessage, RAG)
│           ├── ApiResponse.js       # Envelope response helper
│           ├── ApiError.js          # Envelope error helper
│           ├── asyncHandler.js      # Express error wrapper
│           └── username.util.js     # Unique username generator
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx              # React entry — mounts App
        ├── App.jsx               # Root component & routing
        ├── index.css             # Global styles + Tailwind
        ├── conf/
        │   └── conf.js           # API base URL config
        ├── store/
        │   └── authStore.js      # Zustand auth state + localStorage persist
        ├── lib/
        │   └── apiClient.js      # Axios instance with 401 refresh interceptor
        ├── hooks/
        │   ├── useGithubOAuth.js # PKCE-based GitHub OAuth flow
        │   └── useChat.js        # Chat state, streaming, resize logic
        ├── services/
        │   ├── prService.js      # PR & history API calls
        │   └── chatService.js    # Chat SSE stream + history fetch
        ├── Components/
        │   ├── landing/          # Hero, Navbar, Features, CTA, Footer, HowItWorks, Example
        │   └── dashboard/        # Header, Sidebar, Tabs, ChatPanel, FileExplanations
        ├── pages/
        │   ├── LandingPage.jsx     # Public landing
        │   ├── GithubSignIn.jsx    # OAuth login trigger page
        │   ├── Dashboard.jsx       # Main protected dashboard (lazy)
        │   ├── ChatInterface.jsx   # Standalone chat interface (lazy)
        │   ├── FileExplanations.jsx # File explanations detail (lazy)
        │   ├── DocsPage.jsx        # Public docs landing
        │   ├── GettingStartedPage.jsx
        │   ├── FeaturesPage.jsx
        │   ├── FAQPage.jsx
        │   ├── AIReviewPage.jsx
        │   ├── GitHubPRAnalysisPage.jsx
        │   ├── PRSummaryPage.jsx
        │   ├── CodeReviewAutomationPage.jsx
        │   └── BlogPage.jsx
        └── pages/blog/           # 10 blog articles
```

---

## 📡 API Reference

Base URL: `http://localhost:8000/api`

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/oauth` | PKCE-based GitHub OAuth login | No |
| `POST` | `/auth/refresh-token` | Refresh access token via cookie | No |
| `POST` | `/auth/logout` | Revoke GitHub grant + clear cookies | Yes |

### Pull Requests

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/pr/analyze` | Analyze a PR from URL (5 req / 15 min) | Yes |
| `GET` | `/pr/history` | Get user's analysis history | Yes |
| `GET` | `/pr/:id` | Get specific analysis by PR ID | Yes |
| `PUT` | `/pr/:id` | Update PR title | Yes |
| `DELETE` | `/pr/:id` | Delete PR + analysis + vectors + chat | Yes |

### AI Chat & RAG

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/chat/:prId` | Send a chat message (SSE streaming, 60/min) | Yes |
| `GET` | `/chat/:prId/history` | Get chat history for a PR (last 30) | Yes |
| `POST` | `/rag/retrieve` | Retrieve relevant RAG chunks for a query | Yes |
| `POST` | `/rag/delete` | Delete all embeddings for a PR | Yes |

### Health

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/health` | Server health + uptime check | No |

### Rate Limits

| Endpoint Group | Window | Limit |
|----------------|--------|-------|
| General API | 15 min | 100 requests |
| PR Analysis | 15 min | 5 requests |
| Chat / RAG | 1 min | 60 requests |
| Auth | 1 hour | 10 attempts |

### Response Format

**Success:**
```json
{
    "statusCode": 200,
    "data": { "..." },
    "message": "Operation successful",
    "success": true
}
```

**Error:**
```json
{
    "statusCode": 400,
    "message": "Validation failed",
    "errors": ["PR URL is required"],
    "success": false
}
```

---

## 🔐 Authentication Flows

### JWT Token Flow

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant DB

    Client->>Server: GET /auth/github (redirect to GitHub)
    Server-->>Client: Redirect to GitHub OAuth

    Note over Client,GitHub: User authorizes on GitHub

    GitHub-->>Server: Callback with authorization code
    Server->>GitHub: Exchange code for access token
    GitHub-->>Server: GitHub access token
    Server->>Server: Generate JWT access + refresh tokens
    Server-->>Client: Set httpOnly cookies + return user data

    Note over Client: Subsequent API requests

    Client->>Server: POST /pr/analyze (with cookies)
    Server->>Server: Verify JWT access token
    Server-->>Client: 200 OK + analysis data
```

### GitHub OAuth Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant GitHub
    participant DB

    User->>Frontend: Click "Login with GitHub"
    Frontend->>Backend: GET /auth/github
    Backend-->>Frontend: Redirect to GitHub OAuth URL

    Note over User,GitHub: Authorizes PRLens

    GitHub-->>Backend: GET /auth/github/callback?code=xxx
    Backend->>GitHub: POST /login/oauth/access_token
    GitHub-->>Backend: { access_token }
    Backend->>GitHub: GET /user (fetch profile)
    GitHub-->>Backend: { login, avatar_url, email }
    Backend->>DB: Find or create user
    Backend->>DB: Store GitHub token (encrypted)
    Backend->>Backend: Generate JWT tokens
    Backend-->>Frontend: Set httpOnly cookies + redirect
    Frontend-->>User: Redirect to Dashboard
```

---

## 🤖 AI Analysis Flow

```
POST /pr/analyze { url }
  → PR Controller
    → Parse PR URL
    → GitHubService.getPullRequest() / getPRFiles()
      → Octokit (fetch PR metadata + file patches)
    → chunkDiff() — filter/sort top 20 files, truncate patches to 3000 chars
    → formatDiffForPrompt() — build structured prompt with PR metadata + diffs
    → analyzePRChunks()
      → Round-robin provider loop (Provider 1 → 2 → 3 → 4)
        → Retry 3x with exponential backoff on 429/5xx
      → If all fail → Gemini fallback (Provider 5)
      → Parse JSON response: summary, key_changes, tradeoffs, risks,
        reviewer_checklist, file_explanations
    → savePR() + saveAnalysis() — upsert into PostgreSQL
    → cleanupPRVectors() + processAndStorePRFiles() — RAG indexing
    → Return analysis to frontend
```

### AI Providers (Round-Robin + Failover)

```
Provider 1: OpenRouter
Provider 2: Modal AI
Provider 3: NVIDIA
Provider 4: Gemini
Fallback:   Gemini (last-resort, provider 5)
```

Each request picks the next provider via round-robin counter. On failure, the next provider is tried. After all primary providers fail, **Gemini** is used as fallback.

### PR Controller Responsibilities

| Step | File | Purpose |
|------|------|---------|
| Parse URL | `github.service.js` | Extract owner, repo, PR number |
| Fetch PR | `github.service.js` | Get PR details + file diffs via Octokit |
| Cache check | `cache.service.js` | Check if PR already analyzed (same head SHA) |
| Chunking | `chunker.service.js` | Filter generated files, cap to 20 files, truncate patches |
| AI call | `ai.service.js` | Send formatted prompt to round-robin providers |
| Store | `cache.service.js` | Upsert PR + analysis rows in PostgreSQL |
| RAG | `rag.service.js` | Chunk + embed + index PR diffs for chat |

---

## 🧠 RAG Embedding Flow

```
processAndStorePRFiles(prId, prUrl, files)
  → RecursiveCharacterTextSplitter (1000 chars, 200 overlap)
  → For each chunk:
    → embedTexts() via Gemini API (gemini-embedding-001, 1536-dim)
    → batch size 50, retry 3x on 429/500/503
  → Bulk INSERT into pr_embeddings (batch size 100)
  → HNSW index on embedding vector_cosine_ops
```

### Retrieval Flow (Chat Time)

```
POST /chat/:prId { message }
  → Load analysis (summary, key_changes, etc.) from DB
  → Load last 30 chat messages
  → retrieveRelevantChunks(prId, message)
    → embedQuery(message) → 1536-dim vector
    → SQL: WHERE pr_id = :prId AND cosine_similarity >= 0.4
    → ORDER BY cosine distance, LIMIT 5
  → Combine: analysis + RAG chunks + chat history
  → streamChat() via round-robin provider
  → Persist user + assistant messages to chat_messages
```

### Token Budget

| Context | Cap |
|---------|-----|
| System prompt + PR analysis | 32,000 tokens |
| RAG retrieved chunks | 25,600 tokens |
| Chat history | 64,00 tokens |
| User message | 6,400 tokens |

---
## 📁 Frontend Deep Dive

### Routing

| Route | Page | Access | Description |
|-------|------|--------|-------------|
| `/` | LandingPage | Public | Landing page with PR input and marketing sections |
| `/login` | GithubSignIn | Public | PKCE-based GitHub OAuth trigger |
| `/dashboard` | Dashboard | 🔒 Auth | PR analysis dashboard with sidebar + chat |
| `/dashboard/:id` | FileExplanations | 🔒 Auth | Per-PR file explanations detail |
| `/chat/:id` | ChatInterface | 🔒 Auth | Standalone chat interface |
| `/docs` | DocsPage | Public | Documentation hub |
| `/docs/getting-started` | GettingStartedPage | Public | Setup guide |
| `/docs/features` | FeaturesPage | Public | Feature overview |
| `/docs/faq` | FAQPage | Public | Frequently asked questions |
| `/ai-code-review` | AIReviewPage | Public | AI review info page |
| `/github-pull-request-analysis` | GitHubPRAnalysisPage | Public | Product info page |
| `/pull-request-summary` | PRSummaryPage | Public | Product info page |
| `/code-review-automation` | CodeReviewAutomationPage | Public | Product info page |
| `/blog` | BlogPage | Public | Blog hub |
| `/blog/...` | 10 blog posts | Public | SEO content pages |

### Dashboard Tabs

| Tab | Component | Description |
|-----|-----------|-------------|
| **Summary** | `TabSummary` | AI-generated PR overview, description, and impact |
| **Key Changes** | `TabChanges` | File-level diff stats, additions/deletions |
| **Risks** | `TabRisks` | Detected risks, severity levels, recommendations |
| **Reviewer Checklist** | `TabChecklist` | Actionable review checklist |
| **File Explanations** | `TabFileExplanations` | Per-file AI explanations |

### State Management

| Zustand Store | Purpose | Key Actions | Persistence |
|---------------|---------|-------------|-------------|
| `authStore` | User auth state | `login`, `logout`, `getCurrentUser` | localStorage (`auth-storage`) |

> `prStore` and `chatStore` have been replaced with local component state + `useChat` hook in `frontend/src/hooks/useChat.js`.

### OAuth Flow (PKCE)

The frontend uses **PKCE** (Proof Key for Code Exchange) via the Web Crypto API:

1. `generateState()` — CSRF state token stored in `sessionStorage`
2. `generateCodeVerifier()` — SHA-256 challenge verifier
3. `generateCodeChallenge(verifier)` — base64url-encoded SHA-256 digest
4. Redirects to `https://github.com/login/oauth/authorize` with `code_challenge`
5. Backend exchanges code + verifier via `POST /auth/oauth`
6. JWT access/refresh tokens set as **httpOnly, SameSite cookies**

### Chat Streaming

`chatService.sendMessage` uses the **Fetch API + ReadableStream** directly (not Axios) because SSE requires unbuffered streaming. The stream parser emits text chunks to `onChunk` callbacks, supporting:
- AbortController for cancellation
- Line-buffered SSE parsing (`data: ...` frames)
- Server-side persistence of both user and assistant messages

### API Client

`apiClient` (Axios instance) handles:
- **401 interceptors** with queued refresh requests (prevents request storms)
- Auto-redirect to `/login` on failed refresh
- 5-minute timeout for PR analysis
- Credentials included for cookie-based auth

---

## ⚡ Performance & Optimizations

| Optimization | Implementation |
|--------------|----------------|
| **Response Compression** | Gzip via `compression` middleware (level 6) |
| **Rate Limiting** | `express-rate-limit` to prevent API abuse |
| **Caching** | `node-cache` for GitHub API responses |
| **DB Connection Pool** | Postgres.js connection pooling |
| **Code Splitting** | Lazy-loaded pages with `React.lazy()` + `Suspense` |
| **Production Keep-Alive** | Self-ping to prevent cold starts on free hosting |
| **Proxy Trust** | `trust proxy` enabled for Render/Vercel deployments |

---

## 🚢 Deployment

### Frontend — Vercel

```bash
# Build for production
cd frontend
npm run build

# Deploy via Vercel CLI or GitHub integration
vercel --prod
```

### Backend — Render / Railway

```bash
# Production start command
cd Backend
npm start
```

**Required environment variables:** Set all variables from the [Environment Variables](#-environment-variables) section in your hosting platform's dashboard.

**Important:** Update `CORS_ORIGIN` to your deployed frontend URL and `FRONTEND_URL` to match.

---

## 🔧 Troubleshooting

### Authentication Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| GitHub OAuth fails | Redirect URI mismatch | GitHub App callback must match `BACKEND_URL/api/auth/github/callback` |
| "Unauthorized" on requests | Missing/expired token | Clear cookies, re-login with GitHub |
| Token refresh loop | Invalid refresh token | Clear cookies, re-login |

### PR Analysis Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Analysis fails silently | GitHub token invalid | Check GitHub token is stored correctly |
| "PR not found" | Private repo / no access | Ensure GitHub OAuth has `repo` scope |
| AI analysis timeout | AI API key wrong / model unavailable | Verify `AI_API_KEY` and `AI_MODEL` in `.env` |

### General

```bash
# Clear everything and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for outdated packages
npm outdated

# Verify PostgreSQL connection
psql "postgresql://user:pass@localhost:5432/prlens" -c "SELECT 1"
```

---

## 🧠 RAG Embedding Pipeline

PRLens uses a Retrieval-Augmented Generation (RAG) pipeline to power contextual AI chat over pull request diffs.

### Embedding Model

| Config | Value |
|--------|-------|
| Model | `gemini-embedding-001` |
| Dimensions | `1536` |
| Index type | HNSW (cosine similarity) |

### Why 1536 Dimensions?

pgvector's HNSW and IVFFlat indexes have a hard limit of **2000 dimensions**. The previous NVIDIA embedding model (`llama-nemotron-embed-vl-1b-v2`) produced **2048-dimensional** vectors, which **cannot be indexed** by pgvector. This caused:

- Full table scans on every similarity query
- Exponential slowdowns as PR data grows
- Inability to scale past small test datasets

`gemini-embedding-001` at 1536 dimensions resolves this while keeping the system scalable.

### HNSW Indexing Strategy

```sql
CREATE INDEX IF NOT EXISTS idx_pr_chunks_embedding
ON pr_embeddings USING hnsw (embedding vector_cosine_ops);
```

- **HNSW** (Hierarchical Navigable Small Worlds) is the recommended index for high-dimensional vector search in pgvector.
- **Cosine distance** (`vector_cosine_ops`) is used because embedding quality is relative — we care about semantic similarity, not vector magnitude.
- On app startup, `connectDB()` automatically ensures the index exists.

### Re-indexing Process

When you first deploy this migration with existing 2048-dim data, the `connectDB()` migration will:

1. Drop the old index (if present)
2. Delete all existing embeddings from `pr_embeddings`
3. Alter `pr_embeddings.embedding` to `vector(1536) NOT NULL`
4. Re-create the HNSW index

After this, **re-analyze any previously indexed PRs** to populate fresh 1536-dim embeddings. The PR controller's `cleanupPRVectors` + `processAndStorePRFiles` calls handle this automatically on re-analysis.

### Validation Checklist

- [ ] `\d pr_embeddings` shows `embedding vector(1536) NOT NULL`
- [ ] `\di idx_pr_chunks_embedding` exists with method `hnsw`
- [ ] Analyzed a PR and confirmed exactly 1536-dim embeddings stored
- [ ] `SELECT COUNT(*) FROM pr_embeddings` returns non-zero after re-analysis
- [ ] `/api/chat/:prId` returns context from vector search

## 🤖 AI Provider Architecture

PRLens uses a **multi-provider round-robin** system with automatic failover and a Gemini fallback, rather than a single API integration. The OpenAI SDK (`openai` npm package) is used as the unified client interface.

### Configured Providers

| # | Name | Default Model | Notes |
|---|------|---------------|-------|
| 1 | **OpenRouter** | *(configurable)* | Primary round-robin provider |
| 2 | **Modal AI** | *(configurable)* | Round-robin participant |
| 3 | **NVIDIA** | *(configurable)* | Round-robin participant |
| 4 | **Gemini** | *(configurable)* | Round-robin participant |
| 5 | **Gemini (fallback)** | *(last provider)* | Auto-used when all round-robin providers fail |

### API Key Environment Variables

| Variable | Purpose |
|----------|---------|
| `AI_API_KEY` / `PROVIDER_1_API_KEY` | OpenRouter primary key |
| `MODAL_AI_API_KEY` | Modal AI API key |
| `NVIDIA_AI_API_KEY` | NVIDIA API key |
| `PROVIDER_GEMINI_API_KEY` | Shared Gemini API key (also used for embeddings) |

### Failover Behavior

1. Round-robin tries each configured provider in turn
2. Each provider is retried **3 times** with exponential backoff on 429/5xx
3. After all round-robin providers fail, **Gemini fallback** takes over
4. If Gemini also fails, the API returns a structured error

### Relevant Source Files

- `Backend/src/services/ai.providers.js` — provider registry, round-robin logic, Gemini chat/stream adapters
- `Backend/src/services/ai.service.js` — PR analysis (`analyzePR`, `analyzePRChunks`) and streaming chat (`streamChat`)
- `Backend/src/services/gemini-embeddings.service.js` — Gemini-only embedding client (used by RAG)

---

---

## 👨‍💻 Author

**Nikunj Malwana**

- GitHub: [@Makwana-Nikunj](https://github.com/Makwana-Nikunj)
- LinkedIn: [Nikunj Malwana](https://www.linkedin.com/in/makwana-nikunj-gec-ldce-it-dte/)

---

## 📄 License

This project is licensed under the **ISC License** — see the `package.json` files for details.
