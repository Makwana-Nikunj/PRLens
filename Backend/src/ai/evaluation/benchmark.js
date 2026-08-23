import "dotenv/config";
import { connectDB, sql } from "../../db/index.js";
import { analyzePRChunksWithLangChain } from "../orchestrator.js";
import { indexPRForRAG, retrieveRAGContext } from "../rag/index.js";
import { streamChatWithLangChain } from "../orchestrator.js";
import { prAnalysisSchema } from "../parsers/index.js";

async function runEvaluationBenchmark() {
  console.log("=================================================");
  console.log("    PRLens LangChain AI & RAG Benchmark Suite   ");
  console.log("=================================================\n");

  await connectDB();

  // 1. Fetch or create a test PR
  let prRows = await sql`SELECT id, owner, repo, pr_number, url, title FROM pull_requests LIMIT 1`;
  let testPR;

  if (prRows.length > 0) {
    testPR = prRows[0];
  } else {
    const [inserted] = await sql`
      INSERT INTO pull_requests (url, owner, repo, pr_number, title, author, description)
      VALUES ('https://github.com/test-org/benchmark-repo/pull/1', 'test-org', 'benchmark-repo', 1, 'Refactor Auth & Database Pool', 'senior-dev', 'Benchmarking PR analysis')
      RETURNING id, owner, repo, pr_number, url, title
    `;
    testPR = inserted;
  }

  console.log(`Evaluating against PR: ${testPR.owner}/${testPR.repo}#${testPR.pr_number} (ID: ${testPR.id})\n`);

  const benchmarkFiles = [
    {
      filename: "src/auth/jwt.service.js",
      status: "modified",
      additions: 32,
      deletions: 8,
      patch: `@@ -15,10 +15,34 @@
- function signUserToken(user) {
-   return jwt.sign({ id: user.id }, secret);
- }
+ export function signUserToken(user, options = {}) {
+   const payload = {
+     sub: user.id,
+     role: user.role || 'user',
+     iss: 'prlens-auth'
+   };
+   return jwt.sign(payload, process.env.JWT_SECRET, {
+     expiresIn: options.expiresIn || '1h',
+     algorithm: 'HS256'
+   });
+ }
+
+ export function verifyUserToken(token) {
+   return jwt.verify(token, process.env.JWT_SECRET, {
+     algorithms: ['HS256'],
+     issuer: 'prlens-auth'
+   });
+ }`
    },
    {
      filename: "src/db/pool.js",
      status: "modified",
      additions: 20,
      deletions: 4,
      patch: `@@ -1,8 +1,24 @@
- import { Pool } from "pg";
- export const pool = new Pool();
+ import postgres from "postgres";
+ 
+ export const sql = postgres(process.env.DATABASE_URL, {
+   ssl: 'require',
+   max: 20,
+   idle_timeout: 30,
+   connect_timeout: 10
+ });`
    }
  ];

  const results = {
    analysis: {},
    indexing: {},
    retrieval: {},
    chat: {}
  };

  // ==========================================
  // BENCHMARK 1: PR Analysis Quality & Schema
  // ==========================================
  console.log("[BENCHMARK 1] PR Analysis & Zod Schema Conformance");
  const analysisStart = Date.now();

  try {
    const analysis = await analyzePRChunksWithLangChain(benchmarkFiles, {
      id: testPR.id,
      url: testPR.url,
      owner: testPR.owner,
      repo: testPR.repo,
      pr_number: testPR.pr_number,
      title: testPR.title,
      total_files: 2,
      total_additions: 52,
      total_deletions: 12
    });

    const analysisDuration = Date.now() - analysisStart;
    const zodValidation = prAnalysisSchema.safeParse(analysis);

    results.analysis = {
      durationMs: analysisDuration,
      schemaValid: zodValidation.success,
      keyChangesCount: analysis.key_changes?.length || 0,
      tradeoffsCount: analysis.tradeoffs?.length || 0,
      risksCount: analysis.risks?.length || 0,
      checklistCount: analysis.reviewer_checklist?.length || 0,
      modelUsed: analysis.model_used || "LangChain Multi-Provider"
    };

    console.log(`  ⏱️  Duration: ${analysisDuration}ms`);
    console.log(`  🛡️  Zod Schema Valid: ${zodValidation.success ? "✅ 100% Valid" : "❌ Invalid"}`);
    console.log(`  📋 Key Changes Identified: ${results.analysis.keyChangesCount}`);
    console.log(`  ⚠️  Risks Identified: ${results.analysis.risksCount}`);
    console.log(`  ✅ Checklist Items: ${results.analysis.checklistCount}`);
  } catch (err) {
    console.error("  ❌ PR Analysis Benchmark Failed:", err.message);
    results.analysis.error = err.message;
  }
  console.log("-------------------------------------------------\n");

  // ==========================================
  // BENCHMARK 2: RAG Ingestion Performance
  // ==========================================
  console.log("[BENCHMARK 2] RAG Ingestion & Vectorization");
  const indexStart = Date.now();

  try {
    const indexRes = await indexPRForRAG({
      prId: testPR.id,
      prUrl: testPR.url,
      owner: testPR.owner,
      repo: testPR.repo,
      prNumber: testPR.pr_number,
      files: benchmarkFiles
    });

    const indexDuration = Date.now() - indexStart;
    results.indexing = {
      durationMs: indexDuration,
      storedChunks: indexRes.stored,
      embeddingModel: "gemini-embedding-001 (1536d)",
      table: "pr_embeddings"
    };

    console.log(`  ⏱️  Duration: ${indexDuration}ms`);
    console.log(`  📦 Chunks Vectorized & Stored: ${indexRes.stored}`);
  } catch (err) {
    console.error("  ❌ RAG Ingestion Benchmark Failed:", err.message);
    results.indexing.error = err.message;
  }
  console.log("-------------------------------------------------\n");

  // ==========================================
  // BENCHMARK 3: RAG Retrieval Precision
  // ==========================================
  console.log("[BENCHMARK 3] RAG Retrieval Precision & Scoring");
  const testQueries = [
    { query: "How is the JWT secret and expiration configured?", expectedFile: "src/auth/jwt.service.js" },
    { query: "What are the database connection pool limits?", expectedFile: "src/db/pool.js" }
  ];

  const retrievalMetrics = [];

  for (const tq of testQueries) {
    const retStart = Date.now();
    const retRes = await retrieveRAGContext({
      prId: testPR.id,
      query: tq.query,
      k: 3,
      threshold: 0.3
    });
    const retDuration = Date.now() - retStart;

    const topDoc = retRes.documents[0];
    const topFilename = topDoc?.metadata?.filePath || topDoc?.metadata?.filename;
    const topScore = topDoc?.metadata?.similarity || 0;
    const precisionHit = topFilename === tq.expectedFile;

    retrievalMetrics.push({
      query: tq.query,
      durationMs: retDuration,
      topFilename,
      topScore,
      precisionHit
    });

    console.log(`  Query: "${tq.query}"`);
    console.log(`    -> Top Result: ${topFilename} (Similarity: ${(topScore * 100).toFixed(2)}%) [${precisionHit ? "✅ Accurate" : "❌ Miss"}]`);
    console.log(`    -> Latency: ${retDuration}ms`);
  }

  results.retrieval = {
    averageLatencyMs: Math.round(retrievalMetrics.reduce((acc, m) => acc + m.durationMs, 0) / retrievalMetrics.length),
    precisionRate: `${(retrievalMetrics.filter(m => m.precisionHit).length / retrievalMetrics.length) * 100}%`,
    queriesTested: retrievalMetrics.length
  };
  console.log("-------------------------------------------------\n");

  // ==========================================
  // BENCHMARK 4: Grounded Chat Generation
  // ==========================================
  console.log("[BENCHMARK 4] Grounded Chat Streaming Generation");
  const chatStart = Date.now();

  try {
    const chatResponse = await streamChatWithLangChain({
      prId: testPR.id,
      message: "What algorithm is enforced for JWT signing, and what is the default expiration?"
    });

    const chatDuration = Date.now() - chatStart;
    const mentionsAlgorithm = chatResponse.includes("HS256");
    const mentionsExpiration = chatResponse.includes("1h") || chatResponse.includes("hour");

    results.chat = {
      durationMs: chatDuration,
      responseLength: chatResponse.length,
      groundedAccuracy: mentionsAlgorithm && mentionsExpiration ? "100% Grounded" : "Partially Grounded",
      mentionsAlgorithm,
      mentionsExpiration
    };

    console.log(`  ⏱️  Total Generation Time: ${chatDuration}ms`);
    console.log(`  📝 Response Length: ${chatResponse.length} characters`);
    console.log(`  🎯 Grounding Check: ${results.chat.groundedAccuracy} (Algorithm HS256: ${mentionsAlgorithm ? "✅" : "❌"}, Expiration 1h: ${mentionsExpiration ? "✅" : "❌"})`);
  } catch (err) {
    console.error("  ❌ Chat Benchmark Failed:", err.message);
    results.chat.error = err.message;
  }
  console.log("-------------------------------------------------\n");

  // ==========================================
  // SUMMARY REPORT
  // ==========================================
  console.log("=================================================");
  console.log("             FINAL BENCHMARK SUMMARY             ");
  console.log("=================================================");
  console.log(JSON.stringify(results, null, 2));
  console.log("=================================================\n");

  process.exit(0);
}

runEvaluationBenchmark();
