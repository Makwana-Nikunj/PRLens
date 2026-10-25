// One-shot backfill script: read every row in `users_backup_legacy` that
// has a github_token, encrypt it with AES-256-GCM, and write the encrypted
// bytes into `github_connections`.
//
// Run this ONCE after deploying the auth-rebuild migration:
//
//     node scripts/migrate-github-tokens.js
//
// It is idempotent — re-running it re-encrypts the same rows but does not
// create duplicates (ON CONFLICT (user_id) DO UPDATE).
//
// Requirements:
//   - DATABASE_URL set
//   - GITHUB_TOKEN_ENCRYPTION_KEY set (base64-encoded 32 bytes)
//   - The `users_backup_legacy` table still exists (the migration keeps
//     it for one release cycle; the script will fail loudly if it's gone)
//
// What it does NOT touch:
//   - The legacy `users` table — its `github_token` column was dropped by
//     the migration, but the data is preserved in `users_backup_legacy`.
//   - Sessions, auth_identities, verification_tokens — those have their
//     own backfill (in the migration's auth_rebuild_v1_backfill step).

import "dotenv/config";
import postgres from "postgres";
import { encryptToken } from "../src/utils/crypto.util.js";

const REQUIRED_ENV = ["DATABASE_URL", "GITHUB_TOKEN_ENCRYPTION_KEY"];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`❌ ${key} is not set`);
    process.exit(1);
  }
}

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

try {
  // 1. Confirm the backup table exists. If it doesn't, the migration
  //    probably already ran and pruned it — bail with a clear error
  //    rather than silently no-op.
  const backupTable = await sql`
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users_backup_legacy'
    LIMIT 1
  `;
  if (backupTable.length === 0) {
    console.error(
      "❌ users_backup_legacy does not exist. Either the migration has " +
        "already been cleaned up, or it never ran. Nothing to migrate."
    );
    process.exit(1);
  }

  // 2. Confirm the new target table exists.
  const targetTable = await sql`
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'github_connections'
    LIMIT 1
  `;
  if (targetTable.length === 0) {
    console.error(
      "❌ github_connections does not exist. Run the auth-rebuild migration first."
    );
    process.exit(1);
  }

  // 3. Read every legacy user that had a github_token set.
  const rows = await sql`
    SELECT id, github_id, github_token
    FROM users_backup_legacy
    WHERE github_token IS NOT NULL
  `;

  if (rows.length === 0) {
    console.log("✅ No legacy github_token rows to migrate. Nothing to do.");
    process.exit(0);
  }

  console.log(`📦 Found ${rows.length} legacy github_token row(s) to migrate.`);

  let migrated = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      const accessTokenEncrypted = encryptToken(row.github_token);

      await sql`
        INSERT INTO github_connections (
          user_id,
          github_user_id,
          github_username,
          access_token_encrypted
        )
        VALUES (
          ${row.id},
          ${row.github_id},
          ${row.github_id},
          ${accessTokenEncrypted}
        )
        ON CONFLICT (user_id) DO UPDATE
          SET access_token_encrypted = EXCLUDED.access_token_encrypted,
              github_user_id = EXCLUDED.github_user_id,
              github_username = EXCLUDED.github_username
      `;

      migrated += 1;
    } catch (err) {
      failed += 1;
      console.error(`  ❌ Failed to migrate user ${row.id}: ${err.message}`);
    }
  }

  console.log(
    `✅ Done. Migrated: ${migrated}, failed: ${failed}. ` +
      `You can now drop users_backup_legacy with: ` +
      `DROP TABLE users_backup_legacy;`
  );
} catch (err) {
  console.error("❌ Migration failed:", err);
  process.exitCode = 1;
} finally {
  await sql.end();
}
