import { ChatOpenRouter } from "@langchain/openrouter";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatGroq } from "@langchain/groq";

/**
 * Resilient multi-provider LLM abstraction for LangChain.
 * Priority: OpenRouter -> Mistral -> Groq
 */

const openRouterApiKey = process.env.OPENROUTER_API_KEY || process.env.AI_API_KEY || process.env.PROVIDER_1_API_KEY;
const openRouterModel = process.env.AI_MODEL || process.env.PROVIDER_1_MODEL || "z-ai/glm-5.2:free";

export const openRouterLLM = new ChatOpenRouter({
  apiKey: openRouterApiKey,
  model: openRouterModel,
  maxTokens: 4000,
  timeout: 30000,
  maxRetries: 1
});

const mistralApiKey = process.env.MISTRAL_API_KEY;
export const mistralLLM = new ChatMistralAI({
  apiKey: mistralApiKey,
  model: "labs-leanstral-1-5",
  temperature: 0.1,
  timeout: 30000,
  maxRetries: 1
});

const groqApiKey = process.env.GROQ_API_KEY;
export const groqLLM = new ChatGroq({
  apiKey: groqApiKey,
  model: "groq/compound",
  temperature: 0.1,
  maxTokens: 4000,
  timeout: 30000,
  maxRetries: 1
});