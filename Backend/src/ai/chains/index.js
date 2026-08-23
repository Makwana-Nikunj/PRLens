import { analyzePRPrompt, chatPrompt } from "../prompts/index.js";
import { prAnalysisSchema, chatParser } from "../parsers/index.js";

/**
 * Creates a runnable chain for analyzing PR diff chunks.
 * Data Flow: Prompt -> LLM (with Structured Output) -> Zod Validated JSON
 *
 * @param {import("@langchain/core/language_models/chat_models").BaseChatModel} llm The LLM provider to execute the chain.
 * @returns A LangChain Runnable that takes { diff_chunk: string } and returns the parsed JSON object.
 */
export const createAnalyzePRChain = (llm) => {
  // Leverage the native tool-calling capabilities of the LLM to guarantee structured output
  const structuredLlm = llm.withStructuredOutput(prAnalysisSchema, { name: "analyze_pr" });
  return analyzePRPrompt.pipe(structuredLlm);
};

/**
 * Creates a runnable chain for the interactive PR review chat.
 * Data Flow: Prompt -> LLM -> String Parser
 *
 * @param {import("@langchain/core/language_models/chat_models").BaseChatModel} llm The LLM provider to execute the chain.
 * @returns A LangChain Runnable that takes { analysis, ragContext, chatHistory, message } and returns a string (or stream).
 */
export const createChatChain = (llm) => {
  return chatPrompt.pipe(llm).pipe(chatParser);
};
