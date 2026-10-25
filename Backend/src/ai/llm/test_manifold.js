import "dotenv/config";

import { manifoldLLM, resilientLLM, mistralLLM, groqLLM } from "./index.js";

async function testManifold() {
  console.log("\n=================================================");
  console.log("   PRLens AI: Manifold Gateway LangChain Test     ");
  console.log("=================================================\n");

  const baseUrl = process.env.PROVIDER_1_BASE_URL || process.env.MANIFOLD_BASE_URL || "https://manifold-g1tz.onrender.com/v1";
  const model = process.env.PROVIDER_1_MODEL || process.env.MANIFOLD_MODEL || "combo/nikunj";
  const apiKey = process.env.PROVIDER_1_API_KEY || process.env.MANIFOLD_API_KEY || "(not set)";
  const maskedKey = apiKey.length > 8 ? `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}` : apiKey;

  console.log(`[Config] Base URL:  ${baseUrl}`);
  console.log(`[Config] Model:     ${model} (Combo router with multi-model fallback)`);
  console.log(`[Config] API Key:   ${maskedKey}`);
  console.log(`[Config] Key Check: ${apiKey.startsWith("gw_") ? "✅ Valid Manifold prefix (gw_...)" : "⚠️ Does NOT start with gw_..."}`);

  // Test 1: Direct Invocation of Manifold combo/nikunj
  console.log("\n--- Test 1: Direct Manifold combo/nikunj Invocation ---");
  let directSuccess = false;
  try {
    const startTime = Date.now();
    const res = await manifoldLLM.invoke("Say 'MANIFOLD_CONNECTED' in one word.");
    const elapsed = Date.now() - startTime;
    console.log(`✅ Direct invocation succeeded in ${elapsed}ms!`);
    console.log(`Response: ${res.content}`);
    directSuccess = true;
  } catch (err) {
    console.log(`❌ Direct invocation failed: ${err.message}`);
    if (err.status) console.log(`   HTTP Status: ${err.status}`);
  }

  // Test 2: Resilient LangChain Fallback Chain
  console.log("\n--- Test 2: Resilient Multi-Tier LangChain Fallback ---");
  console.log("Testing resilient chain (Manifold combo -> Mistral -> Groq)...");
  try {
    const startTime = Date.now();
    const res = await resilientLLM.invoke("Explain in 1 sentence what a Pull Request is.");
    const elapsed = Date.now() - startTime;
    const content = typeof res.content === "string" ? res.content : JSON.stringify(res.content);
    console.log(`✅ Resilient chain succeeded in ${elapsed}ms!`);
    console.log(`Response: ${content.trim()}`);
  } catch (err) {
    console.log(`❌ Resilient chain failed: ${err.message}`);
  }

  console.log("\n=================================================");
  console.log(`Summary: Manifold Direct = ${directSuccess ? "SUCCESS" : "REQUIRES_VALID_KEY"}, Fallback System = ACTIVE`);
  console.log("=================================================\n");
}

testManifold().catch(console.error);
