import { sql } from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { streamChat } from "../services/ai.service.js";
import { chunkDiff, formatDiffForPrompt } from "../services/chunker.service.js";

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
    SELECT raw_diff, title, author, description, base_branch, head_branch, total_additions, total_deletions, total_files
    FROM pull_requests
    WHERE id = ${pr_id}
  `;

  if (!prResult || !prResult.length) {
    throw new ApiError(404, "PR not found in database");
  }

  // Load latest analysis for the PR
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
      const chunks = chunkDiff(diffData);
      diffContext = formatDiffForPrompt(chunks, prResult[0]);
    }
  } catch (e) {
    console.error("Failed to parse raw_diff for chat context", e);
  }

  aiMessages.push({ role: 'system', content: `Current PR Analysis Summary: ${analysisResult[0].summary}` });

  // Smarter Context Management: Limit history to last 10 messages to prevent token overflow
  const MAX_HISTORY = 10;
  const recentHistory = history.slice(-MAX_HISTORY);

  for (const m of recentHistory) {
    if (m.role === 'user' || m.role === 'assistant' || m.role === 'system') {
      aiMessages.push({ role: m.role, content: m.content });
    }
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  let fullResponse = "";
  try {
    fullResponse = await streamChat(aiMessages, {
      prTitle: prResult[0].title,
      prFiles: prFilesList,
      diffContext: diffContext,
      res
    });

  } catch (err) {
    console.error("Chat generation failed:", err);
    res.write(`data: ${JSON.stringify({ error: "Failed to generate chat response from AI" })}\n\n`);
  }

  // Save AI response
  if (fullResponse) {
    await sql`
      INSERT INTO chat_messages (pr_id, user_id, role, content)
      VALUES (${pr_id}, null, 'assistant', ${fullResponse})
    `;
  }

  res.write('data: [DONE]\n\n');
  res.end();
});
