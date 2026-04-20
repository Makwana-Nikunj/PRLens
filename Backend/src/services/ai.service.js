import { ApiError } from "../utils/ApiError.js";
import { formatDiffForPrompt } from "./chunker.service.js";

const AI_BASE_URL = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
const AI_API_KEY = process.env.AI_API_KEY || process.env.CLAUDE_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

async function retryWithBackoff(fn, maxRetries = 3) {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            return await fn();
        } catch (error) {
            const status = error.status || error.statusCode;
            const isRetryable = status === 429 || (status >= 500 && status < 600) || !status;
            if (isRetryable) {
                attempt++;
                if (attempt === maxRetries) throw new ApiError(status || 500, `API failed after ${maxRetries} attempts: ${error.message}`);
                const delay = Math.pow(2, attempt) * 1000;
                console.warn(`[AI Service] API Error ${status || 'Network'}. Retrying in ${delay / 1000}s...`);
                await wait(delay);
            } else {
                throw error;
            }
        }
    }
}

function parseJSONResponse(text) {
    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) cleanText = cleanText.slice(7);
    else if (cleanText.startsWith("```")) cleanText = cleanText.slice(3);
    if (cleanText.endsWith("```")) cleanText = cleanText.slice(0, -3);

    try {
        return JSON.parse(cleanText.trim());
    } catch {
        throw new ApiError(502, "Failed to parse API response as structured JSON");
    }
}

function validateAnalysisResult(data) {
    const required = ["summary", "key_changes", "tradeoffs", "risks", "reviewer_checklist", "file_explanations"];
    for (const key of required) {
        if (!data[key]) throw new ApiError(502, `AI Response mapped missing key: ${key}`);
    }
    return data;
}

export async function analyzePR(prompt, options = {}) {
    const AI_BASE_URL = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
    const AI_API_KEY = process.env.AI_API_KEY || process.env.CLAUDE_API_KEY;
    const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

    if (!AI_API_KEY) throw new ApiError(500, "AI_API_KEY is not configured.");

    const systemPrompt = `You are an expert technical code reviewer. Analyze the github PR chunk. Output ONLY a valid JSON object representing your analysis.
Required JSON format:
{
  "summary": "String summarizing changes",
  "key_changes": ["Array of main string changes"],
  "tradeoffs": ["Array of tradeoff strings"],
  "risks": ["Array of risk strings"],
  "reviewer_checklist": ["Array of check action items"],
  "file_explanations": {"filename": "String explaining file"}
}`;

    return await retryWithBackoff(async () => {
        // Enforce timeout via AbortController to prevent AI hanging internally
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 180000); // 180s timeout for OpenAI/Minimax

        try {
            const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
                method: "POST",
                signal: controller.signal,
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${AI_API_KEY}` },
                body: JSON.stringify({
                    model: AI_MODEL,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.2
                })
            });

            clearTimeout(timeoutId);

            if (!res.ok) throw new ApiError(res.status, await res.text());

            const data = await res.json();
            const rawContent = data.choices?.[0]?.message?.content;

            if (!rawContent) {
                throw new ApiError(502, "AI returned an empty or filtered response");
            }

            const parsed = parseJSONResponse(rawContent);

            return {
                ...validateAnalysisResult(parsed),
                raw_response: rawContent,
                model_used: AI_MODEL
            };
        } catch (fetchErr) {
            clearTimeout(timeoutId);
            if (fetchErr.name === 'AbortError') {
                throw new ApiError(504, "AI Service timed out after 180 seconds");
            }
            throw fetchErr;
        }
    });
}

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

    const prompt = formatDiffForPrompt(chunks, prMetadata);
    const analysis = await analyzePR(prompt, options);

    return analysis;
}

export async function* streamChat(messages, options = {}) {
    const AI_BASE_URL = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
    const AI_API_KEY = process.env.AI_API_KEY || process.env.CLAUDE_API_KEY;
    const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

    if (!AI_API_KEY) throw new ApiError(500, "AI_API_KEY is not configured.");

    const { prTitle, prFiles, diffContext } = options;
    const croppedDiff = diffContext ? diffContext.substring(0, 10000) + (diffContext.length > 10000 ? '\n... (diff truncated due to length)' : '') : 'No diff available';

    const systemPrompt = `You are a conversational AI dev bot tracking an analyzed pull request. Talk concisely to the user regarding the analysis.
PR Context:
- Title: ${prTitle || 'Unknown'}
- Files involved: ${prFiles ? prFiles.join(', ') : 'Unknown'}

Code Changes / Diff:
${croppedDiff}`;

    const res = await retryWithBackoff(async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 180000);

        try {
            const fetchRes = await fetch(`${AI_BASE_URL}/chat/completions`, {
                method: "POST",
                signal: controller.signal,
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${AI_API_KEY}` },
                body: JSON.stringify({
                    model: AI_MODEL,
                    messages: [{ role: "system", content: systemPrompt }, ...messages],
                    stream: false,
                    temperature: 0.4
                })
            });

            clearTimeout(timeoutId);
            if (!fetchRes.ok) throw new ApiError(fetchRes.status, await fetchRes.text());
            return fetchRes;
        } catch (fetchErr) {
            clearTimeout(timeoutId);
            if (fetchErr.name === 'AbortError') {
                throw new ApiError(504, "AI Service timed out after 180 seconds");
            }
            throw fetchErr;
        }
    });

    const data = await res.json();
    if (data.choices && data.choices[0] && data.choices[0].message?.content) {
        yield data.choices[0].message.content;
    }
}