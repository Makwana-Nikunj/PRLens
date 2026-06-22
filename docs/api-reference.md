# API Reference

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