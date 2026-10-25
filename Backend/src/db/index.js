import postgres from "postgres";

let sql;

export const connectDB = async () => {

    try {
        sql = postgres(process.env.DATABASE_URL, {
            ssl: 'require',
            max: 10,
            prepare: true,
            idle_timeout: 30,        // close idle connections after 30s
            connect_timeout: 30,
        });

        // ===============================
        // AUTH SCHEMA (5-table normalized design)
        // ===============================

        // 1. USERS TABLE
        await sql`
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

        // Ensure columns exist on legacy tables
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;`;
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;`;
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;`;

        // 2. AUTH IDENTITIES (Email/Password, Google OAuth, GitHub)
        await sql`
CREATE TABLE IF NOT EXISTS auth_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('email', 'google', 'github')),
  provider_user_id TEXT,
  password_hash TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, provider)
)
`;

        // 3. VERIFICATION TOKENS (Email verification links & Password reset OTPs)
        await sql`
CREATE TABLE IF NOT EXISTS verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('email_verification', 'password_reset')),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

        // 4. SESSIONS (Refresh token tracking & revocation)
        await sql`
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  replaced_by UUID REFERENCES sessions(id) ON DELETE SET NULL,
  user_agent TEXT,
  ip TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

        // 5. GITHUB CONNECTIONS (Encrypted tokens for PR data access)
        await sql`
CREATE TABLE IF NOT EXISTS github_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  access_token_encrypted BYTEA NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

        // Ensure columns exist on legacy tables
        await sql`ALTER TABLE github_connections ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`;

        // ===============================
        // Pull Requests TABLE
        // ===============================

        await sql`
CREATE TABLE IF NOT EXISTS pull_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT UNIQUE NOT NULL,
  owner TEXT NOT NULL,
  repo TEXT NOT NULL,
  pr_number INTEGER NOT NULL,
  title TEXT,
  author TEXT,
  description TEXT,
  base_branch TEXT,
  head_branch TEXT,
  head_sha TEXT,
  total_files INTEGER DEFAULT 0,
  total_additions INTEGER DEFAULT 0,
  total_deletions INTEGER DEFAULT 0,
  is_private BOOLEAN DEFAULT FALSE,
  raw_diff JSONB,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

        // Ensure user_id column exists for existing tables
        await sql`
            ALTER TABLE pull_requests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
        `;

        // Ensure head_sha column exists for existing tables
        await sql`
            ALTER TABLE pull_requests ADD COLUMN IF NOT EXISTS head_sha TEXT;
        `;

        // ===============================
        // Analyses TABLE
        // ===============================

        await sql`
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_id UUID REFERENCES pull_requests(id) ON DELETE CASCADE,
  summary TEXT,
  key_changes TEXT,
  tradeoffs TEXT,
  risks TEXT,
  reviewer_checklist TEXT,
  file_explanations JSONB,
  raw_response TEXT,
  model_used TEXT DEFAULT 'claude-sonnet-4-5',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

        // ===============================
        // Chat Messages TABLE
        // ===============================

        await sql`
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_id UUID REFERENCES pull_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  tokens_used INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
)
`;

        // ===============================
        // RAG: PR Embeddings TABLE
        // ===============================

        await sql`CREATE EXTENSION IF NOT EXISTS vector;`;

        await sql`
CREATE TABLE IF NOT EXISTS pr_embeddings (
    id SERIAL PRIMARY KEY,
    pr_id UUID REFERENCES pull_requests(id) ON DELETE CASCADE,
    pr_url TEXT NOT NULL,
    filename TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
`;

        // PERFORMANCE INDEXES
        // ===============================

        // It's recommended to have lists=100 for ivfflat but skipping for now or IF NOT EXISTS syntax might be tricky for ivfflat.
        // Actually PostgreSQL 10+ handles IF NOT EXISTS nicely.

        await sql`
            CREATE INDEX IF NOT EXISTS idx_pr_embeddings_pr_id 
            ON pr_embeddings (pr_id);
        `;

        await sql`
            CREATE INDEX IF NOT EXISTS idx_pr_chunks_embedding
            ON pr_embeddings USING hnsw (embedding vector_cosine_ops);
        `;

        await sql`
            CREATE INDEX IF NOT EXISTS
             idx_pr_url ON pull_requests(url);
        `;

        await sql`
            CREATE INDEX IF NOT EXISTS
             idx_analysis_pr_id ON analyses
             (pr_id);
        `;

        await sql`
            CREATE INDEX IF NOT EXISTS
             idx_chat_pr_id_time ON chat_messages
             (pr_id, created_at ASC);
        `;

        await sql`
            CREATE INDEX IF NOT EXISTS
             idx_users_email ON users(email);
        `;

        await sql`
            CREATE INDEX IF NOT EXISTS
             idx_auth_identities_user ON auth_identities(user_id);
        `;

        await sql`
            CREATE INDEX IF NOT EXISTS
             idx_auth_identities_provider ON auth_identities(provider, provider_user_id);
        `;

        await sql`
            CREATE INDEX IF NOT EXISTS
             idx_verification_tokens_hash ON verification_tokens(token_hash);
        `;

        await sql`
            CREATE INDEX IF NOT EXISTS
             idx_verification_tokens_user ON verification_tokens(user_id);
        `;

        await sql`
            CREATE INDEX IF NOT EXISTS
             idx_sessions_refresh_hash ON sessions(refresh_token_hash);
        `;

        await sql`
            CREATE INDEX IF NOT EXISTS
             idx_sessions_user ON sessions(user_id);
        `;

        console.log("✅ Database connected and tables created (if they didn't exist)");

    } catch (error) {
        console.error("❌ Error connecting to the database:", error);
        throw error;
    }
}

export { sql };