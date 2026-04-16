import { sql } from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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

  // TODO: Implement streamChatResponse
  res.status(200).json({
    message: "Chat is not yet connected to Claude. Your message was saved.",
    pr_id, 
    content: message
  });
});
