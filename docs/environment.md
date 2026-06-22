# Environment Variables

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