import { githubFilesToDocuments } from "../documents/github.js";
import { splitDocuments } from "../splitters/index.js";
import { addPRDocumentsToVectorStore } from "../vectorstores/pgvector.js";
import { createPRRetriever } from "../retrievers/index.js";

/**
 * Ingests and indexes a PR's files into the PostgreSQL pgvector store.
 * 
 * Pipeline:
 * 1. Convert GitHub file diffs into LangChain Documents with full PR metadata.
 * 2. Split documents into format-aware semantic chunks (Code, Markdown, HTML, JSON, Diffs).
 * 3. Embed chunks (1536d) and store into `pr_embeddings` table.
 * 4. Ensures idempotency by purging previous vectors for this PR prior to insertion.
 * 
 * @param {Object} params
 * @param {string} params.prId - PR UUID
 * @param {string} [params.prUrl] - GitHub PR URL
 * @param {string} [params.owner] - Repository owner
 * @param {string} [params.repo] - Repository name
 * @param {string|number} [params.prNumber] - PR number
 * @param {Array} params.files - Array of processed/chunked file objects ({ filename, status, additions, deletions, patch })
 * @returns {Promise<{ stored: number, prId: string }>}
 */
export async function indexPRForRAG({ prId, prUrl, owner, repo, prNumber, files }) {
  if (!files || !Array.isArray(files) || files.length === 0) {
    console.warn(`[RAG Ingestion] No files provided for PR ${prId || `${owner}/${repo}#${prNumber}`}`);
    return { stored: 0, prId };
  }

  console.log(`[RAG Ingestion] Processing ${files.length} files for PR ${prId || `${owner}/${repo}#${prNumber}`}...`);

  // 1. Transform raw file data into LangChain Documents
  const rawDocs = githubFilesToDocuments({
    prId,
    prUrl,
    owner,
    repo,
    prNumber,
    files
  });

  // 2. Perform format-aware semantic splitting
  const splitDocs = await splitDocuments(rawDocs);
  console.log(`[RAG Ingestion] Generated ${splitDocs.length} chunks from ${rawDocs.length} original documents`);

  if (splitDocs.length === 0) {
    return { stored: 0, prId };
  }

  // 3. Store in pgvector (handles embedding + idempotency)
  const result = await addPRDocumentsToVectorStore(splitDocs, {
    prId,
    owner,
    repo,
    prNumber
  });

  console.log(`[RAG Ingestion] Successfully stored ${result.added} chunks for PR ${prId || `${owner}/${repo}#${prNumber}`}`);
  return {
    stored: result.added,
    prId
  };
}

/**
 * Formats retrieved LangChain Documents into clean, prompt-ready context text.
 * 
 * @param {import("@langchain/core/documents").Document[]} documents
 * @returns {string} Formatted context
 */
export function formatRetrievedDocuments(documents) {
  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    return "";
  }

  return documents.map(doc => {
    const filename = doc.metadata?.filePath || doc.metadata?.filename || "Unknown File";
    return `File: ${filename}\n\n${doc.pageContent}`.trim();
  }).join("\n\n---\n\n");
}

/**
 * Retrieves relevant document chunks for a query and formats them for the prompt.
 * 
 * @param {Object} options
 * @param {string} options.prId - PR UUID
 * @param {string} [options.owner] - Repo owner
 * @param {string} [options.repo] - Repo name
 * @param {string|number} [options.prNumber] - PR number
 * @param {string} options.query - User question or query string
 * @param {number} [options.k] - Max chunks to retrieve
 * @param {number} [options.threshold] - Cosine similarity threshold (default: 0.4)
 * @returns {Promise<{ context: string, documents: import("@langchain/core/documents").Document[], chunkCount: number }>}
 */
export async function retrieveRAGContext({ prId, owner, repo, prNumber, query, k, threshold }) {
  if (!query || typeof query !== "string" || !query.trim()) {
    return { context: "", documents: [], chunkCount: 0 };
  }

  const retriever = createPRRetriever({
    prId,
    owner,
    repo,
    prNumber,
    k,
    threshold
  });

  const documents = await retriever.invoke(query);
  const context = formatRetrievedDocuments(documents);

  return {
    context,
    documents,
    chunkCount: documents.length
  };
}
