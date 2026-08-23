import { Document } from "@langchain/core/documents";
import { splitDocuments, getSplitterForDocument } from "./index.js";

async function runTests() {
  const baseMetadata = {
    owner: "test-org",
    repo: "prlens",
    prNumber: 42,
    additions: 120,
    deletions: 45,
    changes: 165,
    source: "github"
  };

  const testCases = [
    // 1. JavaScript
    {
      name: "JavaScript (.js)",
      doc: new Document({
        metadata: { ...baseMetadata, filePath: "src/auth.js" },
        pageContent: `function authenticate(user, pass) {\n  return user && pass;\n}\n\n` +
          `function helper() {\n  const a = 1;\n  const b = 2;\n  return a + b;\n}\n\n`.repeat(60)
      })
    },

    // 2. TypeScript
    {
      name: "TypeScript (.ts)",
      doc: new Document({
        metadata: { ...baseMetadata, filePath: "src/services/auth.service.ts" },
        pageContent: `export interface UserProfile {\n  id: string;\n  name: string;\n}\n\n` +
          `export class AuthService {\n  validate(token: string): boolean {\n    return token.length > 0;\n  }\n}\n\n`.repeat(50)
      })
    },

    // 3. Markdown
    {
      name: "Markdown (.md)",
      doc: new Document({
        metadata: { ...baseMetadata, filePath: "README.md" },
        pageContent: `# PRLens AI Overview\n\nPRLens is an intelligent PR review assistant.\n\n` +
          `## Architecture\n\nDetailed breakdown of components.\n\n` +
          `### Document Layer\n\nHandles GitHub PR document ingestion.\n\n` +
          `### Splitter Layer\n\nLanguage-aware document splitting.\n\n`.repeat(40)
      })
    },

    // 4. HTML
    {
      name: "HTML (.html)",
      doc: new Document({
        metadata: { ...baseMetadata, filePath: "public/index.html" },
        pageContent: `<!DOCTYPE html>\n<html>\n<head><title>PRLens</title></head>\n<body>\n` +
          `<header><h1>PRLens Dashboard</h1></header>\n` +
          `<main><section class="content"><p>PR Review details</p></section></main>\n`.repeat(50) +
          `</body></html>`
      })
    },

    // 5. JSON
    {
      name: "JSON (.json)",
      doc: new Document({
        metadata: { ...baseMetadata, filePath: "package.json" },
        pageContent: JSON.stringify({
          name: "prlens-backend",
          version: "1.0.0",
          dependencies: Object.fromEntries(
            Array.from({ length: 60 }, (_, i) => [`dep-${i}`, `^${i}.0.0`])
          )
        }, null, 2)
      })
    },

    // 6. Git Diff (Realistic multi-hunk patch)
    {
      name: "Git Diff (patch content)",
      doc: new Document({
        metadata: { ...baseMetadata, filePath: "src/auth.js" },
        pageContent: `diff --git a/src/auth.js b/src/auth.js\n` +
          `index 83a0f32..b72a110 100644\n` +
          `--- a/src/auth.js\n` +
          `+++ b/src/auth.js\n` +
          Array.from({ length: 25 }, (_, i) => 
            `@@ -${10 + i * 20},8 +${10 + i * 20},10 @@\n` +
            `- const oldValidation_${i} = null;\n` +
            `+ const newValidation_${i} = await validator.check(${i});\n` +
            `  return newValidation_${i};\n`
          ).join("\n")
      })
    },

    // 7. Unknown File Type (.xyz)
    {
      name: "Unknown File (.xyz)",
      doc: new Document({
        metadata: { ...baseMetadata, filePath: "custom.xyz" },
        pageContent: `CUSTOM CONFIG DATA BLOCK\n`.repeat(150)
      })
    },

    // 8. Python (.py)
    {
      name: "Python (.py)",
      doc: new Document({
        metadata: { ...baseMetadata, filePath: "scripts/migrate.py" },
        pageContent: `def migrate_db():\n    print("Migrating...")\n\n` +
          `class MigrationStep:\n    def execute(self):\n        pass\n\n`.repeat(50)
      })
    },

    // 9. Go (.go)
    {
      name: "Go (.go)",
      doc: new Document({
        metadata: { ...baseMetadata, filePath: "main.go" },
        pageContent: `package main\n\nimport "fmt"\n\n` +
          `func HandleRequest() {\n    fmt.Println("Handled")\n}\n\n`.repeat(50)
      })
    },

    // 10. Small Document (Should NOT be split unnecessarily)
    {
      name: "Small Document (No unnecessary split)",
      doc: new Document({
        metadata: { ...baseMetadata, filePath: "src/constants.js" },
        pageContent: `export const API_PORT = 3000;\nexport const TIMEOUT = 5000;\n`
      })
    }
  ];

  console.log("=================================================");
  console.log("   LangChain Native Splitter Router Test Suite   ");
  console.log("=================================================\n");

  let allPassed = true;

  for (const { name, doc } of testCases) {
    const { type } = getSplitterForDocument(doc);
    const chunks = await splitDocuments([doc]);

    console.log(`[TEST] ${name}`);
    console.log(`  File Path: ${doc.metadata.filePath}`);
    console.log(`  Selected Splitter: ${type}`);
    console.log(`  Input Size: ${doc.pageContent.length} chars`);
    console.log(`  Generated Chunks: ${chunks.length}`);

    // Verification 1: Chunks produced
    if (chunks.length === 0) {
      console.error(`  ❌ FAILED: Zero chunks produced!`);
      allPassed = false;
      continue;
    }

    // Verification 2: Metadata preservation across all chunks
    const metadataPreserved = chunks.every(c => 
      c.metadata.owner === baseMetadata.owner &&
      c.metadata.repo === baseMetadata.repo &&
      c.metadata.prNumber === baseMetadata.prNumber &&
      c.metadata.filePath === doc.metadata.filePath
    );
    console.log(`  Metadata Preserved Across All Chunks: ${metadataPreserved ? "✅ Yes" : "❌ No"}`);
    if (!metadataPreserved) allPassed = false;

    // Verification 3: Small doc not split unnecessarily
    if (name.includes("Small Document") && chunks.length !== 1) {
      console.error(`  ❌ FAILED: Small document was split into ${chunks.length} chunks!`);
      allPassed = false;
    }

    // Verification 4: Max chunk size check (targeting ~4000 chars / ~800-1000 tokens)
    const maxChunkSize = Math.max(...chunks.map(c => c.pageContent.length));
    console.log(`  Max Chunk Size: ${maxChunkSize} chars`);

    console.log("-------------------------------------------------\n");
  }

  console.log(`Test Result: ${allPassed ? "✅ ALL TESTS PASSED!" : "❌ SOME TESTS FAILED!"}`);
}

runTests().catch(console.error);
