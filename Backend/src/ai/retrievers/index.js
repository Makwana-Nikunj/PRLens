import { BaseRetriever } from "@langchain/core/retrievers";
import { getPRVectorStore } from "../vectorstores/pgvector.js";

/**
 * LangChain-native Retriever for PR document chunks stored in PostgreSQL pgvector.
 * 
 * Features:
 * 1. Scoped PR isolation via `prId` filter
 * 2. Cosine similarity thresholding (`>= threshold`)
 * 3. Top-K limit (`k`)
 * 4. Automatic query embedding and metadata enrichment
 */
export class PRRetriever extends BaseRetriever {
  lc_namespace = ["ai", "retrievers"];

  static lc_name() {
    return "PRRetriever";
  }

  constructor(fields = {}) {
    super(fields);
    this.vectorStore = fields.vectorStore || getPRVectorStore();
    this.prId = fields.prId || null;
    this.owner = fields.owner || null;
    this.repo = fields.repo || null;
    this.prNumber = fields.prNumber || null;
    this.k = fields.k ?? parseInt(process.env.RAG_TOP_K || "5", 10);
    this.threshold = fields.threshold ?? parseFloat(process.env.RAG_SIMILARITY_THRESHOLD || "0.4");
  }

  /**
   * Internal retriever execution method called by LangChain Runnable pipeline.
   * 
   * @param {string} query - The user question or search query
   * @returns {Promise<import("@langchain/core/documents").Document[]>}
   */
  async _getRelevantDocuments(query) {
    if (!query || typeof query !== "string" || !query.trim()) {
      return [];
    }

    const filter = {
      prId: this.prId,
      owner: this.owner,
      repo: this.repo,
      prNumber: this.prNumber,
      threshold: this.threshold
    };

    const results = await this.vectorStore.similaritySearch(query, this.k, filter);

    console.log(`[PRRetriever] Retrieved ${results.length} chunks for PR "${this.prId || `${this.owner}/${this.repo}#${this.prNumber}`}" (k=${this.k}, threshold=${this.threshold})`);

    return results;
  }
}

/**
 * Factory function to instantiate a configured PRRetriever.
 * 
 * @param {Object} options
 * @param {string} options.prId - PR UUID
 * @param {string} [options.owner] - Repo owner
 * @param {string} [options.repo] - Repo name
 * @param {string|number} [options.prNumber] - PR number
 * @param {number} [options.k] - Max chunks to retrieve
 * @param {number} [options.threshold] - Cosine similarity threshold
 * @returns {PRRetriever}
 */
export const createPRRetriever = (options = {}) => {
  return new PRRetriever(options);
};
