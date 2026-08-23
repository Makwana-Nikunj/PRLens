import "dotenv/config";
import { connectDB, sql } from "../../db/index.js";
import { githubFilesToDocuments } from "../documents/github.js";
import { splitDocuments } from "../splitters/index.js";
import { embeddingModel } from "../embeddings/index.js";
import { indexPRForRAG, retrieveRAGContext, formatRetrievedDocuments } from "./index.js";
import { createPRRetriever } from "../retrievers/index.js";
import { streamChatWithLangChain } from "../orchestrator.js";

async function runRAGTestSuite() {
  console.log("=================================================");
  console.log("    PRLens LangChain RAG End-to-End Test Suite    ");
  console.log("=================================================\n");

  await connectDB();

  // 1. Fetch or create a test PR in pull_requests table to satisfy foreign key constraints
  let prRows = await sql`SELECT id, owner, repo, pr_number, url FROM pull_requests LIMIT 1`;
  let testPR;

  if (prRows.length > 0) {
    testPR = prRows[0];
  } else {
    // Create a temporary test PR if none exists
    const [inserted] = await sql`
      INSERT INTO pull_requests (url, owner, repo, pr_number, title, author, description)
      VALUES ('https://github.com/test-org/prlens-rag-test/pull/1', 'test-org', 'prlens-rag-test', 1, 'RAG Test PR', 'test-user', 'Testing LangChain RAG')
      RETURNING id, owner, repo, pr_number, url
    `;
    testPR = inserted;
  }

  console.log(`Using Test PR: ${testPR.owner}/${testPR.repo}#${testPR.pr_number} (ID: ${testPR.id})\n`);

  const sampleFiles = [
    {
      filename: "src/auth/jwt.service.js",
      status: "modified",
      additions: 25,
      deletions: 5,
      patch: `@@ -10,12 +10,25 @@
- function verifyToken(token) { return jwt.verify(token, secret); }
+ function verifyToken(token, options = {}) {
+   const decoded = jwt.verify(token, process.env.JWT_SECRET, {
+     algorithms: ['HS256'],
+     ...options
+   });
+   if (!decoded.userId) {
+     throw new Error("Invalid token payload: missing userId");
+   }
+   return decoded;
+ }`
    },
    {
      filename: "src/db/connection.js",
      status: "modified",
      additions: 15,
      deletions: 2,
      patch: `@@ -5,6 +5,15 @@
+ export const poolConfig = {
+   maxConnections: 20,
+   idleTimeoutSeconds: 30,
+   ssl: process.env.NODE_ENV === 'production' ? 'require' : 'prefer'
+ };`
    },
    {
      filename: "README.md",
      status: "modified",
      additions: 10,
      deletions: 1,
      patch: `@@ -1,4 +1,10 @@
 # PRLens Authentication
- Basic token authentication.
+ Secure JWT token authentication with algorithm pinning and payload validation.`
    }
  ];

  let allPassed = true;

  try {
    // ==========================================
    // TEST 1: Document Conversion
    // ==========================================
    console.log("[TEST 1] GitHub Files -> LangChain Documents");
    const rawDocs = githubFilesToDocuments({
      prId: testPR.id,
      prUrl: testPR.url,
      owner: testPR.owner,
      repo: testPR.repo,
      prNumber: testPR.pr_number,
      files: sampleFiles
    });

    console.log(`  Produced ${rawDocs.length} Documents`);
    const doc1Ok = rawDocs.length === 3 && rawDocs[0].metadata.filePath === "src/auth/jwt.service.js";
    console.log(`  Document 1 Metadata & Path preserved: ${doc1Ok ? "✅ Yes" : "❌ No"}`);
    if (!doc1Ok) allPassed = false;
    console.log("-------------------------------------------------\n");

    // ==========================================
    // TEST 2: Format-aware Splitting
    // ==========================================
    console.log("[TEST 2] Format-aware Splitting");
    const splitDocs = await splitDocuments(rawDocs);
    console.log(`  Split ${rawDocs.length} docs into ${splitDocs.length} chunks`);
    const splitOk = splitDocs.length >= 3 && splitDocs.every(d => d.metadata.prId === testPR.id && d.metadata.chunkIndex !== undefined);
    console.log(`  Chunks contain enriched metadata (prId, chunkIndex): ${splitOk ? "✅ Yes" : "❌ No"}`);
    if (!splitOk) allPassed = false;
    console.log("-------------------------------------------------\n");

    // ==========================================
    // TEST 3: Embeddings Dimensionality
    // ==========================================
    console.log("[TEST 3] Embeddings Dimensionality Verification");
    const testEmbedding = await embeddingModel.embedQuery("JWT token verification");
    console.log(`  Embedding Dimension: ${testEmbedding.length}`);
    const dimOk = testEmbedding.length === 1536 && typeof testEmbedding[0] === "number";
    console.log(`  Strict 1536d Numeric Vector: ${dimOk ? "✅ Yes" : "❌ No"}`);
    if (!dimOk) allPassed = false;
    console.log("-------------------------------------------------\n");

    // ==========================================
    // TEST 4: Indexing into pgvector
    // ==========================================
    console.log("[TEST 4] Ingesting PR into pr_embeddings Table");
    const indexResult1 = await indexPRForRAG({
      prId: testPR.id,
      prUrl: testPR.url,
      owner: testPR.owner,
      repo: testPR.repo,
      prNumber: testPR.pr_number,
      files: sampleFiles
    });
    console.log(`  Stored Chunks: ${indexResult1.stored}`);
    const indexOk = indexResult1.stored > 0;
    console.log(`  Index Successful: ${indexOk ? "✅ Yes" : "❌ No"}`);
    if (!indexOk) allPassed = false;
    console.log("-------------------------------------------------\n");

    // ==========================================
    // TEST 5: Idempotency (Re-indexing same PR)
    // ==========================================
    console.log("[TEST 5] Idempotency Verification (Re-indexing PR)");
    const indexResult2 = await indexPRForRAG({
      prId: testPR.id,
      prUrl: testPR.url,
      owner: testPR.owner,
      repo: testPR.repo,
      prNumber: testPR.pr_number,
      files: sampleFiles
    });

    const [countRow] = await sql`SELECT COUNT(*)::int AS count FROM pr_embeddings WHERE pr_id = ${testPR.id}`;
    console.log(`  Total Chunks in DB after second run: ${countRow.count}`);
    const idempOk = countRow.count === indexResult1.stored;
    console.log(`  No duplicate chunks created: ${idempOk ? "✅ Yes" : "❌ No"}`);
    if (!idempOk) allPassed = false;
    console.log("-------------------------------------------------\n");

    // ==========================================
    // TEST 6: PRRetriever & Cosine Similarity
    // ==========================================
    console.log("[TEST 6] PRRetriever Query & Cosine Similarity Thresholding");
    const query = "How is the JWT secret and token verification configured?";
    const retriever = createPRRetriever({
      prId: testPR.id,
      k: 3,
      threshold: 0.3
    });

    const retrievedDocs = await retriever.invoke(query);
    console.log(`  Retrieved ${retrievedDocs.length} chunks for query: "${query}"`);
    retrievedDocs.forEach((d, idx) => {
      console.log(`    [#${idx + 1}] File: ${d.metadata.filename || d.metadata.filePath} | Similarity: ${d.metadata.similarity?.toFixed(4)}`);
    });

    const retrievalOk = retrievedDocs.length > 0 && retrievedDocs[0].metadata.filename === "src/auth/jwt.service.js";
    console.log(`  Correct top chunk retrieved with similarity score: ${retrievalOk ? "✅ Yes" : "❌ No"}`);
    if (!retrievalOk) allPassed = false;
    console.log("-------------------------------------------------\n");

    // ==========================================
    // TEST 7: Context Formatting
    // ==========================================
    console.log("[TEST 7] Context Formatting for Prompt Consumption");
    const formattedContext = formatRetrievedDocuments(retrievedDocs);
    console.log(`  Context snippet:\n${formattedContext.slice(0, 200)}...\n`);
    const formatOk = formattedContext.includes("File: src/auth/jwt.service.js") && formattedContext.includes("verifyToken");
    console.log(`  Clean format with file headers preserved: ${formatOk ? "✅ Yes" : "❌ No"}`);
    if (!formatOk) allPassed = false;
    console.log("-------------------------------------------------\n");

    // ==========================================
    // TEST 8: Full RAG Chat Generation with Fallbacks
    // ==========================================
    console.log("[TEST 8] Full RAG Chat Streaming Generation via Orchestrator");
    const chatResponse = await streamChatWithLangChain({
      prId: testPR.id,
      message: "Explain the changes made to the verifyToken function in jwt.service.js.",
      analysis: "Summary: Updated JWT verification logic to enforce algorithms and userId payload check."
    });

    console.log(`\n  AI Response:\n  ${chatResponse.slice(0, 300)}...\n`);
    const genOk = chatResponse && chatResponse.length > 50 && (chatResponse.toLowerCase().includes("jwt") || chatResponse.toLowerCase().includes("token"));
    console.log(`  Generation Succeeded: ${genOk ? "✅ Yes" : "❌ No"}`);
    if (!genOk) allPassed = false;
    console.log("-------------------------------------------------\n");

  } catch (err) {
    console.error("❌ Test Suite Encountered Error:", err);
    allPassed = false;
  }

  console.log(`=================================================`);
  console.log(`FINAL RESULT: ${allPassed ? "✅ ALL 8 RAG TESTS PASSED!" : "❌ SOME TESTS FAILED!"}`);
  console.log(`=================================================\n`);

  process.exit(allPassed ? 0 : 1);
}

runRAGTestSuite();
