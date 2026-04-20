import { sql } from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { streamChat } from "../services/ai.service.js";

export const getChatHistory = asyncHandler(async (req, res) => {
  const { pr_id } = req.params;

  if (!pr_id) {
    throw new ApiError(400, "pr_id is required");
  }

  // Fetch conversation history
  const history = await sql`
    SELECT id, role, content, created_at
    FROM chat_messages
    WHERE pr_id = ${pr_id}
    ORDER BY created_at ASC
  `;

  res.status(200).json({
    success: true,
    data: history
  });
});

// POST /api/chat
export const chatController = asyncHandler(async (req, res) => {
  const { pr_id, message } = req.body;

  if (!pr_id || !message) {
    throw new ApiError(400, "pr_id and message are required");
  }

  // Load PR context from DB
  const prResult = await sql`
    SELECT raw_diff, title, author, description
    FROM pull_requests
    WHERE id = ${pr_id}
  `;

  if (!prResult || !prResult.length) {
    throw new ApiError(404, "PR not found in database");
  }

  const analysisResult = await sql`
    SELECT summary, key_changes, tradeoffs, risks, reviewer_checklist AS checklist, file_explanations
    FROM analyses
    WHERE pr_id = ${pr_id}
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (!analysisResult || !analysisResult.length) {
    throw new ApiError(404, "Analysis not found - analyze the PR first");
  }

  // Save user message first
  await sql`
    INSERT INTO chat_messages (pr_id, user_id, role, content)
    VALUES (${pr_id}, ${req.user?.id || null}, 'user', ${message})
  `;

  // Fetch conversation history
  const history = await sql`
    SELECT role, content
    FROM chat_messages
    WHERE pr_id = ${pr_id}
    ORDER BY created_at ASC
  `;

  const aiMessages = [];

  let prFilesList = [];
  let diffContext = "";
  try {
    const rawDiff = prResult[0].raw_diff;
    const diffData = typeof rawDiff === 'string' ? JSON.parse(rawDiff) : rawDiff;
    if (Array.isArray(diffData)) {
      prFilesList = diffData.map(f => f.filename).filter(Boolean);
      diffContext = diffData.map(f => `--- ${f.filename} ---\n${f.patch || 'No changes visible'}`).join('\n\n');
    }
  } catch (e) {
    console.error("Failed to parse raw_diff for chat context", e);
  }

  aiMessages.push({ role: 'system', content: `Current PR Analysis Summary: ${analysisResult[0].summary}` });

  for (const m of history) {
    if (m.role === 'user' || m.role === 'assistant' || m.role === 'system') {
      aiMessages.push({ role: m.role, content: m.content });
    }
  }

  let fullResponse = "";
  try {
    const stream = streamChat(aiMessages, {
      prTitle: prResult[0].title,
      prFiles: prFilesList,
      diffContext: diffContext
    });
    for await (const chunk of stream) {
      fullResponse += chunk;
    }
  } catch (err) {
    console.error("Chat generation failed:", err);
    throw new ApiError(500, "Failed to generate chat response from AI");
  }

  // Save AI response
  await sql`
    INSERT INTO chat_messages (pr_id, user_id, role, content)
    VALUES (${pr_id}, null, 'assistant', ${fullResponse})
  `;

  res.status(200).json({
    reply: fullResponse,
    message: fullResponse,
    pr_id,
    content: message
  });
});
