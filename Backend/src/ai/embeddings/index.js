import { Embeddings } from "@langchain/core/embeddings";
import { embedTexts, embedQuery } from "../../services/gemini-embeddings.service.js";

/**
 * A LangChain-compatible Embeddings wrapper around the existing Gemini embeddings service.
 * 
 * The existing service uses a raw fetch to explicitly pass `outputDimensionality: 1536`.
 * The native @langchain/google-genai package currently lacks support for passing
 * outputDimensionality, which causes it to default to 3072. 
 * 
 * By wrapping the existing working service, we guarantee exactly 1536 dimensions
 * for PostgreSQL/pgvector compatibility while providing the standard LangChain interface.
 */
class CustomGeminiEmbeddings extends Embeddings {
  constructor() {
    super({});
    this.dimension = 1536;
  }

  async embedDocuments(documents) {
    if (!documents || documents.length === 0) return [];
    const embeddings = await embedTexts(documents);
    if (embeddings.length > 0 && embeddings[0].length !== this.dimension) {
      throw new Error(`Embedding dimension mismatch: got ${embeddings[0].length}, expected ${this.dimension}`);
    }
    return embeddings;
  }

  async embedQuery(document) {
    if (!document) return [];
    const vector = await embedQuery(document);
    if (vector.length > 0 && vector.length !== this.dimension) {
      throw new Error(`Embedding dimension mismatch: got ${vector.length}, expected ${this.dimension}`);
    }
    return vector;
  }
}

export const embeddingModel = new CustomGeminiEmbeddings();
