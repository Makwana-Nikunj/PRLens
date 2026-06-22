# System Architecture

```mermaid
flowchart TB
    subgraph Client
["🖥 Frontend — React + Vite"]
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