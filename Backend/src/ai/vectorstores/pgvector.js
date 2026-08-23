import { VectorStore } from "@langchain/core/vectorstores";
import { Document } from "@langchain/core/documents";
import { sql } from "../../db/index.js";
import { embeddingModel } from "../embeddings/index.js";

/**
 * A custom LangChain VectorStore that wraps PostgreSQL pgvector via postgres.js
 * and operates on the `pr_embeddings` table.
 */
export class PRVectorStore extends VectorStore {
  _vectorstoreType() {
    return "postgres.js";
  }

  constructor(embeddings = embeddingModel, config = {}) {
    super(embeddings, config);
  }

  async addDocuments(documents) {
    if (!documents || documents.length === 0) return [];
    const texts = documents.map(doc => doc.pageContent);
    const embeddings = await this.embeddings.embedDocuments(texts);
    return await this.addVectors(embeddings, documents);
  }

  async addVectors(vectors, documents) {
    if (!documents || !documents.length) return [];

    const firstMeta = documents[0].metadata || {};
    let prId = firstMeta.prId || null;
    let prUrl = firstMeta.prUrl || "unknown";

    // If prId is not provided directly in metadata, resolve from pull_requests table
    if (!prId && firstMeta.owner && firstMeta.repo && firstMeta.prNumber) {
      const prRows = await sql`
        SELECT id, url FROM pull_requests 
        WHERE owner = ${firstMeta.owner} 
          AND repo = ${firstMeta.repo} 
          AND pr_number = ${parseInt(firstMeta.prNumber, 10)}
        LIMIT 1
      `;
      
      if (prRows.length > 0) {
        prId = prRows[0].id;
        prUrl = prRows[0].url || prUrl;
      }
    }

    if (!prId) {
      console.warn("[PRVectorStore] Warning: Inserting chunks without a valid pr_id. Note that foreign key constraints may reject this if pr_id is required.");
    }

    const rows = documents.map((doc, idx) => ({
      pr_id: prId,
      pr_url: prUrl,
      filename: doc.metadata?.filePath || doc.metadata?.filename || "unknown",
      chunk_index: doc.metadata?.chunkIndex ?? idx,
      content: doc.pageContent,
      metadata: sql.json({
        ...doc.metadata,
        prId: prId || doc.metadata?.prId,
        prUrl: prUrl || doc.metadata?.prUrl
      }),
      embedding: `[${vectors[idx].join(",")}]`
    }));

    // Batch insert in chunks of 100
    const batchSize = 100;
    for (let i = 0; i < rows.length; i += batchSize) {
      const chunk = rows.slice(i, i + batchSize);
      await sql`
        INSERT INTO pr_embeddings ${sql(chunk, "pr_id", "pr_url", "filename", "chunk_index", "content", "metadata", "embedding")}
      `;
    }

    return rows.map((_, i) => i.toString());
  }

  /**
   * Performs cosine similarity search against pgvector.
   * 
   * IMPORTANT: pgvector's `<=>` operator computes cosine DISTANCE.
   * Cosine SIMILARITY = 1 - distance.
   * A similarity threshold of >= 0.4 corresponds to distance <= 0.6.
   * 
   * @param {number[]} queryVector - 1536-dimensional query embedding
   * @param {number} k - Max number of top chunks to return
   * @param {Object} filter - Filter criteria ({ prId, threshold, owner, repo, prNumber })
   * @returns {Promise<[Document, number][]>}
   */
  async similaritySearchVectorWithScore(queryVector, k = 5, filter = {}) {
    const threshold = filter.threshold ?? parseFloat(process.env.RAG_SIMILARITY_THRESHOLD || "0.4");
    const limit = k || parseInt(process.env.RAG_TOP_K || "5", 10);
    const vectorStr = `[${queryVector.join(",")}]`;

    let results = [];

    if (filter.prId) {
      results = await sql`
        SELECT 
          content,
          filename,
          metadata,
          1 - (embedding <=> ${vectorStr}::vector) AS similarity
        FROM pr_embeddings
        WHERE pr_id = ${filter.prId}
          AND (1 - (embedding <=> ${vectorStr}::vector)) >= ${threshold}
        ORDER BY embedding <=> ${vectorStr}::vector
        LIMIT ${limit}
      `;
    } else if (filter.owner && filter.repo && filter.prNumber) {
      results = await sql`
        SELECT 
          p.content,
          p.filename,
          p.metadata,
          1 - (p.embedding <=> ${vectorStr}::vector) AS similarity
        FROM pr_embeddings p
        JOIN pull_requests pr ON p.pr_id = pr.id
        WHERE pr.owner = ${filter.owner}
          AND pr.repo = ${filter.repo}
          AND pr.pr_number = ${parseInt(filter.prNumber, 10)}
          AND (1 - (p.embedding <=> ${vectorStr}::vector)) >= ${threshold}
        ORDER BY p.embedding <=> ${vectorStr}::vector
        LIMIT ${limit}
      `;
    } else {
      // Unfiltered search (fallback)
      results = await sql`
        SELECT 
          content,
          filename,
          metadata,
          1 - (embedding <=> ${vectorStr}::vector) AS similarity
        FROM pr_embeddings
        WHERE (1 - (embedding <=> ${vectorStr}::vector)) >= ${threshold}
        ORDER BY embedding <=> ${vectorStr}::vector
        LIMIT ${limit}
      `;
    }

    return results.map(row => {
      const docMetadata = {
        ...(typeof row.metadata === 'object' && row.metadata !== null ? row.metadata : {}),
        filename: row.filename,
        similarity: Number(row.similarity)
      };

      return [
        new Document({
          pageContent: row.content,
          metadata: docMetadata
        }),
        Number(row.similarity)
      ];
    });
  }

  /**
   * Similarity search returning Document[] directly.
   */
  async similaritySearch(query, k = 5, filter = {}) {
    const queryVector = await this.embeddings.embedQuery(query);
    const results = await this.similaritySearchVectorWithScore(queryVector, k, filter);
    return results.map(([doc]) => doc);
  }
}

/**
 * Returns a configured instance of PRVectorStore.
 */
export const getPRVectorStore = () => {
  return new PRVectorStore(embeddingModel, {});
};

/**
 * Reusable ingestion API.
 * Safely adds PR documents while ensuring idempotency (no uncontrolled duplication).
 */
export const addPRDocumentsToVectorStore = async (documents, options = {}) => {
  if (!documents || documents.length === 0) return { added: 0 };

  const store = getPRVectorStore();
  const firstMeta = documents[0].metadata || {};
  const prId = options.prId || firstMeta.prId;
  const owner = options.owner || firstMeta.owner;
  const repo = options.repo || firstMeta.repo;
  const prNumber = options.prNumber || firstMeta.prNumber;

  // Idempotency: Delete existing chunks before inserting new ones
  if (prId) {
    await sql`
      DELETE FROM pr_embeddings 
      WHERE pr_id = ${prId}
    `;
  } else if (owner && repo && prNumber) {
    const prRows = await sql`
      SELECT id FROM pull_requests 
      WHERE owner = ${owner} AND repo = ${repo} AND pr_number = ${parseInt(prNumber, 10)}
      LIMIT 1
    `;

    if (prRows.length > 0) {
      await sql`
        DELETE FROM pr_embeddings 
        WHERE pr_id = ${prRows[0].id}
      `;
    }
  }

  await store.addDocuments(documents);
  
  return {
    added: documents.length,
    collection: "pr_embeddings"
  };
};
