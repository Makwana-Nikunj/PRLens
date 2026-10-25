import crypto from "crypto";
import { openRouterLLM, mistralLLM, groqLLM } from "./index.js";

/**
 * Env-aware cache for the resilient LangChain chains used by the orchestrator.
 *
 * The orchestrator previously re-instantiated identical
 * `prompt.pipe(llm.withStructuredOutput(schema)).withFallbacks([...])` chains
 * on every request. The chain objects only depend on a small, stable subset
 * of the process environment, so we cache them.
 *
 * Behavior:
 *  - Cache key = providerKey + '::' + sha256(envSubset).
 *  - On cache miss, build the chain via the existing `chains/index.js` factory.
 *  - On cache hit, return the cached Runnable.
 *  - If any env var that affects the chain changes, the key changes, and a new
 *    chain is built on the next call.
 *
 * Sharing a Runnable across requests is safe: LangChain runnables are stateless
 * across `.invoke()` / `.stream()`. Per-call state (abort signals, output writers)
 * is plumbed through the second arg, not stored on the runnable.
 */

const ENV_KEYS = [
  "OPENROUTER_API_KEY",
  "AI_MODEL",
  "MISTRAL_API_KEY",
  "GROQ_API_KEY",
  "RAG_TOP_K",
  "RAG_SIMILARITY_THRESHOLD",
  "NODE_ENV",
];

function envHash() {
  const subset = {};
  for (const k of ENV_KEYS) {
    subset[k] = process.env[k] ?? "";
  }
  return crypto.createHash("sha256").update(JSON.stringify(subset)).digest("hex").slice(0, 16);
}

const LLM_BY_KEY = {
  openRouter: openRouterLLM,
  mistral: mistralLLM,
  groq: groqLLM,
};

/** @type {Map<string, unknown>} */
const analyzeCache = new Map();
/** @type {Map<string, unknown>} */
const chatCache = new Map();

/**
 * Build the analyze-PR chain. Imports the factory lazily to avoid a circular
 * import: `chains/index.js` doesn't import this file, but it's cleaner to keep
 * the cache module as the only entry point for cached chains.
 */
async function _buildAnalyzeChain(providerKey) {
  const { createAnalyzePRChain } = await import("../chains/index.js");
  const primary = createAnalyzePRChain(LLM_BY_KEY[providerKey]);
  const fallbacks = [
    createAnalyzePRChain(LLM_BY_KEY.mistral),
    createAnalyzePRChain(LLM_BY_KEY.groq),
  ];
  return primary.withFallbacks({ fallbacks });
}

async function _buildChatChain(providerKey) {
  const { createChatChain } = await import("../chains/index.js");
  const primary = createChatChain(LLM_BY_KEY[providerKey]);
  const fallbacks = [
    createChatChain(LLM_BY_KEY.mistral),
    createChatChain(LLM_BY_KEY.groq),
  ];
  return primary.withFallbacks({ fallbacks });
}

/**
 * Get a cached analyze-PR chain for the given provider key.
 * @param {string} providerKey - One of "openRouter", "mistral", "groq". Use
 *   `PROVIDER_KEYS.openRouter` etc. for type-safety.
 * @returns {Promise<import("langchain/core/runnables").Runnable>}
 */
export async function getAnalyzePRChain(providerKey) {
  if (!(providerKey in LLM_BY_KEY)) {
    throw new Error(`chainCache: unknown providerKey "${providerKey}"`);
  }
  const key = `${providerKey}::${envHash()}`;
  let chain = analyzeCache.get(key);
  if (chain) return chain;
  chain = await _buildAnalyzeChain(providerKey);
  analyzeCache.set(key, chain);
  return chain;
}

/**
 * Get a cached chat chain for the given provider key.
 * @param {string} providerKey
 * @returns {Promise<import("langchain/core/runnables").Runnable>}
 */
export async function getChatChain(providerKey) {
  if (!(providerKey in LLM_BY_KEY)) {
    throw new Error(`chainCache: unknown providerKey "${providerKey}"`);
  }
  const key = `${providerKey}::${envHash()}`;
  let chain = chatCache.get(key);
  if (chain) return chain;
  chain = await _buildChatChain(providerKey);
  chatCache.set(key, chain);
  return chain;
}

/**
 * Test-only: clear the cache so the next call rebuilds.
 * @param {{ analyze?: boolean, chat?: boolean }} [opts]
 */
export function _resetChainCache({ analyze = true, chat = true } = {}) {
  if (analyze) analyzeCache.clear();
  if (chat) chatCache.clear();
}

/**
 * Test-only: inspect cache sizes.
 * @returns {{ analyze: number, chat: number }}
 */
export function _chainCacheStats() {
  return { analyze: analyzeCache.size, chat: chatCache.size };
}
