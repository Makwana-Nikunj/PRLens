import { ChatOpenAI } from "@langchain/openai";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatGroq } from "@langchain/groq";

/**
 * Resilient multi-provider LLM abstraction for LangChain.
 *
 * Provider 1 (Primary): Manifold Gateway (combo/nikunj)
 *   - Base URL: https://manifold-g1tz.onrender.com/v1
 *   - Model: combo/nikunj (intelligent combo combining multiple upstream models with fallback strategies)
 *
 * Client-Side Fallback Tiers:
 *   - Tier 1: Manifold Gateway (combo/nikunj)
 *   - Tier 2: Mistral AI (labs-leanstral-1-5)
 *   - Tier 3: Groq (groq/compound)
 */

const manifoldApiKey = process.env.PROVIDER_1_API_KEY || process.env.MANIFOLD_API_KEY || process.env.OPENROUTER_API_KEY || process.env.AI_API_KEY;
const manifoldBaseUrl = (process.env.PROVIDER_1_BASE_URL || process.env.MANIFOLD_BASE_URL || process.env.AI_BASE_URL || "https://manifold-g1tz.onrender.com/v1").replace(/\/$/, "");
const manifoldModel = process.env.PROVIDER_1_MODEL || process.env.MANIFOLD_MODEL || process.env.AI_MODEL || "combo/nikunj";

export const manifoldLLM = new ChatOpenAI({
  apiKey: manifoldApiKey,
  model: manifoldModel,
  configuration: {
    baseURL: manifoldBaseUrl,
  },
  maxTokens: 4000,
  timeout: 60000,
  maxRetries: 2
});

// Primary LLM is Manifold Gateway Combo
export const primaryLLM = manifoldLLM;

// Alias openRouterLLM to manifoldLLM for backwards compatibility
export const openRouterLLM = manifoldLLM;

const mistralApiKey = process.env.MISTRAL_API_KEY || "missing-mistral-key";
export const mistralLLM = new ChatMistralAI({
  apiKey: mistralApiKey,
  model: "labs-leanstral-1-5",
  temperature: 0.1,
  timeout: 30000,
  maxRetries: 1
});

const groqApiKey = process.env.GROQ_API_KEY || "missing-groq-key";
export const groqLLM = new ChatGroq({
  apiKey: groqApiKey,
  model: "groq/compound",
  temperature: 0.1,
  maxTokens: 4000,
  timeout: 30000,
  maxRetries: 1
});

/**
 * Resilient LLM Runnable with client-side fallback chaining.
 * Tier 1: Manifold combo/nikunj (upstream multi-model routing & fallbacks)
 * Tier 2: Mistral AI (labs-leanstral-1-5)
 * Tier 3: Groq (groq/compound)
 */
export const resilientLLM = manifoldLLM.withFallbacks({
  fallbacks: [mistralLLM, groqLLM]
});