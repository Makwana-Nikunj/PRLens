import postgres from "postgres";

let sql;

export const connectDB = async () => {

  try {
    sql = postgres(process.env.DATABASE_URL, {
      ssl: 'require',
      max: 10,
      prepare: true,
      idle_timeout: 120,       // close idle connections after 120s
      connect_timeout: 10,     // fail if connection takes >10s
    });

    // ===============================
    // USERS TABLE
    // ===============================
    await sql`
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  refresh_token TEXT,
  github_token TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

    // Ensure github_token column exists for existing tables
    await sql`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS github_token TEXT;
        `;

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
    // Analyses TABLE
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
    // PERFORMANCE INDEXES
    // ===============================

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
             idx_users_github_id ON users(github_id);
        `;

    console.log("✅ Database connected and tables created (if they didn't exist)");

  } catch (error) {
    console.error("❌ Error connecting to the database:", error);
  }
}

export { sql };