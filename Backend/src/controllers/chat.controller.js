import { sql } from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { streamChat } from "../services/ai.service.js";
import { retrieveRelevantChunks } from "../services/rag.service.js";
import { saveChatMessage } from "../services/chat.service.js";
import { cap, BUDGET } from "../utils/tokenBudget.js";

// GET /api/chat/:prId/history
export const getChatHistory = asyncHandler(async (req, res) => {
  const { prId } = req.params;
  console.log("[CHAT] Fetch history", { prId });

  const messages = await sql`
    SELECT id, role, content, created_at
    FROM chat_messages
    WHERE pr_id = ${prId}
    ORDER BY created_at ASC
    LIMIT 30
  `;

  console.log("[CHAT] History returned", { prId, count: messages?.length });
  res.status(200).json(new ApiResponse(200, messages, "Chat history retrieved successfully"));
});

// POST /api/chat/:prId
export const chatController = asyncHandler(async (req, res) => {
  const { prId } = req.params;
  let { message } = req.body;

  console.log("[CHAT] Request started", { prId, messagePreview: typeof message === 'string' ? message.slice(0, 50) : message });

  if (!prId || !message) {
    console.warn("[CHAT] Missing prId or message");
    throw new ApiError(400, "prId and message are required");
  }

  if (typeof message !== 'string') {
    console.warn("[CHAT] Non-string message received, coercing", { type: typeof message });
    message = String(message);
  }

  message = cap(message, BUDGET.userMessage, "User Message");

  message = message
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .trim();

  console.log("[CHAT] Input prepared", { messageLength: message.length });

  const analysisResult = await sql`
    SELECT summary, key_changes, tradeoffs, risks, file_explanations
    FROM analyses
    WHERE pr_id = ${prId}
    ORDER BY created_at DESC
    LIMIT 1
  `;
  console.log("[CHAT] Analysis loaded", { hasAnalysis: analysisResult?.length > 0 });

  let analysisContent = "";
  if (analysisResult?.length) {
    analysisContent = JSON.stringify(analysisResult[0]);
  }
  const cappedAnalysis = cap(analysisContent, BUDGET.systemPrompt, "Analysis");
  console.log("[CHAT] Analysis capped", { originalLength: analysisContent.length, cappedLength: cappedAnalysis.length });

  let recentMessages = [];
  try {
    recentMessages = await sql`
      SELECT role, content
      FROM chat_messages
      WHERE pr_id = ${prId}
      ORDER BY created_at DESC
      LIMIT 30
    `;
    recentMessages.reverse();
    console.log("[CHAT] Recent messages loaded", { count: recentMessages?.length });
  } catch (err) {
    console.error("[CHAT] Failed to load chat history:", err.message);
  }

  let chatHistoryStr = "";
  if (recentMessages?.length) {
    chatHistoryStr = recentMessages
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');
  }
  const cappedHistory = cap(chatHistoryStr, BUDGET.chatHistory, "Chat History");
  console.log("[CHAT] Chat history capped", { originalLength: chatHistoryStr.length, cappedLength: cappedHistory.length });

  let retrievedContext = "";
  try {
    const vectorCount = await sql`
      SELECT COUNT(*)::int AS count FROM pr_embeddings WHERE pr_id = ${prId}
    `;
    const totalVectors = vectorCount?.[0]?.count ?? 0;
    if (totalVectors === 0) {
      console.warn(`[CHAT] No vectors found for PR ${prId}, chat will proceed without RAG context`);
    } else {
      console.log(`[CHAT] Vectors available for PR ${prId}`, { totalVectors });
    }

    console.log("[CHAT] Retrieving relevant chunks...");
    const results = await retrieveRelevantChunks(prId, message);
    if (results && results.length > 0) {
      const texts = results.map(r => `File: ${r.filename}\n${r.content}`);
      retrievedContext = texts.join("\n\n---\n\n");
      console.log("[CHAT] RAG chunks retrieved", { chunkCount: results.length, contextLength: retrievedContext.length });
    } else {
      console.log("[CHAT] No RAG chunks found meeting threshold");
    }
  } catch (err) {
    console.error("[CHAT] RAG retrieval failed, continuing without it:", err.message);
  }

  const cappedRag = cap(retrievedContext, BUDGET.ragContext, "RAG Context");

  console.log({
    analysisLength: cappedAnalysis.length,
    historyLength: cappedHistory.length,
    ragLength: cappedRag.length
  });

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  console.log("[CHAT] SSE stream opened", { prId, messageLength: message.length });

  let aborted = false;
  const onAborted = () => aborted;

  const abortHandler = () => {
    aborted = true;
    console.log("[CHAT] Client aborted stream", { prId });
  };
  req.on('aborted', abortHandler);
  req.on('close', abortHandler);

  let fullResponse = "";
  try {
    fullResponse = await streamChat({
      message,
      analysis: cappedAnalysis,
      ragContext: cappedRag,
      chatHistory: cappedHistory,
      res,
      isAborted: onAborted
    });
    console.log("[CHAT] AI streaming complete", { prId, aborted });
  } catch (err) {
    console.error("[CHAT] Chat generation failed:", err.message);
    if (!aborted) {
      try {
        res.write(`data: ${JSON.stringify({ error: "Failed to generate chat response from AI" })}\n\n`);
      } catch (_e) {
        // ignore write errors if client disconnected
      }
    }
  } finally {
    req.off('aborted', abortHandler);
    req.off('close', abortHandler);
    res.off('close', abortHandler);
  }

  if (!aborted) {
    try {
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (_e) {
      // ignore if already closed
    }
  }
  console.log("[CHAT] Response sent, persisting messages", { prId, aborted, responseLength: fullResponse.length });

  try {
    await saveChatMessage({
      prId,
      userId: req.user?.id || null,
      role: 'user',
      content: message,
      tokensUsed: null
    });

    await saveChatMessage({
      prId,
      userId: req.user?.id || null,
      role: 'assistant',
      content: fullResponse,
      tokensUsed: null
    });
    console.log("[CHAT] Messages persisted", { prId });
  } catch (persistErr) {
    console.error("[CHAT] Failed to persist chat messages:", persistErr.message);
  }
});
