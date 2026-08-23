import { ApiError } from "../utils/ApiError.js";
import { openRouterLLM, mistralLLM, groqLLM } from "./llm/index.js";
import { createAnalyzePRChain, createChatChain } from "./chains/index.js";
import { githubFilesToDocuments, formatDocumentsForPRAnalysis } from "./documents/github.js";
import { indexPRForRAG, retrieveRAGContext } from "./rag/index.js";

/**
 * LangChain-powered execution for PR Analysis.
 * Runs completely isolated from the legacy `ai.service.js` implementation.
 * 
 * @param {Array} chunks - The raw diff chunks
 * @param {Object} prMetadata - PR title, description, etc.
 * @returns {Promise<Object>} - The structured analysis result
 */
export async function analyzePRChunksWithLangChain(chunks, prMetadata) {
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

  // 1. Establish the clean AI boundary: Convert GitHub data -> LangChain Documents
  const documents = githubFilesToDocuments({
    owner: prMetadata.owner,
    repo: prMetadata.repo,
    prNumber: prMetadata.pr_number,
    prId: prMetadata.id,
    prUrl: prMetadata.url,
    files: chunks
  });

  // 2. Format the Documents for the specific Chain
  const formattedDiff = formatDocumentsForPRAnalysis(documents, prMetadata);

  console.log(`[AI Orchestrator] Starting LangChain execution with ${documents.length} LangChain Documents`);

  // 3. Instantiate chains for each provider
  const primaryChain = createAnalyzePRChain(openRouterLLM);
  const fallbackChain1 = createAnalyzePRChain(mistralLLM);
  const fallbackChain2 = createAnalyzePRChain(groqLLM);

  // 4. Attach fallbacks to the entire Runnable sequence (Prompt -> LLM -> Parser)
  const resilientChain = primaryChain.withFallbacks({
    fallbacks: [fallbackChain1, fallbackChain2]
  });

  try {
    // 5. Execute the chain
    const analysis = await resilientChain.invoke(
      { diff_chunk: formattedDiff },
      { timeout: 180000 }
    );

    // 6. Inject metadata to maintain API compatibility
    return {
      ...analysis,
      raw_response: null,
      model_used: "langchain-resilient-chain"
    };
  } catch (error) {
    console.error(`[AI Orchestrator] LangChain analyzePRChunks failed:`, error.message);
    throw new ApiError(502, "All LangChain AI providers (including fallbacks) failed to process the PR analysis. " + error.message);
  }
}

/**
 * Indexes PR files into PostgreSQL pgvector using the LangChain RAG subsystem.
 * 
 * @param {Object} params
 * @param {string} params.prId - PR UUID
 * @param {string} [params.prUrl] - GitHub PR URL
 * @param {string} [params.owner] - Repository owner
 * @param {string} [params.repo] - Repository name
 * @param {string|number} [params.prNumber] - PR number
 * @param {Array} params.files - Array of PR files/diffs
 * @returns {Promise<{ stored: number, prId: string }>}
 */
export async function indexPRForRAGWithLangChain(params) {
  return await indexPRForRAG(params);
}

/**
 * Retrieves relevant context chunks for a query using the LangChain PRRetriever.
 * 
 * @param {Object} params
 * @param {string} params.prId - PR UUID
 * @param {string} params.query - User query
 * @param {number} [params.k] - Max chunks
 * @param {number} [params.threshold] - Cosine similarity threshold
 * @returns {Promise<{ context: string, documents: Array, chunkCount: number }>}
 */
export async function retrieveRAGContextWithLangChain(params) {
  return await retrieveRAGContext(params);
}

/**
 * LangChain-powered execution for Chat Streaming with optional RAG integration.
 * Runs completely isolated from the legacy `ai.service.js` implementation.
 * 
 * If `prId` is supplied and `ragContext` is not provided, automatically retrieves
 * relevant context via `retrieveRAGContext()`.
 * 
 * @param {Object} options
 * @param {string} options.message - The user's input message
 * @param {string} [options.prId] - PR UUID (triggers automatic RAG retrieval)
 * @param {string} [options.analysis] - Formatted PR analysis string
 * @param {string} [options.ragContext] - Explicit RAG context string
 * @param {string} [options.chatHistory] - Formatted chat history string
 * @param {Object} [options.res] - Express response object for SSE
 * @param {Function} [options.isAborted] - Function returning boolean if stream is aborted
 * @returns {Promise<string>} The full concatenated response
 */
export async function streamChatWithLangChain(options = {}) {
  const { message, prId, analysis, chatHistory, res, isAborted = () => false } = options;
  let { ragContext } = options;

  if (!message) throw new ApiError(400, "Message is required for chat.");

  console.log("[AI Orchestrator] Starting LangChain execution for Chat Stream");

  // 1. Automatic RAG context retrieval if prId is provided and ragContext is absent
  if (prId && (ragContext === undefined || ragContext === null)) {
    try {
      console.log(`[AI Orchestrator] Auto-retrieving RAG context for PR ${prId}...`);
      const ragResult = await retrieveRAGContext({
        prId,
        query: message
      });
      ragContext = ragResult.context;
      console.log(`[AI Orchestrator] Auto-retrieved ${ragResult.chunkCount} RAG chunks`);
    } catch (ragErr) {
      console.warn(`[AI Orchestrator] RAG auto-retrieval failed, proceeding without RAG:`, ragErr.message);
      ragContext = "";
    }
  }

  // 2. Instantiate the chat chains for each provider
  const primaryChain = createChatChain(openRouterLLM);
  const fallbackChain1 = createChatChain(mistralLLM);
  const fallbackChain2 = createChatChain(groqLLM);

  // 3. Attach fallbacks to the entire Runnable sequence
  const resilientChain = primaryChain.withFallbacks({
    fallbacks: [fallbackChain1, fallbackChain2]
  });

  let fullResponse = "";

  try {
    // 4. Start the LangChain stream
    const stream = await resilientChain.stream({
      message,
      analysis: analysis || 'None',
      ragContext: ragContext || 'None',
      chatHistory: chatHistory || 'No previous conversation.'
    });

    // 5. Iterate over the stream and push SSE packets identically to the legacy format
    for await (const chunk of stream) {
      if (isAborted()) {
        console.warn(`[AI Orchestrator] LangChain stream aborted by client`);
        return fullResponse;
      }
      
      if (chunk) {
        fullResponse += chunk;
        if (res) {
          try {
            res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
            if (typeof res.flush === 'function') res.flush();
          } catch (_e) {
            if (isAborted()) return fullResponse;
            else throw _e;
          }
        }
      }
    }

    console.log("[AI Orchestrator] LangChain stream complete");
    return fullResponse;

  } catch (error) {
    if (isAborted()) {
      console.warn(`[AI Orchestrator] LangChain stream aborted during error handling`);
      return fullResponse;
    }
    
    console.error(`[AI Orchestrator] LangChain streamChat failed:`, error.message);
    
    if (res && !fullResponse) {
      res.write(`data: ${JSON.stringify({ text: `\n*(All LangChain providers failed. Error: ${error.message})*\n` })}\n\n`);
      if (typeof res.flush === 'function') res.flush();
    }
    
    throw error;
  }
}
