import "dotenv/config";
import { Document } from "@langchain/core/documents";
import { addPRDocumentsToVectorStore, getPRVectorStore } from "./pgvector.js";
import { connectDB, sql } from "../../db/index.js";

async function testVectorStore() {
  console.log("Starting Vector Store Test...\n");
  
  await connectDB();

  // Fetch a real PR from the database to satisfy the foreign key constraint
  const prRows = await sql`SELECT owner, repo, pr_number FROM pull_requests LIMIT 1`;
  
  if (prRows.length === 0) {
    console.log("No PRs found in the database. Please sync a PR first.");
    process.exit(1);
  }

  const testPR = prRows[0];
  const metadata = {
    owner: testPR.owner,
    repo: testPR.repo,
    prNumber: testPR.pr_number.toString(),
    source: "github"
  };

  const documents = [
    new Document({
      pageContent: "function authenticateToken(token) { return jwt.verify(token, secret); }",
      metadata: { ...metadata, filePath: "src/auth.js" }
    }),
    new Document({
      pageContent: "SELECT * FROM users WHERE email = $1",
      metadata: { ...metadata, filePath: "src/db.js" }
    }),
    new Document({
      pageContent: "function validateEmail(email) { return email.includes('@'); }",
      metadata: { ...metadata, filePath: "src/utils.js" }
    })
  ];

  try {
    console.log("Adding 3 documents to vector store...");
    const addResult = await addPRDocumentsToVectorStore(documents);
    console.log("Add result:", addResult);

    // Test idempotency
    console.log("\nRe-adding documents to test idempotency (should delete old ones)...");
    const addResult2 = await addPRDocumentsToVectorStore(documents);
    console.log("Add result 2:", addResult2);

    // Test similarity search
    console.log("\nTesting similarity search for 'authentication token validation'...");
    const store = getPRVectorStore();
    const results = await store.similaritySearch("authentication token validation", 1);
    
    console.log(`\nResults returned: ${results.length}`);
    results.forEach((doc, i) => {
      console.log(`Result ${i + 1}:`);
      console.log(`  File: ${doc.metadata.filePath}`);
      console.log(`  Content: ${doc.pageContent}`);
      console.log(`  Metadata preserved: ${doc.metadata.owner === "test-owner"}`);
    });
  } catch (error) {
    console.error("Test failed:", error);
  }

  console.log("\nVector store test complete! Do not forget to close the DB connection.");
  process.exit(0);
}

testVectorStore();
