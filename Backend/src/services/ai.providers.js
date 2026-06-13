import { ApiError } from "../utils/ApiError.js";

const PROVIDER_CONFIGS = [
  {
    id: 1,
    name: 'OpenRouter',
    baseUrl: (process.env.AI_BASE_URL || process.env.PROVIDER_1_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/$/, ''),
    apiKey: process.env.AI_API_KEY || process.env.PROVIDER_1_API_KEY || '',
    model: process.env.AI_MODEL || process.env.PROVIDER_1_MODEL || 'gpt-4o-mini',
    fallbackModel: process.env.PROVIDER_1_FALLBACK_MODEL || null,
  },
  {
    id: 2,
    name: 'Modal AI',
    baseUrl: (process.env.MODAL_AI_BASE_URL || process.env.PROVIDER_2_BASE_URL || '').replace(/\/$/, ''),
    apiKey: process.env.MODAL_AI_API_KEY || process.env.PROVIDER_2_API_KEY || '',
    model: process.env.MODAL_AI_MODEL || process.env.PROVIDER_2_MODEL || '',
    fallbackModel: process.env.PROVIDER_2_FALLBACK_MODEL || null,
  },
  {
    id: 3,
    name: 'NVIDIA',
    baseUrl: (process.env.NVIDIA_AI_BASE_URL || process.env.PROVIDER_3_BASE_URL || '').replace(/\/$/, ''),
    apiKey: process.env.NVIDIA_AI_API_KEY || process.env.PROVIDER_3_API_KEY || '',
    model: process.env.NVIDIA_AI_MODEL || process.env.PROVIDER_3_MODEL || '',
    fallbackModel: process.env.PROVIDER_3_FALLBACK_MODEL || null,
  },
  {
    id: 4,
    name: 'Gemini',
    baseUrl: (process.env.PROVIDER_GEMINI_BASE_URL || process.env.PROVIDER_4_BASE_URL || '').replace(/\/$/, ''),
    apiKey: process.env.PROVIDER_GEMINI_API_KEY || process.env.PROVIDER_4_API_KEY || '',
    model: process.env.GEMINI_FALLBACK_MODEL || process.env.PROVIDER_4_MODEL || '',
    fallbackModel: process.env.PROVIDER_4_FALLBACK_MODEL || null,
  },
];

const nextProviderIndex = { value: 0 };

function isGemini(provider) {
  return provider.baseUrl.includes('generativelanguage.googleapis.com');
}

function logStartup() {
  console.log('[AI Providers] ========== Provider Config Loaded ==========');
  PROVIDER_CONFIGS.forEach(p => {
    const configured = p.baseUrl && p.apiKey && p.model;
    console.log(
      `[AI Providers] Provider ${p.id}: ${p.name} | model=${configured ? p.model : 'NOT_CONFIGURED'} | baseUrl=${p.baseUrl || 'MISSING'} | apiKey=${p.apiKey ? 'SET' : 'MISSING'} | fallback=${p.fallbackModel || 'none'}`
    );
  });
  const roundRobin = getRoundRobinProviders();
  const gemini = getGeminiFallbackProvider();
  console.log(`[AI Providers] Round-robin providers: ${roundRobin.map(p => `${p.id}.${p.name}(${p.model})`).join(' -> ')}`);
  console.log(`[AI Providers] Gemini fallback: ${gemini ? `${gemini.id}.${gemini.name}(${gemini.model})` : 'DISABLED'}`);
  console.log('[AI Providers] =============================================');
}

logStartup();

export function getRoundRobinProviders() {
  const last = PROVIDER_CONFIGS[PROVIDER_CONFIGS.length - 1];
  const isLastGemini = last && isGemini(last);
  return PROVIDER_CONFIGS.filter((p, idx) => {
    if (isLastGemini && idx === PROVIDER_CONFIGS.length - 1) return false;
    return p.baseUrl && p.apiKey && p.model;
  });
}

export function getGeminiFallbackProvider() {
  const candidate = PROVIDER_CONFIGS[PROVIDER_CONFIGS.length - 1];
  return (candidate && isGemini(candidate) && candidate.baseUrl && candidate.apiKey && candidate.model) ? candidate : null;
}

export function getProviderConfig(id) {
  return PROVIDER_CONFIGS.find(p => p.id === id) || null;
}

export function advanceRoundRobin() {
  nextProviderIndex.value++;
  console.log(`[AI Providers] Round-robin index advanced to ${nextProviderIndex.value}`);
}

export function getNextProviderIndex() {
  return nextProviderIndex.value;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseJSONResponse(text) {
  let cleanText = text.trim();
  if (cleanText.startsWith('```json')) cleanText = cleanText.slice(7);
  else if (cleanText.startsWith('```')) cleanText = cleanText.slice(3);
  if (cleanText.endsWith('```')) cleanText = cleanText.slice(0, -3);

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

function logProviderEvent(level, provider, message, extra = {}) {
  const prefix = '[AI Providers]';
  if (level === 'error') {
    console.error(`${prefix} ${message}`, { provider: provider.id, name: provider.name, ...extra });
  } else if (level === 'warn') {
    console.warn(`${prefix} ${message}`, { provider: provider.id, name: provider.name, ...extra });
  } else {
    console.log(`${prefix} ${message}`, { provider: provider.id, name: provider.name, ...extra });
  }
}

export async function callProviderChat(provider, messages, options = {}) {
  const temperature = options.temperature ?? 0.2;

  if (isGemini(provider)) {
    return callGeminiChat(provider, messages, temperature);
  }

  const url = `${provider.baseUrl}/chat/completions`;
  const startTime = Date.now();

  logProviderEvent('log', provider, `Calling provider ${provider.id} (${provider.name}) model=${provider.model}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      temperature
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(response.status, text);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new ApiError(502, "Provider returned an empty response");

  const parsed = parseJSONResponse(content);
  const latency = Date.now() - startTime;
  logProviderEvent('log', provider, `Provider ${provider.id} (${provider.name}) succeeded in ${latency}ms`, { latency, model: provider.model });

  return {
    ...validateAnalysisResult(parsed),
    raw_response: content,
    model_used: provider.model
  };
}

async function callGeminiChat(provider, messages, temperature) {
  const url = `${provider.baseUrl}/models/${provider.model}:generateContent?key=${provider.apiKey}`;
  const startTime = Date.now();

  logProviderEvent('log', provider, `Calling provider ${provider.id} (${provider.name}) model=${provider.model} (Gemini format)`);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: messages.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
      generationConfig: { temperature }
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(response.status, text);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new ApiError(502, "Gemini returned an empty response");

  const parsed = parseJSONResponse(content);
  const latency = Date.now() - startTime;
  logProviderEvent('log', provider, `Provider ${provider.id} (${provider.name}) succeeded in ${latency}ms`, { latency, model: provider.model });

  return {
    ...validateAnalysisResult(parsed),
    raw_response: content,
    model_used: provider.model
  };
}

export async function callProviderChatStream(provider, messages, options = {}, res, isAborted = () => false, abortSignal) {
  const temperature = options.temperature ?? 0.4;
  const startTime = Date.now();

  if (isGemini(provider)) {
    return streamGeminiRaw(provider, messages, temperature, res, isAborted, abortSignal, startTime);
  }

  logProviderEvent('log', provider, `Calling provider ${provider.id} (${provider.name}) model=${provider.model} (stream)`);

  const { default: OpenAI } = await import('openai');

  const openai = new OpenAI({
    apiKey: provider.apiKey,
    baseURL: provider.baseUrl
  });

  try {
    const stream = await openai.chat.completions.create({
      model: provider.model,
      messages,
      stream: true,
      temperature,
      signal: abortSignal
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      if (isAborted()) {
        console.warn(`[AI Providers] Stream aborted on provider ${provider.id} (${provider.name})`);
        return fullResponse;
      }
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        if (res) {
          try {
            res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
            if (typeof res.flush === 'function') res.flush();
          } catch (_e) {
            if (isAborted()) return fullResponse;
            else throw _e;
          }
        }
      }
    }

    const latency = Date.now() - startTime;
    logProviderEvent('log', provider, `Provider ${provider.id} (${provider.name}) stream succeeded in ${latency}ms`, { latency, model: provider.model });
    return fullResponse;
  } catch (error) {
    if (isAborted()) {
      console.warn(`[AI Providers] Stream aborted during provider ${provider.id} catch`);
      return '';
    }
    if (error?.name === 'AbortError' || /aborted/i.test(error?.message || '')) {
      console.warn(`[AI Providers] Stream aborted via OpenAI AbortError on provider ${provider.id}`);
      return '';
    }
    throw error;
  }
}

async function streamGeminiRaw(provider, messages, temperature, res, isAborted, abortSignal, startTime) {
  const url = `${provider.baseUrl}/models/${provider.model}:streamGenerateContent?alt=sse&key=${provider.apiKey}`;

  logProviderEvent('log', provider, `Calling provider ${provider.id} (${provider.name}) model=${provider.model} (Gemini stream)`);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: messages.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
      generationConfig: { temperature }
    }),
    signal: abortSignal
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(response.status, text);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullResponse = '';
  let buffer = '';

  while (true) {
    if (isAborted()) {
      console.warn(`[AI Providers] Gemini stream aborted on provider ${provider.id}`);
      reader.cancel().catch(() => void 0);
      break;
    }
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (isAborted()) {
        console.warn(`[AI Providers] Gemini stream aborted on provider ${provider.id}`);
        reader.cancel().catch(() => void 0);
        break;
      }
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (!data || data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text) {
          fullResponse += text;
          if (res) {
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
            if (typeof res.flush === 'function') res.flush();
          }
        }
      } catch {
        // skip malformed SSE chunk
      }
    }
  }

  const latency = Date.now() - startTime;
  logProviderEvent('log', provider, `Provider ${provider.id} (${provider.name}) Gemini stream succeeded in ${latency}ms`, { latency, model: provider.model });
  return fullResponse;
}

export async function retryProviderCall(fn, provider, maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      const status = error.status || error.statusCode;
      const isRetryable = !status || status === 429 || (status >= 500 && status < 600);

      if (!isRetryable) {
        logProviderEvent('warn', provider, `Provider ${provider.id} (${provider.name}) non-retryable error ${status || 'network'}: ${error.message}`);
        throw error;
      }

      attempt++;
      if (attempt > maxRetries) {
        logProviderEvent('warn', provider, `Provider ${provider.id} (${provider.name}) retryable error (attempt ${attempt}/${maxRetries}): ${status || 'network'}: ${error.message} — exhausted`);
        throw error;
      }

      const delay = Math.pow(2, attempt) * 1000;
      logProviderEvent('warn', provider, `Provider ${provider.id} (${provider.name}) retryable error (attempt ${attempt}/${maxRetries}): ${status || 'network'}: ${error.message}. Retrying in ${delay / 1000}s...`);
      await wait(delay);
    }
  }
}
