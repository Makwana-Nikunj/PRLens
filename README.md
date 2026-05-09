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
| **React 19** | UI framework with latest concurrent features |
| **Vite 7** | Lightning-fast build tool & dev server |
| **Tailwind CSS 4** | Utility-first styling with Vite plugin |
| **React Router DOM 7** | Client-side routing |
| **Zustand 5** | Lightweight global state management |
| **Axios** | HTTP client with interceptors |
| **Lucide React** | Icon library |
| **React Markdown** | Markdown rendering for AI responses |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js 18+** | JavaScript runtime (ESM) |
| **Express 5** | Web framework |
| **PostgreSQL** | Relational database (via `postgres` driver) |
| **JWT** | Token-based authentication |
| **Octokit REST** | GitHub API client |
| **OpenAI SDK** | AI analysis (supports OpenAI, Claude, compatible endpoints) |
| **bcrypt** | Password hashing |
| **Nodemon** | Development hot-reload |

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
        SMTP["Email Service"]
    end

    Services <-->|"REST API + httpOnly Cookies"| Routes
    Services2 --> GitHub
    Services2 --> AI
    Controllers --> PostgreSQL
    Controllers --> SMTP
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
| `AI_BASE_URL` | AI API base URL | `https://api.openai.com/v1` |
| `AI_API_KEY` | AI API key | `sk-xxxx` or Claude key |
| `AI_MODEL` | AI model to use | `gpt-4o-mini` |
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
├── Backend/
│   ├── package.json
│   ├── src/
│   │   ├── index.js              # Server entry — DB connect & listen
│   │   ├── app.js                # Express app — middleware & routes
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # GitHub OAuth, JWT auth
│   │   │   ├── pr.controller.js      # PR analysis, history
│   │   │   └── chat.controller.js    # AI chat with PR context
│   │   ├── services/
│   │   │   ├── ai.service.js         # AI analysis (summary, risks, chat)
│   │   │   └── github.service.js     # GitHub API interactions
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js    # JWT verification
│   │   │   └── rateLimit.middleware.js # API rate limiting
│   │   ├── db/
│   │   │   └── index.js             # PostgreSQL connection
│   │   └── utils/
│   │       ├── keepAlive.js         # Production keep-alive ping
│   │       └── constants.js         # App-wide constants
│   └── .env
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx              # React entry point
        ├── App.jsx               # Root component & routing
        ├── index.css             # Global styles + Tailwind
        ├── conf/
        │   └── conf.js           # API base URL config
        ├── components/
        │   ├── landing/          # Hero, Navbar
        │   └── dashboard/        # Header, Sidebar, Tabs, ChatPanel
        ├── pages/
        │   └── Dashboard.jsx     # Main dashboard page
        ├── services/
        │   ├── prService.js      # PR analysis API calls
        │   └── chatService.js    # Chat API calls
        ├── hooks/
        │   └── useGithubOAuth.js # GitHub OAuth hook
        └── lib/
            └── apiClient.js      # Axios instance with interceptors
```

---

## 📡 API Reference

Base URL: `http://localhost:8000/api`

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/auth/github` | Initiate GitHub OAuth | No |
| `GET` | `/auth/github/callback` | GitHub OAuth callback | No |
| `POST` | `/auth/logout` | Logout (clear cookies) | Yes |
| `POST` | `/auth/refresh-token` | Refresh access token | No |

### Pull Requests

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/pr/analyze` | Analyze a PR from URL | Yes |
| `GET` | `/pr/history` | Get user's analysis history | Yes |
| `GET` | `/pr/history/:id` | Get specific analysis by ID | Yes |

### AI Chat

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/chat/:prId` | Send a chat message (streaming) | Yes |
| `GET` | `/chat/:prId/history` | Get chat history for a PR | Yes |

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

## 🎨 Frontend Deep Dive

### Routing

| Route | Page | Access | Description |
|-------|------|--------|-------------|
| `/` | Landing | Public | Landing page with PR input |
| `/dashboard` | Dashboard | 🔒 Auth | PR analysis dashboard |
| `/dashboard/history` | History | 🔒 Auth | Past PR analyses |

### Dashboard Tabs

| Tab | Component | Description |
|-----|-----------|-------------|
| **Summary** | `TabSummary` | AI-generated PR overview, description, and impact |
| **Changes** | `TabChanges` | File-level diff stats, additions/deletions |
| **Risks** | `TabRisks` | Detected risks, severity levels, recommendations |
| **Chat** | `ChatPanel` | Interactive AI chat with PR context |

### State Management

| Zustand Store | Purpose | Key Actions |
|---------------|---------|-------------|
| `authStore` | User auth state | `login`, `logout`, `getCurrentUser` |
| `prStore` | PR analysis data | `analyzePR`, `fetchHistory`, `setActivePR` |
| `chatStore` | Chat messages | `sendMessage`, `fetchHistory` |

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

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Guidelines

- Follow existing code patterns and project structure
- Keep components small and focused
- Add proper loading and error states
- Use meaningful commit messages

---

## 👨‍💻 Author

**Nikunj Malwana**

- GitHub: [@Makwana-Nikunj](https://github.com/Makwana-Nikunj)
- LinkedIn: [Nikunj Malwana](https://linkedin.com/in/nikunj-malwana)

---

## 📄 License

This project is licensed under the **ISC License** — see the `package.json` files for details.
