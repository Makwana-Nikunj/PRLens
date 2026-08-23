import { sql } from "../db/index.js";
import { indexPRForRAGWithLangChain, retrieveRAGContextWithLangChain } from "../ai/orchestrator.js";

/**
 * Processes and stores PR file diffs in pgvector using the LangChain RAG pipeline.
 * Uses format-aware splitters and 1536-dimensional embeddings.
 * 
 * @param {string} prId - PR UUID
 * @param {string} prUrl - GitHub PR URL
 * @param {Array} files - PR files array
 * @returns {Promise<{ stored: number }>}
 */
export async function processAndStorePRFiles(prId, prUrl, files) {
  if (!files || files.length === 0) {
    console.warn(`[RAG Service] No files to embed for PR ${prId}`);
    return { stored: 0 };
  }

  const result = await indexPRForRAGWithLangChain({
    prId,
    prUrl,
    files
  });

  return { stored: result.stored };
}

/**
 * Retrieves relevant PR code/diff chunks for a user query using the LangChain PRRetriever.
 * 
 * @param {string} prId - PR UUID
 * @param {string} query - User message or question
 * @returns {Promise<Array<{ content: string, filename: string, similarity: number }>>}
 */
export async function retrieveRelevantChunks(prId, query) {
  const threshold = parseFloat(process.env.RAG_SIMILARITY_THRESHOLD || "0.4");
  const limit = parseInt(process.env.RAG_TOP_K || "5", 10);

  const { documents } = await retrieveRAGContextWithLangChain({
    prId,
    query,
    k: limit,
    threshold
  });

  const results = documents.map(doc => ({
    content: doc.pageContent,
    filename: doc.metadata?.filePath || doc.metadata?.filename || "unknown",
    similarity: doc.metadata?.similarity ?? 1.0
  }));

  console.log({
    prId,
    query,
    chunksRetrieved: results.length,
    similarityScores: results.map(r => r.similarity)
  });

  return results;
}

/**
 * Cleans up stored vectors for a specific PR in pgvector.
 * 
 * @param {string} prId - PR UUID
 */
export async function cleanupPRVectors(prId) {
  await sql`
    DELETE FROM pr_embeddings WHERE pr_id = ${prId}
  `;
}

