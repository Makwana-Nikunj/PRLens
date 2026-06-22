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
  <a href="#-documentation">📚 Documentation</a>
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

## 🔗 Demo
[Add Demo Link Here]

## ✨ Key Features

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
| 📱 **Responsive UI** | Clean, modern dashboard with native-like mobile scroll handling |
| ⚡ **Fast Analysis** | Caching and optimized GitHub API calls for quick results |
| 📡 **Real-time Progress** | Live UI updates during PR analysis via Server-Sent Events (SSE) |

## 📸 Screenshots

*(Add screenshots here)*

## 🛠 Tech Stack

**Frontend:** React 19, Vite 7, Tailwind CSS 4, Zustand 5, Axios, React Router DOM 7  
**Backend:** Node.js 18+, Express 5, PostgreSQL, pgvector, LangChain, OpenAI SDK, Octokit  
**AI Providers:** OpenRouter, Modal AI, NVIDIA, Gemini  

## 🏗 High-Level Architecture

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

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ and **npm**
- **PostgreSQL** (local install or Neon/Supabase)
- **GitHub OAuth App**
- **AI API Key** (OpenAI, Anthropic, or OpenRouter)

### Installation
```bash
git clone https://github.com/Makwana-Nikunj/PRLens.git
cd PRLens

# Install backend dependencies
cd Backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Minimal Environment Setup
Create `Backend/.env` and `frontend/.env` files based on the `.env.example` files provided in their respective directories. See [Environment Variables](docs/environment.md) for detailed configuration.

### Run Development Servers
```bash
# Backend (Terminal 1)
cd Backend && npm run dev

# Frontend (Terminal 2)
cd frontend && npm run dev
```
Open **http://localhost:5173** and login with GitHub.

## 📁 Simplified Project Structure

```
PRLens/
├── docs/                 # Detailed documentation
├── Backend/              # Node.js + Express + PostgreSQL
│   └── src/
│       ├── controllers/  # API route logic
│       ├── services/     # AI, GitHub, RAG logic
│       ├── middlewares/  # Auth, rate limiting
│       └── db/           # PostgreSQL connection
└── frontend/             # React + Vite
    └── src/
        ├── Components/   # Reusable UI parts
        ├── pages/        # Route pages
        ├── store/        # Zustand state
        └── services/     # API clients & SSE
```

## ⚡ Engineering Challenges Solved

### Multi-Provider AI Orchestration
Built round-robin provider selection with automatic retries and failover.

### Scalable RAG Pipeline
Implemented pgvector + HNSW indexing using 1536-dimensional Gemini embeddings.

### Real-Time Streaming
Implemented Server-Sent Events for live PR analysis and chat responses.

### Secure Authentication
Implemented GitHub OAuth with PKCE, JWT, refresh tokens, and httpOnly cookies.

### Performance Optimization
Added caching, compression, connection pooling, and lazy loading.

## 🗺 Roadmap
- [ ] Add support for GitLab and Bitbucket.
- [ ] Implement team workspaces.
- [ ] Add more granular RAG controls.

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## 👨‍💻 Author
**Nikunj Malwana**
- GitHub: [@Makwana-Nikunj](https://github.com/Makwana-Nikunj)
- LinkedIn: [Nikunj Malwana](https://www.linkedin.com/in/makwana-nikunj-gec-ldce-it-dte/)

## 📄 License
This project is licensed under the **ISC License**.

---

## 📚 Documentation

Detailed documentation has been moved to the `docs/` directory:

* [Architecture](docs/architecture.md)
* [RAG Architecture](docs/rag-architecture.md)
* [API Reference](docs/api-reference.md)
* [Frontend Guide](docs/frontend.md)
* [Deployment Guide](docs/deployment.md)
* [Environment Variables](docs/environment.md)
* [Troubleshooting](docs/troubleshooting.md)
