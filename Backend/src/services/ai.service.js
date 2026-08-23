import { ApiError } from "../utils/ApiError.js";
import { formatDiffForPrompt } from "./chunker.service.js";
import {
  analyzePRChunksWithLangChain,
  streamChatWithLangChain
} from "../ai/orchestrator.js";

/**
 * Analyzes PR chunks using the LangChain-powered analysis pipeline with fallback LLMs.
 * 
 * @param {Array} chunks - The file diff chunks
 * @param {Object} prMetadata - PR metadata (title, repo, owner, etc.)
 * @param {Object} options - Optional parameters
 * @returns {Promise<Object>} Analysis result matching schema
 */
export async function analyzePRChunks(chunks, prMetadata, options = {}) {
  if (!chunks || chunks.length === 0) return null;

  if (prMetadata?.title === "Mock PR for Testing") {
    return {
      summary: "This is a mocked PR summary because the Dev Mock bypassed the AI.",
      key_changes: ["Mocked change 1", "Mocked change 2"],
      tradeoffs: ["Mocked tradeoff"],
      risks: ["Mocked risk"],
      reviewer_checklist: ["Review mock", "Test mock"],
      file_explanations: { "src/mock.js": "Mocked explanation" },
      raw_response: "Mock",
      model_used: "mock-model"
    };
  }

  return await analyzePRChunksWithLangChain(chunks, prMetadata);
}

/**
 * Streams chat responses using the LangChain RAG pipeline and resilient LLMs.
 * 
 * @param {Object} options
 * @param {string} options.message - User message
 * @param {string} [options.prId] - PR UUID for auto-RAG retrieval
 * @param {string} [options.analysis] - PR analysis context
 * @param {string} [options.ragContext] - Explicit RAG context
 * @param {string} [options.chatHistory] - Chat history string
 * @param {Object} [options.res] - SSE Response object
 * @param {Function} [options.isAborted] - Abort check callback
 * @returns {Promise<string>}
 */
export async function streamChat(options = {}) {
  return await streamChatWithLangChain(options);
}
