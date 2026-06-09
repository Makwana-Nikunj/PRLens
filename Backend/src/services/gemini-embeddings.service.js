const GEMINI_EMBEDDING_MODEL = "gemini-embedding-001";
const EXPECTED_DIM = 1536;
const BATCH_SIZE = 50;
const MAX_RETRIES = 3;

function getGeminiApiKey() {
    const key = process.env.GEMINI_API_KEY || process.env.PROVIDER_GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is not configured");
    return key;
}

function getGeminiBaseUrl() {
    return (process.env.PROVIDER_GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
}

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGeminiEmbedding(texts) {
    const apiKey = getGeminiApiKey();
    const baseUrl = getGeminiBaseUrl();
    const url = `${baseUrl}/models/${GEMINI_EMBEDDING_MODEL}:embedContent?key=${apiKey}`;

    if (!texts || texts.length === 0) {
        return [];
    }

    console.log(`[Embeddings] Requesting ${texts.length} embeddings from Gemini...`);

    const results = await Promise.all(
        texts.map((text) =>
            fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: { parts: [{ text }] },
                    outputDimensionality: EXPECTED_DIM,
                }),
            }).then(async (response) => {
                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`Gemini embedding failed (${response.status}): ${text}`);
                }
                const data = await response.json();
                const values = data.embedding?.values || data.embedding || [];
                if (values.length !== EXPECTED_DIM) {
                    throw new Error(
                        `Embedding dimension mismatch: got ${values.length}, expected ${EXPECTED_DIM}`
                    );
                }
                return values;
            })
        )
    );

    return results;
}

async function embedWithRetry(texts) {
    let attempt = 0;
    while (attempt < MAX_RETRIES) {
        try {
            return await callGeminiEmbedding(texts);
        } catch (error) {
            attempt++;
            const isRetryable = error.message.includes("429") || error.message.includes("500") || error.message.includes("503");
            if (isRetryable && attempt < MAX_RETRIES) {
                const delay = Math.pow(2, attempt) * 1000;
                console.warn(`[Gemini Embeddings] Retry ${attempt}/${MAX_RETRIES} after ${delay}ms...`);
                await sleep(delay);
            } else {
                throw error;
            }
        }
    }
}

export async function embedTexts(texts) {
    if (!texts || texts.length === 0) return [];

    const results = [];
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
        const batch = texts.slice(i, i + BATCH_SIZE);
        const batchResult = await embedWithRetry(batch);
        results.push(...batchResult);
    }

    return results;
}

export async function embedQuery(text) {
    if (!text) return [];
    const [vector] = await embedTexts([text]);
    return vector;
}
