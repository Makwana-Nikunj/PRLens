import { sql } from "../db/index.js";

export const saveChatMessage = async ({ prId, userId, role, content, tokensUsed = null }) => {
  if (!prId || !role || content == null) return null;
  const result = await sql`
    INSERT INTO chat_messages (pr_id, user_id, role, content, tokens_used)
    VALUES (${prId}, ${userId || null}, ${role}, ${content}, ${tokensUsed})
    RETURNING id, pr_id, user_id, role, content, tokens_used, created_at
  `;
  return result?.[0] || null;
};

export const getChatHistory = async (prId) => {
  const messages = await sql`
    SELECT id, role, content, created_at
    FROM chat_messages
    WHERE pr_id = ${prId}
    ORDER BY created_at ASC
  `;
  return messages;
};
