# Troubleshooting

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