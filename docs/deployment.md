# Deployment Guide

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